// src/store/index.js
import { createPinia } from 'pinia';
import { createPersistedState } from 'pinia-plugin-persistedstate';

const piniaStore = createPinia();
piniaStore.use(
    createPersistedState({
        storage: {
            getItem: uni.getStorageSync,
            setItem: uni.setStorageSync
        }
    })
);
export { piniaStore };

export function setupStore(app) {
    app.use(piniaStore);
}
