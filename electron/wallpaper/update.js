/*
 * @Author: jares
 * @Date: 2024-08-17 15:10:34
 * @LastEditors: jares
 * @LastEditTime: 2024-08-18 00:01:31
 * @Description:
 *
 * Copyright (c) 2024 by jares, All Rights Reserved.
 */
const { autoUpdater } = require('electron-updater')
const { dialog } = require('electron')
const path = require('path')
const { app, BrowserWindow, ipcMain, shell } = require('electron')
const { contextBridge, ipcRenderer } = require('electron')

const checkUpdate = (mainWindow) => {
	autoUpdater.setFeedURL('http://localhost:8882/')
	autoUpdater.checkForUpdates()
	autoUpdater.autoDownload = false
	autoUpdater.autoInstallOnAppQuit = true
	autoUpdater.on('checking-for-update', () => {
		dialog
			.showMessageBox({
				type: 'info',
				title: '检查更新',
				message: 'Checking for update...',
				buttons: ['是', '否']
			})
			.then((result) => {
				if (result.response === 0) {
					// 用户选择更新，触发下载和安装
					autoUpdater.downloadUpdate()
				}
			})
	})

	// 当有可用更新的时候触发。 更新将自动下载。
	autoUpdater.on('update-available', (info) => {
		// console.log(info.version)
		// const objectToShow = { name: 'Electron', version: 'app.getVersion()' }
		// dialog.showMessageBox(mainWindow, {
		// 	message: info.version,
		// 	title: '对象信息'
		// })
		// 当有新版本可用时，弹窗提示用户
		dialog
			.showMessageBox({
				type: 'info',
				title: '新版本可用',
				message: '有一个可用的新版本，要更新吗',
				buttons: ['是', '否']
			})
			.then((result) => {
				if (result.response === 0) {
					// 用户选择更新，触发下载和安装
					autoUpdater.downloadUpdate()
				}
			})
	})
	//当没有可用更新的时候触发。
	autoUpdater.on('update-not-available', (info) => {
		dialog.showMessageBox({
			type: 'info',
			title: '更新',
			message: '当前没有可用的更新',
			buttons: ['是', '否']
		})
	})
	// 错误
	autoUpdater.on('error', (err) => {
		dialog
			.showMessageBox({
				type: 'info',
				title: '更新',
				message: '错误',
				buttons: ['是', '否']
			})
			.then((result) => {})
	})

	autoUpdater.on('update-downloaded', () => {
		// 处理下载完成的情况
		dialog
			.showMessageBox({
				type: 'info',
				title: '更新下载完成',
				message: '点击确定重启获取最新内容',
				buttons: ['确定']
			})
			.then(() => {
				// 调用 quitAndInstall 来安装更新
				autoUpdater.quitAndInstall()
			})
	})
	// 在应用程序启动时设置差分下载逻辑
	var percent = 0
	autoUpdater.on('download-progress', (progressObj) => {
		percent = progressObj.percent
		// dialog
		// 	.showMessageBox({
		// 		type: 'info',
		// 		title: JSON.stringify(progressObj),
		// 		message: JSON.stringify(progressObj),
		// 		buttons: ['是', '否']
		// 	})
		// 	.then((result) => {
		// 		// if (result.response === 0) {
		// 		// 	// 用户选择更新，触发下载和安装
		// 		// 	autoUpdater.downloadUpdate()
		// 		// }
		// 	})
	})
	ipcMain.handle('updatePercent', () => {
		return percent
	})
}
module.exports = checkUpdate
