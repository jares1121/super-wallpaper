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
const { app, Tray, Menu, BrowserWindow } = require('electron')

const { mainWindow } = require('./main')
var trayMenuTemplate = [
	{
		label: '显示主窗口',
		icon: path.join(__dirname, './static/images/1.png'), //设置单个菜单项图标
		click: function () {
			mainWindow.show()
		}
	},
	{
		label: '退出客户端',
		click: function () {
			app.quit()
		}
	}
]
//系统托盘图标目录
let iconPath = path.join(__dirname, './static/images/icon.png')
let appTray = new Tray(iconPath)
//图标的上下文菜单
const contextMenu = Menu.buildFromTemplate(trayMenuTemplate)
//设置此托盘图标的悬停提示内容
appTray.setToolTip('super-wallpaper')
//设置此图标的上下文菜单 与右键点击冲突
// appTray.setContextMenu(contextMenu)

appTray.on('right-click', function (event, bounds) {
	createCustomTray(bounds)
})
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
		mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
		// 关闭托盘显示
		// appTray.destroy();
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
			preload: path.join(__dirname, 'preload.js')
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
