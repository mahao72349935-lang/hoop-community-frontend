import { request } from '@/utils/request';

export const getTaskListApi = (params) => {
    return request({
        method: 'get',
        url: '/detection/alsTask/pageAlsTask',
        params
    });
};

export const getTaskDetailByIDApi = (id) => {
    return request({
        method: 'get',
        url: `/detection/alsTask/getAlsTaskById/${id}`
    });
};
