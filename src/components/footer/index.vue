<!--
 * @Author: jares
 * @Date: 2023-01-13 22:58:16
 * @LastEditors: jares
 * @LastEditTime: 2023-01-14 13:47:35
 * @Description:
 *
 * Copyright (c) 2023 by jares, All Rights Reserved.
-->
<template>
	<div class="footer">
		<div class="left">
			<div class="img">
				<img :src="$store.state.music.obj.img" v-if="$store.state.music.obj.img" alt="" />
			</div>
		</div>
		<div class="center">
			<div class="btn prev">
				<span class="iconfont icon-prev"></span>
			</div>
			<div class="btn player" @click="player">
				<span class="iconfont icon-play" v-if="!this.status"></span>
				<span class="iconfont icon-pause" v-else></span>
			</div>
			<div class="btn next">
				<span class="iconfont icon-next"></span>
			</div>
		</div>
		<div class="right"></div>
	</div>
</template>
<script>
export default {
	name: 'myFooter',
	data() {
		return {
			audio: null,
			// 是否播放
			status: true
		}
	},
	mounted() {},
	watch: {
		'$store.state.music': {
			handler: function (newVal, oldVal) {
				this.status = this.$store.state.music.audio.paused
			},
			deep: true //深度监听设置为 true
		}
	},
	methods: {
		player() {
			let audio = this.$store.state.music.audio
			// 是否暂停
			this.status = this.$store.state.music.audio.paused
			// 播放
			if (this.status) {
				audio.play()
				this.status = false
			} else {
				audio.pause()
				this.status = true
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.footer {
	width: 100%;
	height: 100px;
	padding: 20px;
	overflow: hidden;
	box-sizing: border-box;
	background-color: rgba(36, 36, 36, 1);
	position: relative;
	.left {
		height: 100%;
		float: left;
		.img {
			width: 60px;
			height: 100%;
			border-radius: 3px;
			overflow: hidden;
			background: #000;
			img {
				width: 100%;
				height: 100%;
				object-fit: cover;
			}
		}
	}
	.center {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		.btn {
			padding: 10px;
			float: left;
			cursor: pointer;
			&.player {
				border-radius: 100%;
				background-color: rgba(255, 255, 255, 0.1);
				&:hover {
					background-color: rgba(255, 255, 255, 0.2);
				}
			}
			&.prev:hover {
				color: #a40011;
			}
			&.next:hover {
				color: #a40011;
			}
		}
	}
	.right {
		float: right;
	}
}
</style>
