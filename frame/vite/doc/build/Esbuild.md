# Esbuild

> 文件夹 esbuild

1.  依赖预构建——作为 Bundle 工具

[对比](https://zhuanlan.zhihu.com/p/342336095)

当然，Esbuild 作为打包工具也有一些缺点。

- 不支持降级到 ES5 的代码。这意味着在低端浏览器代码会跑不起来。
- 不支持 const enum 等语法。这意味着单独使用这些语法在 esbuild 中会直接抛错。
- 不提供操作打包产物的接口，像 Rollup 中灵活处理打包产物的能力(如 renderChunk 钩子)在 Esbuild 当中完全没有。
- 不支持自定义 Code Splitting 策略。传统的 Webpack 和 Rollup 都提供了自定义拆包策略的 API，而 Esbuild 并未提供，从而降级了拆包优化的灵活性。

尽管 Esbuild 作为一个社区新兴的明星项目，有如此多的局限性，但依然不妨碍 Vite 在开发阶段使用它成功启动项目并获得极致的性能提升，生产环境处于稳定性考虑当然是采用功能更加丰富、生态更加成熟的 Rollup 作为依赖打包工具了。

2.  单文件编译——作为 TS 和 JSX 编译工具

在依赖预构建阶段， Esbuild 作为 Bundler 的角色存在。而在 TS(X)/JS(X) 单文件编译上面，Vite 也使用 Esbuild 进行语法转译，也就是将 Esbuild 作为 Transformer 来用。

Vite 已经将 Esbuild 的 Transformer 能力用到了生产环境。尽管如此，对于低端浏览器场景，Vite 仍然可以做到语法和 Polyfill 安全

虽然 Esbuild Transfomer 能带来巨大的性能提升，但其自身也有局限性，最大的局限性就在于 TS 中的类型检查问题。这是因为 Esbuild 并没有实现 TS 的类型系统，在编译 TS(或者 TSX) 文件时仅仅抹掉了类型相关的代码，暂时没有能力实现类型检查。

因此，打包时候，vite build 之前会先执行 tsc 命令，也就是借助 TS 官方的编译器进行类型检查

3.  代码压缩

Vite 从 2.6 版本开始，就官宣默认使用 Esbuild 来进行生产环境的代码压缩，包括 JS 代码和 CSS 代码。

传统的方式都是使用 Terser 这种 JS 开发的压缩器来实现，在 Webpack 或者 Rollup 中作为一个 Plugin 来完成代码打包后的压缩混淆的工作。但 Terser 其实很慢，主要有 2 个原因。

- 压缩这项工作涉及大量 AST 操作，并且在传统的构建流程中，AST 在各个工具之间无法共享，比如 Terser 就无法与 Babel 共享同一个 AST，造成了很多重复解析的过程。
- JS 本身属于解释性 + JIT（即时编译） 的语言，对于压缩这种 CPU 密集型的工作，其性能远远比不上 Golang 这种原生语言。

因此，Esbuild 这种从头到尾共享 AST 以及原生语言编写的 Minifier 在性能上能够甩开传统工具的好几十倍。

## 性能

Esbuild 是由 Figma 的 CTO 「Evan Wallace」基于 Golang 开发的一款打包工具，相比传统的打包工具，主打性能优势，在构建速度上可以比传统工具快 10~100 倍。那么，它是如何达到这样超高的构建性能的呢？主要原因可以概括为 4 点。

1.  使用 Golang 开发，构建逻辑代码直接被编译为原生机器码，而不用像 JS 一样先代码解析为字节码，然后转换为机器码，大大节省了程序运行时间。

2.  多核并行。内部打包算法充分利用多核 CPU 优势，所有的步骤尽可能并行，这也是得益于 Go 当中多线程共享内存的优势。

3.  从零造轮子。 几乎没有使用任何第三方库，所有逻辑自己编写，大到 AST 解析，小到字符串的操作，保证极致的代码性能。

4.  高效的内存利用。Esbuild 中从头到尾尽可能地复用一份 AST 节点数据，而不用像 JS 打包工具中频繁地解析和传递 AST 数据（如 string -> TS -> JS -> string)，造成内存的大量浪费。

