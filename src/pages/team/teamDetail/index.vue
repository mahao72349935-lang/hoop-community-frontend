<template>
    <view class="team-detail">
        <view v-if="loading && teamId" class="state-wrap">
            <view class="loading-spinner" />
            <text class="state-text">加载中...</text>
        </view>

        <view v-else-if="teamId && !detail && !loading" class="state-wrap">
            <text class="state-text">{{ loadError ? '加载失败，请稍后重试' : '暂无球队信息' }}</text>
            <view class="retry-btn" @click="fetchTeamDetail">重新加载</view>
        </view>

        <template v-else-if="detail">
            <!-- 自定义顶栏：返回 + 标题（球队名） -->
            <view class="nav-bar" :style="{ paddingTop: statusBarPx + 'px' }">
                <view class="nav-row">
                    <view class="nav-back" @click="goBack">
                        <text class="nav-back-icon">‹</text>
                    </view>
                    <text class="nav-title">{{ detail.name || '球队详情' }}</text>
                    <view class="nav-right-placeholder" />
                </view>
            </view>

            <scroll-view scroll-y class="detail-scroll" :show-scrollbar="false">
                <view class="hero-wrap">
                    <image class="hero-img" :src="detail.logoUrl" mode="aspectFill" />
                    <view class="hero-mask" />
                </view>

                <view class="content-card">
                    <view v-if="detail.allTags.length" class="tags-row">
                        <view v-for="(tag, i) in detail.allTags" :key="tag.key || i" class="tag-pill">
                            <view v-if="getTeamTagIconClass(tag)"
                                :class="['iconfont', 'tag-pill-icon', getTeamTagIconClass(tag)]" />
                            <text class="tag-text">{{ formatTagDisplay(tag) }}</text>
                        </view>
                    </view>

                    <text class="team-name">{{ detail.name }}</text>

                    <view class="meta-rows">
                        <view class="meta-row">
                            <text class="meta-icon iconfont icon-team"></text>
                            <text class="meta-label">成员</text>
                            <text class="meta-value">{{ detail.memberCount ?? 0 }} 人</text>
                        </view>
                        <view class="meta-row">
                            <text class="meta-icon iconfont icon-dengji"></text>
                            <text class="meta-label">比赛强度</text>
                            <text class="meta-value">{{ intensityLabel(detail.preferredIntensity) }}</text>
                        </view>
                    </view>

                    <view v-if="regionLine" class="loc-card">
                        <view class="loc-texts">
                            <text class="loc-line1">{{ regionLine }}</text>
                            <text v-if="regionDetail" class="loc-line2">{{ regionDetail }}</text>
                        </view>
                        <view class="loc-map-placeholder">
                            <text class="loc-pin iconfont icon-weizhi2"></text>
                        </view>
                    </view>

                    <view class="tabs">
                        <view class="tab-item" :class="{ active: activeTab === 'intro' }" @click="activeTab = 'intro'">
                            <text>球队介绍</text>
                        </view>
                        <view class="tab-item" :class="{ active: activeTab === 'stats' }" @click="activeTab = 'stats'">
                            <text>球队数据</text>
                        </view>
                    </view>

                    <view v-show="activeTab === 'intro'" class="tab-panel">
                        <text class="desc-text">{{ detail.description || '暂无介绍' }}</text>
                        <view v-if="detail.inviteCode" class="notice-bar">
                            <text class="notice-icon iconfont icon-yaoqingma"></text>
                            <view class="notice-mid">
                                <text class="notice-title">邀请码 {{ detail.inviteCode }}</text>
                                <text v-if="inviteExpireText" class="notice-sub">{{ inviteExpireText }}</text>
                            </view>
                            <text class="notice-badge">{{ statusLabel(detail.status) }}</text>
                        </view>
                    </view>

                    <view v-show="activeTab === 'stats'" class="tab-panel">
                        <view class="stats-grid">
                            <view class="stat-cell">
                                <text class="stat-num">{{ detail.stats?.totalMatches ?? 0 }}</text>
                                <text class="stat-name">总场次</text>
                            </view>
                            <view class="stat-cell">
                                <text class="stat-num">{{ detail.stats?.wins ?? 0 }}</text>
                                <text class="stat-name">胜</text>
                            </view>
                            <view class="stat-cell">
                                <text class="stat-num">{{ detail.stats?.losses ?? 0 }}</text>
                                <text class="stat-name">负</text>
                            </view>
                            <view class="stat-cell">
                                <text class="stat-num">{{ detail.stats?.draws ?? 0 }}</text>
                                <text class="stat-name">平</text>
                            </view>
                        </view>
                        <view class="win-rate-row">
                            <text class="win-rate-label">胜率</text>
                            <text class="win-rate-val">{{ winRateDisplay }}</text>
                        </view>
                        <view v-if="detail.members?.length" class="members-block">
                            <text class="members-title">成员（{{ detail.members.length }}）</text>
                            <view v-for="m in detail.members" :key="m.memberId || m.id" class="member-row">
                                <text class="member-role">{{ roleLabel(m.role) }}</text>
                                <text class="member-id">{{ shortId(m.user) }}</text>
                            </view>
                        </view>
                    </view>

                    <view class="scroll-bottom-spacer" />
                </view>
            </scroll-view>

            <view class="bottom-bar safe-bottom">
                <view class="bar-icon-btn" @click="onLike">
                    <text class="bar-ico">♡</text>
                </view>
                <view class="bar-icon-btn" @click="onShare">
                    <text class="bar-ico">↻</text>
                </view>
                <view class="bar-metric">
                    <text class="bar-metric-main">{{ detail.memberCount ?? 0 }} 人已加入</text>
                    <text class="bar-metric-sub">胜率 {{ winRateDisplay }}</text>
                </view>
                <view class="bar-cta" @click="onApply">
                    <text class="bar-cta-text">申请加入</text>
                </view>
            </view>
        </template>
    </view>
