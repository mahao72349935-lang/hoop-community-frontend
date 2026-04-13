/**
 * 文件上传相关API接口
 */

import { request } from '@/utils/request';

// 上传图片
export const uploadImageApi = (filePath, formData = {}) => {
    return new Promise((resolve, reject) => {
        uni.uploadFile({
            url: request.defaults.baseURL + '/upload/image',
            filePath,
            name: 'image',
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
};

// 上传文件
export const uploadFileApi = (filePath, formData = {}) => {
    return new Promise((resolve, reject) => {
        uni.uploadFile({
            url: request.defaults.baseURL + '/upload/file',
            filePath,
            name: 'file',
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
};

// 批量上传图片
export const batchUploadImageApi = (filePaths, formData = {}) => {
    const uploadPromises = filePaths.map((filePath) => uploadImageApi(filePath, formData));
    return Promise.all(uploadPromises);
};

// 下载文件
export const downloadFileApi = (url) => {
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
};
