import { request } from '@/utils/request';

export const getSampleInfoListApi = (params) => {
    return request({
        method: 'get',
        url: '/detection/sampleInfo/qrySampleInfoPage',
        params
    });
};

export const getSampleLabelInfoApi = (params) => {
    return request({
        method: 'get',
        url: '/detection/sampleInfo/getSampleLabelInfo',
        params
    });
};
