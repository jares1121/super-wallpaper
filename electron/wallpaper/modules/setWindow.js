/*
 * @Author: jares
 * @Date: 2024-08-06 22:13:22
 * @LastEditors: jares
 * @LastEditTime: 2024-08-21 23:33:24
 * @Description: 
 * 
 * Copyright (c) 2024 by jares, All Rights Reserved. 
 */
const path = require('path')
const { app, BrowserWindow, ipcMain, shell } = require('electron')
const setWindow = () => {
	const child = new BrowserWindow({
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
	child.loadFile(path.join(__dirname, '../html/set.html'))
	child.webContents.openDevTools()
	child.once('ready-to-show', () => {
		child.show()
	})
}
module.exports = {
	setWindow
}
