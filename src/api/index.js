/*
 * @Author: jares
 * @Date: 2023-09-08 09:25:49
 * @LastEditors: jares
 * @LastEditTime: 2025-06-27 10:11:22
 * @Description:
 *
 * Copyright (c) 2023 by jares, All Rights Reserved.
 */
import request from '@/request'
export const homeApi = {
	getPaperList: (query) => {
		return request({
			url: '/bing/HPImageArchive.aspx',
			method: 'get',
			params: query
		})
	}
}
