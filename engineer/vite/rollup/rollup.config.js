// 引入非常关键的两个包，接入插件的能力
// 允许我们加载第三方依赖, 否则，第三方依赖不会识别
import resolve from "@rollup/plugin-node-resolve";
// 将 CommonJS 格式的代码转换为 ESM 格式
import commonjs from "@rollup/plugin-commonjs";

// 压缩
import { terser } from 'rollup-plugin-terser'

// 以下注释是为了能使用 VSCode 的类型提示
/**
 * @type { import('rollup').RollupOptions }
 */
export default {
  input: ["src/index.js"],
  // 数组为多产物配置
  output: [
    /**
      // 产物输出目录
      dir: path.resolve(__dirname, 'dist'),
      // 以下三个配置项都可以使用这些占位符:
      // 1. [name]: 去除文件后缀后的文件名
      // 2. [hash]: 根据文件名和文件内容生成的 hash 值
      // 3. [format]: 产物模块格式，如 es、cjs
      // 4. [extname]: 产物后缀名(带`.`)
      // 入口模块的输出文件名
      entryFileNames: `[name].js`,
      // 非入口模块(如动态 import)的输出文件名
      chunkFileNames: 'chunk-[hash].js',
      // 静态资源文件输出文件名
      assetFileNames: 'assets/[name]-[hash][extname]',
      // 产物输出格式，包括`amd`、`cjs`、`es`、`iife`、`umd`、`system`
      format: 'cjs',
      // 是否生成 sourcemap 文件
      sourcemap: true,
      // 如果是打包出 iife/umd 格式，需要对外暴露出一个全局变量，通过 name 配置变量名
      name: 'MyBundle',
      // 全局变量声明
      globals: {
        // 项目中可以直接用`$`代替`jquery`
        jquery: '$'
      }
    */

    {
      file: "bundle.js",
      entryFileNames: "[name].js",
      // 产物输出目录
      dir: "dist/es",
      // 产物格式
      format: "esm",
    },
    {
      dir: "dist/cjs",
      format: "cjs",
      // 加入 terser 插件，用来压缩代码，也可以放到外层的plugins
      plugins: [terser()]
    },
  ],
  // 第三方依赖，不想打包，可以用entryFileNames优化
  // external: ['react', 'react-dom'],
  plugins: [resolve(), commonjs()],
};
