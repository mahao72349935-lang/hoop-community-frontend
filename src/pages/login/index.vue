<template>
    <div class="login-page">
        <div class="login-top">
            <div class="bg-shape">
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

            <div class="form-container">
                <div class="input-box">
                    <input class="form-input" v-model="formData.phone" type="number" maxlength="11" placeholder="请输入手机号"
                        placeholder-class="input-placeholder" />
                </div>
                <div class="input-box">
                    <input class="form-input" v-model="formData.password" type="password" placeholder="请输入密码"
                        placeholder-class="input-placeholder" />
                </div>
                <div class="input-box" v-if="isRegister">
                    <input class="form-input" v-model="formData.confirmPassword" type="password" placeholder="请再次输入确认密码"
                        placeholder-class="input-placeholder" />
                </div>
            </div>

            <div class="action-container">
                <button class="primary-btn" @click="handleSubmit">
                    {{ isRegister ? '确认注册' : '立即登录' }}
                </button>
                <div class="toggle-mode" @click="toggleMode">
                    {{ isRegister ? '已有账号？返回登录' : '没有账号？点击注册' }}
                </div>
            </div>

            <div class="agreement">
                登录代表您已同意 <text class="link">《用户协议》</text> 和 <text class="link">《隐私政策》</text>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { registerApi, loginApi } from '../../api/user';

const logoUrl = ref('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%236474E5"/><path d="M50 5 L50 95 M5 50 L95 50 M18 18 Q 50 50 18 82 M82 18 Q 50 50 82 82" stroke="%23fff" stroke-width="4" fill="none" /></svg>');

// 状态控制：是否为注册模式
const isRegister = ref(false);

// 表单数据
const formData = reactive({
    phone: '',
    password: '',
    confirmPassword: ''
});

// 切换登录/注册模式
const toggleMode = () => {
    isRegister.value = !isRegister.value;
    // 切换时清空密码，保留手机号
    formData.password = '';
    formData.confirmPassword = '';
};

// 表单校验逻辑
const validateForm = () => {
    const phoneReg = /^1[3-9]\d{9}$/;
    if (!formData.phone) {
        uni.showToast({ title: '请输入手机号', icon: 'none' });
        return false;
    }
    if (!phoneReg.test(formData.phone)) {
        uni.showToast({ title: '手机号格式不正确', icon: 'none' });
        return false;
    }
    if (!formData.password) {
        uni.showToast({ title: '请输入密码', icon: 'none' });
        return false;
    }
    if (formData.password.length < 6) {
        uni.showToast({ title: '密码长度至少为6位', icon: 'none' });
        return false;
    }
    if (isRegister.value && formData.password !== formData.confirmPassword) {
        uni.showToast({ title: '两次输入的密码不一致', icon: 'none' });
        return false;
    }
    return true;
};

// 提交表单（登录或注册）
const handleSubmit = async () => {
    if (!validateForm()) return;

    uni.showLoading({ title: isRegister.value ? '注册中...' : '登录中...', mask: true });

    // 核心步骤：静默获取微信 code，用于后端绑定 openid
    uni.login({
        provider: 'weixin',
        success: async (loginRes) => {
            if (loginRes.code) {
                console.log('静默获取微信 code 成功:', loginRes.code);

                // 构建要发送给后端的数据参数
                const requestData = {
                    phone: formData.phone,
                    password: formData.password,
                    wechatCode: loginRes.code // 将静默拿到的 code 传给后端
                };

                console.log('准备发送给后端的数据:', requestData);

                try {
                    const res = isRegister.value ? await registerApi(requestData) : await loginApi(requestData);

                    uni.hideLoading();

                    // 后端返回 { code: 200, data: { userInfo, accessToken } }
                    // 经过 axios 拦截器 (code === 200 → return data.data)，res = { userInfo, accessToken }
                    const { accessToken, userInfo } = res;

                    // 存储 token 和用户信息（接口可能返回 mobile/phoneNumber 等，统一写入 phone 便于各页回显）
                    const phoneFromApi = userInfo?.phone ?? userInfo?.mobile ?? userInfo?.phoneNumber ?? userInfo?.tel;
                    const normalizedPhone = phoneFromApi != null && String(phoneFromApi).trim() !== ''
                        ? String(phoneFromApi).replace(/\D/g, '').slice(0, 11)
                        : String(formData.phone || '').replace(/\D/g, '').slice(0, 11);
                    const mergedUserInfo = { ...userInfo, phone: normalizedPhone };

                    uni.setStorageSync('token', accessToken);
                    uni.setStorageSync('userInfo', mergedUserInfo);

                    uni.showToast({
                        title: isRegister.value ? '注册成功' : '登录成功',
                        icon: 'success'
                    });

                    setTimeout(() => {
                        uni.reLaunch({ url: '/pages/home/index' });
                    }, 1000);

                } catch (error) {
                    uni.hideLoading();
                    // 拦截器已经 showToast 了错误信息，这里只需静默处理
                    console.error('登录/注册请求失败:', error);
                }

            } else {
                uni.hideLoading();
                uni.showToast({ title: '获取微信环境凭证失败', icon: 'none' });
            }
        },
        fail: (err) => {
            uni.hideLoading();
            console.error('uni.login 调用失败:', err);
        }
    });
};
</script>

<style lang="scss" scoped>
.login-page {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    min-height: 100vh;
    background-color: #f4f6f8;
    position: relative;
}

.login-top {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 100rpx;
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
            box-shadow: 0 8rpx 24rpx rgba(100, 116, 229, 0.25);
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
    padding: 20rpx 60rpx 80rpx;
    background-color: #f4f6f8;

    .target-users {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 20rpx;
        margin-bottom: 50rpx;

        .user-tag {
            background: rgba(100, 116, 229, 0.1);
            color: #6474E5;
            font-size: 24rpx;
            padding: 12rpx 24rpx;
            border-radius: 100rpx;
            font-weight: bold;
        }
    }

    .form-container {
        margin-bottom: 40rpx;

        .input-box {
            background: #ffffff;
            border-radius: 16rpx;
            margin-bottom: 24rpx;
            padding: 0 30rpx;
            box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.02);
            border: 2rpx solid transparent;
            transition: all 0.3s;

            &:focus-within {
                border-color: #6474E5;
            }

            .form-input {
                height: 100rpx;
                font-size: 30rpx;
                color: #333;
            }

            .input-placeholder {
                color: #a0aec0;
                font-size: 28rpx;
            }
        }
    }

    .action-container {
        width: 100%;
        margin-bottom: 40rpx;

        .primary-btn {
            background: #6474E5;
            color: #fff;
            font-size: 32rpx;
            font-weight: 600;
            border-radius: 100rpx;
            height: 100rpx;
            line-height: 100rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 12rpx 32rpx rgba(100, 116, 229, 0.3);
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

        .toggle-mode {
            text-align: center;
            color: #6474E5;
            font-size: 28rpx;
            margin-top: 30rpx;
            font-weight: 500;
        }
    }

    .agreement {
        text-align: center;
        font-size: 24rpx;
        color: #94a3b8;

        .link {
            color: #6474E5;
            font-weight: 500;
        }
    }
}
</style>