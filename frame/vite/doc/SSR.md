# SSR

在 SSR 的场景下，服务端生成好完整的 HTML 内容，直接返回给浏览器，浏览器能够根据 HTML 渲染出完整的首屏内容，而不需要依赖 JS 的加载，这样一方面能够降低首屏渲染的时间，另一方面也能将完整的页面内容展现给搜索引擎的爬虫，利于 SEO。

当然，SSR 中只能生成页面的内容和结构，并不能完成事件绑定，因此需要在浏览器中执行 CSR 的 JS 脚本，完成事件绑定，让页面拥有交互的能力，这个过程被称作 hydrate(翻译为注水或者激活)。同时，像这样服务端渲染 + 客户端 hydrate 的应用也被称为同构应用。

## 生命周期

### 构建时

1.  解决模块加载问题

在原有的构建过程之外，需要加入 SSR 构建的过程 ，具体来说，我们需要另外生成一份 CommonJS 格式的产物，使之能在 Node.js 正常加载。当然，随着 Node.js 本身对 ESM 的支持越来越成熟，我们也可以复用前端 ESM 格式的代码，Vite 在开发阶段进行 SSR 构建也是这样的思路

2.  移除样式代码的引入

直接引入一行 css 在服务端其实是无法执行的，因为 Node.js 并不能解析 CSS 的内容。但 CSS Modules 的情况除外，如下所示:

```ts
import styles from "./index.module.css";

// 这里的 styles 是一个对象，如{ "container": "xxx" }，而不是 CSS 代码
console.log(styles);
```

3.  依赖外部化(external)
    对于某些第三方依赖我们并不需要使用构建后的版本，而是直接从 node_modules 中读取，比如 react-dom，这样在 SSR 构建的过程中将不会构建这些依赖，从而极大程度上加速 SSR 的构建

### 运行时

1.  加载 ssr 入口

需要确定 SSR 构建产物的入口，即组件的入口在哪里，并加载对应的模块。

2.  数据获取

这时候 Node 侧会通过查询数据库或者网络请求来获取应用所需的数据。

3.  组件渲染

这个阶段为 SSR 的核心，主要将第一步中加载的组件渲染成 HTML 字符串或者 Stream 流

4.  HTML 拼接

在组件渲染完成之后，需要拼接完整的 HTML 字符串，并将其作为响应返回给浏览器

## ssr 项目

1.  项目骨架

> ssr -> [vite-ssr](../../ssr/vite-ssr/)

其中涉及到两个额外的工具:

- nodemon: 一个监听文件变化自动重启 Node 服务的工具。
- esno: 类似 ts-node 的工具，用来执行 ts 文件，底层基于 Esbuild 实现。

2.  SSR 运行时

SSR 作为一种特殊的后端服务，可以将其封装成一个中间件的形式

```ts
import express, { RequestHandler, Express } from "express";
import { ViteDevServer } from "vite";

const isProd = process.env.NODE_ENV === "production";
const cwd = process.cwd();

async function createSsrMiddleware(app: Express): Promise<RequestHandler> {
  let vite: ViteDevServer | null = null;
  if (!isProd) {
    vite = await (
      await import("vite")
    ).createServer({
      root: process.cwd(),
      server: {
        middlewareMode: "ssr",
      },
    });
    // 注册 Vite Middlewares
    // 主要用来处理客户端资源
    app.use(vite.middlewares);
  }
  return async (req, res, next) => {
    // SSR 的逻辑
    // 1. 加载服务端入口模块
    // 2. 数据预取
    // 3. 「核心」渲染组件
    // 4. 拼接 HTML，返回响应
  };
}

async function createServer() {
  const app = express();
  // 加入 Vite SSR 中间件
  app.use(await createSsrMiddleware(app));

  app.listen(3000, () => {
    console.log("Node 服务器已启动~");
    console.log("http://localhost:3000");
  });
}

createServer();
```

```ts
// src/ssr-server/index.ts
function resolveTemplatePath() {
  return isProd
    ? path.join(cwd, "dist/client/index.html")
    : path.join(cwd, "index.html");
}

async function createSsrMiddleware(app: Express): Promise<RequestHandler> {
  // 省略之前的代码
  return async (req, res, next) => {
    const url = req.originalUrl;
    // 省略前面的步骤
    // 4. 拼接完整 HTML 字符串，返回客户端
    const templatePath = resolveTemplatePath();
    let template = await fs.readFileSync(templatePath, "utf-8");
    // 开发模式下需要注入 HMR、环境变量相关的代码，因此需要调用 vite.transformIndexHtml
    if (!isProd && vite) {
      template = await vite.transformIndexHtml(url, template);
    }
    const html = template
      .replace("<!-- SSR_APP -->", appHtml)
      // 注入数据标签，用于客户端 hydrate
      .replace(
        "<!-- SSR_DATA -->",
        `<script>window.__SSR_DATA__=${JSON.stringify(data)}</script>`
      );
    res.status(200).setHeader("Content-Type", "text/html").end(html);
  };
}
```