</template>

<script setup>
import { getTeamDetailApi } from '@/api/team';
import { formatDate, formatTagDisplay, getTeamTagIconClass } from '@/utils/format';
import { onLoad } from '@dcloudio/uni-app';
import { computed, ref } from 'vue';

const INTENSITY_MAP = {
    UNKNOWN: '不限',
    CASUAL: '养生局',
    MODERATE: '强度局',
    COMPETITIVE: '专业局',
    ANY: '不限'
};

const teamId = ref('');
const detail = ref(null);
const loading = ref(false);
const loadError = ref(false);
const statusBarPx = ref(20);
const activeTab = ref('intro');

const goBack = () => {
    uni.navigateBack({ delta: 1 });
};

const intensityLabel = (v) => INTENSITY_MAP[v] || '不限';

const statusLabel = (s) => {
    const map = { active: '进行中', inactive: '已解散', recruiting: '招募中' };
    return map[s] || '—';
};

const roleLabel = (r) => {
    const map = { captain: '队长', member: '队员', coach: '教练' };
    return map[r] || r || '成员';
};

const shortId = (id) => {
    if (!id || typeof id !== 'string') return '—';
    if (id.length <= 8) return id;
    return `${id.slice(0, 4)}…${id.slice(-4)}`;
};


const regionLine = computed(() => {
    const r = detail.value?.region;
    if (!r) return '';
    const parts = [r.province, r.city].filter(Boolean);
    return parts.join(' | ');
});

const regionDetail = computed(() => {
    const r = detail.value?.region;
    if (!r) return '';
    const tail = [r.district].filter(Boolean).join('');
    return tail || '';
});

const winRateDisplay = computed(() => {
    const w = detail.value?.winRate;
    if (w === undefined || w === null) return '—';
    const n = Number(w);
    if (Number.isNaN(n)) return '—';
    if (n <= 1 && n >= 0) return `${Math.round(n * 100)}%`;
    return `${Math.round(n)}%`;
});

const inviteExpireText = computed(() => {
    const iso = detail.value?.inviteExpiredAt;
    if (!iso) return '';
    return `有效期至 ${formatDate(iso)}`;
});

