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

启动 `3000` 端口可以看到已经返回一个字符串，并且在页面上渲染成功

## 加入 vue

想要加入 vue，需要引入依赖 `vue-server-renderer`

然后对 server.js 进行改造

```js
const express = require("express");
const app = express();
const Vue = require("vue");
const vueServerRender = require("vue-server-renderer").createRenderer();

app.get("*", (request, response) => {
  const vueApp = new Vue({
    data: {
      message: "hello, ssr",
    },
    template: `<h1>{{message}}</h1>`,
  });

  response.status(200);
  response.setHeader("Content-type", "text/html;charset-utf-8");
  vueServerRender
    .renderToString(vueApp)
    .then((html) => {
      response.end(html);
    })
    .catch((err) => console.log(err));
});
```

可以看到 h1 上面有一个属性：data-server-rendered="true"，这个是一个标记，表明这个页面是由 vue-ssr 渲染而来的

## vue 加入模板

首先创建一个 html，并且写入内容

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Hello, SSR</title>
  </head>
  <body>
    <!--vue-ssr-outlet-->
  </body>
</html>
```

可以看到 有一个注释`<!--vue-ssr-outlet-->`,这是不能删除的，并且内部不能添加空格，因为这是 vue 的挂在符，需要完全正确，vue 才能知道内容要挂载到哪里

然后，修改 server.js，把新创建的 index.html 引入

```js
const express = require("express");
const app = express();
const Vue = require("vue");
const path = require("path");
const vueServerRender = require("vue-server-renderer").createRenderer({
  template: require("fs").readFileSync(path.join(__dirname, "./index.html"), "utf-8")
});
...
```

重启服务，已经可以看到，成功的渲染了一个 html 页面

# webpack-demo

结合 `vue` 官方提供插件 `vue-server-renderer` 进行配置

## 项目说明

# `nuxt` 项目搭建

## 项目说明

```bash
yarn create nuxt-app <项目名>
```

然后进行配置选择即可
