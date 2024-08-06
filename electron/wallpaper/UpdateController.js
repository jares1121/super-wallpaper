// const { dialog } = require('electron')
// const { autoUpdater } = require('electron-updater')
// const { ipcMain, app } = require('electron')

// let mainWin = null
// let judgeRs = {}
// let isDownloading = false
// //自动下载更新
// autoUpdater.autoDownload = false
// //退出时自动安装更新
// autoUpdater.autoInstallOnAppQuit = false
// const checkUpdate = (win) => {
// 	mainWin = win
// 	autoUpdater.setFeedURL('http://lizetoolbox.top:83/updater/lize-tools-pc')
// 	// if (app.isPackaged) {
// 	// } else {
// 	// 	autoUpdater.setFeedURL('http://localhost:83/updater/lize-tools-pc/')
// 	// }
// 	// autoUpdater.forceDevUpdateConfig = true //开发环境下强制更新
// 	autoUpdater.autoDownload = false // 自动下载
// 	autoUpdater.autoInstallOnAppQuit = false // 应用退出后自动安装
// 	autoUpdater.checkForUpdates()

// }

// autoUpdater.on('update-available', (info) => {
// 	console.log('有新版本需要更新', info)
// 	judgeRs = {
// 		success: true,
// 		needUpdate: true,
// 		msg: '有新版本需要更新',
// 		version: info.version
// 	}
// })
// autoUpdater.on('update-not-available', (info) => {
// 	console.log('无需更新')
// 	judgeRs = {
// 		success: true,
// 		needUpdate: false,
// 		msg: '无需更新'
// 	}
// })

// // 监听渲染进程的 install 事件，触发退出应用并安装
// ipcMain.handle('pc-install', () => autoUpdater.quitAndInstall())

// ipcMain.handle('check-pc-update', async () => {
// 	try {
// 		if (isDownloading) {
// 			return {
// 				success: true,
// 				isDownloading: true,
// 				msg: '正在下载中，请稍后'
// 			}
// 		} else {
// 			const res = await autoUpdater.checkForUpdatesAndNotify()
// 			console.log('judge', res)
// 			//如果check结果正常，则使用上面监听构造的judgeRs
// 			return judgeRs
// 		}
// 	} catch (e) {
// 		//    check报错
// 		judgeRs = {
// 			success: false,
// 			msg: '没有更新包：博主财力有限，服务器被下架了，软件最新版本，请通过"中二少年工具箱"小程序，查询网盘下载地址'
// 		}
// 		return judgeRs
// 	}
// })
// autoUpdater.on('download-progress', (prog) => {
// 	let speed =
// 		prog.bytesPerSecond / 1000000 > 1
// 			? Math.ceil(prog.bytesPerSecond / 1000000) + 'M/s'
// 			: Math.ceil(prog.bytesPerSecond / 1000) + 'K/s'

// 	mainWin.webContents.send('pc-update-progress', {
// 		speed, // 网速
// 		percent: Math.ceil(prog.percent) // 百分比
// 	})
// 	isDownloading = true
// })
// autoUpdater.on('update-downloaded', (info) => {
// 	isDownloading = false
// 	mainWin.webContents.send('pc-downloaded')
// 	// 下载完成后强制用户安装，不推荐
// 	// autoUpdater.quitAndInstall();
// })
// /*监听渲染进程指令，执行更新*/
// ipcMain.on('send-update', () => {
// 	autoUpdater.autoDownload = true
// 	autoUpdater.checkForUpdates()
// })
// module.exports = checkUpdate
// autoUpdater.js
const { dialog } = require('electron')
const { autoUpdater } = require('electron-updater')

//自动下载更新
autoUpdater.autoDownload = false
//退出时自动安装更新
autoUpdater.autoInstallOnAppQuit = false
const checkUpdate = () => {
	// 设置更新源url
	autoUpdater.setFeedURL(
		'http://lizetoolbox.top:83/updater/lize-tools-pc'
	)
	//检查是否有更新
	autoUpdater.checkForUpdates()

	//有新版本时
	autoUpdater.on('update-available', (_info) => {
		console.log('有新版本')
		dialog
			.showMessageBox({
				type: 'warning',
				title: '更新提示',
				message: '有新版本发布了',
				buttons: ['更新', '取消'],
				cancelId: 1
			})
			.then((res) => {
				if (res.response == 0) {
					//开始下载更新
					autoUpdater.downloadUpdate()
				}
			})
	})

	//没有新版本时
	autoUpdater.on('update-not-available', (_info) => {
		console.log('没有更新')
	})

	//更新下载完毕
	autoUpdater.on('update-downloaded', (_info) => {
		//退出并安装更新
		autoUpdater.quitAndInstall()
	})

	//更新发生错误
	autoUpdater.on('error', (_info) => {
		console.log('更新时发生错误')
	})

	// 监听下载进度
	autoUpdater.on('download-progress', (progress) => {
		console.log(`更新进度，${JSON.stringify(progress)}`)
	})
}
module.exports = checkUpdate
