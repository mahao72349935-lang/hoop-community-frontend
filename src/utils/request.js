import axios from 'axios';
import { createUniAppAxiosAdapter } from '@uni-helper/axios-adapter';

const TEST_URL = 'http://localhost:3000/';
const PROD_URL = 'https://schyhb.com.cn/fspm/';
// 创建axios实例
const request = axios.create({
    baseURL: process.env.NODE_ENV === 'development' ? TEST_URL : PROD_URL,
    timeout: 10000,
    adapter: createUniAppAxiosAdapter()
});

// 请求拦截器
request.interceptors.request.use(
    (config) => {
        // 显示加载提示
        uni.showLoading({
            title: '加载中...',
            mask: true
        });

        // 添加token到请求头
        const token = uni.getStorageSync('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // 添加时间戳防止缓存
        if (config.method === 'get') {
            config.params = {
                ...config.params,
                _t: Date.now()
            };
        }

        return config;
    },
    (error) => {
        uni.hideLoading();
        console.error('请求错误:', error);
        return Promise.reject(error);
    }
);

// 响应拦截器
request.interceptors.response.use(
    (response) => {
        uni.hideLoading();

        const { data, status } = response;

        // 根据业务状态码处理
        if (status === 200) {
            // 如果后端返回的数据结构是 { code, data, message }
            if (data && typeof data === 'object' && 'code' in data) {
                if (data.code === 200 || data.code === 0) {
                    return data.data || data;
                } else {
                    // 业务错误
                    const errorMsg = data.message || '请求失败';
                    uni.showToast({
                        title: errorMsg,
                        icon: 'none',
                        duration: 2000
                    });
                    return Promise.reject(new Error(errorMsg));
                }
            }
            return data;
        } else {
            uni.showToast({
                title: '请求失败',
                icon: 'none',
                duration: 2000
            });
            return Promise.reject(new Error('请求失败'));
        }
    },
    (error) => {
        uni.hideLoading();

        let errorMessage = '网络错误';

        if (error.response) {
            const { status, data } = error.response;

            switch (status) {
                case 401:
                    errorMessage = '未授权，请重新登录';
                    // 清除token并跳转到登录页
                    uni.removeStorageSync('token');
                    uni.reLaunch({
                        url: '/pages/login/index'
                    });
                    break;
                case 403:
                    errorMessage = '拒绝访问';
                    break;
                case 404:
                    errorMessage = '请求地址不存在';
                    break;
                case 500:
                    errorMessage = '服务器内部错误';
                    break;
                case 502:
                    errorMessage = '网关错误';
                    break;
                case 503:
                    errorMessage = '服务不可用';
                    break;
                case 504:
                    errorMessage = '网关超时';
                    break;
                default:
                    errorMessage = data?.message || `请求失败(${status})`;
            }
        } else if (error.code === 'ECONNABORTED') {
            errorMessage = '请求超时';
        } else if (error.message.includes('Network Error')) {
            errorMessage = '网络连接失败';
        }

        uni.showToast({
            title: errorMessage,
            icon: 'none',
            duration: 2000
        });

        return Promise.reject(error);
    }
);

// 封装请求方法
export const http = {
    get(url, params = {}, config = {}) {
        return request({
            method: 'get',
            url,
            params,
            ...config
        });
    },

    post(url, data = {}, config = {}) {
        return request({
            method: 'post',
            url,
            data,
            ...config
        });
    },

    put(url, data = {}, config = {}) {
        return request({
            method: 'put',
            url,
            data,
            ...config
        });
    },

    delete(url, params = {}, config = {}) {
        return request({
            method: 'delete',
            url,
            params,
            ...config
        });
    },

    upload(url, filePath, name = 'file', formData = {}, config = {}) {
        return new Promise((resolve, reject) => {
            uni.uploadFile({
                url: request.defaults.baseURL + url,
                filePath,
                name,
                formData: {
                    ...formData,
                    token: uni.getStorageSync('token')
                },
                success: (res) => {
                    try {
                        const data = JSON.parse(res.data);
                        if (data.code === 200 || data.code === 0) {
                            resolve(data.data || data);
                        } else {
                            reject(new Error(data.message || '上传失败'));
                        }
                    } catch (e) {
                        reject(new Error('上传失败'));
                    }
                },
                fail: (error) => {
                    reject(error);
                }
            });
        });
    },

    download(url, config = {}) {
        return new Promise((resolve, reject) => {
            uni.downloadFile({
                url: request.defaults.baseURL + url,
                success: (res) => {
                    if (res.statusCode === 200) {
                        resolve(res);
                    } else {
                        reject(new Error('下载失败'));
                    }
                },
                fail: (error) => {
                    reject(error);
                }
            });
        });
    }
};

// 导出request实例，方便直接使用
export { request };

export default request;
