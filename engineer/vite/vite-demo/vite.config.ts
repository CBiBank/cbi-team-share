import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import windi from 'vite-plugin-windicss';
// ts引入 path 包注意两点:
// 1. 为避免类型报错，需要通过 `pnpm i @types/node -D` 安装类型
// 2. tsconfig.node.json 中设置 `allowSyntheticDefaultImports: true`，以允许下面的 default 导入方式
import path from 'path';

import { viteMockServe } from 'vite-plugin-mock';
import viteStylelint from '@amatlash/vite-plugin-stylelint';
import viteEslint from 'vite-plugin-eslint';

// Vue2 项目中可以使用 vite-plugin-vue2-svg插件。
// Vue3 项目中可以引入 vite-svg-loader。
// React 项目使用 vite-plugin-svgr插件。

import svgr from 'vite-plugin-svgr';
import viteImagemin from 'vite-plugin-imagemin';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import createStyleImportPlugin from 'vite-plugin-style-import';
import AutoImport from 'unplugin-auto-import/vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { normalizePath } from 'vite';
import autoprefixer from 'autoprefixer';

// 用 normalizePath 解决 window 下的路径问题
const variablePath = normalizePath(path.resolve('./src/variable.scss'));

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    // 别名
    alias: {
      '@': path.join(__dirname, 'src'),
      '@assets': path.join(__dirname, 'src/assets')
    }
  },
  // 静态资源
  // assetsInclude: ['.gltf'],

  // build: {
  //   // 8 KB 自动提取，否则内联
  //   assetsInlineLimit: 8 * 1024
  // },
  css: {
    // vite 已提供配置入口
    postcss: {
      plugins: [
        autoprefixer({
          // 指定目标浏览器
          overrideBrowserslist: ['Chrome > 40', 'ff > 31', 'ie 11']
        })
      ]
    },
    modules: {
      // 可以通过 generateScopedName 属性来对生成的类名进行自定义
      // 其中，name 表示当前文件名，local 表示类名
      generateScopedName: '[name]__[local]___[hash:base64:5]'
    },
    preprocessorOptions: {
      scss: {
        // additionalData 的内容会在每个 scss 文件的开头自动注入
        additionalData: `@import "${variablePath}";`
      },
      // 适配 antd
      less: {
        javascriptEnabled: true
      }
    }
  },
  // 预构建
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
      //   target: 'http://127.0.0.1:3300/',
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/api/, '')
      // }
    }
  },
  build: {
    minify: false
  },
  plugins: [
    svgr(),
    react({
      /**
        babel: {
          // 加入 babel 插件
          // 以下插件包都需要提前安装
          // 当然，通过这个配置你也可以添加其它的 Babel 插件
          plugins: [
            // 适配 styled-component
            "babel-plugin-styled-components"
              // 适配 emotion
              "@emotion/babel-plugin"
          ]
        },
        // 注意: 对于 emotion，需要单独加上这个配置
        // 通过 `@emotion/react` 包编译 emotion 中的特殊 jsx 语法
        jsxImportSource: "@emotion/react"
      */
    }),
    windi(),
    // mock 配置
    viteMockServe({
      mockPath: 'mock'
    }),
    // vite集成stylelint
    viteEslint({
      // 对某些文件排除检查
      exclude: ['**/*.spec.ts']
    }),
    viteStylelint({
      exclude: /windicss|node_modules/
    }),
    createStyleImportPlugin({
      libs: [
        {
          libraryName: 'antd',
          esModule: true,
          resolveStyle: (name) => {
            return `antd/es/${name}/style/index`;
          }
        }
      ]
    }),
    // 图片压缩
    viteImagemin({
      // 无损压缩配置，无损压缩下图片质量不会变差
      optipng: {
        optimizationLevel: 7
      },
      // 有损压缩配置，有损压缩下图片质量可能会变差
      pngquant: {
        quality: [0.8, 0.9],
        speed: 4
      },
      // svg 优化
      svgo: {
        plugins: [
          {
            name: 'removeViewBox'
          },
          {
            name: 'removeEmptyAttrs',
            active: false
          }
        ]
      }
    }),
    // 雪碧图
    createSvgIconsPlugin({
      iconDirs: [path.join(__dirname, 'src/assets/icons')]
    }),
    // 配合 Vitest 使用
    AutoImport({
      imports: ['vitest'],
      dts: true
    }),
    visualizer({
      open: process.env.NODE_ENV === 'production'
    })
  ],
  // json: {
  //   stringify: true
  // },
  test: {
    globals: true,
    environment: 'jsdom'
  }
});
