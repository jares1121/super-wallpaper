/*
 * @Author: jares
 * @Date: 2024-06-10 01:09:25
 * @LastEditors: jares
 * @LastEditTime: 2024-07-07 18:52:01
 * @Description:
 *
 * Copyright (c) 2024 by jares, All Rights Reserved.
 */
module.exports = {
	makers: [
		{
			name: '@electron-forge/maker-squirrel',
			config: {
				name: 'electron_quick_start'
			}
		},
		{
			name: '@electron-forge/maker-zip',
			platforms: ['win32']
		},
		{
			name: '@electron-forge/maker-deb',
			config: {}
		},
		{
			name: '@electron-forge/maker-rpm',
			config: {}
		}
	],
	packagerConfig: {
		name: '超级壁纸',
		// productName: 'My Electron App', // 产品名称（用于生成安装包的名称）
		out: 'true', // 输出目录的路径
		asar: true,
		appCopyright: 'Copyright © 2024', // 版权信息
		executableName: 'super-wallpaper',
		// extraFiles: ['./electron/wallpaper/html'],
		extraResource: ['./electron/wallpaper/static'], // 静态文件
		icon: './electron/wallpaper/static/images/icon.ico', // 不用加后缀，但是需要准备3个文件，win: icon.ico, mac: icon.icns, linux: icon.png，打包时自动识别，linux 在BrowserWindow构造参数中设置
		// platform: ["darwin", "win32", "linux"],
		outputDirectory: 'C:\\CustomPath\\YourApp'
	},
	publishers: [
		{
			name: '@electron-forge/publisher-electron-release-server',
			platforms: ['darwin', 'linux'],
			config: {
				baseUrl: 'https://update.server.com',
				channel: 'stable',
				username: 'admin',
				password: 'admin'
			}
		},
		{
			name: '@electron-forge/publisher-github',
			config: {
				repository: {
					owner: 'jares1121',
					name: 'super-wallpaper'
				},
				prerelease: false,
				draft: true
			}
		}
	]
}