## 功能使用

安装依赖

```bash
pnpm i esbuild react react-dom
```

### 1. 命令行调用

创建组件 index.jsx

```jsx
import Server from "react-dom/server";

let Greet = () => <h1>Hello</h1>;
console.log(Server.renderToString(<Greet />));
```

到 package.json 中添加 build 脚本

```json
 "scripts": {
    "build": "./node_modules/.bin/esbuild src/index.jsx --bundle --outfile=dist/out.js"
 },
```

说明我们已经成功通过命令行完成了 Esbuild 打包！但命令行的使用方式不够灵活，只能传入一些简单的命令行参数，稍微复杂的场景就不适用了，所以一般情况下我们还是会用代码调用的方式。

### 2. 代码调用

Build API 主要用来进行项目打包，包括 build、buildSync 和 serve 三个方法。

三种形式均在 basic/build.js 内，可分开对比

### 单文件处理能力

除了打包功能，esbuild 还提供了单文件编译能力，Transfrom API。与 Build API 类似，它也包含了同步和异步的两个方法，分别是 transformSync 和 transform

文件为 transform.js

| 同步方式 | api           |
| -------- | ------------- |
| 异步     | transform     |
| 同步     | transformSync |

**`PS`**:由于同步的 API 会使 Esbuild 丧失并发任务处理的优势（Build API 的部分已经分析过），我同样也不推荐大家使用 transformSync。出于性能考虑，Vite 的底层实现也是采用 transform 这个异步的 API 进行 TS 及 JSX 的单文件转译的

# 插件开发

> esbuild/plugin-dev 文件夹

插件开发其实就是基于原有的体系结构中进行扩展和自定义。 Esbuild 插件也不例外，通过 Esbuild 插件我们可以扩展 Esbuild 原有的路径解析、模块加载等方面的能力，并在 Esbuild 的构建过程中执行一系列自定义的逻辑

Esbuild 插件结构被设计为一个对象，里面有 name 和 setup 两个属性，name 是插件的名称，setup 是一个函数，其中入参是一个 build 对象，这个对象上挂载了一些钩子可供我们自定义一些钩子函数逻辑

简单示例：

```ts
let envPlugin = {
  name: "env",
  setup(build) {
    build.onResolve({ filter: /^env$/ }, (args) => ({
      path: args.path,
      namespace: "env-ns",
    }));

    build.onLoad({ filter: /.*/, namespace: "env-ns" }, () => ({
      contents: JSON.stringify(process.env),
      loader: "json",
    }));
  },
};

require("esbuild")
  .build({
    entryPoints: ["src/index.jsx"],
    bundle: true,
    outfile: "out.js",
    // 应用插件
    plugins: [envPlugin],
  })
  .catch(() => process.exit(1));
```

## 钩子函数

### onResolve 钩子 和 onLoad 钩子

在 Esbuild 插件中，onResolve 和 onload 是两个非常重要的钩子，分别控制路径解析和模块内容加载的过程，并且都需要传入两个参数: Options 和 Callback

```ts
build.onResolve({ filter: /^env$/ }, (args) => ({
  path: args.path,
  namespace: "env-ns",
}));
build.onLoad({ filter: /.*/, namespace: "env-ns" }, () => ({
  contents: JSON.stringify(process.env),
  loader: "json",
}));
```

Options:它是一个对象，对于 onResolve 和 onLoad 都一样，包含 filter 和 namespace 两个属性

```ts
interface Options {
  filter: RegExp;
  namespace?: string;
}
```

filter 为必传参数，是一个正则表达式，它决定了要过滤出的特征文件

> 插件中的 filter 正则是使用 Go 原生正则实现的，为了不使性能过于劣化，规则应该尽可能严格。同时它本身和 JS 的正则也有所区别，不支持前瞻(?<=)、后顾(?=)和反向引用(\1)这三种规则

namespace 为选填参数，一般在 onResolve 钩子中的回调参数返回 namespace 属性作为标识，我们可以在 onLoad 钩子中通过 namespace 将模块过滤出来。如上述插件示例就在 onLoad 钩子通过 env-ns 这个 namespace 标识过滤出了要处理的 env 模块

