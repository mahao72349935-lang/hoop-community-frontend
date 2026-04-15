<template>
    <div class="mine-page">
        <div class="mine-header">
            <div class="header-left">
                <nut-avatar size="large" v-if="userInfo.avatarUrl">
                    <image :src="userInfo.avatarUrl"></image>
                </nut-avatar>
                <div class="avatar" v-else>{{ userName }}</div>
            </div>
            <div class="header-right">
                <div class="header-right-text">
                    <div class="header-right-text-username">{{ userInfo.realName || userInfo.username }}</div>
                    <div class="header-right-text-phone">{{ userInfo.phone }}</div>
                </div>
            </div>
        </div>
        <div class="wrapper">
            <nut-cell-group>
                <nut-cell title="修改密码">
                    <template #link>
                        <nut-icon name="rect-right" custom-color="#b0abab" size="16"></nut-icon>
                    </template>
                </nut-cell>
                <nut-cell title="退出登录" @click="handleLogout">
                    <template #link>
                        <nut-icon name="rect-right" custom-color="#b0abab" size="16"></nut-icon>
                    </template>
                </nut-cell>
                <nut-cell title="修改个人信息" @click="handleUpdateUserInfo">
                    <template #link>
                        <nut-icon name="rect-right" custom-color="#b0abab" size="16"></nut-icon>
                    </template>
                </nut-cell>
                <nut-cell title="创建球队" @click="handleCreateTeam">
                    <template #link>
                        <nut-icon name="rect-right" custom-color="#b0abab" size="16"></nut-icon>
                    </template>
                </nut-cell>
            </nut-cell-group>
        </div>
        <TabBar tab="mine" />
    </div>
</template>

<script setup>
import TabBar from '@/components/TabBar/index.vue';

const userInfo = ref({
    username: '',
    phoneNumber: ''
});
onShow(() => {
    getUserInfo();
});
const getUserInfo = async () => {
    // 缓存中获取用户信息
    const result = uni.getStorageSync('userInfo');
    userInfo.value = result || {};
};
const handleLogout = () => {
    // uni.removeStorageSync('token');
    // uni.removeStorageSync('userInfo');
    // uni.reLaunch({
    //     url: '/pages/login/index'
    // });
};
const userName = computed(() => {
    if (userInfo.value.realName) {
        return userInfo.value.realName.slice(0, 1);
    } else if (userInfo.value.username) {
        return userInfo.value.username.slice(0, 1);
    } else {
        return '用户';
    }
});
const handleUpdateUserInfo = () => {
    uni.navigateTo({
        url: '/pages/user/updateUserInfo/index'
    });
};

const handleCreateTeam = () => {
    uni.navigateTo({
        url: '/pages/team/updateTeam/index'
    });
};

</script>

<style scoped lang="scss">
.mine-page {
    padding: 24rpx;
    box-sizing: border-box;

    .wrapper {
        border-radius: 16rpx;
        overflow: hidden;
    }

    .mine-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 24rpx;
        background-color: #fff;
        padding: 48rpx 24rpx;
        box-sizing: border-box;
        border-radius: 16rpx;
        overflow: hidden;
        gap: 48rpx;

        .header-left {
            .avatar {
                width: 100rpx;
                height: 100rpx;
                border-radius: 50%;
                background-color: #6474E5;
                color: #fff;
                font-size: 32rpx;
                text-align: center;
                line-height: 100rpx;
            }
        }

        .header-right {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: space-between;

            .header-right-text {
                display: flex;
                flex-direction: column;
                gap: 12rpx;

                .header-right-text-username {
                    font-size: 32rpx;
                    font-weight: bold;
                    color: #444;
                }

                .header-right-text-phone {
                    font-size: 28rpx;
                    color: #777;
                }
            }

            .header-right-icon {
                font-size: 32rpx;
                color: #969799;
            }
        }
    }
}
</style>
