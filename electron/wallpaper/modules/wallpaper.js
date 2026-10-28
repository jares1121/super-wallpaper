/*
 * @Author: super-wallpaper
 * @Date: 2026-10-28
 * @Description: 壁纸窗口工厂
 *   创建一个覆盖所有显示器的全屏 BrowserWindow，内容是动态壁纸
 *   （视频 / 网页 / 图片 / 内置 demo），然后通过 wallpaper-engine 挂载到 WorkerW
 *
 *   内容管理：
 *   - 自动识别类型：http(s)=网页、视频扩展名=视频、图片扩展名=图片、html=本地网页、其余=内置 demo
 *   - 视频/图片走 wallpaper-media.html 渲染（object-fit:cover 铺满）
 *   - 记住上次选择，重启自动恢复（userData/wallpaper-content.json）
 */

const path = require('path')
const fs = require('fs')
const { BrowserWindow, screen, app } = require('electron')
const wallpaperEngine = require('./wallpaper-engine')

let wallpaperWindow = null
let _heartbeatTimer = null
let _reAttachCount = 0

// 内置 demo 与媒体渲染页
const DEMO_HTML = path.join(__dirname, '../html/wallpaper.html')
const MEDIA_HTML = path.join(__dirname, '../html/wallpaper-media.html')

// 内容类型扩展名表
const EXT = {
	video: ['.mp4', '.webm', '.ogg', '.mov', '.m4v', '.avi'],
	image: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'],
	html: ['.html', '.htm']
}

/**
 * 识别内容类型
 * @param {string|null|undefined} content
 * @returns {{ type: 'demo'|'url'|'video'|'image'|'html', src?: string }}
 */
