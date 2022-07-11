# CodeSplitting

在生产环境下，为了提高页面加载性能，构建工具一般将项目的代码打包(bundle)到一起，这样上线之后只需要请求少量的 JS 文件，大大减少 HTTP 请求。当然，Vite 也不例外，默认情况下 Vite 利用底层打包引擎 Rollup 来完成项目的模块打包

某种意义上来说，对线上环境进行项目打包是一个必须的操作。但随着前端工程的日渐复杂，单份的打包产物体积越来越庞大，会出现一系列应用加载性能问题，而代码分割可以很好地解决它们。

当然，在实际的项目场景中，只用 Vite 默认的策略是不够的，我们会更深入一步，学习 Rollup 底层拆包的各种高级姿势，实现自定义拆包，同时我也会带大家通过实际案例复现 Rollup 自定义拆包经常遇到的坑——循环引用问题，一起分析问题出现的原因，也分享一些自己的解决思路和方案，让大家对 Vite 及 Rollup 的代码分割有更加深入的掌握。

- bundle 指的是整体的打包产物，包含 JS 和各种静态资源。
- chunk 指的是打包后的 JS 文件，是 bundle 的子集。
- vendor 是指第三方包的打包产物，是一种特殊的 chunk。

## Code Splitting 解决的问题

在传统的单 chunk 打包模式下，当项目代码越来越庞大，最后会导致浏览器下载一个巨大的文件，从页面加载性能的角度来说，主要会导致两个问题:

1.  无法做到按需加载，即使是当前页面不需要的代码也会进行加载。
2.  线上缓存复用率极低，改动一行代码即可导致整个 bundle 产物缓存失效。

一般而言，一个前端页面中的 JS 代码可以分为两个部分: Initital Chunk 和 Async Chunk，前者指页面首屏所需要的 JS 代码，而后者当前页面并不一定需要，一个典型的例子就是 路由组件，与当前路由无关的组件并不用加载。而项目被打包成单 bundle 之后，无论是 Initial Chunk 还是 Async Chunk，都会打包进同一个产物，也就是说，浏览器加载产物代码的时候，会将两者一起加载，导致许多冗余的加载过程，从而影响页面性能。而通过 Code Splitting 我们可以将按需加载的代码拆分出单独的 chunk，这样应用在首屏加载时只需要加载 Initial Chunk 即可，避免了冗余的加载过程，使页面性能得到提升。

其次，线上的缓存命中率是一个重要的性能衡量标准。对于线上站点而言，服务端一般在响应资源时加上一些 HTTP 响应头，最常见的响应头之一就是 cache-control，它可以指定浏览器的强缓存，比如设置为下面这样:

```
cache-control: max-age=31536000
```

表示资源过期时间为一年，在过期之前，访问相同的资源 url，浏览器直接利用本地的缓存，并不用给服务端发请求，这就大大降低了页面加载的网络开销。不过，在单 chunk 打包模式下面，一旦有一行代码变动，整个 chunk 的 url 地址都会变化

由于构建工具一般会根据产物的内容生成哈希值，一旦内容变化就会导致整个 chunk 产物的强缓存失效，所以单 chunk 打包模式下的缓存命中率极低，基本为零。

而进行 Code Splitting 之后，代码的改动只会影响部分的 chunk 哈希改动

入口文件引用了 A、B、C、D 四个组件，当我们修改 A 的代码后，变动的 Chunk 就只有 A 以及依赖 A 的 Chunk 中，A 对应的 chunk 会变动，这很好理解，后者也会变动是因为相应的引入语句会变化，如这里的入口文件会发生如下内容变动:

```js
import CompA from "./A.d3e2f17a.js";
// 更新 import 语句
import CompA from "./A.a5d2f82b.js";
```

也就是说，在改动 A 的代码后，B、C、D 的 chunk 产物 url 并没有发生变化，从而可以让浏览器复用本地的强缓存，大大提升线上应用的加载性能。

