/*
 * Wallpaper Engine - WorkerW attach (Windows only)
 * Pure-JS FFI via koffi (no native compile needed)
 * Algorithm from meslzy/electron-as-wallpaper (Rust)
 *
 * 重要 (koffi 2.x):
 *  - lib.func(...) 的【返回值】才是可调用的函数；koffi 不会把它挂到 lib.Xxx 属性上，
 *    所以必须捕获返回值后直接调用（不能写 user32.FindWindowA(...)）。
 *  - GetLastError 属于 kernel32.dll，不在 user32.dll 里。
 *  - 回调类型(koffi.proto)作为函数参数时，必须用 koffi.pointer(...) 包裹。
 *  - HWND 是 64 位句柄，所有相关函数必须用 uint64 声明并以 BigInt/number 传递。
 *    ⚠️ 不能用 void* 声明：koffi 会把 HWND 返回成 External 指针对象，
 *       再把它传回 void* 参数的 Win32 API 时会被当成垃圾值 → SetParent 报
 *       ERROR_INVALID_PARAMETER(87)。统一用 uint64 可彻底规避。
 */

let koffi = null
let _user32 = null
let _kernel32 = null

// 捕获的函数（用返回值，不依赖 lib 属性）
let FindWindowA = null
let FindWindowExA = null
let SetParent = null
let SetWindowPos = null
let IsWindow = null
let SendMessageTimeoutA = null
let GetSystemMetrics = null
let GetLastError = null
let EnumWindows = null

let _workerWHwnd = null

function init() {
	if (_user32) return true

	try {
		koffi = require('koffi')
	} catch (e) {
		console.error('[WPE] koffi not installed -> run: npm install koffi')
		return false
	}

	try {
		_user32 = koffi.load('user32.dll')
		_kernel32 = koffi.load('kernel32.dll')

		// 注意: 必须用 func() 的返回值，koffi 不会挂到 _user32.X 上
		// 所有 HWND 参数/返回值统一用 uint64（绝不可以用 void*，见文件头注释）
		FindWindowA = _user32.func('__stdcall', 'FindWindowA', 'uint64', ['str', 'str'])
		FindWindowExA = _user32.func('__stdcall', 'FindWindowExA', 'uint64', ['uint64', 'uint64', 'str', 'str'])
		SetParent = _user32.func('__stdcall', 'SetParent', 'uint64', ['uint64', 'uint64'])
		SetWindowPos = _user32.func('__stdcall', 'SetWindowPos', 'int', ['uint64', 'uint64', 'int', 'int', 'int', 'int', 'uint'])
		IsWindow = _user32.func('__stdcall', 'IsWindow', 'int', ['uint64'])
		// 取真实全屏分辨率（SM_CXSCREEN=0, SM_CYSCREEN=1），避免被“工作区”高度(减去任务栏)收掉导致底部露黑边
		GetSystemMetrics = _user32.func('__stdcall', 'GetSystemMetrics', 'int', ['int'])
		SendMessageTimeoutA = _user32.func('__stdcall', 'SendMessageTimeoutA', 'unsigned long', [
			'uint64', 'uint', 'long long', 'long long', 'uint', 'uint', 'unsigned long *'
		])

		// GetLastError 在 kernel32.dll（原代码误绑在 user32 上导致整个 init 失败）
		GetLastError = _kernel32.func('__stdcall', 'GetLastError', 'unsigned long', [])

		// EnumWindows 回调类型，作为函数参数时必须用 koffi.pointer(...) 包裹
		const EnumWindowsProc = koffi.proto('__stdcall', 'EnumWindowsProc', 'int', ['uint64', 'long long'])
		EnumWindows = _user32.func('__stdcall', 'EnumWindows', 'int', [koffi.pointer(EnumWindowsProc), 'long long'])

		console.log('[WPE] user32.dll + kernel32.dll bound OK')
		return true
	} catch (e) {
		console.error('[WPE] bind FAILED:', e.message)
		_user32 = null
		_kernel32 = null
		return false
	}
}

function triggerWorkerWRecreate() {
	try {
		const progman = FindWindowA('Progman', null)
		if (!progman) {
			console.warn('[WPE] Progman not found, skip recreate')
			return
		}
		// 0x052C = WM_USER+0x0C：让 explorer 重新生成 WorkerW 层级（空壁纸层）
		SendMessageTimeoutA(progman, 0x052C, 0xD, 0x1, 0, 1000, null)
		console.log('[WPE] WorkerW recreate triggered')
	} catch (e) {
		console.error('[WPE] triggerWorkerWRecreate err:', e.message)
	}
}

/**
 * 查找真正的“壁纸层” WorkerW（位于桌面图标之下）。
 *
 * 实测本机窗口结构：Progman 在收到 0x052C 后会生成一个【直接子 WorkerW】，
 * 该 WorkerW 不含 SHELLDLL_DefView（图标仍在 Progman 默认结构里），即空壁纸层。
 * 因此最可靠的做法是：枚举 Progman 的直接子 WorkerW，取“不含 SHELLDLL_DefView”的那个。
 * 这样既不受 z 序前后影响，也不会误选其他软件的顶层 WorkerW。
 */
