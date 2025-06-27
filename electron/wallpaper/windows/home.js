/*
 * @Author: jares
 * @Date: 2024-08-06 22:13:22
 * @LastEditors: jares
 * @LastEditTime: 2025-06-27 14:13:55
 * @Description: 
 * 主页窗口
 * Copyright (c) 2024 by jares, All Rights Reserved. 
 */
const path = require('path')
const { app, BrowserWindow, ipcMain, shell } = require('electron')
var win = null
const setWindow = () => {
	win = new BrowserWindow({
		// parent: mainWindow,
		// modal: true,
		// show: true,
		width: 1200,
		height: 800,
		icon: path.join(__dirname, '../static/images/icon.png'),
		webPreferences: {
			preload: path.join(__dirname, '../preload.js')
		},
		frame: false, // 无边框窗口
		transparent: true // 窗口透明
	})
	win.loadURL('http://localhost:5173/home')
	// win.webContents.openDevTools()
	win.once('ready-to-show', () => {
		win.show()
	})
}
// 关闭窗口
ipcMain.on('setClose', (event, message) => {
	win.close()
})
module.exports = {
	setWindow
}
