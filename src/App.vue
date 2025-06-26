<!--
 * @Author: jares
 * @Date: 2025-05-26 14:05:09
 * @LastEditors: jares
 * @LastEditTime: 2025-06-26 17:53:49
 * @Description: 
 * 
 * Copyright (c) 2025 by jares, All Rights Reserved. 
-->
<template>
	<div class="container">
		<router-view />
	</div>
</template>
<script setup>
	import { onMounted, ref } from 'vue'
</script>
<style scoped>
.container {
	width: 100vw;
	height: 100vh;
}
</style>
