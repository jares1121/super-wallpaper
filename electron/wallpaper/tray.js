/*
 * @Author: jares
 * @Date: 2022-12-29 13:49:56
 * @LastEditors: jares
 * @LastEditTime: 2024-06-10 01:00:29
 * @Description:
 *
 * Copyright (c) 2022 by jares, All Rights Reserved.
 */
const path = require('path')
const { app, Tray, Menu, BrowserWindow, ipcMain, dialog } = require('electron')
const wallpaper = require('./modules/wallpaper')

const { mainWindow } = require('./main')

let wallpaperEnabled = true

var trayMenuTemplate = [
	{
		label: '显示主窗口',
		icon: path.join(__dirname, './static/images/1.png'),
		click: function () {
			if (mainWindow) mainWindow.show()
		}
	},
	{
		label: '动态壁纸: 已开启',
		id: 'wallpaper-toggle',
		type: 'checkbox',
		checked: true,
		click: function (item) {
			wallpaperEnabled = item.checked
			if (wallpaperEnabled) {
				wallpaper.createWallpaperWindow({ debug: true })
			} else {
				wallpaper.destroyWallpaperWindow()
			}
			// 同步 main.js 的开关状态（两个地方都能控制）
			ipcMain.emit('wallpaper:toggle', null)
		}
	},
	{ type: 'separator' },
	{
		label: '选择壁纸',
		submenu: [
			{
				label: '视频文件 (mp4/webm/mov...)',
				click: () => pickWallpaperFile([{ name: '视频', extensions: ['mp4', 'webm', 'mov', 'm4v', 'avi', 'ogg', 'mkv'] }])
			},
			{
				label: '图片 / GIF',
				click: () => pickWallpaperFile([{ name: '图片', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'] }])
			},
			{
				label: '本地网页 (HTML)',
				click: () => pickWallpaperFile([{ name: '网页', extensions: ['html', 'htm'] }])
			},
			{ type: 'separator' },
			{
				label: '网页地址...',
				click: () => openUrlPrompt()
			}
		]
	},
	{ type: 'separator' },
	{
		label: '退出客户端',
		click: function () {
			app.quit()
		}
	}
]

// 用系统文件选择器挑选本地壁纸（视频/图片/HTML），选中即切换
function pickWallpaperFile(filters) {
	try {
		const res = dialog.showOpenDialogSync({
			title: '选择壁纸文件',
			properties: ['openFile'],
			filters
		})
		if (res && res[0]) {
			wallpaper.setContent(res[0])
			console.log('[tray] 已设置壁纸:', res[0])
		}
	} catch (e) {
		console.error('[tray] 选择壁纸文件失败:', e.message)
	}
}

// 打开一个小输入框，让用户输入网页地址作为壁纸
function openUrlPrompt() {
	const w = new BrowserWindow({
		width: 440,
		height: 170,
		frame: false,
		resizable: false,
		movable: true,
		transparent: false,
		webPreferences: {
			preload: path.join(__dirname, './preload.js'),
			contextIsolation: true,
			nodeIntegration: false
		}
	})
	w.loadFile(path.join(__dirname, './html/prompt.html'))
	w.on('closed', () => {})
}
//系统托盘图标目录
let iconPath = path.join(__dirname, './static/images/icon.png')
let appTray = new Tray(iconPath)
//图标的上下文菜单
const contextMenu = Menu.buildFromTemplate(trayMenuTemplate)
//设置此托盘图标的悬停提示内容
appTray.setToolTip('super-wallpaper')
//启用原生右键菜单（比自定义 tray.html 更稳定）
appTray.setContextMenu(contextMenu)

// 自定义右键窗口暂时停用（原生菜单够用），如需恢复可打开下面注释
// appTray.on('right-click', function (event, bounds) {
// 	createCustomTray(bounds)
// })
//系统托盘图标闪烁
let count = 0,
	timer = null
timer = setInterval(function () {
	count++
	if (count % 2 == 0) {
		appTray.setImage(iconPath)
	} else {
		appTray.setImage(iconPath)
	}
}, 600)
//单点击 1.主窗口显示隐藏切换 2.清除闪烁
// 单击显示主窗口，再单击隐藏主窗口
appTray.on('click', function () {
	if (!!timer) {
		appTray.setImage(iconPath)
		//主窗口显示隐藏切换
		if (mainWindow) {
			mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
		}
	}
})

/**
 * @description: 创建自定义窗口
 * @param {*} bounds
 * @return {*}
 */
function createCustomTray(bounds) {
	let child = null
	if (child) {
		child.hide()
	}
	let width = 250
	let height = 400
	child = new BrowserWindow({
		width: width,
		height: height,
		icon: path.join(__dirname, './static/images/icon.png'),
		webPreferences: {
			preload: path.join(__dirname, './preload.js')
		},
		// 窗口是否永远在别的窗口的上面
		alwaysOnTop: true,
		// 创建一个无边框窗口
		frame: false,
		// 是否在任务栏中显示窗口
		skipTaskbar: true,
		// 窗口大小是否可调整
		transparent: true,
		resizable: false,
		maximizable: false
	})
	child.loadFile(path.join(__dirname, './html/tray.html'))
	child.setContentBounds({
		width: width,
		height: height,
		x: bounds.x + 5,
		y: bounds.y - height - 5
	})
	child.on('blur', function () {
		child.hide()
	})
}
