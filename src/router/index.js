/*
 * @Author: jares
 * @Date: 2025-05-26 14:32:13
 * @LastEditors: jares
 * @LastEditTime: 2025-05-26 14:34:31
 * @Description: 
 * 
 * Copyright (c) 2025 by jares, All Rights Reserved. 
 */
import { createRouter, createWebHistory,  } from 'vue-router'

// 定义路由规则
const routes  = [
	{
		path: '/home',
		name: 'Home',
		component: () => import('@/views/home/index.vue')
	}
]

// 创建路由实例
const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL), // 使用历史模式
	routes
})

export default router
