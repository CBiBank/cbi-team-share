对于项目的加载性能优化而言，常见的优化手段可以分为下面三类:

1.  网络优化。包括 HTTP2、DNS 预解析、Preload、Prefetch 等手段。
2.  资源优化。包括构建产物分析、资源压缩、产物拆包、按需加载等优化方式。
3.  预渲染优化，本文主要介绍服务端渲染(SSR)和静态站点生成(SSG)两种手段。

# 网络优化

## http2

1.  多路复用。将数据分为多个二进制帧，多个请求和响应的数据帧在同一个 TCP 通道进行传输，解决了 http1 的队头阻塞问题。而与此同时，在 HTTP2 协议下，浏览器不再有同域名的并发请求数量限制，因此请求排队问题也得到了解决。
2.  Server Push，即服务端推送能力。可以让某些资源能够提前到达浏览器，比如对于一个 html 的请求，通过 HTTP 2 我们可以同时将相应的 js 和 css 资源推送到浏览器，省去了后续请求的开销。

在 Vite 中，我们可以通过 vite-plugin-mkcert 在本地 Dev Server 上开启 HTTP2:

```shell
pnpm i vite-plugin-mkcert -D
```

使用：

```ts
import { defineConfig } from "vite";
import mkcert from "vite-plugin-mkcert";
export default defineConfig({
  plugins: [mkcert()],
  server: {
    // https 选项需要开启
    https: true,
  },
});
```

插件的原理也比较简单，由于 HTTP2 依赖 TLS 握手，插件会自动生成 TLS 证书，然后支持通过 HTTPS 的方式启动，而 Vite 会自动把 HTTPS 服务升级为 HTTP2。

> 其中有一个特例，当使用 Vite 的 proxy 配置时，Vite 会将 HTTP2 降级为 HTTPS，也可以通过编写一个插件来解决

