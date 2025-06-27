/*
 * @Author: jares
 * @Date: 2022-12-28 17:56:14
 * @LastEditors: jares
 * @LastEditTime: 2025-06-27 14:51:53
 * @Description:
 *
 * Copyright (c) 2022 by jares, All Rights Reserved.
 */

const path = require('path')
const { app, BrowserWindow, ipcMain, shell } = require('electron')
const fs = require('fs')

try {
	require('electron-reloader')(module)
} catch (_) {}
var mainWindow
function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1200,
		height: 800,
		icon: path.join(__dirname, './static/images/icon.png'),
		webPreferences: {
			preload: path.join(__dirname, './preload.js')
			// nodeIntegration: true, // 改为true 即可
			// contextIsolation: false,
		},
		frame: false, // 无边框窗口
		transparent: false // 窗口透明
	})
	// mainWindow.loadFile(path.join(__dirname, '/html/update.html'))
	mainWindow.webContents.openDevTools()
	mainWindow.loadURL('http://www.baidu.com')
	module.exports = { mainWindow }
}

Object.defineProperty(app, 'isPackaged', {
	get() {
		return true
	}
})
// 以后会用到
// async function handleFileOpen() {
// 	const { canceled, filePaths } = await dialog.showOpenDialog()
// 	if (!canceled) {
// 		return filePaths[0]
// 	}
// }

app.whenReady().then(() => {
	// createWindow()
	// app.on('activate', function () {
	// 	if (BrowserWindow.getAllWindows().length === 0) createWindow()
	// 	// menu()
	// })
	const tray = require('./tray.js')
	const { init } = require('./modules/setPaper')
	init()
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
