// src/store/count.js
import { piniaStore } from '../index';
import { defineStore } from 'pinia';
export const useCountStore = defineStore('count', {
    state: () => {
        return {
            count: 0
        };
    },
    actions: {
        increment() {
            this.count++;
        }
    },
    persist: true // 配置持久化
});

export function useOutsideCountStore() {
    return useCountStore(piniaStore);
}
