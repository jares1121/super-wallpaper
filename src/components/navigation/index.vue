<template>
	<div class="navigation">
		<ul>
			<li
				v-for="(item, index) in navigationArr"
				:key="index"
				:class="navigationActive === index ? 'active' : ''"
				@click="navigationClick(item, index)">
				<div class="b-box">{{ item.name }}</div>
			</li>
		</ul>
	</div>
</template>
<script>
export default {
	name: 'navigation',
	data() {
		return {
			navigationActive: 0,
			navigationArr: [
				{
					name: '发现音乐',
					label: 'discover'
				},
				{
					name: '播客',
					label: 'podcast'
				},
				{
					name: '视频'
				},
				{
					name: '关注'
				},
				{
					name: '直播'
				},
				{
					name: '私人FM'
				}
			]
		}
	},
	mounted() {},
	methods: {
		navigationClick(item, index) {
			console.log(item)
			this.navigationActive = index
			this.$router.push({ path: item.label })
		}
	}
}
</script>
<style lang="scss" scoped>
.navigation {
	width: 100%;
	ul {
		padding: 10px;
		height: calc(100vh - 60px - 60px);
		border-right: 1px solid rgba(255, 255, 255, 0.1);
		box-sizing: border-box;
		li {
			margin: 2.5px 0;
			line-height: 36px;
			cursor: pointer;
			.b-box {
				color: rgba(255, 255, 255, 0.8);
				padding: 0 10px;
				border-radius: 3px;
			}
			&:hover {
				.b-box {
					background-color: rgba(255, 255, 255, 0.1);
				}
			}
			&.active {
				.b-box {
					background-color: rgba(255, 255, 255, 0.1);
				}
			}
		}
	}
}
</style>
