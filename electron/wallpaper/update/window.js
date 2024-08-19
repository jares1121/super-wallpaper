/*
 * @Author: jares
 * @Date: 2024-08-18 22:37:06
 * @LastEditors: jares
 * @LastEditTime: 2024-08-19 23:03:56
 * @Description:
 *
 * Copyright (c) 2024 by jares, All Rights Reserved.
 */
const path = require('path')
const { app, BrowserWindow, ipcMain, shell } = require('electron')
const { checkUpdate, download } = require('./index')

var child = null
const updateWindow = () => {
	if (child) {
		child.hide()
	}
	child = new BrowserWindow({
		// parent: mainWindow,
		// modal: true,
		// show: true,
		width: 600,
		height: 400,
		icon: path.join(__dirname, '../static/images/icon.png'),
		webPreferences: {
			preload: path.join(__dirname, '../preload.js')
		},
		frame: false, // 无边框窗口
		transparent: true // 窗口透明
	})
	child.loadFile(path.join(__dirname, '../html/update.html'))
	child.webContents.openDevTools()
	child.once('ready-to-show', () => {
		child.show()
	})
}
// 监听更新按钮
ipcMain.on('isUpdate', (event, message) => {
	checkUpdate(child)
})
// 下载
ipcMain.on('download', (event, message) => {
	console.log('下载2')
	download()
})
// 关闭窗口
ipcMain.on('updateClose', (event, message) => {
	child.close()
})
module.exports = {
	updateWindow
}
