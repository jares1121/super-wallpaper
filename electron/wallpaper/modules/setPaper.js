/*
 * @Author: jares
 * @Date: 2024-06-09 15:35:02
 * @LastEditors: jares
 * @LastEditTime: 2025-06-27 15:33:47
 * @Description:
 *
 * Copyright (c) 2024 by jares, All Rights Reserved.
 */
const fs = require('fs')
const path = require('path')
const request = require('request')
const wallpaper = require('wallpaper')
function getImg(url) {
	//采用request模块，向服务器发起一次请求，获取图片资源
	request.head(url, function (err, res, body) {
		if (err) {
			console.log(err)
		}
	})
	var img_filename = 'action.jpg'
	let _path = '../static/wallpaper/' + img_filename
	let u = path.join(__dirname, _path)
	//通过流的方式，把图片写到本地/image目录下，并用新闻的标题和图片的标题作为图片的名称。
	request(url).pipe(fs.createWriteStream(u))
	return _path
}
// 设置壁纸
async function init(obj) {
	if (!obj) return false
	let url = obj.url
	let type = obj.type
	if (type === 0) {
		setLocal(url)
	}
	if (type === 1) {
		setNetwork(url)
	}
}
// 设置本地图片
function setLocal(url) {
	// let _default = path.join(
	// 	process.resourcesPath,
	// 	'/static/wallpaper/default.jpg'
	// )
	let _default = path.join(__dirname, '../static/wallpaper/default.jpg')
	console.log(_default)
	let filePath = _default
	console.log(url, 'url')

	wallpaper.set(filePath)
}
// 设置网络图片
function setNetwork(url) {
	let u = path.join(__dirname, getImg(url))
	setTimeout(() => {
		wallpaper.set(u)
	}, 1000)
}
module.exports = {
	init,
	setNetwork
}
