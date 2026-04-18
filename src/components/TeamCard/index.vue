<template>
    <view class="team-card" @click="handleClick">
        <view class="team-card-cover">
            <image class="team-card-cover-img" :src="team.logoUrl" mode="aspectFill" />
            <view v-if="team.region?.province" class="team-card-loc">
                <text class="team-card-loc-pin">📍</text>
                <text class="team-card-loc-text">{{ team.region.district }}</text>
            </view>
        </view>
        <view class="team-card-body">
            <view v-if="tag" class="team-card-tag">
                <text v-if="getTeamTagIconClass(tag)"
                    :class="['iconfont', 'tag-pill-icon', getTeamTagIconClass(tag)]" />
                <text>{{ tagText }}</text>
            </view>
            <text class="team-card-name">{{ team.name }}</text>
            <text class="team-card-date">{{ dateText }}</text>
            <text class="team-card-foot">{{ memberText }}</text>
        </view>
    </view>
</template>

<script setup>
import { formatDate, formatMemberCount, formatTagDisplay, getFirstTag, getTeamTagIconClass } from '@/utils/format';
import { computed } from 'vue';

const props = defineProps({
    team: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['click']);

const tag = computed(() => getFirstTag(props.team));
const tagText = computed(() => formatTagDisplay(tag.value));
const dateText = computed(() => formatDate(props.team?.createdAt));
const memberText = computed(() => formatMemberCount(props.team));

const handleClick = () => {
    emit('click', props.team);
};
</script>

<style lang="scss" scoped>
.team-card {
    width: 100%;
    display: flex;
    flex-direction: column;

    &:active {
        opacity: 0.92;
    }
}

.team-card-cover {
    position: relative;
    width: 100%;
    height: 200rpx;
    border-radius: 24rpx;
    overflow: hidden;
    background: #f1f5f9;
}

.team-card-cover-img {
    width: 100%;
    height: 100%;
}

.team-card-badge {
    position: absolute;
    top: 12rpx;
    right: 12rpx;
    padding: 4rpx 12rpx;
    background: rgba(0, 0, 0, 0.72);
    border-radius: 8rpx;
    font-size: 20rpx;
    color: #fff;
    line-height: 1.3;
}

.team-card-loc {
    position: absolute;
    left: 12rpx;
    bottom: 12rpx;
    display: flex;
    align-items: center;
    gap: 4rpx;
    max-width: calc(100% - 24rpx);
    padding: 6rpx 14rpx;
    background: rgba(15, 23, 42, 0.45);
    border-radius: 999rpx;
}

.team-card-loc-pin {
    font-size: 20rpx;
    line-height: 1;
}

.team-card-loc-text {
    font-size: 22rpx;
    color: #fff;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.team-card-body {
    margin-top: 16rpx;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
    padding: 0 4rpx;
}

.team-card-tag {
    width: fit-content;
    display: inline-flex;
    align-items: center;
    gap: 4rpx;
    padding: 4rpx 12rpx;
    background: #ecfdf5;
    border-radius: 8rpx;
    font-size: 20rpx;
    color: #047857;
    font-weight: 500;

    .tag-pill-icon {
        font-size: 20rpx;
    }
}

.team-card-name {
    font-size: 28rpx;
    font-weight: 700;
    color: #0f172a;
    line-height: 1.35;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.team-card-date {
    font-size: 22rpx;
    color: #94a3b8;
}

.team-card-foot {
    font-size: 26rpx;
    font-weight: 700;
    color: #ea580c;
}
</style>
