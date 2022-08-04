# ESLint

ESLint 是一种扩展性极佳的 JavaScript 代码风格检查工具，它能够自动识别违反风格规则的代码并予以修复

Webpack 下，可以使用 eslint-webpack-plugin 接入 ESLint 工具

1.  安装依赖

```bash
# 安装 webpack 依赖
yarn add -D webpack webpack-cli

# 安装 eslint
yarn add -D eslint eslint-webpack-plugin

# 简单起见，这里直接使用 standard 规范
yarn add -D eslint-config-standard eslint-plugin-promise eslint-plugin-import eslint-plugin-node
```

2.  在项目根目录添加 .eslintrc 配置文件，内容：

```bash
// .babelrc
{
  "extends": "standard"
}
```

3.  添加 webpack.config.js 配置文件，补充 eslint-webpack-plugin 配置

```ts
// webpack.config.js
const path = require("path");
const ESLintPlugin = require("eslint-webpack-plugin");

module.exports = {
  entry: "./src/index",
  mode: "development",
  devtool: false,
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },
  // 添加 eslint-webpack-plugin 插件实例
  plugins: [new ESLintPlugin()],
};
```

4.  执行编译命令

```bash
npx webpack
```

除常规 JavaScript 代码风格检查外，我们还可以使用适当的 ESLint 插件、配置集实现更丰富的检查、格式化功能，推荐几种使用率较高第三方扩展：

- eslint-config-airbnb：Airbnb 提供的代码风格规则集，算得上 ESLint 生态第一个成名的规则集合
- eslint-config-standard：Standard.js 代码风格规则集，史上最便捷的统一代码风格的方式
- eslint-plugin-vue：实现对 Vue SFC 文件的代码风格检查
- eslint-plugin-react：实现对 React 代码风格检查
- @typescript-eslint/eslint-plugin：实现对 TypeScript 代码风格检查
- eslint-plugin-sonarjs：基于 Sonar 的代码质量检查工具，提供圈复杂度、代码重复率等检测功能