### vite 的默认拆包策略

在生产环境下 Vite 完全利用 Rollup 进行构建，因此拆包也是基于 Rollup 来完成的，但 Rollup 本身是一个专注 JS 库打包的工具，对应用构建的能力还尚为欠缺，Vite 正好是补足了 Rollup 应用构建的能力，在拆包能力这一块的扩展就是很好的体现。

> codeSplitting 项目
> 进入项目后，打包尝试

```
  .
  ├── assets
  │   ├── Dynamic.3df51f7a.js    // Async Chunk
  │   ├── Dynamic.f2cbf023.css   // Async Chunk (CSS)
  │   ├── favicon.17e50649.svg   // 静态资源
  │   ├── index.1e236845.css     // Initial Chunk (CSS)
  │   ├── index.6773c114.js      // Initial Chunk
  │   └── vendor.ab4b9e1f.js     // 第三方包产物 Chunk
  └── index.html                 // 入口 HTML
```

方面 Vite 实现了自动 CSS 代码分割的能力，即实现一个 chunk 对应一个 css 文件，比如上面产物中 index.js 对应一份 index.css，而按需加载的 chunk Danamic.js 也对应单独的一份 Danamic.css 文件，与 JS 文件的代码分割同理，这样做也能提升 CSS 文件的缓存复用率。

而另一方面， Vite 基于 Rollup 的 manualChunksAPI 实现了应用拆包的策略:

- 对于 Initital Chunk 而言，业务代码和第三方包代码分别打包为单独的 chunk，在上述的例子中分别对应 index.js 和 vendor.js。需要说明的是，这是 Vite 2.9 版本之前的做法，而在 Vite 2.9 及以后的版本，默认打包策略更加简单粗暴，将所有的 js 代码全部打包到 index.js 中。

- 对于 Async Chunk 而言 ，动态 import 的代码会被拆分成单独的 chunk，如上述的 Dynacmic 组件。

Vite 默认拆包的优势在于实现了 CSS 代码分割与业务代码、第三方库代码、动态 import 模块代码三者的分离，但缺点也比较直观，第三方库的打包产物容易变得比较臃肿，上述例子中的 vendor.js 的大小已经达到 500 KB 以上，显然是有进一步拆包的优化空间的，这个时候我们就需要用到 Rollup 中的拆包 API ——manualChunks 了

### 自定义拆包策略

针对更细粒度的拆包，Vite 的底层打包引擎 Rollup 提供了 manualChunks，让我们能自定义拆包策略，它属于 Vite 配置的一部分，示例如下:

```ts
// vite.config.ts
export default {
  build: {
    rollupOptions: {
      output: {
        // manualChunks 配置
        manualChunks: {},
      },
    },
  },
};
```

manualChunks 主要有两种配置的形式，可以配置为一个对象或者一个函数。先来看看对象的配置，也是最简单的配置方式，可以在上述的示例项目中添加如下的 manualChunks 配置代码:

```ts
// manualChunks 配置
manualChunks: {
  // 将 React 相关库打包成单独的 chunk 中
  "react-vendor": ["react", "react-dom"],
  // 将 Lodash 库的代码单独打包
  lodash: ["lodash-es"],
  // 将组件库的代码打包
  library: ["antd", "@arco-design/web-react"],
},
```

在对象格式的配置中，key 代表 chunk 的名称，value 为一个字符串数组，每一项为第三方包的包名，这样通过 build 打包，就可以看到有 loadsh.xxxxxx.ks，react-vendor.xxxxxx.js，library.xxxxxx.js

当第三方包更新的时候，也只会更新其中一个 chunk 的 url，而不会全量更新，从而提高了第三方包产物的缓存命中率

除了对象的配置方式之外，我们还可以通过函数进行更加灵活的配置，而 Vite 中的默认拆包策略也是通过函数的方式来进行配置的，我们可以在 Vite 的实现中瞧一瞧:

