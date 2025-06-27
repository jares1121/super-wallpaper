<!--
 * @Author: jares
 * @Date: 2023-01-04 09:30:59
 * @LastEditors: jares
 * @LastEditTime: 2025-06-27 15:44:06
 * @Description:
 *
 * Copyright (c) 2023 by jares, All Rights Reserved.
-->
<template>
	<div class="container">
		<Header></Header>
		<div class="main">
			<router-view />
		</div>
	</div>
</template>
<script>
	import Header from '@/components/header'
	import Footer from '@/components/footer'
	import Navigation from '@/components/navigation'
	export default {
		name: 'App',
		components: { Header, Footer, Navigation }
	}
</script>
<style lang="scss" scoped>
	.container {
		height: 100%;
		display: flex;
		flex-direction: column;
		box-shadow: 0 0 10px rgba(0, 0, 0, 1);
	}
	.main {
		flex: 1;
		// height: calc(100vh - 62px - 100px);
		background-color: rgba(36, 36, 36, 0.96);
		overflow: hidden;
		.navigation {
			width: 200px;
			float: left;
		}
		.router-view {
			width: calc(100% - 200px);
			padding: 20px;
			float: left;
			box-sizing: border-box;
		}
	}
</style>