const fetchTeamDetail = async () => {
    if (!teamId.value) return;
    try {
        loading.value = true;
        loadError.value = false;
        const data = await getTeamDetailApi(teamId.value);
        detail.value = data || null;
        if (!data) loadError.value = true;
    } catch {
        detail.value = null;
        loadError.value = true;
    } finally {
        loading.value = false;
    }
};

onLoad((options) => {
    const sys = uni.getSystemInfoSync();
    statusBarPx.value = sys.statusBarHeight || 20;
    teamId.value = options.teamId || '';
    if (!teamId.value) {
        uni.showToast({ title: '缺少球队信息', icon: 'none' });
        setTimeout(() => goBack(), 1200);
        return;
    }
    fetchTeamDetail();
});

const onLike = () => {
    uni.showToast({ title: '收藏功能开发中', icon: 'none' });
};

const onShare = () => {
    uni.showToast({ title: '分享功能开发中', icon: 'none' });
};

const onApply = () => {
    uni.showToast({ title: '申请加入功能开发中', icon: 'none' });
};
</script>

<style lang="scss" scoped>
.team-detail {
    min-height: 100vh;
    background: #f5f5f5;
}

.state-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 200rpx;
}

.loading-spinner {
    width: 48rpx;
    height: 48rpx;
    border: 4rpx solid #e5e7eb;
    border-top-color: #111;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.state-text {
    margin-top: 24rpx;
    font-size: 28rpx;
    color: #64748b;
}

.retry-btn {
    margin-top: 32rpx;
    padding: 16rpx 48rpx;
    font-size: 28rpx;
    color: #fff;
    background: #111827;
    border-radius: 999rpx;
}

.nav-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0) 100%);
    pointer-events: none;
}

.nav-row {
    height: 88rpx;
    flex-direction: row;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24rpx;
    pointer-events: auto;
}

.nav-back {
    width: 64rpx;
    height: 64rpx;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
}

.nav-back-icon {
    font-size: 44rpx;
    color: #fff;
    line-height: 1;
    margin-top: -4rpx;
}

.nav-title {
    flex: 1;
    text-align: center;
    font-size: 32rpx;
    font-weight: 600;
    color: #fff;
    text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.35);
    padding: 0 16rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.nav-right-placeholder {
    width: 64rpx;
}

.detail-scroll {
    height: 100vh;
    box-sizing: border-box;
}

.hero-wrap {
    position: relative;
    width: 100%;
    height: 420rpx;
    background: #e2e8f0;
}

.hero-img {
    width: 100%;
    height: 100%;
}

.hero-mask {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 120rpx;
    background: linear-gradient(180deg, transparent, rgba(245, 245, 245, 1));
}

.content-card {
    z-index: 1;
    background: #fff;
    border-radius: 32rpx 32rpx 0 0;
    padding: 32rpx 28rpx 0;
    min-height: 400rpx;
}

.tags-row {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    margin-bottom: 20rpx;
    justify-content: space-between;
}

.tag-pill {
    width: calc(50% - 60rpx);
    padding: 10rpx 20rpx;
    background: #bbdefb;
    border-radius: 8rpx;
    border: 1rpx solid #2196f3;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8rpx;
}

.tag-pill-icon {
    flex-shrink: 0;
    font-size: 26rpx;
    color: #6474E5;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.tag-text {
    font-size: 22rpx;
    color: #6474E5;
    font-weight: 500;
}

.team-name {
    display: block;
    font-size: 40rpx;
    font-weight: 700;
    color: #0f172a;
    line-height: 1.35;
    margin-bottom: 24rpx;
}

.meta-rows {
    margin-bottom: 28rpx;
}

.meta-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 16rpx;
}

.meta-icon {
    font-size: 28rpx;
    margin-right: 12rpx;
}

.meta-label {
    font-size: 26rpx;
    color: #64748b;
    width: 140rpx;
}

.meta-value {
    font-size: 28rpx;
    color: #0f172a;
    font-weight: 500;
}

.loc-card {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx;
    background: #f1f5f9;
    border-radius: 20rpx;
    margin-bottom: 32rpx;
}

.loc-texts {
    flex: 1;
    min-width: 0;
}

