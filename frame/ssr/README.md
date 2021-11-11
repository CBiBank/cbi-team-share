- 参考 尤大的项目：[vue-hackernews-2.0](https://github.com/vuejs/vue-hackernews-2.0)

# 预渲染

## [prerender-spa-plugin](https://github.com/chrisvfritz/prerender-spa-plugin) 插件

简单配置：

```js
const path = require("path");
const PrerenderSPAPlugin = require("prerender-spa-plugin");

module.exports = {
  plugins: [
    ...new PrerenderSPAPlugin({
      // Required - The path to the webpack-outputted app to prerender.
      staticDir: path.join(__dirname, "dist"),
      // Required - Routes to render.
      routes: ["/", "/about", "/some/deep/nested/route"],
    }),
  ],
};
```

# simple-demo

## 依赖

项目需要四个依赖

```bash
yarn add exporess (或者koa)
yarn add vue
yarn add vue-router
yarn add vue-server-renderer
```

## 搭建 node 服务

```js
const express = require("express");
const app = express();

app.get("*", (request, response) => {
  response.end("hello, ssr");
});

const port = 3000;

app.listen(port, () => {
  console.log("http://localhost:" + port);
});
```

再加入命令启动

```
"scripts": {
    "server": "node index.js"
 }
```

启动 `3000` 端口

# webpack-demo

结合 `vue` 官方提供插件 `vue-server-renderer` 进行配置

## 项目说明

# `nuxt` 项目搭建

## 项目说明

```bash
yarn create nuxt-app <项目名>
```

然后进行配置选择即可
