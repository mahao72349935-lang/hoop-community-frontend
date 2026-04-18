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
            <div class="hot-team-section">
                <div class="hot-team-header">
                    <div class="hot-team-title-wrap">
                        <view class="hot-team-hex-icon" aria-hidden="true">
                            <text class="hot-team-star">★</text>
                        </view>
                        <text class="hot-team-title-text">热门球队</text>
                    </div>
                    <view class="hot-team-more" @click="goHotTeamMore">
                        <text>更多</text>
                        <text class="hot-team-more-arrow">›</text>
                    </view>
                </div>
                <view v-if="displayTeamList.length" class="hot-team-list">
                    <TeamCard class="hot-team-card" v-for="team in displayTeamList" :key="team.teamId" :team="team"
                        @click="goTeamDetail" />
                </view>
                <view v-else class="hot-team-empty">
                    <text>暂无推荐球队</text>
                </view>
            </div>
        </div>
        <TabBar tab="home" />
    </view>
</template>

<script setup>
import { getFeaturedTeamListApi } from '@/api/team';
import TabBar from '@/components/TabBar/index.vue';
import TeamCard from '@/components/TeamCard/index.vue';
import { playerMenu, venueOwnerMenu } from '@/constants/homeMenu';
import { onShow } from '@dcloudio/uni-app';
import { computed, ref } from 'vue';

const MAX_DISPLAY_TEAMS = 3;

const teamList = ref([]);

const displayTeamList = computed(() => teamList.value.slice(0, MAX_DISPLAY_TEAMS));

onShow(() => {
    fetchTeamList();
});

const fetchTeamList = async () => {
    try {
        const data = await getFeaturedTeamListApi();
        teamList.value = Array.isArray(data) ? data : [];
    } catch {
        teamList.value = [];
    }
};

const goHotTeamMore = () => {
    uni.switchTab({ url: '/pages/myTeam/index' });
};

const goTeamDetail = (team) => {
    if (!team?.teamId) return;
    uni.navigateTo({ url: `/pages/team/teamDetail/index?teamId=${team.teamId}` });
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

        .hot-team-section {
            width: 100%;
            background-color: #fff;
            padding: 24rpx;
            box-sizing: border-box;
            border-radius: 16rpx;
            margin-bottom: 24rpx;
        }

        .hot-team-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20rpx;
        }

        .hot-team-title-wrap {
            display: flex;
            align-items: center;
            gap: 12rpx;
        }

        .hot-team-hex-icon {
            width: 40rpx;
            height: 40rpx;
            background: linear-gradient(145deg, #8b7cf7, #6474e5);
            clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .hot-team-star {
            color: #fff;
            font-size: 22rpx;
            line-height: 1;
        }

        .hot-team-title-text {
            font-size: 30rpx;
            color: #444;
            font-weight: bold;
        }

        .hot-team-more {
            display: flex;
            align-items: center;
            gap: 4rpx;
            padding: 8rpx 20rpx;
            border: 1rpx solid #e2e8f0;
            border-radius: 999rpx;
            font-size: 24rpx;
            color: #94a3b8;
        }

        .hot-team-more:active {
            opacity: 0.75;
        }

        .hot-team-more-arrow {
            font-size: 28rpx;
            line-height: 1;
            margin-top: -2rpx;
        }

        .hot-team-list {
            display: flex;
            gap: 10rpx;

            .hot-team-card {
                flex: 1
            }
        }

        .hot-team-empty {
            padding: 32rpx 0;
            text-align: center;
            font-size: 26rpx;
            color: #94a3b8;
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
