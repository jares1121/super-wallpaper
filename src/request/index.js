/*
 * @Author: jares
 * @Date: 2022-07-21 17:57:17
 * @LastEditors: jares
 * @LastEditTime: 2025-06-06 10:24:04
 * @Description:
 *
 * Copyright (c) 2022 by jares, All Rights Reserved.
 */
import axios from 'axios'

let isHttpRequestStatus = true

axios.defaults.headers['clientid'] = import.meta.env.VITE_APP_CLIENT_ID
const service = axios.create({
	baseURL: import.meta.env.VITE_APP_BASE_API, // api 的 base_url
	timeout: 30000 // request timeout
})

service.interceptors.request.use(
	(config) => {
		config.headers['Content-Type'] = 'application/json;charset=UTF-8'
		config.headers.Accept = 'application/json'
		return config
	},
	(error) => {
		console.log(error) // for debug
		Promise.reject(error)
	}
)

// 请求返回
service.interceptors.response.use(
	(response) => {
		const res = response.data
		return res
		if (res.code === 200) {
		} else {
			// Vue.prototype.$message.error('出错，请联系管理员！')
			return {
				err: res
			}
		}
	},
	(error) => {
		if (error.response.data.code) {
			return false
		}
		console.log(error) // for debug
		// Vue.prototype.$message.error(error.response.statusText)
		return {
			err: error.response
		}
	}
)
export default service
