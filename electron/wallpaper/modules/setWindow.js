/*
 * @Author: jares
 * @Date: 2024-08-06 22:13:22
 * @LastEditors: jares
 * @LastEditTime: 2024-08-22 14:20:19
 * @Description: 
 * 
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
		width: 800,
		height: 600,
		icon: path.join(__dirname, '../static/images/icon.png'),
		webPreferences: {
			preload: path.join(__dirname, '../preload.js')
		},
		frame: false, // 无边框窗口
		transparent: true // 窗口透明
	})
	win.loadFile(path.join(__dirname, '../html/set.html'))
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
