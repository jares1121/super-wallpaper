/*
 * @Author: jares
 * @Date: 2024-06-09 15:35:02
 * @LastEditors: jares
 * @LastEditTime: 2024-07-07 23:45:53
 * @Description:
 *
 * Copyright (c) 2024 by jares, All Rights Reserved.
 */
const fs = require('fs')
const path = require('path')
const request = require('request')
const wallpaper = require('wallpaper')
function getImg() {
	var img_src =
		'https://static.wetab.link/widget-background/background01_larg.jpg' //获取图片的url
	//采用request模块，向服务器发起一次请求，获取图片资源
	request.head(img_src, function (err, res, body) {
		if (err) {
			console.log(err)
		}
	})

	var img_filename = 'mu.jpg'
	let _path = './static/' + img_filename
	//通过流的方式，把图片写到本地/image目录下，并用新闻的标题和图片的标题作为图片的名称。
	request(img_src).pipe(fs.createWriteStream(_path))
	return _path
}
// 设置壁纸
async function init(url) {
	let _default = path.join(
		process.resourcesPath,
		'/static/wallpaper/default.jpg'
	)
	let filePath = url || _default
	// wallpaper.set('F:/super-wallpaper/static/mu.jpg')
	let u = path.join(__dirname, '../../../' + getImg())
	console.log(u)
	// wallpaper.set('F:/super-wallpaper/static/1720366734596.jpg')
	setTimeout(() => {
		wallpaper.set(u)
	}, 1000);
	return filePath
}
module.exports = {
	init
}
