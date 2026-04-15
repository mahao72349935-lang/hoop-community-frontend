<template>
    <div class="team-list-page">
        <!-- 搜索栏 -->
        <div class="search-bar">
            <nut-searchbar v-model="searchKeyword" placeholder="搜索球队名称" @search="onSearch" @clear="onClear" />
        </div>

        <!-- 筛选栏 -->
        <div class="filter-bar">
            <scroll-view scroll-x class="filter-scroll">
                <!-- 强度筛选 -->
                <div v-for="item in intensityFilters" :key="item.value" class="filter-chip"
                    :class="{ active: activeIntensity === item.value }" @click="toggleIntensity(item.value)">
                    {{ item.label }}
                </div>
            </scroll-view>
        </div>

        <!-- 列表区域 -->
        <div class="list-body">
            <!-- 加载中骨架 -->
            <template v-if="loading && list.length === 0">
                <div v-for="i in 4" :key="i" class="skeleton-card">
                    <div class="skeleton-logo" />
                    <div class="skeleton-content">
                        <div class="skeleton-line w60" />
                        <div class="skeleton-line w40" />
                        <div class="skeleton-line w80" />
                    </div>
                </div>
            </template>

            <!-- 列表 -->
            <template v-else-if="list.length > 0">
                <div v-for="team in list" :key="team._id" class="team-card" @click="goDetail(team._id)">
                    <!-- 队徽 -->
                    <div class="card-logo-wrap">
                        <image v-if="team.logoUrl" :src="team.logoUrl" class="card-logo" mode="aspectFill" />
                        <div v-else class="card-logo-placeholder">🏀</div>
                    </div>

                    <!-- 信息 -->
                    <div class="card-info">
                        <div class="card-top">
                            <text class="card-name">{{ team.name }}</text>
                            <text class="intensity-tag" :class="`intensity-${intensityClass(team.preferredIntensity)}`">
                                {{ team.preferredIntensity || '不限' }}
                            </text>
                        </div>

                        <div class="card-meta">
                            <text class="meta-item">📍 {{ regionText(team.region) }}</text>
                            <text class="meta-item">👥 {{ team.memberCount ?? team.members?.length ?? 0 }}/15 人</text>
                        </div>

                        <div class="card-stats">
                            <text class="stat">{{ team.stats?.totalMatches ?? 0 }} 场</text>
                            <text class="stat-divider">·</text>
                            <text class="stat win">{{ team.stats?.wins ?? 0 }} 胜</text>
                            <text class="stat-divider">·</text>
                            <text class="stat lose">{{ team.stats?.losses ?? 0 }} 负</text>
                            <text class="stat-divider">·</text>
                            <text class="stat">胜率 {{ winRate(team.stats) }}%</text>
                        </div>

                        <div v-if="team.description" class="card-desc">{{ team.description }}</div>
                    </div>

                    <div class="card-arrow">›</div>
                </div>

                <!-- 加载更多 -->
                <div class="load-more-wrap">
                    <nut-button v-if="hasMore" size="small" plain :loading="loadingMore" @click="loadMore">
                        加载更多
                    </nut-button>
                    <text v-else class="no-more">— 已加载全部 —</text>
                </div>
            </template>

            <!-- 空态 -->
            <div v-else class="empty-state">
                <text class="empty-icon">🏀</text>
                <text class="empty-text">暂无球队</text>
                <text class="empty-sub">换个关键词试试，或者创建一支！</text>
            </div>
        </div>

        <!-- 右下角 FAB：创建球队 -->
        <div class="fab" @click="goCreate">
            <text class="fab-icon">＋</text>
            <text class="fab-label">创建球队</text>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
// import { getTeamListApi } from '@/api/team';

// ─── 筛选选项 ─────────────────────────────────────────────
const intensityFilters = [
    { label: '全部强度', value: '' },
    { label: '不限', value: '不限' },
    { label: '养生局', value: '养生局' },
    { label: '强度局', value: '强度局' },
    { label: '专业局', value: '专业局' },
];

// ─── 状态 ─────────────────────────────────────────────────
const searchKeyword = ref('');
const activeIntensity = ref('');
const list = ref([]);
const loading = ref(false);
const loadingMore = ref(false);
const hasMore = ref(false);
const page = ref(1);
const PAGE_SIZE = 10;