function detectContent(content) {
	if (content == null || typeof content !== 'string') return { type: 'demo' }
	const c = content.trim()
	if (/^https?:\/\//i.test(c)) return { type: 'url', src: c }
	const lower = c.toLowerCase()
	for (const ext of EXT.video) if (lower.endsWith(ext)) return { type: 'video', src: c }
	for (const ext of EXT.image) if (lower.endsWith(ext)) return { type: 'image', src: c }
	for (const ext of EXT.html) if (lower.endsWith(ext)) return { type: 'html', src: c }
	// 其它一律当作网页地址处理
	return { type: 'url', src: c }
}

/**
 * 把内容加载进指定窗口，并持久化
 */
function applyContent(win, content) {
	const resolved = detectContent(content)
	if (resolved.type === 'url') {
		win.loadURL(resolved.src)
	} else if (resolved.type === 'html') {
		win.loadFile(resolved.src)
	} else if (resolved.type === 'demo') {
		win.loadFile(DEMO_HTML)
	} else {
		// video / image -> 媒体渲染页
		win.loadFile(MEDIA_HTML, { query: { type: resolved.type, src: resolved.src } })
	}
	saveContent(content)
}

// ============ 持久化（记住上次壁纸） ============
function contentFile() {
	return path.join(app.getPath('userData'), 'wallpaper-content.json')
}
function saveContent(content) {
	try {
		fs.writeFileSync(contentFile(), JSON.stringify({ content: content ?? null }))
	} catch (e) {
		console.warn('[wallpaper] 保存壁纸配置失败:', e.message)
	}
}
function loadSavedContent() {
	try {
		if (fs.existsSync(contentFile())) {
			const data = JSON.parse(fs.readFileSync(contentFile(), 'utf-8'))
			let c = data.content
			// 本地文件若已不存在，回退到内置 demo
			if (c && typeof c === 'string' && !/^https?:\/\//i.test(c) && !fs.existsSync(c)) {
				c = null
			}
			return c
		}
	} catch (e) {
		console.warn('[wallpaper] 读取壁纸配置失败:', e.message)
	}
	return null
}

/**
 * 计算覆盖所有显示器的 bounding rect
 */
function getSpanningBounds() {
	const displays = screen.getAllDisplays()
	let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity
	for (const d of displays) {
		const b = d.bounds
		left = Math.min(left, b.x)
		top = Math.min(top, b.y)
		right = Math.max(right, b.x + b.width)
		bottom = Math.max(bottom, b.y + b.height)
	}
	return { x: left, y: top, width: right - left, height: bottom - top }
}

/**
 * 创建壁纸 BrowserWindow
 *
 * @param {object} options
 * @param {string} [options.content] - 壁纸内容：URL / 本地视频·图片·HTML 路径
 *                                     不传则使用上次保存的内容（首次为内置 demo）
 * @param {boolean} [options.debug] - 是否打开 DevTools（调试 WorkerW 挂载时有用）
 */
function createWallpaperWindow(options = {}) {
	const bounds = getSpanningBounds()
	console.log('[wallpaper] 覆盖区域:', bounds, '（显示器数:', screen.getAllDisplays().length, '）')

	wallpaperWindow = new BrowserWindow({
		...bounds,
		frame: false,
		transparent: true,     // 允许透明背景（用 CSS 控制不透明的部分）
		hasShadow: false,
		skipTaskbar: true,     // WS_EX_TOOLWINDOW → 不出现在任务栏、Alt+Tab 中
		focusable: false,      // WS_EX_NOACTIVATE → 不会抢焦点
		alwaysOnTop: false,    // false 才不会顶到应用窗口上面
		resizable: false,
		movable: false,
		maximizable: false,
		minimizable: false,
		fullscreenable: false,
		show: false,           // 先不显示，等 attach 成功再 showInactive()
		webPreferences: {
			contextIsolation: true,
			nodeIntegration: false,
			webSecurity: false,  // 允许加载本地视频/资源
			preload: path.join(__dirname, '../preload.js')
		}
	})

	// 加载内容：优先用本次指定的，否则用上次保存的（首次=内置 demo）
	const content = (options.content !== undefined) ? options.content : loadSavedContent()
	applyContent(wallpaperWindow, content)

	if (options.debug) {
		wallpaperWindow.webContents.openDevTools({ mode: 'detach' })
	}

	wallpaperWindow.once('ready-to-show', () => {
		// 关键！attach 到 WorkerW 必须在窗口 show 之前或刚 show 完之后
		const ok = wallpaperEngine.attach(wallpaperWindow)
		if (!ok) {
			console.error('[wallpaper] ❌ attach WorkerW 失败，退化为覆盖层模式')
			// 退化成方案 B（覆盖层，图标会被挡，但至少能显示内容）
			wallpaperWindow.setAlwaysOnTop(true, 'screen-saver')
		}
		// showInactive()：显示但不抢焦点、不激活
		wallpaperWindow.showInactive()

		// 启动心跳：每 10s 检查 WorkerW 是否还活着，死了就重挂
		startHeartbeat()
	})

	// 窗口关闭时清理
	wallpaperWindow.on('closed', () => {
		stopHeartbeat()
		wallpaperEngine.detach(wallpaperWindow)
		wallpaperWindow = null
		console.log('[wallpaper] 壁纸窗口已销毁')
	})

	return wallpaperWindow
}

/**
 * 心跳：WorkerW 句柄在 Windows 更新 / 显示器插拔后可能失效
 * 每 10s 验证一次，失效就重新 attach
 */
function startHeartbeat() {
	stopHeartbeat()
	_heartbeatTimer = setInterval(() => {
		if (!wallpaperWindow || wallpaperWindow.isDestroyed()) {
			stopHeartbeat()
			return
		}
		if (!wallpaperEngine.isWorkerWAlive()) {
			console.warn('[wallpaper] ⚠️ 心跳检测: WorkerW 句柄失效，尝试重挂 (第', ++_reAttachCount, '次)')
			const ok = wallpaperEngine.attach(wallpaperWindow)
			if (!ok) {
				console.error('[wallpaper] ❌ 重挂失败')
			} else {
				console.log('[wallpaper] ✅ 重挂成功')
			}
		}
	}, 10_000)
}

function stopHeartbeat() {
	if (_heartbeatTimer) {
		clearInterval(_heartbeatTimer)
		_heartbeatTimer = null
	}
}

/**
 * 销毁壁纸窗口
 */
function destroyWallpaperWindow() {
	if (!wallpaperWindow) return
	wallpaperEngine.detach(wallpaperWindow)
	wallpaperWindow.close()
	wallpaperWindow = null
}

/**
 * 动态切换壁纸内容（视频 / 图片 / 网页 / 本地 HTML）
 * 切换只换内部页面，WorkerW 挂载关系保持不变
 */
function setContent(content) {
	if (!wallpaperWindow) {
		createWallpaperWindow({ content })
		return
	}
	applyContent(wallpaperWindow, content)
}

function getWallpaperWindow() {
	return wallpaperWindow
}

module.exports = {
	createWallpaperWindow,
	destroyWallpaperWindow,
	setContent,
	getWallpaperWindow
}
