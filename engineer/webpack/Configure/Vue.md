# 使用 Vue-loader 处理 SFC 代码

态上，Vue SFC(Single File Component) 文件(\*.vue)是使用类 HTML 语法描述 Vue 组件的自定义文件格式，文件由四种类型的顶层语法块组成：

- `<template>`：用于指定 Vue 组件模板内容，支持类 HTML、Pug 等语法，其内容会被预编译为 JavaScript 渲染函数；
- `<script>`：用于定义组件选项对象，在 Vue2 版本支持导出普通对象或 defineComponent 值；Vue3 之后还支持 `<script setup>` 方式定义组件的 setup() 函数；
- `<style>`：用于定义组件样式，通过配置适当 Loader 可实现 Less、Sass、Stylus 等预处理器语法支持；也可通过添加 scoped、module 属性将样式封装在当前组件内；
- Custom Block：用于满足领域特定需求而预留的 SFC 扩展模块，例如 `<docs>`；Custom Block 通常需要搭配特定工具使用，详情可参考 Custom Blocks | Vue Loader 。

原生 Webpack 并不能处理这种内容格式的文件，为此我们需要引入专用于 Vue SFC 的加载器：vue-loader。首先，依然是安装依赖：

```
yarn add -D webpack webpack-cli vue-loader
```

之后，修改 Webpack 配置，加入 vue-loader 相关声明：

```ts
onst { VueLoaderPlugin } = require("vue-loader");

module.exports = {
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: ["vue-loader"],
      },
      {
        test: /\.less$/,
        use: ["style-loader", "css-loader", "less-loader"],
      },
    ],
  },
  plugins: [new VueLoaderPlugin()],
};
```

> vue-loader 库同时提供用于处理 SFC 代码转译的 Loader 组件，与用于处理上下文兼容性的 Plugin 组件，两者需要同时配置才能正常运行。

经过 vue-loader 处理后，SFC 各个模块会被等价转译为普通 JavaScript 模块

`<template>` 内容会被转译为用于构造 Virtual Dom 结构的 render 函数；`<script>` 标签导出的对象会被转译为 JavaScript 对象字面量形式。

## 运行页面

- 使用 html-webpack-plugin 自动生成 HTML 页面；
- 使用 webpack-dev-server 让页面真正运行起来，并具备热更新能力。

其中 html-webpack-plugin 是一款根据编译产物自动生成 HTML 文件的 Webpack 插件，借助这一插件我们无需手动维护产物数量、路径、hash 值更新等问题

```
yarn add -D html-webpack-plugin
```

