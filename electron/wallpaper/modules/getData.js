/*
 * @Author: jares
 * @Date: 2025-06-24 09:49:00
 * @LastEditors: jares
 * @LastEditTime: 2025-06-24 10:12:44
 * @Description:
 *
 * Copyright (c) 2025 by jares, All Rights Reserved.
 */
const https = require('https')
const { setNetwork } = require('./setPaper')

function init() {
	https
		.get(
			'https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=8',
			(response) => {
				let data = ''

				response.on('data', (chunk) => {
					data += chunk
				})

				response.on('end', () => {
					let obj = JSON.parse(data)
					console.log(
						'https://www.bing.com' +
							obj.images[0].urlbase+'_UHD.jpg'
					)
					let url = 'https://www.bing.com' + obj.images[0].urlbase + '_UHD.jpg'
					setNetwork(url)
				})
			}
		)
		.on('error', (error) => {
			console.error('Error:', error)
		})
}
module.exports = {
	init
}
