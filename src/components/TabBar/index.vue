<template>
    <div class="tab-bar-container">
        <nut-tabbar v-model="activeTab" @tab-switch="tabSwitch" bottom safe-area-inset-bottom inactive-color="#7d7e80"
            active-color="#6474E5">
            <nut-tabbar-item v-for="item in tabList" :key="item.name" :name="item.name" :tab-title="item.title">
                <template #icon>
                    <nut-icon font-class-name="iconfont" class-prefix="icon" :name="item.iconName"
                        :color="activeTab === item.name ? '#6474E5' : '#7d7e80'" />
                </template>
            </nut-tabbar-item>
        </nut-tabbar>
    </div>
</template>

<script setup>
import { ref } from 'vue';
const tabList = ref([
    {
        title: '首页',
        customType: 'iconfont',
        iconName: 'home',
        name: 'home'
    },
    {
        title: '我的球队',
        name: 'myTeam',
        customType: 'iconfont',
        iconName: 'team',
    },
    {
        title: '我的',
        customType: 'iconfont',
        iconName: 'mine',
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

watch(() => props.tab, (newVal) => {
    activeTab.value = newVal;
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

/* 控制自定义图片的大小，保持与内置图标一致 */
.custom-tab-icon {
    width: 40rpx;
    height: 40rpx;
    display: block;
}
</style>