拼接 HTML 的逻辑中，除了添加页面的具体内容，同时我们也注入了一个挂载全局数据的 script 标签

为了激活页面的交互功能，我们需要执行 CSR 的 JavaScript 代码来进行 hydrate 操作，而客户端 hydrate 的时候需要和服务端同步预取后的数据，保证页面渲染的结果和服务端渲染一致，因此，我们刚刚注入的数据 script 标签便派上用场了。由于全局的 window 上挂载服务端预取的数据，我们可以在 entry-client.tsx 也就是客户端渲染入口中拿到这份数据，并进行 hydrate:

```tsx
const data = window.__SSR_DATA__;

ReactDOM.hydrate(
  <React.StrictMode>
    <App data={data} />
  </React.StrictMode>,
  document.getElementById("root")
);
```

## 生产环境 crs 资源处理

如果直接打包会出现静态资源找不到文件的问题

使用 serve-static 中间件

不过开发阶段并没有这个问题，这是因为对于开发阶段的静态资源 Vite Dev Server 的中间件已经帮我们处理了，而生产环境所有的资源都已经打包完成，我们需要启用单独的静态资源服务来承载这些资源

```ts
async function createServer() {
  const app = express();
  // 加入 Vite SSR 中间件
  app.use(await createSsrMiddleware(app));

  // 生产环境端处理客户端资源
  if (isProd) {
    app.use(serve(path.join(cwd, "dist/client")));
  }

  app.listen(3000, () => {
    console.log("Node 服务器已启动~");
    console.log("http://localhost:3000");
  });
}
```

## 路由管理

在 SPA 场景下，对于不同的前端框架，一般会有不同的路由管理方案，如 Vue 中的 vue-router、React 的 react-router。

路由方案在 SSR 过程中所完成的功能都是差不多的:

1.  告诉框架现在渲染哪个路由。在 Vue 中我们可以通过 router.push 确定即将渲染的路由，React 中则通过 StaticRouter 配合 location 参数来完成。
2.  设置 base 前缀。规定路径的前缀，如 vue-router 中 base 参数、react-router 中 StaticRouter 组件的 basename。

## 全局状态管理

对于全局的状态管理而言，对于不同的框架也有不同的生态和方案，比如 Vue 中的 Vuex、Pinia，React 中的 Redux、Recoil 等。

接入 SSR 的思路也比较简单，在预取数据阶段初始化服务端的 store ，将异步获取的数据存入 store 中，然后在 拼接 HTML 阶段将数据从 store 中取出放到数据 script 标签中，最后在客户端 hydrate 的时候通过 window 即可访问到预取数据。

> 服务端处理许多不同的请求，对于每个请求都需要分别初始化 store，即一个请求一个 store，不然会造成全局状态污染的问题。

## CSR 降级

某些比较极端的情况下，我们需要降级到 CSR，也就是客户端渲染。一般而言包括如下的降级场景:

1.  服务器端预取数据失败，需要降级到客户端获取数据。
2.  服务器出现异常，需要返回兜底的 CSR 模板，完全降级为 CSR。
3.  本地开发调试，有时需要跳过 SSR，仅进行 CSR。

第一种场景：

```ts
// entry-client.tsx
import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

async function fetchData() {
  // 客户端获取数据
}

let data;
if (window.__SSR_DATA__) {
  data = window.__SSR_DATA__;
} else {
  // 降级逻辑
  data = await fetchData();
}
// 也可简化为 const data = window.__SSR_DATA__ ?? await fetchData();
//
const data = window.__SSR_DATA__ ?? fetchData();

const container: HTMLElement = document.getElementById("root")!;

hydrateRoot(
  container,
  <React.StrictMode>
    <App data={data} />
  </React.StrictMode>
);
```

第二种场景：
服务器执行出错，增加 catch

```ts
async function createSsrMiddleware(app: Express): Promise<RequestHandler> {
  return async (req, res, next) => {
    try {
      // SSR 的逻辑省略
    } catch (e: any) {
      vite?.ssrFixStacktrace(e);
      console.error(e);
      // 在这里返回浏览器 CSR 模板内容
    }
  };
}
```

第三种场景：

可以通过通过 ?csr 的 url query 参数来强制跳过 SSR

```ts
async function createSsrMiddleware(app: Express): Promise<RequestHandler> {
  return async (req, res, next) => {
    try {
      if (req.query?.csr) {
        // 响应 CSR 模板内容
        return;
      }
      // ...
    } catch (e: any) {
      vite?.ssrFixStacktrace(e);
      console.error(e);
    }
  };
}
```

## 浏览器 API 兼容

Node.js 中不能使用浏览器里面诸如 window、document 之类的 API

1.  可以通过 import.meta.env.SSR 这个 Vite 内置的环境变量来判断是否处于 SSR 环境，以此来规避业务代码在服务端出现浏览器的 API

```ts
if (import.meta.env.SSR) {
  // 服务端执行的逻辑
} else {
  // 在此可以访问浏览器的 API
}
```

2.  也可以通过 polyfill 的方式，在 Node 中注入浏览器的 API，使这些 API 能够正常运行起来，解决如上的问题

