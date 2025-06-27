import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
// https://vite.dev/config/
export default defineConfig({
	plugins: [vue()],
	resolve: {
		alias: {
			'~': path.resolve(__dirname, './'),
			'@': path.resolve(__dirname, './src'),
			'vue-i18n': 'vue-i18n/dist/vue-i18n.cjs.js'
		},
		extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
	},
	server: {
		host: '0.0.0.0',
		open: true,
		proxy: {
			['/bing']: {
				target: 'https://www.bing.com',
				// 临沂 10026
				changeOrigin: true,
				ws: true,
				rewrite: (path) => path.replace(new RegExp('^' + '/bing'), '')
			}
		}
	}
})
