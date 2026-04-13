<template>
    <div class="login-page">
        <div class="login-top">
            <!-- 运动感背景 -->
            <div class="bg-shape">
                <!-- 装饰球场线条 -->
                <div class="court-line origin-center"></div>
                <div class="court-line origin-circle"></div>
            </div>
            
            <div class="login-container">
                <image class="app-logo" :src="logoUrl" mode="aspectFit" />
                <div class="login-titles">
                    <div class="title-main">Hoop 街区赛事</div>
                    <div class="title-sub">连接每一位热爱篮球的你</div>
                </div>
            </div>
        </div>

        <div class="login-bottom">
            <div class="target-users">
                <div class="user-tag">🔥 社区球友</div>
                <div class="user-tag">🏀 球馆老板</div>
                <div class="user-tag">🏆 赛事组织者</div>
            </div>

            <div class="btn-container">
                <button 
                    class="wx-login-btn" 
                    open-type="getPhoneNumber" 
                    @getphonenumber="handleGetPhoneNumber"
                >
                    微信手机号快捷登录
                </button>
            </div>
            <div class="agreement">
                登录代表您已同意 <text class="link">《用户协议》</text> 和 <text class="link">《隐私政策》</text>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref } from 'vue';
    import { wxLoginApi } from '../../api/user';

    // 生成的篮球占位 Logo
    const logoUrl = ref('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%23f97316"/><path d="M50 5 L50 95 M5 50 L95 50 M18 18 Q 50 50 18 82 M82 18 Q 50 50 82 82" stroke="%23fff" stroke-width="4" fill="none" /></svg>');

    // 是否为开发环境（微信开发者工具中无法真正获取手机号）
    const isDev = process.env.NODE_ENV === 'development';

    // 微信获取手机号回调
    const handleGetPhoneNumber = async (e) => {
        let code = '';
        let encryptedData = '';
        let iv = '';
        
        if (!isDev && e.detail.errMsg === 'getPhoneNumber:ok') {
            // 生产环境：使用微信真实返回的 code
            code = e.detail.code;
            encryptedData = e.detail.encryptedData;
            iv = e.detail.iv;
            console.log('获取手机号成功, 准备发送给后端:', { code, encryptedData, iv });
        } else {
            // 开发环境：强制走 mock 后门
            console.warn('开发环境或获取手机号失败，使用 mock 登录:', e.detail);
            code = 'mock_test_code';
        }
        
        uni.showLoading({ title: '登录中...' });
        try {
            const res = await wxLoginApi({ code, encryptedData, iv });
            
            if (res && res.success) {
                // 存储 token 和用户信息
                uni.setStorageSync('token', res.token);
                uni.setStorageSync('userInfo', res.data);
                
                uni.hideLoading();
                uni.showToast({ title: '登录成功', icon: 'success' });
                
                setTimeout(() => {
                    uni.reLaunch({
                        url: '/pages/home/index'
                    });
                }, 1000);
            } else {
                throw new Error(res?.message || '系统登录异常');
            }

        } catch (error) {
            uni.hideLoading();
            console.log('登录失败: ', error);
            uni.showToast({ title: error.message || '登录失败，请重试', icon: 'none' });
        }
    };
</script>

<style lang="scss" scoped>
    .login-page {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: 100vh;
        background-color: #f4f6f8;
        position: relative;
    }
    
    .login-top {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 15vh;
        flex: 1;
        
        .bg-shape {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 520rpx;
            background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%);
            border-bottom-left-radius: 80rpx;
            border-bottom-right-radius: 80rpx;
            z-index: 0;
            overflow: hidden;

            /* 模拟简单的球场线条装饰 */
            .court-line {
                position: absolute;
                border: 4rpx solid rgba(255, 255, 255, 0.1);
            }
            .origin-center {
                bottom: -2rpx;
                left: 50%;
                transform: translateX(-50%);
                width: 300rpx;
                height: 150rpx;
                border-top-left-radius: 150rpx;
                border-top-right-radius: 150rpx;
                border-bottom: none;
            }
            .origin-circle {
                bottom: 146rpx;
                left: 50%;
                transform: translateX(-50%);
                width: 100rpx;
                height: 100rpx;
                border-radius: 50%;
            }
        }

        .login-container {
            position: relative;
            z-index: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            background: #ffffff;
            border-radius: 40rpx;
            padding: 80rpx 60rpx;
            box-shadow: 0 16rpx 40rpx rgba(0, 0, 0, 0.08);
            margin-top: 40rpx;
            width: 70%;
            max-width: 600rpx;

            .app-logo {
                width: 160rpx;
                height: 160rpx;
                border-radius: 50%;
                background-color: #f8fafc;
                box-shadow: 0 8rpx 24rpx rgba(249, 115, 22, 0.25);
            }
            .login-titles {
                text-align: center;
                margin-top: 40rpx;
                .title-main {
                    color: #0f172a;
                    font-size: 48rpx;
                    font-weight: 800;
                    letter-spacing: 2rpx;
                }
                .title-sub {
                    color: #64748b;
                    font-size: 28rpx;
                    margin-top: 16rpx;
                    font-weight: 500;
                }
            }
        }
    }

    .login-bottom {
        padding: 40rpx 60rpx 100rpx;
        background-color: #f4f6f8;

        .target-users {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 20rpx;
            margin-bottom: 60rpx;
            
            .user-tag {
                background: rgba(249, 115, 22, 0.1);
                color: #ea580c;
                font-size: 24rpx;
                padding: 12rpx 24rpx;
                border-radius: 100rpx;
                font-weight: bold;
            }
        }

        .btn-container {
            width: 100%;
            margin-bottom: 40rpx;
            
            .wx-login-btn {
                background: #07c160;
                color: #fff;
                font-size: 32rpx;
                font-weight: 600;
                border-radius: 100rpx;
                height: 100rpx;
                line-height: 100rpx;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 12rpx 32rpx rgba(7, 193, 96, 0.3);
                border: none;
                transition: all 0.2s;

                &::after {
                    border: none;
                }
                
                &:active {
                    opacity: 0.85;
                    transform: scale(0.98);
                }
            }
        }

        .agreement {
            text-align: center;
            font-size: 24rpx;
            color: #94a3b8;
            
            .link {
                color: #f97316;
                font-weight: 500;
            }
        }
    }
</style>