onResolve 函数参数与返回值：

```ts
build.onResolve({ filter: /^env$/ }, (args: onResolveArgs): onResolveResult => {
  // 模块路径
  console.log(args.path)
  // 父模块路径
  console.log(args.importer)
  // namespace 标识
  console.log(args.namespace)
  // 基准路径
  console.log(args.resolveDir)
  // 导入方式，如 import、require
  console.log(args.kind)
  // 额外绑定的插件数据
  console.log(args.pluginData)

  return {
      // 错误信息
      errors: [],
      // 是否需要 external
      external: false;
      // namespace 标识
      namespace: 'env-ns';
      // 模块路径
      path: args.path,
      // 额外绑定的插件数据
      pluginData: null,
      // 插件名称
      pluginName: 'xxx',
      // 设置为 false，如果模块没有被用到，模块代码将会在产物中会删除。否则不会这么做
      sideEffects: false,
      // 添加一些路径后缀，如`?xxx`
      suffix: '?xxx',
      // 警告信息
      warnings: [],
      // 仅仅在 Esbuild 开启 watch 模式下生效
      // 告诉 Esbuild 需要额外监听哪些文件/目录的变化
      watchDirs: [],
      watchFiles: []
  }
}
```

onLoad 钩子中函数参数和返回值

```ts
build.onLoad(
  { filter: /.*/, namespace: "env-ns" },
  (args: OnLoadArgs): OnLoadResult => {
    // 模块路径
    console.log(args.path);
    // namespace 标识
    console.log(args.namespace);
    // 后缀信息
    console.log(args.suffix);
    // 额外的插件数据
    console.log(args.pluginData);

    return {
      // 模块具体内容
      contents: "省略内容",
      // 错误信息
      errors: [],
      // 指定 loader，如`js`、`ts`、`jsx`、`tsx`、`json`等等
      loader: "json",
      // 额外的插件数据
      pluginData: null,
      // 插件名称
      pluginName: "xxx",
      // 基准路径
      resolveDir: "./dir",
      // 警告信息
      warnings: [],
      // 仅仅在 Esbuild 开启 watch 模式下生效
      // 告诉 Esbuild 需要额外监听哪些文件/目录的变化
      watchDirs: [],
      watchFiles: [],
    };
  }
);
```

### 其他钩子函数

onStart 和 onEnd 两个钩子用来在构建开启和结束时执行一些自定义的逻辑，使用上比较简单

```ts
let examplePlugin = {
  name: "example",
  setup(build) {
    build.onStart(() => {
      console.log("build started");
    });
    build.onEnd((buildResult) => {
      if (buildResult.errors.length) {
        return;
      }
      // 构建元信息
      // 获取元信息后做一些自定义的事情，比如生成 HTML
      console.log(buildResult.metafile);
    });
  },
};
```

在使用这些钩子的时候，有 2 点需要注意。

onStart 的执行时机是在每次 build 的时候，包括触发 watch 或者 serve 模式下的重新构建。
onEnd 钩子中如果要拿到 metafile，必须将 Esbuild 的构建配置中 metafile 属性设为 true。

## 简单实现两个 Demo

### 从 cdn 拉取依赖插件

Esbuild 原生不支持通过 HTTP 从 CDN 服务上拉取对应的第三方依赖资源

```tsx
// src/index.jsx
// react-dom 的内容全部从 CDN 拉取
// 这段代码目前是无法运行的
import { render } from "https://cdn.skypack.dev/react-dom";

let Greet = () => <h1>Hello</h1>;

render(<Greet />, document.getElementById("root"));
```

现在我们需要通过 Esbuild 插件来识别这样的 url 路径，然后从网络获取模块内容并让 Esbuild 进行加载，甚至不再需要 npm install 安装依赖了

> ESM CDN 作为面向未来的前端基础设施，对 Vite 的影响也至关重大，可以极大提升 Vite 在生产环境下的构建性能

可查看 http-import-plugin.js

然后新建 build.js

但是打包的时候可以尝试一下，失败了，会抛出一个错误

为什么，可以查看第三方包相应内容

