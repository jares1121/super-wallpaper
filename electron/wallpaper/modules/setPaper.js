/*
 * @Author: jares
 * @Date: 2024-06-09 15:35:02
 * @LastEditors: jares
 * @LastEditTime: 2024-06-10 17:18:09
 * @Description: 
 * 
 * Copyright (c) 2024 by jares, All Rights Reserved. 
 */
const path = require('path')
const wallpaper = require('wallpaper')
// 设置壁纸 
async function init(url) {
	let _default =
		process.cwd() + '/electron/wallpaper/static/wallpaper/default.jpg'
	let filePath = url || _default
	wallpaper.set(filePath)
	return filePath
}
module.exports = {
	init
}