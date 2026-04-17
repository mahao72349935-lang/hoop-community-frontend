import { defineStore } from 'pinia';
import { piniaStore } from './index';

export const useUserStore = defineStore('user', {
    state: () => ({
        userInfo: null
    }),
    getters: {
        userId: (state) => state.userInfo?.userId ?? state.userInfo?.id ?? ''
    },
    actions: {
        setUserInfo(info) {
            this.userInfo = info && typeof info === 'object' ? { ...info } : null;
            if (this.userInfo) {
                uni.setStorageSync('userInfo', this.userInfo);
            } else {
                uni.removeStorageSync('userInfo');
            }
        },
        clearUser() {
            this.userInfo = null;
            uni.removeStorageSync('userInfo');
            uni.removeStorageSync('token');
        }
    },
    persist: true
});

export function useOutsideUserStore() {
    return useUserStore(piniaStore);
}