```ts
const path = require("path");
const { VueLoaderPlugin } = require("vue-loader");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: ["vue-loader"],
      },
      {
        test: /\.less$/,
        use: ["style-loader", "css-loader", "less-loader"],
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      templateContent: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Webpack App</title>
  </head>
  <body>
    <div id="app" />
  </body>
</html>
    `,
    }),
  ],
};
```

运行编译命令 npx webpack ，即可自动生成 HTML 文件

接入 html-webpack-plugin 后，还需要使用 webpack-dev-server 启动一套本地开发服务器。webpack-dev-server 主要提供两种功能：

- 结合 Webpack 工作流，提供基于 HTTP(S) 协议的静态资源服务；
- 提供资源热更新能力，在保持页面状态前提下自动更新页面代码，提升开发效率。

安装依赖：

```
yarn add -D webpack-dev-server
```

修改 Webpack 配置，添加 devServer 配置项：

```ts
module.exports = {
  devServer: {
    hot: true,
    open: true
  },
  ...
```

- devServer.hot：用于声明是否使用热更新能力，接受 bool 值。
- devServer.open：用于声明是否自动打开页面，接受 bool 值。

## 复用其它编译工具

到这里，我们还是在用原生 JavaScript、CSS 编写 Vue 组件代码，在现代 Web 开发中，我们通常还会搭配其它工程化工具力求提升开发效率、质量。好消息是经过精妙的设计，vue-loader 能够复合使用其它 Webpack Loader 的能力处理各个模块内容，包括：

- 使用 babel-loader、ts-loader 等处理 SFC 的 `<script>` 模块；
- 使用 less-loader、sass-loader 等处理 `<style>` 模块；
- 使用 pug-plain-loader 等处理 `<template>` 模块。

为了达到这种效果，用法上我们需要为每种模块配置相应的 Webpack 处理规则，并正确设置模块的 lang 属性值。

例如，为了在 `<script>` 使用 TypeScript 编写组件逻辑，首先需要安装 ts-loader 等及相关依赖：

```
npm install -D typescript ts-loader
```

修改 Webpack 配置，添加用于处理 TypeScript 代码的规则：

```ts
const { VueLoaderPlugin } = require("vue-loader");

module.exports = {
  module: {
    rules: [
      { test: /\.vue$/, use: ["vue-loader"] },
      { test: /\.ts$/, use: ["ts-loader"] },
    ],
  },
  plugins: [new VueLoaderPlugin()],
};
```

设置 `<script>` 标签的 lang = "typescript"：

```vue
<script lang="typescript">
export default {
  data() {
    return { message: "Hello World" };
  },
};
</script>
```

vue-loader 会根据 lang 属性值，按 Webpack 配置的 TypeScript 规则，调用 ts-loader 处理这部分代码。

与处理普通 .ts 文件类似，我们还可以通过 tsconfig.json 文件修改 TypeScript 编译配置

> 同理，与处理普通 .ts、.js 文件类似的，我们还可以通过 Webpack 的 module.rule 配置项继续接入 ESLint、Babel 等工具，这些规则也都会对 Vue SFC 文件模块生效。

类似的，我们还可以使用 Less/Sass/Stylus 等语言开发 CSS 代码，接入过程与上述 TypeScript 相似，以 Less 为例，首先安装依赖：

```
yarn add -D less less-loader css-loader style-loader
```

修改 Webpack 配置，添加 Less 文件相关处理规则：

```ts
const path = require("path");
const { VueLoaderPlugin } = require("vue-loader");

module.exports = {
  module: {
    rules: [
      { test: /\.vue$/, use: ["vue-loader"] },
      {
        test: /\.less$/,
        use: ["style-loader", "css-loader", "less-loader"],
      },
    ],
  },
  plugins: [new VueLoaderPlugin()],
};
```

设置 <style> 标签的 lang = "less"：

```vue
<style lang="less">
h3 {
  margin: 40px 0 0;
  color: #42b983;
  span {
    font-weight: normal;
  }
}
</style>
```

Webpack 就会像处理其它 .less 文件一般，使用 less-loader 加载这一模块内容。

> 其它 CSS 相关工具，如 Sass、Stylus、PostCSS 均遵循同样规则。

`<template>` 的处理规则会稍微不同，因为绝大部分 Webpack 模板类 Loader 都会返回一个模板函数，而不是编译好的 HTML 片段，这与 Vue SFC 将 `<template>` 编译为 render 函数的规则相冲突，此时通常需要使用一个返回原始的 HTML 字符串的 loader，例如使用 pug-plain-loader，而不是 pug-loader。

接入过程，首先安装依赖：

```
yarn add -D pug pug-plain-loader
```

修改 Webpack 配置：

```ts
const { VueLoaderPlugin } = require("vue-loader");

module.exports = {
  module: {
    rules: [
      { test: /\.pug$/, use: ["pug-plain-loader"] },
      { test: /\.vue$/, use: ["vue-loader"] },
    ],
  },
  plugins: [new VueLoaderPlugin()],
};
```

设置 `<template>` 标签的 lang = "pug"：

```vue
<template lang="pug">
  div.hello
    h3 {{message}}
  </div>
</template>
```

Webpack 就会像处理其它 .pug 文件一般使用 pug-plain-loader 加载这一模块内容

## ssr

Webpack、Vue3、Express、@vue/server-renderer

[demo](../vue-ssr-demo/)
