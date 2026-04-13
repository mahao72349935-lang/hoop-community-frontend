<!--
 * @Description: 
 * @Author: mahao
 * @Date: 2026-04-13 16:10:50
 * @LastEditors: mahao
 * @LastEditTime: 2026-04-13 16:36:39
-->
<template>
    <div class="tab-bar-container">
        <nut-tabbar v-model="activeTab" @tab-switch="tabSwitch" bottom safe-area-inset-bottom inactive-color="#7d7e80"
            active-color="#699E3C">
            <nut-tabbar-item v-for="item in tabList" :key="item.name" :name="item.name" :tab-title="item.title"
                :icon="item.icon">
            </nut-tabbar-item>
        </nut-tabbar>
    </div>
</template>
<script setup>
const tabList = ref([
    {
        title: '首页',
        icon: 'home',
        name: 'home'
    },
    {
        title: '我的',
        icon: 'my',
        name: 'mine'
    }
]);
const props = defineProps({
    tab: {
        type: String,
        default: 'home'
    }
});

const activeTab = ref('home');

onShow(() => {
    activeTab.value = props.tab;
});

const tabSwitch = (item) => {
    uni.switchTab({
        url: `/pages/${item.name}/index`
    });
};
</script>

<style scoped>
.tab-bar-container {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1000;
}
</style>