// ─── 计算辅助函数 ──────────────────────────────────────────
function regionText(region) {
    if (!region) return '未知地区';
    return [region.city, region.district].filter(Boolean).join(' ') || region.province || '未知地区';
}

function winRate(stats) {
    if (!stats || !stats.totalMatches) return '0.0';
    return ((stats.wins / stats.totalMatches) * 100).toFixed(1);
}

function intensityClass(val) {
    const map = { '养生局': 'casual', '强度局': 'moderate', '专业局': 'pro', '不限': 'any' };
    return map[val] || 'any';
}

// ─── 数据加载 ──────────────────────────────────────────────
async function fetchList(reset = false) {
    if (reset) {
        page.value = 1;
        list.value = [];
        hasMore.value = false;
    }

    if (reset) loading.value = true;
    else loadingMore.value = true;

    try {
        const params = {
            page: page.value,
            pageSize: PAGE_SIZE,
            keyword: searchKeyword.value.trim(),
            preferredIntensity: activeIntensity.value,
        };

        // const res = await getTeamListApi(params);
        // ─── Mock 数据（联调时删除） ───────────────────────────
        await new Promise(r => setTimeout(r, 600));
        const mockTeams = page.value === 1 ? [
            {
                _id: '1', name: '双流杜兰特队', logoUrl: '', description: '友好的双流本地球队，欢迎新人加入！',
                preferredIntensity: '强度局', memberCount: 8,
                region: { province: '四川省', city: '成都市', district: '双流区' },
                stats: { totalMatches: 20, wins: 14, losses: 5, draws: 1 },
            },
            {
                _id: '2', name: '锦江铁卫', logoUrl: '', description: '以防守著称的锦江区队伍',
                preferredIntensity: '专业局', memberCount: 12,
                region: { province: '四川省', city: '成都市', district: '锦江区' },
                stats: { totalMatches: 35, wins: 22, losses: 13, draws: 0 },
            },
            {
                _id: '3', name: '周末养生局', logoUrl: '', description: '不在乎输赢，享受篮球乐趣',
                preferredIntensity: '养生局', memberCount: 5,
                region: { province: '四川省', city: '成都市', district: '青羊区' },
                stats: { totalMatches: 8, wins: 3, losses: 5, draws: 0 },
            },
        ] : [];
        const res = { list: mockTeams, total: 3 };
        // ──────────────────────────────────────────────────────

        if (reset) {
            list.value = res.list;
        } else {
            list.value = [...list.value, ...res.list];
        }
        hasMore.value = list.value.length < res.total;
    } catch (e) {
        console.error('fetchTeamList', e);
        uni.showToast({ title: '加载失败，请重试', icon: 'none' });
    } finally {
        loading.value = false;
        loadingMore.value = false;
    }
}

function loadMore() {
    if (loadingMore.value || !hasMore.value) return;
    page.value += 1;
    fetchList(false);
}

// ─── 交互 ─────────────────────────────────────────────────
function onSearch() {
    fetchList(true);
}

function onClear() {
    searchKeyword.value = '';
    fetchList(true);
}

function toggleIntensity(val) {
    activeIntensity.value = activeIntensity.value === val ? '' : val;
    fetchList(true);
}

function goDetail(id) {
    uni.navigateTo({ url: `/pages/team/detail?id=${id}` });
}

function goCreate() {
    uni.navigateTo({ url: '/pages/team/create' });
}

onMounted(() => fetchList(true));
</script>

<style lang="scss" scoped>
.team-list-page {
    min-height: 100vh;
    background: #f4f6f8;
    padding-bottom: 160rpx; // 留出 FAB 空间
}

// ─── 搜索栏 ──────────────────────────────────────────────
.search-bar {
    padding: 16rpx 24rpx;
    background: #fff;
}

// ─── 筛选栏 ──────────────────────────────────────────────
.filter-bar {
    background: #fff;
    border-bottom: 1rpx solid #eee;
}

.filter-scroll {
    white-space: nowrap;
    padding: 16rpx 24rpx;
}

.filter-chip {
    display: inline-block;
    padding: 10rpx 28rpx;
    border-radius: 40rpx;
    border: 1.5rpx solid #ddd;
    font-size: 24rpx;
    color: #666;
    margin-right: 16rpx;
    background: #fafafa;
    transition: all 0.2s;

    &.active {
        background: #fa2c19;
        border-color: #fa2c19;
        color: #fff;
        font-weight: 600;
    }
}

