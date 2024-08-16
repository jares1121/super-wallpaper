
const { autoUpdater } = require('electron-updater')
const { dialog } = require('electron')
const checkUpdate = (mainWindow) => {
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

	autoUpdater.on('update-available', (info) => {
		console.log(info)
		const objectToShow = { name: 'Electron', version: 'app.getVersion()' };
	  dialog.showMessageBox(mainWindow, {
		message: JSON.stringify(info, null, 2),
		title: '对象信息'
	  });
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
				// if (result.response === 0) {
				// 	// 用户选择更新，触发下载和安装
				// 	autoUpdater.downloadUpdate()
				// }
			})
	})

	autoUpdater.on('error', (err) => {
		console.log('errerrerrerrerrerrerr', err)

		// dialog
		// 	.showMessageBox({
		// 		type: 'info',
		// 		title: 'err',
		// 		message: 'err',
		// 		buttons: ['是', '否']
		// 	})
		// 	.then((result) => {
		// 		if (result.response === 0) {
		// 			// 用户选择更新，触发下载和安装
		// 			autoUpdater.downloadUpdate()
		// 		}
		// 	})
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
				// if (result.response === 0) {
				// 	// 用户选择更新，触发下载和安装
				// 	autoUpdater.downloadUpdate()
				// }
			})
	})
}
module.exports = checkUpdate
