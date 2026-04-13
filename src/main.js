import { createSSRApp } from 'vue';

import App from './App.vue';
import { setupStore } from './store';

// 全局配置axios
import './utils/request';

export function createApp() {
    const app = createSSRApp(App);
    setupStore(app);
    return {
        app
    };
}
