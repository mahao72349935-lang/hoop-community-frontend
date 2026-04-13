/**
 * API使用示例
 * 展示如何在页面中使用各个模块的API接口
 */

// ========== 方式一：直接导入具体接口 ==========
import { updateAlsTaskListApi, pageAlsTaskApi, getAlsTaskDetailApi } from '@/api/detection';

import { loginApi, getUserInfoApi, updateUserInfoApi } from '@/api/user';

import { uploadImageApi, uploadFileApi } from '@/api/upload';

// 使用示例
export const detectionExample = async () => {
    try {
        // 更新ALS任务列表
        const updateResult = await updateAlsTaskListApi({
            taskId: 123,
            status: 'completed'
        });
        console.log('更新结果:', updateResult);

        // 分页获取ALS任务
        const listResult = await pageAlsTaskApi({
            page: 1,
            size: 10,
            status: 'active'
        });
        console.log('任务列表:', listResult);

        // 获取任务详情
        const detailResult = await getAlsTaskDetailApi(123);
        console.log('任务详情:', detailResult);
    } catch (error) {
        console.error('检测任务操作失败:', error);
    }
};

export const userExample = async () => {
    try {
        // 用户登录
        const loginResult = await loginApi({
            username: 'test@example.com',
            password: '123456'
        });
        console.log('登录结果:', loginResult);

        // 获取用户信息
        const userInfo = await getUserInfoApi();
        console.log('用户信息:', userInfo);

        // 更新用户信息
        const updateResult = await updateUserInfoApi({
            nickname: '新昵称',
            avatar: 'https://example.com/avatar.jpg'
        });
        console.log('更新结果:', updateResult);
    } catch (error) {
        console.error('用户操作失败:', error);
    }
};

export const uploadExample = async () => {
    try {
        // 选择图片
        const res = await uni.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera']
        });

        // 上传图片
        const uploadResult = await uploadImageApi(res.tempFilePaths[0], {
            type: 'avatar'
        });
        console.log('上传结果:', uploadResult);
    } catch (error) {
        console.error('上传失败:', error);
    }
};

// ========== 方式二：按模块导入 ==========
import * as detectionApi from '@/api/detection';
import * as userApi from '@/api/user';
import * as uploadApi from '@/api/upload';

export const moduleExample = async () => {
    try {
        // 使用检测任务API
        const taskList = await detectionApi.pageAlsTaskApi({ page: 1, size: 10 });

        // 使用用户API
        const userInfo = await userApi.getUserInfoApi();

        // 使用上传API
        const uploadResult = await uploadApi.uploadImageApi('/path/to/image.jpg');
    } catch (error) {
        console.error('操作失败:', error);
    }
};

// ========== 在Vue组件中使用 ==========
export const useApiInVueComponent = () => {
    const loading = ref(false);
    const taskList = ref([]);
    const error = ref(null);

    const fetchTaskList = async (params = {}) => {
        loading.value = true;
        error.value = null;

        try {
            const result = await pageAlsTaskApi({
                page: 1,
                size: 10,
                ...params
            });
            taskList.value = result.list || [];
        } catch (err) {
            error.value = err.message;
        } finally {
            loading.value = false;
        }
    };

    const updateTask = async (taskId, data) => {
        try {
            const result = await updateAlsTaskListApi({
                taskId,
                ...data
            });
            // 更新成功后刷新列表
            await fetchTaskList();
            return result;
        } catch (err) {
            error.value = err.message;
            throw err;
        }
    };

    return {
        loading,
        taskList,
        error,
        fetchTaskList,
        updateTask
    };
};
