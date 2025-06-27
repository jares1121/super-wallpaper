<!--
 * @Author: jares
 * @Date: 2025-06-26 17:51:17
 * @LastEditors: jares
 * @LastEditTime: 2025-06-27 10:06:36
 * @Description: 
 * 
 * Copyright (c) 2025 by jares, All Rights Reserved. 
-->
<template>
	<div class="home">
		<div class="list">
			<ul>
				<li
					v-for="(item, index) in list"
					:key="index"
					@click="set(item, index)"
				>
					<img :src="item.url" :alt="item.title" />
					<div class="title">{{ item.title }}</div>
				</li>
			</ul>
		</div>
	</div>
</template>

<script setup>
	// 这里可以导入其他文件（比如：组件，工具js，第三方插件js，json文件，图片文件等等）
	// 例如：import 《组件名称》 from '《组件路径》';
	import { ref, reactive, onMounted } from 'vue'
	const list = ref([])
	import { homeApi } from '@/api/index.js'
	onMounted(() => {
		// 页面加载完成后执行的代码
		get()
	})
	const get = async () => {
		console.log(11)
		let params = {
			format: 'js',
			idx: 0,
			n: 8
		}
		const { images } = await homeApi.getPaperList(params)
		list.value = images.map((item) => {
			return {
				url: `https://www.bing.com/${item.urlbase}_UHD.jpg`,
				title: item.title
			}
		})
	}
	const set = (item, index) => {
		window.trayAPI.setPaper({ url: item.url, type: 1 })
	}
</script>

<style lang="scss" scoped>
	.list {
		padding: 20px;
		ul {
			display: flex;
			flex-wrap: wrap;
			list-style: none;
			overflow: hidden;
			gap: 20px;
			li {
				display: flex;
				flex: 1 1 calc(25% - 20px);
				/* 三列计算，考虑gap */
				max-width: calc(25% - 15px);
				/* 最小宽度，防止过小 */
				border-radius: 10px;
				overflow: hidden;
				position: relative;
				img {
					width: 100%;
				}
				.title {
					font-size: 14px;
					width: 100%;
					height: 40px;
					color: #fff;
					padding-left: 20px;
					line-height: 40px;
					position: absolute;
					bottom: 0;
					background-color: rgba(0, 0, 0, 0.5);
				}
			}
		}
	}
</style>
