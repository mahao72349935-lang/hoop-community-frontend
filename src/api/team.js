import { http } from '@/utils/request';

// 获取我加入的球队列表（页面自有 loading，避免与拦截器全局 loading 叠层）
export const getJoinedTeamListApi = () => http.get('/teams/joined', {}, { silent: true });

// 获取所有球队列表
export const getTeamListApi = () => http.get('/teams');

// 获取球队详情（页面自有加载态）
export const getTeamDetailApi = (teamId) => http.get(`/teams/${teamId}`, {}, { silent: true });

// 创建球队
export const createTeamApi = (payload) => http.post('/teams', payload);

// 编辑球队
export const updateTeamApi = (teamId, payload) => http.patch(`/teams/${teamId}`, payload);

// 解散球队
export const deleteTeamApi = (teamId) => http.delete(`/teams/${teamId}`);

// 获取精选球队/featured
export const getFeaturedTeamListApi = () => http.get('/teams/featured');
