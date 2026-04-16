/**
 * 用户相关API接口
 */

import { request } from '@/utils/request';

// 手机号 + 密码 注册
export const registerApi = (data) => {
    return request({
        method: 'post',
        url: '/auth/register',
        data
    });
};

// 手机号 + 密码 登录（附带微信 code 静默绑定 openid）
export const loginApi = (data) => {
    return request({
        method: 'post',
        url: '/auth/login',
        data
    });
};

// 获取用户信息
export const getUserInfoApi = () => {
    return request({
        method: 'get',
        url: '/user/profile/info'
    });
};

// 更新用户信息
export const updateUserInfoApi = (data) => {
    return request({
        method: 'post',
        url: '/user/updateUserInfo',
        data
    });
};
