<template>
    <view class="team-list-page">
        <view v-if="loading" class="loading-wrap">
            <view class="loading-spinner" />
            <text class="loading-text">加载中...</text>
        </view>

        <view v-else-if="teamList.length === 0" class="empty-wrap">
            <text class="iconfont icon-empty empty-icon"></text>
            <text class="empty-text">你还没有加入任何球队</text>
            <button class="empty-btn" @click="goCreate">创建球队</button>
        </view>
        <div v-else class="list-scroll">
            <div class="team-card-list">
                <view v-for="team in teamList" :key="team.teamId" class="team-card" @click="goDetail(team.teamId)">
                    <view class="card-logo-wrap">
                        <image class="card-logo" :src="team.logoUrl || '/static/images/default-logo.png'"
                            mode="aspectFill" />
                    </view>

                    <view class="card-info">
                        <view class="card-row">
                            <text class="card-name">{{ team.name }}</text>
                            <view class="intensity-tag" :class="intensityClass(team.preferredIntensity)">
                                <text class="intensity-text">{{ intensityLabel(team.preferredIntensity) }}</text>
                            </view>
                        </view>

                        <view class="card-row" v-if="team.region?.city || team.region?.district">
                            <text class="card-region">{{ team.region.city }} {{ team.region.district }}</text>
                        </view>

                        <text v-if="team.description" class="card-desc">{{ team.description }}</text>

                        <view class="card-stats">
                            <view class="stat-item">
                                <text class="stat-value">{{ team.memberCount || 0 }}</text>
                                <text class="stat-label">队员</text>
                            </view>
                        </view>
                    </view>
                </view>
            </div>
            <view class="fab" @click="goCreate">
                <text class="fab-icon">＋</text>
            </view>
        </div>
        <TabBar tab="myTeam" />
    </view>
</template>

<script setup>
import { getJoinedTeamListApi } from '@/api/team';
import TabBar from '@/components/TabBar/index.vue';
import { onShow } from '@dcloudio/uni-app'; // 必须使用 onShow
import { ref } from 'vue';

const teamList = ref([]);
const loading = ref(false);


const INTENSITY_MAP = {
    ANY: { label: '不限', cls: 'any' },
    CASUAL: { label: '养生局', cls: 'casual' },
    MODERATE: { label: '强度局', cls: 'moderate' },
    COMPETITIVE: { label: '专业局', cls: 'competitive' },
};

const intensityLabel = (val) => INTENSITY_MAP[val]?.label || '不限';
const intensityClass = (val) => INTENSITY_MAP[val]?.cls || 'any';

const fetchList = async () => {
    try {
        loading.value = true;
        const list = await getJoinedTeamListApi();
        teamList.value = list || [];
    } catch (e) {
        console.error('获取球队列表失败', e);
        uni.showToast({ title: '获取列表失败', icon: 'none' });
    } finally {
        loading.value = false;
    }
};

const goDetail = (teamId) => {
    uni.navigateTo({ url: `/pages/team/teamDetail?teamId=${teamId}` });
};

const goCreate = () => {
    uni.navigateTo({ url: '/pages/team/createTeam' });
};

// 使用 onShow 保证每次进入页面（包括从创建页返回）都会刷新列表
onShow(() => {
    fetchList();
});
</script>

<style lang="scss" scoped>
.team-list-page {
    background-color: #f4f6f8;
    display: flex;
    flex-direction: column;
    position: relative;
    height: calc(100vh - 165rpx);
    box-sizing: border-box;
}

/* ─── 加载状态 ─── */
.loading-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 24rpx;
    padding-top: 200rpx;
}

.loading-spinner {
    width: 64rpx;
    height: 64rpx;
    border: 4rpx solid #e2e8f0;
    border-top-color: #6474E5;
    /* 使用统一主题色 */
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.loading-text {
    font-size: 26rpx;
    color: #94a3b8;
}

/* ─── 空状态 ─── */
.empty-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120rpx 40rpx;
}

