<!--
 * @Author: jares
 * @Date: 2023-01-06 10:49:22
 * @LastEditors: jares
 * @LastEditTime: 2025-06-27 14:50:24
 * @Description:
 *
 * Copyright (c) 2023 by jares, All Rights Reserved.
-->
<template>
	<div id="header" class="header">
		<div class="logo"></div>
		<div class="btn-group">
			<div title="最小化" @click="operate.minimize">
				<span class="iconfont icon-minimize"></span>
			</div>
			<div title="最大化" @click="operate.maximize">
				<span class="iconfont icon-maximize1"></span>
			</div>
			<div title="关闭" @click="operate.close">
				<span class="iconfont icon-close"></span>
			</div>
		</div>
	</div>
</template>
<script setup>
	const operate = {
		minimize: () => {
			window.electronAPI.minimize('最小化')
		},
		maximize: () => {
			window.electronAPI.toggle('最大化')
		},
		close: () => {
			window.electronAPI.close('关闭')
		}
	}
</script>
<style lang="scss" scoped>
	.header {
		height: 60px;
		padding: 0 20px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		overflow: hidden;
		background-color: rgba(36, 36, 36, 1);
		border-bottom: 2px solid #a40011;
		-webkit-app-region: drag;
		-webkit-user-select: none;
		.logo {
			width: 160px;
			height: 40px;
			// background-color: red;
			// background: url('https://s2.music.126.net/style/web2/img/frame/topbar.png')
			// 	no-repeat 0 -15px;
		}
		.btn-group {
			display: flex;
			gap: 20px;
			-webkit-app-region: no-drag;
			div {
				color: rgba(255, 255, 255, 0.6);
				cursor: pointer;
				&:hover {
					color: rgba(255, 255, 255, 0.8);
				}
			}
		}
	}
</style>
