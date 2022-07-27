import { defineConfig, normalizePath } from 'vite'
import vue from '@vitejs/plugin-vue'

import path from 'path'
import viteEslint from 'vite-plugin-eslint'

import { visualizer } from 'rollup-plugin-visualizer'
import autoprefixer from 'autoprefixer'

const variablePath = normalizePath(
  path.resolve('./src/assets/scss/variable.scss')
)

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm-bundler.js',
      'balm-ui-plus': 'balm-ui/dist/balm-ui-plus.esm.js',
      'balm-ui-css': 'balm-ui/dist/balm-ui.css',

      '@': path.join(__dirname, 'src'),
      '@pages': path.join(__dirname, 'src/pages'),
      '@assets': path.join(__dirname, 'src/assets'),
      '@store': path.join(__dirname, 'src/store'),
      '@components': path.join(__dirname, 'src/components')
    }
  },
  css: {
    postcss: {
      plugins: [
        autoprefixer({
          overrideBrowserslist: ['Chrome > 40', 'ff > 31', 'ie 11']
        })
      ]
    },
    modules: {
      generateScopedName: '[name]__[local]___[hash:base64:5]'
    },
    preprocessorOptions: {
      scss: {
        // additionalData 的内容会在每个 scss 文件的开头自动注入
        additionalData: `@import "${variablePath}";`
      },
      less: {
        javascriptEnabled: true
      }
    }
  },

  optimizeDeps: {
    // 为一个字符串数组
    // entries: ["./src/main.vue"],
    // 将所有的 .vue 文件作为扫描入口
    // entries: ["**/*.vue"],
    // 配置为一个字符串数组，将 `lodash-es` 和 `vue`两个包强制进行预构建
    /**
      include: ["lodash-es", "vue"]
     */
    // 自定义esbuild
    /**
      esbuildOptions: {
      plugins: [
          // 加入 Esbuild 插件
        ]
      }
     */
  },
  server: {
    proxy: {
      // 代理配置
      // '/api/': {
      //   target: 'http://127.0.0.1:3000/',
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/api/, '')
      // }
    }
  },
  build: {
    minify: false
  },
  plugins: [
    vue(),
    // 集成stylelint
    viteEslint({
      // 对某些文件排除检查
      exclude: ['**/*.spec.ts']
    }),
    // 打包分析
    visualizer({
      open: process.env.NODE_ENV === 'production'
    })
  ]
})