function findWorkerW() {
	const progman = FindWindowA('Progman', null)
	if (!progman) {
		console.error('[WPE] findWorkerW FAILED - Progman not found')
		return null
	}

	// 优先：Progman 的直接子 WorkerW 中，没有 SHELLDLL_DefView 子窗口的那个 = 空壁纸层
	const progChildren = []
	let hw = 0n
	while (true) {
		hw = FindWindowExA(progman, hw, 'WorkerW', null)
		if (!hw) break
		progChildren.push(hw)
	}
	console.log('[WPE] Progman 直接子 WorkerW 数量:', progChildren.length)

	for (const w of progChildren) {
		const hasShellDll = FindWindowExA(w, 0n, 'SHELLDLL_DefView', null)
		if (!hasShellDll) {
			console.log('[WPE] *** WALLPAPER_LAYER WorkerW:', w)
			return w
		}
		console.log('[WPE] (跳过含图标的 WorkerW):', w)
	}

	// 兜底：极少数环境下壁纸层不在 Progman 直接子级，
	// 改枚举所有顶层 WorkerW，取第一个不含 SHELLDLL_DefView 的
	console.warn('[WPE] Progman 下未找到空壁纸层，回退枚举顶层 WorkerW')
	let top = 0n
	while (true) {
		top = FindWindowExA(0n, top, 'WorkerW', null)
		if (!top) break
		const hasShellDll = FindWindowExA(top, 0n, 'SHELLDLL_DefView', null)
		if (!hasShellDll) {
			console.log('[WPE] *** WALLPAPER_LAYER(顶层兜底) WorkerW:', top)
			return top
		}
	}

	console.error('[WPE] findWorkerW FAILED - 根本找不到 WorkerW!')
	return null
}

function attach(win) {
	if (!init()) return false

	const hwndBuf = win.getNativeWindowHandle()
	const electroHwnd = hwndBuf.readBigUInt64LE(0)
	console.log('[WPE] Electron HWND:', electroHwnd)

	triggerWorkerWRecreate()

	_workerWHwnd = findWorkerW()
	if (!_workerWHwnd) {
		// 重试一次: 时序上壁纸层可能还没生成，再触发一次 0x052C 并重找
		console.warn('[WPE] 首次未找到壁纸层，重试一次...')
		triggerWorkerWRecreate()
		_workerWHwnd = findWorkerW()
	}
	if (!_workerWHwnd) {
		console.error('[WPE] WorkerW not found - attach FAILED')
		return false
	}
	console.log('[WPE] Target WorkerW:', _workerWHwnd)

	// SetParent 返回上一个父窗口(HWND)；失败返回 0
	const prev = SetParent(electroHwnd, _workerWHwnd)
	if (!prev) {
		const err = GetLastError()
		console.error('[WPE] SetParent FAILED, GetLastError:', err)
		return false
	}
	console.log('[WPE] *** SetParent OK! 壁纸已置于桌面图标之下')

	// 把壁纸窗口定位/铺满到 (0,0) 全屏区域（作为 WorkerW 的子窗口，坐标相对其父客户区）
	// 注意: 不能用 win.getBounds() —— Electron 会把隐藏窗口高度按“工作区”收掉(减去任务栏)，
	// 导致壁纸底部留一条黑边。这里用 GetSystemMetrics 取真实全屏分辨率铺满。
	try {
		const SWP_NOACTIVATE = 0x0010
		const SWP_FRAMECHANGED = 0x0020
		const fullW = GetSystemMetrics(0) // SM_CXSCREEN
		const fullH = GetSystemMetrics(1) // SM_CYSCREEN
		SetWindowPos(electroHwnd, 0n, 0, 0, fullW, fullH, SWP_NOACTIVATE | SWP_FRAMECHANGED)
		console.log('[WPE] SetWindowPos OK, size:', fullW + 'x' + fullH)
	} catch (e) {
		console.warn('[WPE] SetWindowPos skipped:', e.message)
	}

	return true
}

function detach(win) {
	if (!_user32 || !win) return false
	try {
		const hwndBuf = win.getNativeWindowHandle()
		const electroHwnd = hwndBuf.readBigUInt64LE(0)
		SetParent(electroHwnd, 0n) // 0 = 桌面(还原为顶层)
	} catch (e) {
		console.error('[WPE] detach err:', e.message)
	}
	_workerWHwnd = null
	console.log('[WPE] detached')
	return true
}

function isWorkerWAlive() {
	if (!_user32 || !_workerWHwnd) return false
	return IsWindow(_workerWHwnd) !== 0
}

function getWorkerWHwnd() {
	return _workerWHwnd
}

module.exports = { init, attach, detach, isWorkerWAlive, getWorkerWHwnd }