使用一个比较成熟的 polyfill 库 jsdom

```ts
const jsdom = require("jsdom");
const { window } = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
const { document } = window;
// 挂载到 node 全局
global.window = window;
global.document = document;
```

## 自定义 Head

React 生态中的 react-helmet-async 以及 Vue 生态中的 vue-meta 库就是为了解决这样的问题

> 低版本可以用 react-helmet

## 流式渲染

Vue 中的 renderToNodeStream 和 React 中的 renderToNodeStream 都实现了流式渲染的能力, 大致的使用方式如下:

```ts
import { renderToNodeStream } from "react-dom/server";

// 返回一个 Nodejs 的 Stream 对象
const stream = renderToNodeStream(element);
let html = "";

stream.on("data", (data) => {
  html += data.toString();
  // 发送响应
});

stream.on("end", () => {
  console.log(html); // 渲染完成
  // 发送响应
});

stream.on("error", (err) => {
  // 错误处理
});
```

流式渲染在我们带来首屏性能提升的同时，也给我们带来了一些限制: **如果我们需要在 HTML 中填入一些与组件状态相关的内容，则不能使用流式渲染**

比如 react-helmet 中自定义的 head 内容，即便在渲染组件的时候收集到了 head 信息，但在流式渲染中，此时 HTML 的 head 部分已经发送给浏览器了，而这部分响应内容已经无法更改，因此 react-helmet 在 SSR 过程中将会失效

## SSR 缓存

SSR 是一种典型的 CPU 密集型操作，为了尽可能降低线上机器的负载，设置缓存是一个非常重要的环节。在 SSR 运行时，缓存的内容可以分为以下几个部分：

- 文件读取缓存。尽可能避免多次重复读磁盘的操作，每次磁盘 IO 尽可能地复用缓存结果

```ts
function createMemoryFsRead() {
  const fileContentMap = new Map();
  return async (filePath) => {
    const cacheResult = fileContentMap.get(filePath);
    if (cacheResult) {
      return cacheResult;
    }
    const fileContent = await fs.readFile(filePath);
    fileContentMap.set(filePath, fileContent);
    return fileContent;
  };
}

const memoryFsRead = createMemoryFsRead();
memoryFsRead("file1");
// 直接复用缓存
memoryFsRead("file1");
```

- 预取数据缓存。对于某些实时性不高的接口数据，我们可以采取缓存的策略，在下次相同的请求进来时复用之前预取数据的结果，这样预取数据过程的各种 IO 消耗，也可以一定程度上减少首屏时间
- HTML 渲染缓存。拼接完成的 HTML 内容是缓存的重点，如果能将这部分进行缓存，那么下次命中缓存之后，将可以节省 renderToString、HTML 拼接等一系列的消耗，服务端的性能收益会比较明显

对于以上的缓存内容，具体的缓存位置可以是：

- 服务器内存。如果是放到内存中，需要考虑缓存淘汰机制，防止内存过大导致服务宕机，一个典型的缓存淘汰方案是 lru-cache (基于 LRU 算法)。
- Redis 数据库，相当于以传统后端服务器的设计思路来处理缓存。
- CDN 服务。我们可以将页面内容缓存到 CDN 服务上，在下一次相同的请求进来时，使用 CDN 上的缓存内容，而不用消费源服务器的资源。对于 CDN 上的 SSR 缓存，大家可以通过阅读这篇文章深入了解。

> Vue 中组件级别的缓存一般放在内存中，可以实现更细粒度的 SSR 缓存。

## 性能监控

SSR 性能数据，有一些比较通用的指标:

- SSR 产物加载时间
- 数据预取的时间
- 组件渲染的时间
- 服务端接受请求到响应的完整时间
- SSR 缓存命中情况
- SSR 成功率、错误日志

我们可以通过 perf_hooks 来完成数据的采集

```ts
import { performance, PerformanceObserver } from "perf_hooks";

// 初始化监听器逻辑
const perfObserver = new PerformanceObserver((items) => {
  items.getEntries().forEach((entry) => {
    console.log("[performance]", entry.name, entry.duration.toFixed(2), "ms");
  });
  performance.clearMarks();
});

perfObserver.observe({ entryTypes: ["measure"] });

// 接下来我们在 SSR 进行打点
// 以 renderToString  为例
performance.mark("render-start");
// renderToString 代码省略
performance.mark("render-end");
performance.measure("renderToString", "render-start", "render-end");
```

## SSG/ISR/SPR

- SSG(Static Site Generation，静态站点生成)

  > SSG 与 SSR 最大的区别就是产出 HTML 的时间点从 SSR 运行时变成了构建时,但核心的生命周期流程并没有发生变化

- SPR 即 Serverless Pre Render，即把 SSR 的服务部署到 Serverless(FaaS) 环境中，实现服务器实例的自动扩缩容，降低服务器运维的成本
- ISR 即 Incremental Site Rendering，即增量站点渲染，将一部分的 SSG 逻辑从构建时搬到了 SSR 运行时，解决的是大量页面 SSG 构建耗时长的问题。