.loc-line1 {
    display: block;
    font-size: 30rpx;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 8rpx;
}

.loc-line2 {
    font-size: 24rpx;
    color: #64748b;
}

.loc-map-placeholder {
    width: 120rpx;
    height: 120rpx;
    border-radius: 16rpx;
    background: #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 20rpx;
}

.loc-pin {
    font-size: 40rpx;
}

.tabs {
    display: flex;
    flex-direction: row;
    border-bottom: 2rpx solid #e2e8f0;
    margin-bottom: 24rpx;
}

.tab-item {
    flex: 1;
    text-align: center;
    padding-bottom: 20rpx;
    font-size: 28rpx;
    color: #94a3b8;
    position: relative;
}

.tab-item.active {
    color: #0f172a;
    font-weight: 700;
}

.tab-item.active::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: 0;
    transform: translateX(-50%);
    width: 56rpx;
    height: 6rpx;
    background: #0f172a;
    border-radius: 4rpx;
}

.tab-panel {
    padding-bottom: 24rpx;
}

.desc-text {
    font-size: 28rpx;
    color: #334155;
    line-height: 1.75;
}

.notice-bar {
    margin-top: 32rpx;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 20rpx 24rpx;
    background: #f8fafc;
    border-radius: 16rpx;
    border: 2rpx solid #e2e8f0;
}

.notice-icon {
    font-size: 32rpx;
    margin-right: 16rpx;
}

.notice-mid {
    flex: 1;
    min-width: 0;
}

.notice-title {
    display: block;
    font-size: 26rpx;
    color: #0f172a;
    font-weight: 500;
}

.notice-sub {
    display: block;
    font-size: 22rpx;
    color: #94a3b8;
    margin-top: 6rpx;
}

.notice-badge {
    font-size: 22rpx;
    color: #f97316;
    font-weight: 600;
}

.stats-grid {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 20rpx;
}

.stat-cell {
    width: calc(50% - 10rpx);
    padding: 28rpx;
    background: #f8fafc;
    border-radius: 16rpx;
    box-sizing: border-box;
}

.stat-num {
    display: block;
    font-size: 40rpx;
    font-weight: 700;
    color: #0f172a;
}

.stat-name {
    font-size: 24rpx;
    color: #64748b;
    margin-top: 8rpx;
}

.win-rate-row {
    margin-top: 28rpx;
    padding: 24rpx;
    background: #fff7ed;
    border-radius: 16rpx;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

.win-rate-label {
    font-size: 28rpx;
    color: #9a3412;
    font-weight: 600;
}

.win-rate-val {
    font-size: 36rpx;
    font-weight: 700;
    color: #ea580c;
}

.members-block {
    margin-top: 32rpx;
}

.members-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 16rpx;
    display: block;
}

.member-row {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 20rpx 0;
    border-bottom: 2rpx solid #f1f5f9;
}

.member-role {
    font-size: 26rpx;
    color: #334155;
}

.member-id {
    font-size: 24rpx;
    color: #94a3b8;
}

.scroll-bottom-spacer {
    height: 200rpx;
}

.bottom-bar {
    position: fixed;
    left: 24rpx;
    right: 24rpx;
    bottom: 24rpx;
    z-index: 90;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 16rpx 20rpx;
    background: #111827;
    border-radius: 999rpx;
    box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.2);
}

.safe-bottom {
    padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
}

.bar-icon-btn {
    width: 72rpx;
    height: 72rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.bar-ico {
    font-size: 36rpx;
    color: #fff;
}

.bar-metric {
    flex: 1;
    min-width: 0;
    padding: 0 12rpx;
}

.bar-metric-main {
    display: block;
    font-size: 24rpx;
    color: #e2e8f0;
}

.bar-metric-sub {
    display: block;
    font-size: 20rpx;
    color: #94a3b8;
    margin-top: 4rpx;
}

.bar-cta {
    padding: 20rpx 36rpx;
    background: linear-gradient(135deg, #6474E5 0%, #2196F3 100%);
    border-radius: 999rpx;
}

.bar-cta-text {
    font-size: 28rpx;
    font-weight: 600;
    color: #fff;
}
</style>
