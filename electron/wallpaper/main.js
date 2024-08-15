/*
 * @Author: jares
 * @Date: 2022-12-28 17:56:14
 * @LastEditors: jares
 * @LastEditTime: 2024-08-15 22:16:31
 * @Description:
 *
 * Copyright (c) 2022 by jares, All Rights Reserved.
 */

const path = require('path')
const { app, BrowserWindow, ipcMain, shell } = require('electron')
const checkUpdate = require('./UpdateController');
const fs = require('fs')
const { autoUpdater } = require('electron-updater')
const { dialog } = require('electron')

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
		},
		frame: false, // 无边框窗口
		transparent: false // 窗口透明
	})
	// mainWindow.loadFile('/html/set.html')
	mainWindow.loadURL('http://www.baidu.com')
	mainWindow.webContents.openDevTools()
	module.exports = { mainWindow }
}

Object.defineProperty(app, 'isPackaged', {
	get() {
		return true
	}
})
app.whenReady().then(() => {
	createWindow()
	// app.on('activate', function () {
	// 	if (BrowserWindow.getAllWindows().length === 0) createWindow()
	// 	// menu()
	// })
	const tray = require('./tray.js')
	const { init } = require('./modules/setPaper')
	init()
// 	checkUpdate(mainWindow) //检查更新
// // 更新出错 加上这些
// 	//我们的软件发布地址
// 	const feed = 'your_site/update/windows_64'

// 	let yaml = ''
// 	let appName = 'ZhangWuJi_App'
// 	yaml += 'provider: generic\n'
// 	yaml += 'url: your_site/update/windows_64\n'
// 	yaml += 'useMultipleRangeRequest: false\n'
// 	yaml += 'channel: latest\n'
// 	yaml += 'updaterCacheDirName: ' + appName

// 	let update_file = [path.join(process.resourcesPath, 'app-update.yml'), yaml]
// 	let dev_update_file = [
// 		path.join(process.resourcesPath, 'dev-app-update.yml'),
// 		yaml
// 	]
// 	let chechFiles = [update_file, dev_update_file]

// 	for (let file of chechFiles) {
// 		if (!fs.existsSync(file[0])) {
// 			fs.writeFileSync(file[0], file[1], () => {})
// 		}
// 	}
 autoUpdater.checkForUpdates()
 autoUpdater.autoDownload = false
 autoUpdater.autoInstallOnAppQuit = true
 autoUpdater.on('checking-for-update', () => {
		dialog
			.showMessageBox({
				type: 'info',
				title: 'Checking for update...',
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

 autoUpdater.on('update-available', (info) => {
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

 autoUpdater.on('update-not-available', (info) => {
		dialog
			.showMessageBox({
				type: 'info',
				title: 'Update not available.',
				message: 'Update not available.',
				buttons: ['是', '否']
			})
			.then((result) => {
				if (result.response === 0) {
					// 用户选择更新，触发下载和安装
					autoUpdater.downloadUpdate()
				}
			})
 })

 autoUpdater.on('error', (err) => {
		dialog
			.showMessageBox({
				type: 'info',
				title: 'err',
				message: 'err',
				buttons: ['是', '否']
			})
			.then((result) => {
				if (result.response === 0) {
					// 用户选择更新，触发下载和安装
					autoUpdater.downloadUpdate()
				}
			})
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
 autoUpdater.on('download-progress', (progressObj) => {
		dialog
			.showMessageBox({
				type: 'info',
				title: JSON.stringify(progressObj),
				message: JSON.stringify(progressObj),
				buttons: ['是', '否']
			})
			.then((result) => {
				if (result.response === 0) {
					// 用户选择更新，触发下载和安装
					autoUpdater.downloadUpdate()
				}
			})
 })

})
// 设置壁纸
ipcMain.on('setPaper', async (event, message) => {
	const { init } = require('./modules/setPaper')
	init(message)
	// event.reply('message-from-main', await init(message)) // 向渲染进程发送消息
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