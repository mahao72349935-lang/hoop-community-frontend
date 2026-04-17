import { createUniAppAxiosAdapter } from '@uni-helper/axios-adapter';
import axios from 'axios';

const TEST_URL = 'http://localhost:3000';
const PROD_URL = 'https://schyhb.com.cn/fspm';

const baseURL = process.env.NODE_ENV === 'development' ? TEST_URL : PROD_URL;

const request = axios.create({
    baseURL: `${baseURL}/api/v1`,
    timeout: 10000,
    adapter: createUniAppAxiosAdapter()
});

// ─── loading 计数器，避免并发闪烁 ─────────────
let loadingCount = 0;
const showLoading = () => {
    if (loadingCount === 0) {
        uni.showLoading({ title: '加载中...', mask: true });
    }
    loadingCount++;
};
const hideLoading = () => {
    loadingCount = Math.max(0, loadingCount - 1);
    if (loadingCount === 0) uni.hideLoading();
};

// ─── 避免 401 并发重复跳转 ───────────────────
let isRedirectingToLogin = false;

// ─── 请求拦截器 ─────────────────────────────
request.interceptors.request.use(
    (config) => {
        if (!config.silent) showLoading();

        const token = uni.getStorageSync('token');
        if (token) config.headers.Authorization = `Bearer ${token}`;

        if (config.method === 'get') {
            config.params = { ...config.params, _t: Date.now() };
        }
        return config;
    },
    (error) => {
        hideLoading();
        return Promise.reject(error);
    }
);

// ─── 响应拦截器 ─────────────────────────────
request.interceptors.response.use(
    (response) => {
        if (!response.config.silent) hideLoading();

        const { data, status } = response;

        // 所有 2xx 都算成功
        if (status >= 200 && status < 300) {
            // 204 No Content：无响应体（删除等）
            if (status === 204) return null;

            // 统一响应结构：{ code, success, message, data }
            if (data && typeof data === 'object' && 'success' in data) {
                if (data.success) {
                    return data.data ?? null;
                }
                // HTTP 成功但业务失败（较少见）
                const msg = data.message || '请求失败';
                if (!response.config.silentError) {
                    uni.showToast({ title: msg, icon: 'none', duration: 2000 });
                }
                return Promise.reject(new Error(msg));
            }

            return data;
        }

        return Promise.reject(new Error('请求失败'));
    },
    (error) => {
        if (!error.config?.silent) hideLoading();

        let errorMessage = '网络错误';

        if (error.response) {
            const { status, data } = error.response;
            switch (status) {
                case 400:
                    errorMessage = data?.message || '请求参数错误';
                    break;
                case 401:
                    errorMessage = '未授权，请重新登录';
                    uni.removeStorageSync('token');
                    if (!isRedirectingToLogin) {
                        isRedirectingToLogin = true;
                        uni.reLaunch({
                            url: '/pages/login/index',
                            complete: () => {
                                isRedirectingToLogin = false;
                            }
                        });
                    }
                    break;
                case 403:
                    errorMessage = data?.message || '拒绝访问';
                    break;
                case 404:
                    errorMessage = data?.message || '请求地址不存在';
                    break;
                case 409:
                    errorMessage = data?.message || '资源冲突';
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
        } else if (error.message?.includes('Network Error')) {
            errorMessage = '网络连接失败';
        }

        if (!error.config?.silentError) {
            uni.showToast({ title: errorMessage, icon: 'none', duration: 2000 });
        }

        return Promise.reject(error);
    }
);

// ─── 请求方法封装 ───────────────────────────
export const http = {
    get(url, params = {}, config = {}) {
        return request({ method: 'get', url, params, ...config });
    },
    post(url, data = {}, config = {}) {
        return request({ method: 'post', url, data, ...config });
    },
    put(url, data = {}, config = {}) {
        return request({ method: 'put', url, data, ...config });
    },
    patch(url, data = {}, config = {}) {
        return request({ method: 'patch', url, data, ...config });
    },
    delete(url, params = {}, config = {}) {
        return request({ method: 'delete', url, params, ...config });
    },
    upload(url, filePath, name = 'file', formData = {}, config = {}) {
        return new Promise((resolve, reject) => {
            uni.uploadFile({
                url: request.defaults.baseURL + url,
                filePath,
                name,
                formData: { ...formData, token: uni.getStorageSync('token') },
                header: {
                    Authorization: `Bearer ${uni.getStorageSync('token')}`
                },
                success: (res) => {
                    try {
                        const data = JSON.parse(res.data);
                        if (data.success) {
                            resolve(data.data ?? null);
                        } else {
                            reject(new Error(data.message || '上传失败'));
                        }
                    } catch (e) {
                        reject(new Error('上传失败'));
                    }
                },
                fail: reject,
                ...config
            });
        });
    },
    download(url, config = {}) {
        return new Promise((resolve, reject) => {
            uni.downloadFile({
                url: request.defaults.baseURL + url,
                success: (res) => {
                    if (res.statusCode === 200) resolve(res);
                    else reject(new Error('下载失败'));
                },
                fail: reject,
                ...config
            });
        });
    }
};

export { request };
export default request;
