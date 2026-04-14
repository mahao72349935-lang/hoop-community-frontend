/**
 * 用户相关API接口
 */

import { request } from '@/utils/request';


// 手机号 + 密码 注册
export const registerApi = (data) => {
    return request({
        method: 'post',
        url: '/api/v1/auth/register',
        data
    });
};

// 手机号 + 密码 登录（附带微信 code 静默绑定 openid）
export const loginApi = (data) => {
    return request({
        method: 'post',
        url: '/api/v1/auth/login',
        data
    });
};


export const getCaptchaCodeApi = () => {
    return request({
        method: 'get',
        url: '/validateCode/captcha'
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
        method: 'put',
        url: '/user/info',
        data
    });
};

// 修改密码
export const changePasswordApi = (data) => {
    return request({
        method: 'post',
        url: '/user/changePassword',
        data
    });
};

// 用户登出
export const logoutApi = () => {
    return request({
        method: 'post',
        url: '/auth/logout'
    });
};

// 获取用户列表
export const getUserListApi = (params) => {
    return request({
        method: 'get',
        url: '/user/list',
        params
    });
};

// 重置密码
export const resetPasswordApi = (data) => {
    return request({
        method: 'post',
        url: '/user/resetPassword',
        data
    });
};
