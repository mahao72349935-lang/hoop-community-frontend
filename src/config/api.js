// API配置文件
export const API_CONFIG = {
    // 开发环境
    development: {
        baseURL: 'http://192.168.5.125:8100/',
        timeout: 10000
    },
    // 生产环境
    production: {
        baseURL: 'https://schyhb.com.cn/fspm/',
        timeout: 10000
    },
    // 测试环境
    test: {
        baseURL: 'https://test-api.example.com',
        timeout: 10000
    }
};

// 获取当前环境配置
export const getApiConfig = () => {
    const env = process.env.NODE_ENV || 'development';
    return API_CONFIG[env] || API_CONFIG.development;
};

// 接口状态码
export const API_CODE = {
    SUCCESS: 200, // 成功
    UNAUTHORIZED: 401, // 未授权
    FORBIDDEN: 403, // 禁止访问
    NOT_FOUND: 404, // 未找到
    SERVER_ERROR: 500 // 服务器错误
};

// 请求状态
export const REQUEST_STATUS = {
    PENDING: 'pending',
    SUCCESS: 'success',
    ERROR: 'error'
};