```ts
/*
 * Skypack CDN - react-dom@17.0.1
 *
 * Learn more:
 *   📙 Package Documentation: https://www.skypack.dev/view/react-dom
 *   📘 Skypack Documentation: https://www.skypack.dev/docs
 *
 * Pinned URL: (Optimized for Production)
 *   ▶️ Normal: https://cdn.skypack.dev/pin/react-dom@v17.0.1-oZ1BXZ5opQ1DbTh7nu9r/mode=imports/optimized/react-dom.js
 *   ⏩ Minified: https://cdn.skypack.dev/pin/react-dom@v17.0.1-oZ1BXZ5opQ1DbTh7nu9r/mode=imports,min/optimized/react-dom.js
 *
 */

// Browser-Optimized Imports (Don't directly import the URLs below in your application!)
export * from "/-/react-dom@v17.0.1-oZ1BXZ5opQ1DbTh7nu9r/dist=es2019,mode=imports/optimized/react-dom.js";
export { default } from "/-/react-dom@v17.0.1-oZ1BXZ5opQ1DbTh7nu9r/dist=es2019,mode=imports/optimized/react-dom.js";
```

再进去查看，还有更多的模块内容

```
https://cdn.skypack.dev/-/react-dom@v17.0.1-oZ1BXZ5opQ1DbTh7nu9r/dist=es2019,mode=imports/optimized/react-dom.js
```

因此我们可以得出一个结论：除了要解析 react-dom 这种直接依赖的路径，还要解析它依赖的路径，也就是间接依赖的路径

所以，可以加入 onResolve 钩子逻辑：

```ts
// 拦截间接依赖的路径，并重写路径
// tip: 间接依赖同样会被自动带上 `http-url`的 namespace
build.onResolve({ filter: /.*/, namespace: "http-url" }, (args) => ({
  // 重写路径
  path: new URL(args.path, args.importer).toString(),
  namespace: "http-url",
}));
```

再 build 一下，可以下载并打包

### HTML 构建插件

Esbuild 作为一个前端打包工具，本身并不具备 HTML 的构建能力。也就是说，当它把 js/css 产物打包出来的时候，并不意味着前端的项目可以直接运行了，我们还需要一份对应的入口 HTML 文件。而这份 HTML 文件当然可以手写一个，但手写显得比较麻烦，尤其是产物名称带哈希值的时候，每次打包完都要替换路径，所以，可以使用 esbuild 插件自动生成

在 Esbuild 插件的 onEnd 钩子中可以拿到 metafile 对象的信息

```json
{
  "inputs": {
    /* 省略内容 */
  },
  "output": {
    "dist/index.js": {
      "imports": [],
      "exports": [],
      "entryPoint": "src/index.jsx",
      "inputs": {
        "http-url:https://cdn.skypack.dev/-/object-assign@v4.1.1-LbCnB3r2y2yFmhmiCfPn/dist=es2019,mode=imports/optimized/object-assign.js": {
          "bytesInOutput": 1792
        },
        "http-url:https://cdn.skypack.dev/-/react@v17.0.1-yH0aYV1FOvoIPeKBbHxg/dist=es2019,mode=imports/optimized/react.js": {
          "bytesInOutput": 10396
        },
        "http-url:https://cdn.skypack.dev/-/scheduler@v0.20.2-PAU9F1YosUNPKr7V4s0j/dist=es2019,mode=imports/optimized/scheduler.js": {
          "bytesInOutput": 9084
        },
        "http-url:https://cdn.skypack.dev/-/react-dom@v17.0.1-oZ1BXZ5opQ1DbTh7nu9r/dist=es2019,mode=imports/optimized/react-dom.js": {
          "bytesInOutput": 183229
        },
        "http-url:https://cdn.skypack.dev/react-dom": { "bytesInOutput": 0 },
        "src/index.jsx": { "bytesInOutput": 178 }
      },
      "bytes": 205284
    },
    "dist/index.js.map": {
      /* 省略内容 */
    }
  }
}
```

具体可参考 html-plugin

然后，在 build 中引入插件

```ts
const html = require("./html-plugin");

// esbuild 配置
plugins: [
  html()
],
```
