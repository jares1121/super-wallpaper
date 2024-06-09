/*
 * @Author: jares
 * @Date: 2022-12-28 17:56:14
 * @LastEditors: jares
 * @LastEditTime: 2024-06-10 00:54:17
 * @Description:
 *
 * Copyright (c) 2022 by jares, All Rights Reserved.
 */

const path = require('path')
const { app, BrowserWindow, ipcMain, shell } = require('electron')

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
			preload: path.join(__dirname, 'preload.js')
		},
		frame: false, // 无边框窗口
		transparent: false // 窗口透明
	})
	// mainWindow.loadFile('./dist/index.html')
	mainWindow.loadURL('http://www.ergirl.com')
	mainWindow.webContents.openDevTools()
	module.exports = { mainWindow }
}
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
ipcMain.on('setPaper', (event, message) => {
	const { init } = require('./modules/setPaper')
	init(message)
})
// 打开设置面板
ipcMain.on('set', (event, message) => {
	const { setWindow } = require('./modules/setWindow')
	setWindow()
})
// 退出
ipcMain.on('quit', (event, message) => {
	app.quit()
})