这是针对开发环境的配置，如果要上生产的话，需要进行[Nginx 配置](http://nginx.org/en/docs/http/ngx_http_v2_module.html)

## DNS 预解析

浏览器在向跨域的服务器发送请求时，首先会进行 DNS 解析，将服务器域名解析为对应的 IP 地址。我们通过 dns-prefetch 技术将这一过程提前，降低 DNS 解析的延迟时间，具体使用方式如下:

```html
<!-- href 为需要预解析的域名 -->
<link rel="dns-prefetch" href="https://fonts.googleapis.com/" />
```

一般情况下 dns-prefetch 会与 preconnect 搭配使用，前者用来解析 DNS，而后者用来会建立与服务器的连接，建立 TCP 通道及进行 TLS 握手，进一步降低请求延迟。使用方式如下所示:

```html
<link rel="preconnect" href="https://fonts.gstatic.com/" crossorigin />
<link rel="dns-prefetch" href="https://fonts.gstatic.com/" />
```

> 对于 preconnect 的 link 标签一般需要加上 crorssorigin(跨域标识)，否则对于一些字体资源 preconnect 会失效。

## Preload/Prefetch

对于一些比较重要的资源，可以通过 Preload 方式进行预加载，即在资源使用之前就进行加载，而不是在用到的时候才进行加载，这样可以使资源更早地到达浏览器。具体使用方式如下:

```html
<link rel="preload" href="style.css" as="style" />
<link rel="preload" href="main.js" as="script" />
```

其中我们一般会声明 href 和 as 属性，分别表示资源地址和资源类型。Preload 的浏览器兼容性也比较好，目前 95% 以上的浏览器已经支持[can i use](https://caniuse.com/?search=Preload)

与普通 script 标签不同的是，对于原生 ESM 模块，浏览器提供了 modulepreload 来进行预加载:

```html
<link rel="modulepreload" href="/src/app.js" />
```

modulepreload 的兼容性稍微差了点[can i use](https://caniuse.com/?search=modulepreload)

不过在 Vite 中我们可以通过配置一键开启 modulepreload 的 Polyfill，从而在使所有支持原生 ESM 的浏览器(占比 90% 以上)都能使用该特性，配置方式如下:

```html
<link rel="prefetch" href="https://B.com/index.js" as="script" />
```

这样浏览器会在 A 页面加载完毕之后去加载 B 这个域名下的资源，如果用户跳转到了 B 页面中，浏览器会直接使用预加载好的资源，从而提升 B 页面的加载速度。而相比 Preload， Prefetch 的浏览器兼容性 80%左右[can i use](https://caniuse.com/?search=Prefetch)

## 资源优化

### 产物分析报告

为了能可视化地感知到产物的体积情况，用 rollup-plugin-visualizer 来进行产物分析。使用方式如下:

```ts
import { defineConfig } from "vite";
// 需要安装
import { visualizer } from "rollup-plugin-visualizer";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    visualizer({
      // 打包完成后自动打开浏览器，显示产物体积报告
      open: true,
    }),
  ],
});
```

### 资源压缩

#### JavaScript 压缩

在 Vite 生产环境构建的过程中，JavaScript 产物代码会自动进行压缩，相关的配置参数如下:

```ts
export default {
  build: {
    // 类型: boolean | 'esbuild' | 'terser'
    // 默认为 `esbuild`
    minify: "esbuild",
    // 产物目标环境
    target: "modules",
    // 如果 minify 为 terser，可以通过下面的参数配置具体行为
    // https://terser.org/docs/api-reference#minify-options
    terserOptions: {},
  },
};
```

值得注意的是 target 参数，也就是压缩产物的目标环境。Vite 默认的参数是 modules，即如下的 browserlist:

```ts
["es2019", "edge88", "firefox78", "chrome87", "safari13.1"];
```

其实，对于 JS 代码压缩的理解仅仅停留在去除空行、混淆变量名的层面是不够的，为了达到极致的压缩效果，压缩器一般会根据浏览器的目标，会对代码进行语法层面的转换，比如下面这个例子:

```ts
// 业务代码中
info == null ? undefined : info.name;
```

如果将 target 配置为 exnext，也就是最新的 JS 语法，会发现压缩后的代码变成了下面这样:

```ts
info?.name;
```

因此，设置合适的 target 就显得特别重要了，一旦目标环境的设置不能覆盖所有的用户群体，那么极有可能在某些低端浏览器中出现语法不兼容问题，从而发生线上事故。

为了线上的稳定性，最好还是将 target 参数设置为 ECMA 语法的最低版本 es2015/es6。

#### CSS 压缩

```ts
export default {
  build: {
    // 设置 CSS 的目标环境
    cssTarget: "",
  },
};
```

默认情况下 Vite 会使用 Esbuild 对 CSS 代码进行压缩，一般不需要我们对 cssTarget 进行配置。

不过在需要兼容安卓端微信的 webview 时，我们需要将 build.cssTarget 设置为 chrome61，以防止 vite 将 rgba() 颜色转化为 #RGBA 十六进制符号的形式，出现样式问题。

#### 图片压缩

图片资源是一般是产物体积的大头，如果能有效地压缩图片体积，那么对项目体积来说会得到不小的优化。而在 Vite 中我们一般使用 vite-plugin-imagemin 来进行图片压缩，再加上 Nginx 的 gzip

### 产物拆包

一般来说，如果不对产物进行代码分割(或者拆包)，全部打包到一个 chunk 中，会产生如下的问题:

1.  首屏加载的代码体积过大，即使是当前页面不需要的代码也会进行加载。
2.  线上缓存复用率极低，改动一行代码即可导致整个 bundle 产物缓存失效。

而 Vite 中内置如下的代码拆包能力:

1.  CSS 代码分割，即实现一个 chunk 对应一个 css 文件。
2.  默认有一套拆包策略，将应用的代码和第三方库的代码分别打包成两份产物，并对于动态 import 的模块单独打包成一个 chunk。

当然，我们也可以通过 manualChunks 参数进行自定义配置：

```json
{
  build: {
    rollupOptions: {
      output: {
        // 1. 对象配置
        manualChunks: {
          // 将 React 相关库打包成单独的 chunk 中
          'react-vendor': ['react', 'react-dom'],
          // 将 Lodash 库的代码单独打包
          'lodash': ['lodash-es'],
          // 将组件库的代码打包
          'library': ['antd'],
        },
        // 2. 函数配置
          if (id.includes('antd') || id.includes('@arco-design/web-react')) {
            return 'library';
          }
          if (id.includes('lodash')) {
            return 'lodash';
          }
          if (id.includes('react')) {
            return 'react';
          }
      },
    }
  },
}
```

### 按需加载

```tsx
import React from "react";
import ReactDOM from "react-dom";
import loadable from "@loadable/component";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const Foo = loadable(() => import("./routes/Foo"));
const Bar = loadable(() => import("./routes/Bar"));

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/foo" element={<Foo />} />
        <Route path="/bar" element={<Bar />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);
```

还可以延迟执行，优化体验

```tsx
function App() {
  const computeFunc = async () => {
    // 延迟加载第三方库
    // 需要注意 Tree Shaking 问题
    // 如果直接引入包名，无法做到 Tree-Shaking，因此尽量导入具体的子路径
    const { default: merge } = await import("lodash-es/merge");
    const c = merge({ a: 1 }, { b: 2 });
    console.log(c);
  };
  return (
    <div className="App">
      <p>
        <button type="button" onClick={computeFunc}>
          Click me
        </button>
      </p>
    </div>
  );
}

export default App;
```

#### 预渲染优化

预渲染是当今比较主流的优化手段，主要包括服务端渲染(SSR)和静态站点生成(SSG)这两种技术。
