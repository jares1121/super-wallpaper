/*
 * @Author: jares
 * @Date: 2022-12-28 17:56:14
 * @LastEditors: jares
 * @LastEditTime: 2025-06-27 14:51:53
 * @Description:
 *
 * Copyright (c) 2022 by jares, All Rights Reserved.
 */

// ------- 控制台编码修复: Windows 终端默认 CP936(GBK), 而 Node 输出 UTF-8 → 中文乱码 -------
// 注意: `chcp 65001` 只在子进程内改代码页，对父进程(本 Electron 主进程)无效，故用 Win32 API 直接设置。
if (process.platform === 'win32') {
	try {
		const koffi = require('koffi')
		const kernel32 = koffi.load('kernel32.dll')
		const SetConsoleOutputCP = kernel32.func('bool SetConsoleOutputCP(uint)')
		SetConsoleOutputCP(65001) // 65001 = UTF-8
	} catch (_) {
		// 万一 koffi 不可用，回退到 chcp（仅对子进程生效，作为兜底）
		try { require('child_process').execSync('chcp 65001', { stdio: 'ignore' }) } catch (_) {}
	}
}

const path = require('path')
const { app, BrowserWindow, ipcMain, shell } = require('electron')
const fs = require('fs')

try {
	require('electron-reloader')(module)
} catch (_) {}

// ========== 动态壁纸引擎 ==========
const wallpaper = require('./modules/wallpaper')
let wallpaperWindow = null
let wallpaperEnabled = true // 启动即开启动态壁纸

// ========== 主应用窗口 ==========
var mainWindow
function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1200,
		height: 800,
		icon: path.join(__dirname, './static/images/icon.png'),
		webPreferences: {
			preload: path.join(__dirname, './preload.js')
		},
		frame: false, // 无边框窗口
		transparent: false // 窗口透明
	})
	mainWindow.webContents.openDevTools()
	// 开发态加载 Vite dev server，生产态加载构建产物
	const isDev = !app.isPackaged
	if (isDev) {
		mainWindow.loadURL('http://localhost:5173/home')
	} else {
		const distPath = path.join(__dirname, '../../dist/index.html')
		mainWindow.loadFile(distPath, { hash: '/home' })
	}
}

module.exports = { get mainWindow() { return mainWindow } }
// 以后会用到
// async function handleFileOpen() {
// 	const { canceled, filePaths } = await dialog.showOpenDialog()
// 	if (!canceled) {
// 		return filePaths[0]
// 	}
// }

app.whenReady().then(() => {
	// 动态壁纸（先启动，让 WorkerW 层级在桌面上就位）
	if (wallpaperEnabled) {
		console.log('\n========== 🎬 启动动态壁纸 ==========')
		wallpaperWindow = wallpaper.createWallpaperWindow({ debug: true })
	}

	// 主应用窗口（Vue 前端）
	createWindow()

	app.on('activate', function () {
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})

	// 托盘
	const tray = require('./tray.js')
	const { init } = require('./modules/setPaper')
	init()
})

// 防止主窗口关闭后 app 自动退出：壁纸 + 托盘可以独立运行
app.on('window-all-closed', () => {
	// macOS 惯例：关掉所有窗口 app 不退出
	if (process.platform !== 'darwin') {
		// Windows: 如果壁纸还开着就不退出
		if (!wallpaperEnabled || !wallpaperWindow) {
			app.quit()
		}
	}
})

// 退出时清理壁纸窗口
app.on('before-quit', () => {
	if (wallpaperWindow) {
		try { wallpaper.destroyWallpaperWindow() } catch (_) {}
	}
})

// ========== 动态壁纸控制 IPC ==========
// 开启 / 关闭动态壁纸
ipcMain.on('wallpaper:toggle', () => {
	if (wallpaperEnabled) {
		wallpaper.destroyWallpaperWindow()
		wallpaperEnabled = false
		console.log('[wallpaper] ❌ 已关闭')
	} else {
		wallpaperWindow = wallpaper.createWallpaperWindow({ debug: true })
		wallpaperEnabled = true
		console.log('[wallpaper] ✅ 已开启')
	}
})

// 切换壁纸内容：URL / 本地 HTML / 视频
ipcMain.on('wallpaper:set-content', (event, content) => {
	wallpaper.setContent(content)
	console.log('[wallpaper] 内容已切换:', content)
})

// 托盘"网页地址"输入框回传的 URL → 设为壁纸
ipcMain.on('wallpaper:set-url', (event, url) => {
	if (url && typeof url === 'string' && url.trim()) {
		wallpaper.setContent(url.trim())
		console.log('[wallpaper] 网页地址已设置:', url.trim())
	}
})
// 设置壁纸
ipcMain.on('setPaper', async (event, message) => {
	const { init } = require('./modules/setPaper')
	init(message)
	// event.reply('message-from-main', await init(message)) // 向渲染进程发送消息
})
// 打开设置面板
ipcMain.on('set', (event, message) => {
	const { setWindow } = require('./windows/set')
	setWindow()
})
// 打开主页
ipcMain.on('home', (event, message) => {
	const { setWindow } = require('./windows/home')
	setWindow()
})
// 打开更新面板
ipcMain.on('update', (event, message) => {
	const { updateWindow } = require('./update/window')
	updateWindow()
})

// 退出
ipcMain.on('quit', (event, message) => {
	app.quit()
})

// ✅ 更简单的统一控制窗口行为
ipcMain.on('window-action', (event, action) => {
	const win = BrowserWindow.fromWebContents(event.sender)
	if (!win) return
	switch (action) {
		case 'minimize':
			win.minimize()
			break
		case 'maximize':
			win.maximize()
			break
		case 'unmaximize':
			win.unmaximize()
			break
		case 'toggle':
			win.isMaximized() ? win.unmaximize() : win.maximize()
			break
		case 'close':
			win.close()
			break
	}
})
