/*
 * @Author: jares
 * @Date: 2025-06-26 17:12:35
 * @LastEditors: jares
 * @LastEditTime: 2025-06-27 14:11:24
 * @Description: 
 * 
 * Copyright (c) 2025 by jares, All Rights Reserved. 
 */
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/style/style.css'
import '../static/iconfont/iconfont.css'

const app = createApp(App)

app.use(router)
app.mount('#app')
