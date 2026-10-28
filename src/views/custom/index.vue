<!--
 * @Author: jares
 * @Date: 2025-06-27 17:06:56
 * @LastEditors: jares
 * @LastEditTime: 2025-06-27 17:50:50
 * @Description: 设置面板（本地图片 / 网络图片 / 自定义水印文字）
 * 
 * Copyright (c) 2025 by jares, All Rights Reserved. 
-->
<template>
	<div class="custom">
		<div class="box">
			<div id="header" class="header">
				<div class="btn-group">
					<div id="close" title="关闭" @click="close">
						<svg
							t="1724077192805"
							id="icon"
							class="icon"
							viewBox="0 0 1024 1024"
							version="1.1"
							xmlns="http://www.w3.org/2000/svg"
							p-id="4441"
							width="256"
							height="256"
						>
							<path
								d="M594.983303 512.554066l411.9697 411.9697a58.304836 58.304836 0 0 1-82.428037 82.428036L512.555267 594.982103 100.585567 1006.951802a58.304836 58.304836 0 0 1-82.428036-82.428036L430.127231 512.554066 18.157531 100.584367A58.304836 58.304836 0 1 1 100.585567 18.156331L512.555267 430.12603 924.524966 18.156331a58.304836 58.304836 0 0 1 82.428037 82.428036L594.983303 512.554066z"
								fill="#ffffff"
								p-id="4442"
							></path>
						</svg>
					</div>
				</div>
			</div>
			<div class="body">
				<h1>壁纸设置</h1>

				<!-- 文字水印 -->
				<div class="section">
					<label class="label">水印文字</label>
					<input
						type="text"
						id="watermark"
						class="input"
						v-model="watermark"
						placeholder="留空则使用默认文字"
					/>
					<label class="checkbox">
						<input type="checkbox" v-model="enableWatermark" />
						<span>启用水印</span>
					</label>
				</div>

				<!-- 本地图片 -->
				<div class="section">
					<div class="local">
						<div class="btn" id="btnLocal" @click="btnLocal">
							<input type="file" value="" id="fileInput" />
							<span>选择本地图片</span>
						</div>
						<span class="file-name" v-if="localPath">{{ localPath }}</span>
					</div>
				</div>

				<!-- 网络图片 -->
				<div class="section">
					<div class="network">
						<input
							type="text"
							id="network"
							class="input"
							v-model="networkUrl"
							placeholder="图片 URL (https://...)"
						/>
						<div class="btn" id="btnNetwork" @click="btnNetwork">
							设置网络图片
						</div>
					</div>
				</div>

				<!-- 状态提示 -->
				<div class="status" v-if="status">{{ status }}</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue'

// 状态
const watermark = ref('')
const enableWatermark = ref(true)
const localPath = ref('')
const networkUrl = ref('')
const status = ref('')

/** 组装传给主进程的参数：统一加上 text */
function buildParams(url, type) {
	return {
		url,
		type,
		text: enableWatermark.value ? watermark.value || '你的自定义文字' : ''
	}
}

function btnLocal() {
	const input = document.getElementById('fileInput')
	if (!input) return
	input.value = '' // 允许重复选同一个文件
	input.onchange = (event) => {
		const fileList = event.target.files
		if (fileList && fileList.length > 0) {
			localPath.value = fileList[0].path
			const params = buildParams(localPath.value, 0)
			status.value = '正在设置本地图片...'
			window.trayAPI.setPaper(params)
			setTimeout(() => (status.value = ''), 2000)
		}
	}
	input.click()
}

function btnNetwork() {
	if (!networkUrl.value.trim()) {
		status.value = '请先填写图片 URL'
		return
	}
	const params = buildParams(networkUrl.value.trim(), 1)
	status.value = '正在下载网络图片并设置...'
	window.trayAPI.setPaper(params)
	setTimeout(() => (status.value = ''), 3000)
}

function close() {
	window.trayAPI.setClose('关闭')
}
</script>

<style lang="scss" scoped>
.custom {
	width: 100%;
	height: 100%;
	color: #fff;
	border-radius: 5px;
	overflow: hidden;
	background: rgba(30, 30, 40, 0.95);
	box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
	.box {
		height: 100%;
		background: linear-gradient(135deg, #1e3a5f 0%, #2d5a3d 100%);
		display: flex;
		flex-direction: column;
		.header {
			height: 40px;
			display: flex;
			justify-content: right;
			align-items: center;
			overflow: hidden;
			-webkit-app-region: drag;
			.btn-group {
				-webkit-app-region: no-drag;
				div {
					color: rgba(255, 255, 255, 0.6);
					margin: 0 10px;
					float: left;
					cursor: pointer;
					&:hover {
						color: #fff;
					}
				}
				.icon {
					width: 12px;
					height: 12px;
					cursor: pointer;
					path {
						fill: rgba(255, 255, 255, 0.6);
					}
					&:hover path {
						fill: #ff6b6b;
					}
				}
			}
		}
		.body {
			flex: 1;
			padding: 20px;
			box-sizing: border-box;
			h1 {
				margin: 0 0 20px 0;
				font-size: 18px;
				font-weight: 600;
				color: #fff;
			}
			.section {
				margin-bottom: 18px;
				.label {
					display: block;
					font-size: 13px;
					color: rgba(255, 255, 255, 0.7);
					margin-bottom: 6px;
				}
				.checkbox {
					display: flex;
					align-items: center;
					gap: 6px;
					font-size: 12px;
					color: rgba(255, 255, 255, 0.7);
					margin-top: 8px;
					input {
						accent-color: #409eff;
					}
				}
			}
			.input {
				width: 100%;
				height: 34px;
				border: 1px solid rgba(64, 158, 255, 0.5);
				border-radius: 4px;
				padding: 0 10px;
				outline: none;
				background: rgba(255, 255, 255, 0.1);
				color: #fff;
				font-size: 13px;
				box-sizing: border-box;
				&::placeholder {
					color: rgba(255, 255, 255, 0.4);
				}
				&:focus {
					border-color: #409eff;
					background: rgba(255, 255, 255, 0.15);
				}
			}
			.local {
				display: flex;
				align-items: center;
				gap: 10px;
				.btn {
					font-size: 12px;
					padding: 0 16px;
					height: 34px;
					text-align: center;
					line-height: 34px;
					background-color: #409eff;
					border-radius: 4px;
					cursor: pointer;
					position: relative;
					white-space: nowrap;
					&:hover {
						background-color: #66b1ff;
					}
					input {
						position: absolute;
						top: 0;
						left: 0;
						width: 100%;
						height: 100%;
						opacity: 0;
						cursor: pointer;
					}
					span {
						position: relative;
						z-index: 0;
					}
				}
				.file-name {
					font-size: 11px;
					color: rgba(255, 255, 255, 0.5);
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
					max-width: 280px;
				}
			}
			.network {
				display: flex;
				gap: 10px;
				input {
					flex: 1;
				}
				.btn {
					font-size: 12px;
					padding: 0 16px;
					height: 34px;
					line-height: 34px;
					text-align: center;
					background-color: #67c23a;
					border-radius: 4px;
					cursor: pointer;
					white-space: nowrap;
					&:hover {
						background-color: #85ce61;
					}
				}
			}
			.status {
				margin-top: 14px;
				padding: 8px 12px;
				background: rgba(64, 158, 255, 0.2);
				border-left: 3px solid #409eff;
				color: rgba(255, 255, 255, 0.9);
				font-size: 12px;
				border-radius: 2px;
			}
		}
	}
}
</style>
