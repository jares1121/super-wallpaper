/*
 * @Author: jares
 * @Date: 2024-06-09 15:35:02
 * @LastEditors: jares
 * @LastEditTime: 2025-06-27 15:33:47
 * @Description: 设置壁纸（支持网络下载 + 本地路径 + 文字水印）
 *
 * Copyright (c) 2024 by jares, All Rights Reserved.
 */
const fs = require('fs')
const path = require('path')
const request = require('request')
const wallpaper = require('wallpaper')
const sharp = require('sharp')

/**
 * @description: 给图片加文字水印（带半透明黑底 + 阴影描边）
 * @param {string} imagePath - 图片路径
 * @param {string} text - 要叠加的文字
 * @param {object} options - 样式配置
 * @returns {Promise<string>} 输出图片路径
 */
async function addTextToImage(imagePath, text, options = {}) {
	const {
		fontSize = 50,
		fontColor = '#ffffff',
		x = 100,
		y = 200,
		shadow = true,
		lineWidth = 22
	} = options

	const image = sharp(imagePath)
	const metadata = await image.metadata()

	// 如果没传文字，直接在原图旁生成一张带默认水印的版本
	if (!text) {
		const parsed = path.parse(imagePath)
		return path.join(parsed.dir, `${parsed.name}_with_text${parsed.ext}`)
	}

	// 按每行 lineWidth 字符自动换行
	const lines = []
	for (let i = 0; i < text.length; i += lineWidth) {
		lines.push(text.substring(i, i + lineWidth))
	}

	let textElements = ''
	let maxLineWidth = 0
	lines.forEach((line, index) => {
		const lineY = y + index * (fontSize + 10)
		maxLineWidth = Math.max(maxLineWidth, line.length * fontSize * 0.6)
		textElements += `<tspan x="${x}" y="${lineY}">${line}</tspan>`
	})

	const bgPadding = 15
	const bgHeight = lines.length * (fontSize + 10) + bgPadding
	const bgY = y - fontSize - 10

	const bgRect = `
      <rect x="${x - bgPadding}" y="${bgY}" 
            width="${maxLineWidth + bgPadding * 2}" 
            height="${bgHeight}" 
            fill="rgba(0,0,0,0.6)" 
            rx="8" />
    `

	const svgText = `
    <svg width="${metadata.width}" height="${metadata.height}" viewBox="0 0 ${metadata.width} ${metadata.height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow">
          <feDropShadow dx="1" dy="1" stdDeviation="1" flood-opacity="0.9"/>
        </filter>
      </defs>
      ${bgRect}
      <text font-size="${fontSize}" 
            fill="${fontColor}" 
            font-family="Microsoft YaHei, SimHei, sans-serif"
            font-weight="bold"
            text-rendering="optimizeLegibility"
            ${shadow ? 'filter="url(#shadow)"' : ''}>
        ${textElements}
      </text>
    </svg>
  `.trim()

	const parsed = path.parse(imagePath)
	const outputPath = path.join(parsed.dir, `${parsed.name}_with_text${parsed.ext}`)

	// 2x 放大 + SVG 合成 + Lanczos3 缩回来，提升文字清晰度
	await image
		.resize(metadata.width * 2, metadata.height * 2)
		.composite([
			{
				input: Buffer.from(svgText),
				top: 0,
				left: 0
			}
		])
		.resize(metadata.width, metadata.height, {
			kernel: sharp.kernel.lanczos3
		})
		.toFile(outputPath)

	return outputPath
}

/**
 * @description: 网络下载图片（Promise 封装）
 * @param {string} url - 图片 URL
 * @returns {Promise<string>} 下载后的绝对路径
 */
async function getImg(url) {
	const imgFilename = 'mu.jpg'
	const saveDir = path.join(__dirname, '../static/wallpaper')
	const savePath = path.join(saveDir, imgFilename)

	// 确保目录存在
	if (!fs.existsSync(saveDir)) {
		fs.mkdirSync(saveDir, { recursive: true })
	}

	return new Promise((resolve, reject) => {
		request(url)
			.pipe(fs.createWriteStream(savePath))
			.on('finish', () => resolve(savePath))
			.on('error', (err) => {
				console.error('[setPaper] 下载图片失败:', err.message)
				reject(err)
			})
	})
}

/**
 * @description: 设置网络图片为壁纸（下载 → 加水印 → 设置）
 */
async function setNetwork(url, text) {
	const savedPath = await getImg(url)
	const imageWithText = await addTextToImage(
		savedPath,
		text || '这歌词让我想起了从前 —— 网易云网友'
	)
	await wallpaper.set(imageWithText)
}

/**
 * @description: 设置本地图片为壁纸（加水印 → 设置）
 */
async function setLocal(url, text) {
	// 打包后优先用 resourcesPath 下的默认图
	let _default = path.join(
		process.resourcesPath,
		'/static/wallpaper/default.jpg'
	)
	// 开发态 fallback
	if (!fs.existsSync(_default)) {
		_default = path.join(__dirname, '../static/wallpaper/default.jpg')
	}
	const filePath = url || _default
	const imageWithText = await addTextToImage(filePath, text || '你的自定义文字')
	await wallpaper.set(imageWithText)
}

/**
 * @description: 对外主入口
 * @param {{ url?: string, type: number, text?: string } | null} obj
 *   - type: 0 = 本地图片，1 = 网络图片
 */
async function init(obj) {
	try {
		// 无参数时：用默认图 + 默认水印
		if (!obj) {
			let _default = path.join(__dirname, '../static/wallpaper/default.jpg')
			const imageWithText = await addTextToImage(_default, '你的自定义文字')
			await wallpaper.set(imageWithText)
			return
		}

		const { url, type, text } = obj
		if (type === 0) {
			await setLocal(url, text)
		} else if (type === 1) {
			await setNetwork(url, text)
		}
	} catch (err) {
		console.error('[setPaper] init 执行失败:', err.message)
		throw err
	}
}

module.exports = {
	init,
	setLocal,
	setNetwork
}
