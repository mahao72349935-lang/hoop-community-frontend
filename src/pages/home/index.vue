<template>
    <view class="home-container">
        <div class="home-content">
            <div class="home-menu-container">
                <div class="home-menu-title">{{ currentMenuTitle }}</div>
                <div class="home-menu-content">
                    <div v-for="(item, index) in currentMenuItems" :key="index" class="home-menu-item"
                        @click="handleMenuClick(item)">
                        <div class="icon-block">
                            <nut-icon name="ask"></nut-icon>
                        </div>
                        <div>{{ item.name }}</div>
                    </div>
                </div>
            </div>
            <div>
                <div class="home-menu-title">球队列表</div>
                <div class="team-list-container">
                    <div class="team-list-item" v-for="team in teamList" :key="team.teamId">
                        <div class="team-list-item-logo">
                            <image :src="team.logoUrl" mode="aspectFill" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <TabBar tab="home" />
    </view>
</template>

<script setup>
import { getTeamListApi } from '@/api/team';
import TabBar from '@/components/TabBar/index.vue';
import { playerMenu, venueOwnerMenu } from '@/constants/homeMenu';
import { computed, ref } from 'vue';

const teamList = ref([]);

onMounted(() => {
    fetchTeamList();
});

const fetchTeamList = async () => {
    const data = await getTeamListApi();
    teamList.value = data;
};

// 用户角色 (这里可以从store或API获取)
const userRole = ref('player'); // 'player','venue_owner'

// 根据用户角色计算当前显示的菜单

const currentMenuItems = computed(() => {
    switch (userRole.value) {
        case 'player':
            return playerMenu;
        case 'venue_owner':
            return venueOwnerMenu;
    }
});

// 根据用户角色计算当前显示的标题
const currentMenuTitle = computed(() => {
    switch (userRole.value) {
        case 'player':
            return '球员';
        case 'venue_owner':
            return '场馆管理';
        default:
            return '球员';
    }
});

// 处理菜单点击
const handleMenuClick = (item) => {
    if (item.path) {
        uni.navigateTo({
            url: item.path
        });
    } else {
        uni.showToast({
            title: `${item.name}功能开发中`,
            icon: 'none'
        });
    }
};
</script>

<style lang="scss" scoped>
.home-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24rpx;
    box-sizing: border-box;

    .home-content {
        width: 100%;

        .home-menu-container {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background-color: #fff;
            padding: 24rpx;
            box-sizing: border-box;
            border-radius: 16rpx;
            overflow: hidden;
            gap: 24rpx;
            margin-bottom: 24rpx;

            .home-menu-title {
                width: 100%;
                font-size: 30rpx;
                color: #444;
                font-weight: bold;
                text-align: left;
                padding-left: 24rpx;
                box-sizing: border-box;
                position: relative;

                &:after {
                    content: '';
                    display: block;
                    width: 6rpx;
                    height: 28rpx;
                    background-color: #6474E5;
                    position: absolute;
                    bottom: 6rpx;
                    left: 0;
                }
            }

            .home-menu-content {
                display: flex;
                flex-wrap: wrap;
                width: 100%;
                gap: 36rpx 0;

                .home-menu-item {
                    width: 25%;
                    font-size: 28rpx;
                    color: #666;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 12rpx;
                    cursor: pointer;
                    transition: all 0.3s ease;

                    &:active {
                        transform: scale(0.95);
                        opacity: 0.8;
                    }

                    .icon-block {
                        width: 64rpx;
                        height: 64rpx;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                }
            }
        }
    }
}

.logo {
    height: 200rpx;
    width: 200rpx;
    margin-top: 200rpx;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 50rpx;
}

.text-area {
    display: flex;
    justify-content: center;
}

.title {
    font-size: 36rpx;
    color: #8f8f94;
}
</style>
