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

## 为 vue 项目添加路由

首先创建 src，然后在 src 下添加 router

```js
const vueRouter = require("vue-router");
const Vue = require("vue");

Vue.use(vueRouter);

module.exports = () => {
  return new vueRouter({
    mode: "history", // 注意，此处必须为history，否则跳转页面无法进行更新
    routes: [
      {
        path: "/",
        component: {
          template: `<h1>this is home page</h1>`,
        },
        name: "home",
      },
      {
        path: "/about",
        component: {
          template: `<h1>this is about page</h1>`,
        },
        name: "about",
      },
    ],
  });
};
```

并添加入口文件 app.js

```js
const Vue = require("vue");
const createRouter = require("./router");

module.exports = (context) => {
  const router = createRouter();
  return new Vue({
    router,
    data: {
      message: "Hello,Vue SSR!",
    },
    template: `
      <div>
        <h1>{{message}}</h1>
        <ul>
          <li>
            <router-link to="/">home</router-link>
          </li>
          <li>
            <router-link to="/about">about</router-link>
          </li>
        </ul>
        <router-view></router-view>
      </div>
    `,
  });
};
```

然后，在 server.js 中，进行引用，重启服务

我们看到页面已经渲染成功，但是点击路由时候，url 有变化，但是内容没有变化。

这是因为我们把页面渲染工作交给了服务器端，页面修改路由切换，还是在前端执行，并未通知到服务端，所以服务端渲染的页面不会有变化

## 服务端控制页面路由

在 src 下创建 entry-server.js 文件，是服务端入口文件，接口 app（渲染内容）和 router(路由)实例：

```js
const createApp = require("./app.js");

module.exports = (context) => {
  return new Promise(async (reslove, reject) => {
    let { url } = context;

    let { app, router } = createApp(context);
    router.push(url);
    //  router回调函数
    //  当所有异步请求完成之后就会触发
    router.onReady(() => {
      let matchedComponents = router.getMatchedComponents();
      if (!matchedComponents.length) {
        return reject();
      }
      reslove(app);
    }, reject);
  });
};
```

添加 entry-client.js 文件，作为客户端入口，将路由挂在到 app 内：

```js
const createApp = require("./app.js");
let { app, router } = createApp({});

router.onReady(() => {
  app.$mount("#app");
});
```

修改 app.js，将实例暴露出去：

```js
const app = new Vue({
  ...
})
return {
  app,
  router
}
```

最后修改 server.js

```js
const App = require("./src/entry-server.js");

let path = require("path");
const vueServerRender = require("vue-server-renderer").createRenderer({
  template: require("fs").readFileSync(
    path.join(__dirname, "./index.html"),
    "utf-8"
  ),
});

app.get("*", async (request, response) => {
  let { url } = request;
  let vm;
  vm = await App({ url });

  response.status(200);
  response.setHeader("Content-type", "text/html;charset-utf-8");

  vueServerRender
    .renderToString(vm)
    .then((html) => {
      response.end(html);
    })
    .catch((err) => console.log(err));
});
```

重启服务，可以路由变化页面也已经发生改变

## 数据传递

修改 entry-server.js，进行同步和异步获取数据

```js
const getData = function () {
  return new Promise((reslove, reject) => {
    let str = 'this is a async data!';
    reslove(str);
  })
}

...
// 数据传递
context.propsData = "this is a data from props!";

context.asyncData = await getData();
...
```

修改 app.js，接收数据并渲染,

```js
data: {
  message: "Hello,Vue SSR!",
  propsData: context.propsData,
  asyncData: context.asyncData
}
```

保存运行，可以看到同步和异步的数据，都能再源代码中展示

并且，还可以再server.js的request中，将数据传递下去

# webpack-demo

结合 `vue` 官方提供插件 `vue-server-renderer` 进行配置

## 项目说明

# `nuxt` 项目搭建

## 项目说明

```bash
yarn create nuxt-app <项目名>
```

然后进行配置选择即可
