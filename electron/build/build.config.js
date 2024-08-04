/*
 * @Author: jares
 * @Date: 2023-01-03 22:07:25
 * @LastEditors: jares
 * @LastEditTime: 2024-06-10 17:00:23
 * @Description:
 *
 * Copyright (c) 2023 by jares, All Rights Reserved.
 */
const path = require('path')

const config = {
	productName: 'super-wallpaper',
	appId: 'com.electron.jares',
	copyright: 'Copyright © 2023 ${author}',
	asar: true,
	files: [],
	extraFiles: ['./electron/wallpaper/static'],
	extraResources: ['./static'],
	directories: {
		output: 'release/${version}'
	},
	win: {
		icon: path.join(__dirname, '../wallpaper/static/images/favicon.ico'),
		target: [
			{
				target: 'nsis',
				arch: ['x64', 'ia32']
			}
		]
	},
	nsis: {
		oneClick: false,
		allowElevation: true,
		allowToChangeInstallationDirectory: true,
		installerIcon: path.join(
			__dirname,
			'../wallpaper/static/images/favicon.ico'
		),
		uninstallerIcon: path.join(
			__dirname,
			'../wallpaper/static/images/favicon.ico'
		),
		installerHeaderIcon: path.join(
			__dirname,
			'../wallpaper/static/images/favicon.ico'
		),
		createDesktopShortcut: true,
		createStartMenuShortcut: true,
		shortcutName: 'super-wallpaper'
	}
}
module.exports = config