```ts
// Vite 部分源码
export function splitVendorChunk(
  options: { cache?: SplitVendorChunkCache } = {}
): GetManualChunk {
  const cache = options.cache ?? new SplitVendorChunkCache();
  // 返回值为 manualChunks 的配置
  return (id, { getModuleInfo }) => {
    // Vite 默认的配置逻辑其实很简单
    // 主要是为了把 Initial Chunk 中的第三方包代码单独打包成`vendor.[hash].js`
    if (
      id.includes("node_modules") &&
      !isCSSRequest(id) &&
      // 判断是否为 Initial Chunk
      staticImportedByEntry(id, getModuleInfo, cache)
    ) {
      return "vendor";
    }
  };
}
```

Rollup 会对每一个模块调用 manualChunks 函数，在 manualChunks 的函数入参中你可以拿到模块 id 及模块详情信息，经过一定的处理后返回 chunk 文件的名称，这样当前 id 代表的模块便会打包到你所指定的 chunk 文件中。

```js
// 2. 函数配置
manualChunks(id) {
  if (id.includes('antd') || id.includes('@arco-design/web-react')) {
    return 'library';
  }
  if (id.includes('lodash')) {
    return 'lodash';
  }
  if (id.includes('react')) {
    return 'react';
  }
}
```

打包尝试一下

看上去好像各个第三方包的 chunk (如 lodash、react 等等)都能拆分出来，但实际上你可以运行 npx vite preview 预览产物，会发现产物根本没有办法运行起来，页面出现白屏，同时控制台出现报错

这也就是函数配置的坑点所在了，虽然灵活而方便，但稍不注意就陷入此类的产物错误问题当中。

### 解决循环引用问题

从报错信息追溯到产物中，可以发现 react-vendor.js 与 index.js 发生了循环引用:

```js
// react-vendor.e2c4883f.js
import { q as objectAssign } from "./index.37a7b2eb.js";

// index.37a7b2eb.js
import { R as React } from "./react-vendor.e2c4883f.js";
```

因为 a.js 与 b.js 内循环引用，代码执行原理：

- JS 引擎执行 a.js 时，发现引入了 b.js，于是去执行 b.js
- 引擎执行 b.js，发现里面引入了 a.js(出现循环引用)，认为 a.js 已经加载完成，继续往下执行
- 执行到 funcA()语句时发现 funcA 并没有定义，于是报错。

react-vendor 为什么需要引用 index.js 的代码呢？

其实也很好理解，之前在 manualChunks 中仅仅将路径包含 react 的模块打包到 react-vendor 中，不过，像 object-assign 这种 react 本身的依赖并没有打包进 react-vendor 中，而是打包到另外的 chunk 当中

index.js ->(引入 React) react-verdor.js ->(引入 object-assets 等依赖) index.js

之前的 manualChunks 逻辑过于简单粗暴，仅仅通过路径 id 来决定打包到哪个 chunk 中，而漏掉了间接依赖的情况。如果针对像 object-assign 这种间接依赖，我们也能识别出它属于 react 的依赖，将其自动打包到 react-vendor 中，这样就可以避免循环引用的问题。

解决思路:

- 确定 react 相关包的入口路径。
- 在 manualChunks 中拿到模块的详细信息，向上追溯它的引用者，如果命中 react 的路径，则将模块放到 react-vendor 中。

> [vite.config.ts](../codeSplitting/vite.config.ts)

对于这个函数的实现，有两个地方需要注意:

1.  可以通过 manualChunks 提供的入参 getModuleInfo 来获取模块的详情 moduleInfo，然后通过 moduleInfo.importers 拿到模块的引用者，针对每个引用者又可以递归地执行这一过程，从而获取引用链的信息。
2.  尽量使用缓存。由于第三方包模块数量一般比较多，对每个模块都向上查找一遍引用链会导致开销非常大，并且会产生很多重复的逻辑，使用缓存会极大加速这一过程。
