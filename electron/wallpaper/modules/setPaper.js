/*
 * @Author: jares
 * @Date: 2024-06-09 15:35:02
 * @LastEditors: jares
 * @LastEditTime: 2024-06-10 00:57:15
 * @Description: 
 * 
 * Copyright (c) 2024 by jares, All Rights Reserved. 
 */
const path = require('path')
const wallpaper = require('wallpaper')
// 设置壁纸 
async function init(url) {
	let _default = path.join(__dirname, '../static/wallpaper/default.jpg')
	let filePath = url || _default
	wallpaper.set(filePath)
}
module.exports = {
	init
}