// ─── 列表 ────────────────────────────────────────────────
.list-body {
    padding: 20rpx 24rpx;
}

// 骨架屏
.skeleton-card {
    display: flex;
    gap: 24rpx;
    background: #fff;
    border-radius: 20rpx;
    padding: 28rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.skeleton-logo {
    width: 96rpx;
    height: 96rpx;
    border-radius: 16rpx;
    background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.2s infinite;
    flex-shrink: 0;
}

.skeleton-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12rpx;
    justify-content: center;
}

.skeleton-line {
    height: 28rpx;
    border-radius: 8rpx;
    background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.2s infinite;

    &.w60 {
        width: 60%;
    }

    &.w40 {
        width: 40%;
    }

    &.w80 {
        width: 80%;
    }
}

@keyframes shimmer {
    0% {
        background-position: 200% 0;
    }

    100% {
        background-position: -200% 0;
    }
}

// 球队卡片
.team-card {
    display: flex;
    align-items: flex-start;
    gap: 24rpx;
    background: #fff;
    border-radius: 20rpx;
    padding: 28rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
    position: relative;
    active-opacity: 0.7;
}

.card-logo-wrap {
    width: 96rpx;
    height: 96rpx;
    border-radius: 16rpx;
    overflow: hidden;
    background: #f5f5f5;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.card-logo {
    width: 100%;
    height: 100%;
}

.card-logo-placeholder {
    font-size: 48rpx;
}

.card-info {
    flex: 1;
    overflow: hidden;
}

.card-top {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 10rpx;
}

.card-name {
    font-size: 30rpx;
    font-weight: 700;
    color: #1a1a1a;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

// 强度标签
.intensity-tag {
    font-size: 20rpx;
    padding: 4rpx 14rpx;
    border-radius: 20rpx;
    flex-shrink: 0;
    font-weight: 600;

    &.intensity-casual {
        background: #e8f5e9;
        color: #388e3c;
    }

    &.intensity-moderate {
        background: #fff3e0;
        color: #f57c00;
    }

    &.intensity-pro {
        background: #fce4ec;
        color: #c62828;
    }

    &.intensity-any {
        background: #ede7f6;
        color: #6a1b9a;
    }
}

.card-meta {
    display: flex;
    gap: 20rpx;
    margin-bottom: 10rpx;
}

.meta-item {
    font-size: 22rpx;
    color: #888;
}

.card-stats {
    display: flex;
    align-items: center;
    gap: 10rpx;
    margin-bottom: 10rpx;
}

.stat {
    font-size: 22rpx;
    color: #666;
}

.stat.win {
    color: #38a169;
    font-weight: 600;
}

.stat.lose {
    color: #e53e3e;
    font-weight: 600;
}

.stat-divider {
    color: #ddd;
    font-size: 22rpx;
}

.card-desc {
    font-size: 22rpx;
    color: #999;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.card-arrow {
    font-size: 40rpx;
    color: #ccc;
    align-self: center;
    flex-shrink: 0;
}

// 加载更多
.load-more-wrap {
    display: flex;
    justify-content: center;
    padding: 24rpx 0;
}

.no-more {
    font-size: 24rpx;
    color: #bbb;
}

// 空态
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 120rpx 0;
    gap: 16rpx;
}

.empty-icon {
    font-size: 96rpx;
}

.empty-text {
    font-size: 30rpx;
    font-weight: 600;
    color: #999;
}

.empty-sub {
    font-size: 24rpx;
    color: #bbb;
}

// FAB
.fab {
    position: fixed;
    right: 36rpx;
    bottom: 120rpx;
    background: #fa2c19;
    color: #fff;
    border-radius: 50rpx;
    padding: 20rpx 36rpx;
    display: flex;
    align-items: center;
    gap: 10rpx;
    box-shadow: 0 8rpx 24rpx rgba(250, 44, 25, 0.4);
    z-index: 100;
}

.fab-icon {
    font-size: 36rpx;
    font-weight: 300;
    line-height: 1;
}

.fab-label {
    font-size: 26rpx;
    font-weight: 600;
}
</style>