.empty-icon {
    font-size: 160rpx;
    color: #cbd5e1;
    margin-bottom: 32rpx;
}

.empty-text {
    font-size: 28rpx;
    color: #64748b;
    margin-bottom: 48rpx;
}

.empty-btn {
    background: #6474E5;
    color: #fff;
    font-size: 30rpx;
    font-weight: 600;
    border-radius: 100rpx;
    padding: 0 80rpx;
    height: 88rpx;
    line-height: 88rpx;
    border: none;
    box-shadow: 0 8rpx 24rpx rgba(100, 116, 229, 0.25);

    &::after {
        border: none;
    }

    &:active {
        opacity: 0.85;
        transform: scale(0.98);
    }
}

/* ─── 列表区 ─── */
.list-scroll {
    flex: 1;
    padding: 24rpx 0;
    height: calc(100vh - 50px);
    width: 100%;
    box-sizing: border-box;

    .team-card-list {
        padding: 0 24rpx;
    }
}



/* ─── 球队卡片 ─── */
.team-card {
    display: flex;
    background: #ffffff;
    border-radius: 16rpx;
    margin-bottom: 24rpx;
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.03);
    box-sizing: border-box;
    overflow: hidden;
    gap: 24rpx;
    /* 阴影更加柔和现代 */
    transition: all 0.2s;

    &:active {
        background-color: #fafafa;
        transform: scale(0.99);
    }
}

.card-logo-wrap {
    width: 240rpx;
    height: 240rpx;
    padding: 24rpx;
    box-sizing: border-box;
}

.card-logo {
    width: 100%;
    height: 100%;
    border-radius: 16rpx;
}

.card-info {
    width: calc(100% - 260rpx);
    padding: 24rpx 0;
    display: flex;
    flex-direction: column;
    gap: 12rpx;
}

.card-row {
    display: flex;
    align-items: center;
    gap: 16rpx;
}

.card-name {
    font-size: 34rpx;
    font-weight: 800;
    color: #0f172a;
    flex-shrink: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.card-region {
    font-size: 24rpx;
    color: #64748b;
}

.card-desc {
    font-size: 24rpx;
    color: #94a3b8;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* ─── 强度标签 ─── */
.intensity-tag {
    height: 32rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 16rpx;
    border-radius: 8rpx;

    &.any {
        background: #f1f5f9;
    }

    &.casual {
        background: #ecfdf5;
    }

    &.moderate {
        background: #fffbeb;
    }

    &.competitive {
        background: #fef2f2;
    }
}

.intensity-text {
    font-size: 20rpx;
    font-weight: 600;

    .any & {
        color: #64748b;
    }

    .casual & {
        color: #10b981;
    }

    .moderate & {
        color: #f59e0b;
    }

    .competitive & {
        color: #ef4444;
    }
}


.stat-item {
    display: flex;
    align-items: baseline;
    gap: 8rpx;
}

.stat-value {
    font-size: 28rpx;
    font-weight: 800;
    color: #334155;
}

.stat-label {
    font-size: 22rpx;
    color: #94a3b8;
}


/* ─── 悬浮按钮 ─── */
.fab {
    position: fixed;
    right: 48rpx;
    bottom: calc(env(safe-area-inset-bottom) + 160rpx);
    width: 104rpx;
    height: 104rpx;
    border-radius: 50%;
    background: #6474E5;
    /* 统一主题色 */
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 12rpx 32rpx rgba(100, 116, 229, 0.4);
    transition: all 0.2s;

    &:active {
        transform: scale(0.9);
        box-shadow: 0 4rpx 16rpx rgba(100, 116, 229, 0.4);
    }
}

.fab-icon {
    font-size: 56rpx;
    color: #fff;
    line-height: 1;
    margin-top: -4rpx;
    /* 视觉居中微调 */
}
</style>
