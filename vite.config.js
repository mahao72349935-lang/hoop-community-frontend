import { defineConfig } from 'vite';
import AutoImport from 'unplugin-auto-import/vite';
import uni from '@dcloudio/vite-plugin-uni';
import uniRouter from 'unplugin-uni-router/vite';
import path from 'path';
import UniComponents from '@uni-helper/vite-plugin-uni-components';
import { NutResolver } from 'nutui-uniapp';

export default defineConfig({
    plugins: [
        uniRouter(),
        AutoImport({
            imports: [
                'vue',
                'uni-app',
                {
                    'nutui-uniapp/composables': [
                        // 在这里添加需要自动导入的API
                        'useToast'
                    ]
                }
            ],
            dts: true,
            eslintrc: {
                enabled: true
            }
        }),
        UniComponents({
            resolvers: [NutResolver()]
        }),
        uni()
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    },
    css: {
        preprocessorOptions: {
            scss: {
                additionalData:
                    "@import '@/style/custom_theme.scss';@import 'nutui-uniapp/styles/variables.scss';"
            }
        }
    }
});
