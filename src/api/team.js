import { request } from '@/utils/request';

export const createTeamApi = (data) => {
    return request({
        method: 'post',
        url: '/team/createTeam',
        data
    });
};

export const getTeamListApi = (params) => {
    return request({
        method: 'get',
        url: '/team/updateTeam',
        params
    });
};
