/*
 * @Author: jares
 * @Date: 2022-12-28 17:56:16
 * @LastEditors: jares
 * @LastEditTime: 2024-08-18 00:12:15
 * @Description:
 * 暴露API
 * Copyright (c) 2023 by jares, All Rights Reserved.
 */
// const os = require('os')
const { contextBridge, ipcRenderer } = require('electron')
window.addEventListener('DOMContentLoaded', () => {
	const replaceText = (selector, text) => {
		const element = document.getElementById(selector)
		if (element) element.innerText = text
	}

	for (const dependency of ['chrome', 'node', 'electron']) {
		replaceText(`${dependency}-version`, process.versions[dependency])
	}
})
contextBridge.exposeInMainWorld('electronAPI', {
	// platform: os.platform(),
	electron: () => process,
	maximize: (params) => ipcRenderer.send('maximize', params),
	unmaximize: (params) => ipcRenderer.send('unmaximize', params),
	minimize: (params) => ipcRenderer.send('minimize', params),
	restore: (params) => ipcRenderer.send('restore', params),
	close: (params) => ipcRenderer.send('close', params),
	reset: (params) => ipcRenderer.send('reset', params)
})
contextBridge.exposeInMainWorld('musicAPI', {
	play: (params) => ipcRenderer.send('musicPlay', params)
})
contextBridge.exposeInMainWorld('trayAPI', {
	// 退出
	quit: (params) => ipcRenderer.send('quit', params),
	// get: (params) =>  ipcRenderer.on('message-from-main', (event, arg) => {
	// console.log(arg, 'arg') // 打印主进程发送的消息
	// }),
	// 设置
	set: (params) => ipcRenderer.send('set', params),
	// 设置壁纸
	setPaper: (params) => ipcRenderer.send('setPaper', params)
})
// 更新
contextBridge.exposeInMainWorld('updateApi', {
	// 检查更新按钮
	update: (params) => ipcRenderer.send('update', params),
	// 更新进度
	updatePercent: () => ipcRenderer.invoke('updatePercent')
})
