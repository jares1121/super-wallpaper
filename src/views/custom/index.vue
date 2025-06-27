<!--
 * @Author: jares
 * @Date: 2025-06-27 17:06:56
 * @LastEditors: jares
 * @LastEditTime: 2025-06-27 17:50:50
 * @Description: 
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
				<h1>设置</h1>
				<div class="body-box">
					<div class="local">
						<div class="btn" id="btnLocal" @click="btnLocal">
							<input type="file" value="" id="fileInput" />
							<span> 选择文件 </span>
						</div>
					</div>
					<div class="network">
						<input type="text" id="network" />
						<div class="btn" id="btnNetwork" @click="btnNetwork">
							设置网络
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
	// 这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
	// 例如：import 《组件名称》 from '《组件路径》';
	import { ref, reactive } from 'vue'
	const path = ref('') // 存储文件路径
	const btnLocal = () => {
		document
			.getElementById('fileInput')
			.addEventListener('change', (event) => {
				const fileList = event.target.files // 文件列表
				if (fileList.length > 0) {
					// 获取第一个文件的实际路径
					path.value = fileList[0].path
					window.trayAPI.setPaper({ url: path.value, type: 0 })
				}
			})
	}
	const btnNetwork = () => {
		// window.trayAPI.get()
		// type 0 本地 1网络
		let type = 1
		var network = document.getElementById('network').value
		window.trayAPI.setPaper({ url: network, type: type })
	}
	const close = () => {
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
		background: rgba(255, 255, 255, 1);
		box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
		/* -webkit-app-region: drag;
			-webkit-user-select: none; */
		.box {
			height: 100%;
			background: rgba(109, 178, 109, 1);
			.header {
				height: 40px;
				display: flex;
				justify-content: right;
				align-items: center;
				overflow: hidden;
				-webkit-app-region: drag;
				-webkit-user-select: none;
				.btn-group {
					-webkit-app-region: no-drag;
					div {
						color: rgba(0, 0, 0, 6);
						margin: 0 10px;
						float: left;
						cursor: pointer;

						&:hover {
							color: rgba(255, 255, 255, 0.8);
						}
					}
					.icon {
						width: 12px;
						height: 12px;
						cursor: pointer;
						path {
							fill: rgba(255, 255, 255, 1);
							/* 设置填充颜色为蓝色 */
						}
						&:hover path {
							fill: rgba(255, 255, 255, 0.5);
							/* 设置填充颜色为蓝色 */
						}
					}
				}
			}
			.body {
				padding: 20px;
				box-sizing: border-box;
				.body-box {
					display: flex;
					flex-direction: column;
					gap: 20px;
					.local {
						.btn {
							font-size: 12px;
							width: 60px;
							height: 30px;
							text-align: center;
							line-height: 30px;
							background-color: #409eff;
							border-radius: 3px;
							cursor: pointer;
							position: relative;
						}
						input {
							width: 100%;
							height: 100%;
							display: block;
							opacity: 0;
							position: relative;
							z-index: 1;
							cursor: pointer;
						}
						span {
							width: 100%;
							height: 100%;
							position: absolute;
							top: 0;
							left: 0;
							z-index: 0;
						}
					}
					.network {
						display: flex;
						gap: 20px;
						input {
							width: 200px;
							height: 30px;
							border: 1px solid #409eff;
							border-radius: 3px;
							padding-left: 10px;
							outline: none;
						}
					}
					.btn {
						font-size: 12px;
						width: 60px;
						height: 30px;
						text-align: center;
						line-height: 30px;
						background-color: #409eff;
						border-radius: 3px;
						cursor: pointer;
						position: relative;
					}
				}
			}
		}
	}
</style>
