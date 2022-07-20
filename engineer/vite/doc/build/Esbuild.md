# Esbuild

> 文件夹 esbuild

1.  依赖预构建——作为 Bundle 工具

[对比](https://zhuanlan.zhihu.com/p/342336095)

当然，Esbuild 作为打包工具也有一些缺点。

- 不支持降级到 ES5 的代码。这意味着在低端浏览器代码会跑不起来。
- 不支持 const enum 等语法。这意味着单独使用这些语法在 esbuild 中会直接抛错。
- 不提供操作打包产物的接口，像 Rollup 中灵活处理打包产物的能力(如 renderChunk 钩子)在 Esbuild 当中完全没有。
- 不支持自定义 Code Splitting 策略。传统的 Webpack 和 Rollup 都提供了自定义拆包策略的 API，而 Esbuild 并未提供，从而降级了拆包优化的灵活性。

尽管 Esbuild 作为一个社区新兴的明星项目，有如此多的局限性，但依然不妨碍 Vite 在开发阶段使用它成功启动项目并获得极致的性能提升，生产环境处于稳定性考虑当然是采用功能更加丰富、生态更加成熟的 Rollup 作为依赖打包工具了。不过，现在 vite 也在进行大一统，期待

> 目前 3.0 已经使用了 esbuild 进行生产环境打包，但是默认是不开启的，Vite 团队不打算将此作为 v3 的正式更新内容，而是一个实验性质的功能，不会默认开启。

> 如果想用，加一个配置即可：optimizeDeps.disabled: false

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

# 预构建

[源码地址](https://github.com/vitejs/vite/blob/main/packages/vite/src/node/optimizer/index.ts)

## 缓存判断

首先是预构建缓存的判断。Vite 在每次预构建之后都将一些关键信息写入到了\_metadata.json 文件中，第二次启动项目时会通过这个文件中的 hash 值来进行缓存的判断，如果命中缓存则不会进行后续的预构建流程

```ts
export function initDepsOptimizerMetadata(
  config: ResolvedConfig,
  ssr: boolean,
  timestamp?: string
): DepOptimizationMetadata {
  // 根据当前的配置计算出哈希值
  const hash = getDepHash(config, ssr);
  return {
    hash,
    browserHash: getOptimizedBrowserHash(hash, {}, timestamp),
    optimized: {},
    chunks: {},
    discovered: {},
    depInfoList: [],
  };
}
/**
 * Creates the initial dep optimization metadata, loading it from the deps cache
 * if it exists and pre-bundling isn't forced
 */
export function loadCachedDepOptimizationMetadata(
  config: ResolvedConfig,
  ssr: boolean,
  force = config.optimizeDeps.force,
  asCommand = false
): DepOptimizationMetadata | undefined {
  const log = asCommand ? config.logger.info : debug;
  // Before Vite 2.9, dependencies were cached in the root of the cacheDir
  // For compat, we remove the cache if we find the old structure
  // _metadata.json 文件所在的路径
  if (fs.existsSync(path.join(config.cacheDir, "_metadata.json"))) {
    emptyDir(config.cacheDir);
  }
  const depsCacheDir = getDepsCacheDir(config, ssr);
  // 默认走到里面的逻辑
  if (!force) {
    let cachedMetadata: DepOptimizationMetadata | undefined;
    try {
      const cachedMetadataPath = path.join(depsCacheDir, "_metadata.json");
      cachedMetadata = parseDepsOptimizerMetadata(
        fs.readFileSync(cachedMetadataPath, "utf-8"),
        depsCacheDir
      );
    } catch (e) {}
    // 当前计算出的哈希值与 _metadata.json 中记录的哈希值一致，表示命中缓存，不用预构建
    // hash is consistent, no need to re-bundle
    if (cachedMetadata && cachedMetadata.hash === getDepHash(config, ssr)) {
      log("Hash is consistent. Skipping. Use --force to override.");
      // Nothing to commit or cancel as we are using the cache, we only
      // need to resolve the processing promise so requests can move on
      return cachedMetadata;
    }
  } else {
    config.logger.info("Forced re-optimization of dependencies");
  }
}
// Start with a fresh cache
fs.rmSync(depsCacheDir, { recursive: true, force: true });
```

得注意的是哈希计算的策略，即决定哪些配置和文件有可能影响预构建的结果，然后根据这些信息来生成哈希值。这部分逻辑集中在 getHash 函数中

```ts
const lockfileFormats = ["package-lock.json", "yarn.lock", "pnpm-lock.yaml"];
function getDepHash(root: string, config: ResolvedConfig): string {
  // 获取 lock 文件内容
  let content = lookupFile(root, lockfileFormats) || "";
  // 除了 lock 文件外，还需要考虑下面的一些配置信息
  content += JSON.stringify(
    {
      // 开发/生产环境
      mode: config.mode,
      // 项目根路径
      root: config.root,
      // 路径解析配置
      resolve: config.resolve,
      // 自定义资源类型
      assetsInclude: config.assetsInclude,
      // 插件
      plugins: config.plugins.map((p) => p.name),
      // 预构建配置
      optimizeDeps: {
        include: config.optimizeDeps?.include,
        exclude: config.optimizeDeps?.exclude,
      },
    },
    // 特殊处理函数和正则类型
    (_, value) => {
      if (typeof value === "function" || value instanceof RegExp) {
        return value.toString();
      }
      return value;
    }
  );
  // 最后调用 crypto 库中的 createHash 方法生成哈希
  return createHash("sha256").update(content).digest("hex").substring(0, 8);
}

const lockfileFormats = ["package-lock.json", "yarn.lock", "pnpm-lock.yaml"];

export function getDepHash(config: ResolvedConfig, ssr: boolean): string {
  let content = lookupFile(config.root, lockfileFormats) || "";
  // also take config into account
  // only a subset of config options that can affect dep optimization
  const optimizeDeps = getDepOptimizationConfig(config, ssr);
  content += JSON.stringify(
    {
      // 开发/生产环境
      mode: process.env.NODE_ENV || config.mode,
      // 项目根路径
      root: config.root,
      // 路径解析配置
      resolve: config.resolve,
      // 浏览器兼容性,默认modules
      buildTarget: config.build.target,
      // 自定义资源类型
      assetsInclude: config.assetsInclude,
      // 插件
      plugins: config.plugins.map((p) => p.name),
      // 预构建配置
      optimizeDeps: {
        include: optimizeDeps?.include,
        exclude: optimizeDeps?.exclude,
        esbuildOptions: {
          ...optimizeDeps?.esbuildOptions,
          plugins: optimizeDeps?.esbuildOptions?.plugins?.map((p) => p.name),
        },
      },
    },
    // 特殊处理函数和正则类型
    (_, value) => {
      if (typeof value === "function" || value instanceof RegExp) {
        return value.toString();
      }
      return value;
    }
  );
  // 最后调用 crypto 库中的 createHash 方法生成哈希
  return getHash(content);
}
```

## 依赖扫描

如果没有命中缓存，则会正式地进入依赖预构建阶段。不过 Vite 不会直接进行依赖的预构建，而是在之前探测一下项目中存在哪些依赖，收集依赖列表，也就是进行依赖扫描的过程。这个过程是必须的，因为 Esbuild 需要知道我们到底要打包哪些第三方依赖

```ts
const { deps, missing } = await scanImports(config);
```

在 scanImports 方法内部主要会调用 Esbuild 提供的 build 方法:

```ts
export async function scanImports(config: ResolvedConfig): Promise<{
  deps: Record<string, string>;
  missing: Record<string, string>;
}> {
  // ...
  const plugin = esbuildScanPlugin(config, container, deps, missing, entries);

  const { plugins = [], ...esbuildOptions } =
    config.optimizeDeps?.esbuildOptions ?? {};

  await Promise.all(
    entries.map((entry) =>
      build({
        absWorkingDir: process.cwd(),
        write: false, // 关键点
        entryPoints: [entry],
        bundle: true,
        format: "esm",
        logLevel: "error",
        plugins: [...plugins, plugin],
        ...esbuildOptions,
      })
    )
  );
  // ...
}
```

其中传入的 write 参数被设为 false，表示产物不用写入磁盘，这就大大节省了磁盘 I/O 的时间了，也是依赖扫描为什么往往比依赖打包快很多的原因之一。

esbuildScanPlugin 这个函数很重要，创建 scan 插件的时候就接收到了 deps 对象作为入参，在 scan 插件里面就是解析各种 import 语句，最终通过它来记录依赖信息。

## 依赖打包

收集完依赖之后，就正式地进入到依赖打包的阶段了。这里也调用 Esbuild 进行打包并写入产物到磁盘中

```ts
export async function runOptimizeDeps(
  resolvedConfig: ResolvedConfig,
  depsInfo: Record<string, OptimizedDepInfo>,
  ssr: boolean = resolvedConfig.command === "build" &&
    !!resolvedConfig.build.ssr
): Promise<DepOptimizationResult> {
  // ...

  const plugins = [...pluginsFromConfig];
  if (external.length) {
    plugins.push(esbuildCjsExternalPlugin(external));
  }
  plugins.push(
    // 预构建专用的插件
    esbuildDepPlugin(flatIdDeps, flatIdToExports, external, config, ssr)
  );
  const start = performance.now();
  const result = await build({
    absWorkingDir: process.cwd(),
    // 所有依赖的 id 数组，在插件中会转换为真实的路径
    entryPoints: Object.keys(flatIdDeps),
    bundle: true,
    // We can't use platform 'neutral', as esbuild has custom handling
    // when the platform is 'node' or 'browser' that can't be emulated
    // by using mainFields and conditions
    platform,
    define,
    format: "esm",
    // See https://github.com/evanw/esbuild/issues/1921#issuecomment-1152991694
    banner:
      platform === "node"
        ? {
            js: `import { createRequire } from 'module';const require = createRequire(import.meta.url);`,
          }
        : undefined,
    target: isBuild ? config.build.target || undefined : ESBUILD_MODULES_TARGET,
    external,
    logLevel: "error",
    splitting: true,
    sourcemap: true,
    outdir: processingCacheDir,
    ignoreAnnotations: !isBuild,
    metafile: true,
    plugins,
    ...esbuildOptions,
    supported: {
      "dynamic-import": true,
      "import-meta": true,
      ...esbuildOptions.supported,
    },
  });

  // ...
}
```

## 元信息写入磁盘

在打包过程完成之后，Vite 会拿到 Esbuild 构建的元信息，也就是上面代码中的 meta 对象，然后将元信息保存到\_metadata.json 文件中:

```ts
const dataPath = path.join(processingCacheDir, "_metadata.json");
writeFile(dataPath, stringifyDepsOptimizerMetadata(metadata, depsCacheDir));

// ...

/**
 * Stringify metadata for deps cache. Remove processing promises
 * and individual dep info browserHash. Once the cache is reload
 * the next time the server start we need to use the global
 * browserHash to allow long term caching
 */
// 序列化元数据，进行缓存哈希删除，设置browserHash为长期缓存
function stringifyDepsOptimizerMetadata(
  metadata: DepOptimizationMetadata,
  depsCacheDir: string
) {
  const { hash, browserHash, optimized, chunks } = metadata;
  return JSON.stringify({
    hash,
    browserHash,
    optimized: Object.fromEntries(
      Object.values(optimized).map(
        ({ id, src, file, fileHash, needsInterop }) => [
          id,
          {
            src,
            file,
            fileHash,
            // 判断是否需要转换成 ESM 格式
            needsInterop,
          },
        ]
      )
    ),
  });
}
```

## 依赖扫描详细分析

### 如何获取入口

主要是在 scanImports 函数内

[文件地址](https://github.com/vitejs/vite/blob/main/packages/vite/src/node/optimizer/scan.ts)

入口文件可能存在于多个配置当中，比如 optimizeDeps.entries 和 build.rollupOptions.input，同时需要考虑数组和对象的情况；也可能用户没有配置，需要自动探测入口文件

```ts
export async function scanImports(config: ResolvedConfig): Promise<{
  deps: Record<string, string>;
  missing: Record<string, string>;
}> {
  // Only used to scan non-ssr code

  const start = performance.now();

  let entries: string[] = [];

  const explicitEntryPatterns = config.optimizeDeps.entries;
  const buildInput = config.build.rollupOptions?.input;

  if (explicitEntryPatterns) {
    // 先从 optimizeDeps.entries 寻找入口，支持 glob 语法
    entries = await globEntries(explicitEntryPatterns, config);
  } else if (buildInput) {
    // 其次从 build.rollupOptions.input 配置中寻找，注意需要考虑数组和对象的情况
    const resolvePath = (p: string) => path.resolve(config.root, p);
    if (typeof buildInput === "string") {
      entries = [resolvePath(buildInput)];
    } else if (Array.isArray(buildInput)) {
      entries = buildInput.map(resolvePath);
    } else if (isObject(buildInput)) {
      entries = Object.values(buildInput).map(resolvePath);
    } else {
      throw new Error("invalid rollupOptions.input value.");
    }
  } else {
    // 如果用户没有进行上述配置，则自动从根目录开始寻找
    entries = await globEntries("**/*.html", config);
  }
  // ...
}
```

其中 globEntries 方法即通过 fast-glob 库来从项目根目录扫描文件。

接下来我们还需要考虑入口文件的类型，一般情况下入口需要是 js/ts 文件，但实际上像 html、vue 单文件组件这种类型我们也是需要支持的，因为在这些文件中仍然可以包含 script 标签的内容，从而让我们搜集到依赖信息。

在源码当中，同时对 html、vue、svelte、astro(一种新兴的类 html 语法)四种后缀的入口文件进行了解析，需要看插件实现

```ts
const htmlTypesRE = /\.(html|vue|svelte|astro)$/;
function esbuildScanPlugin(
  config: ResolvedConfig,
  container: PluginContainer,
  depImports: Record<string, string>,
  missing: Record<string, string>,
  entries: string[]
): Plugin {
  return {
    name: "vite:dep-scan",
    setup(build) {
      // 标记「类 HTML」文件的 namespace
      uild.onResolve({ filter: htmlTypesRE }, async ({ path, importer }) => {
        const resolved = await resolve(path, importer);
        if (!resolved) return;
        // It is possible for the scanner to scan html types in node_modules.
        // If we can optimize this html type, skip it so it's handled by the
        // bare import resolve, and recorded as optimization dep.
        if (
          resolved.includes("node_modules") &&
          isOptimizable(resolved, config.optimizeDeps)
        )
          return;
        return {
          path: resolved,
          namespace: "html",
        };
      });
      // ...

      build.onLoad(
        { filter: htmlTypesRE, namespace: "html" },
        async ({ path }) => {
          // 解析「类 HTML」文件
        }
      );
    },
  };
}
```

在插件中会扫描出所有带有 type=module 的 script 标签，对于含有 src 的 script 改写为一个 import 语句，对于含有具体内容的 script，则抽离出其中的脚本内容，最后将所有的 script 内容拼接成一段 js 代码。

```ts
const scriptModuleRE =
  /(<script\b[^>]*type\s*=\s*(?:"module"|'module')[^>]*>)(.*?)<\/script>/gims;
export const scriptRE = /(<script\b(?:\s[^>]*>|>))(.*?)<\/script>/gims;
export const commentRE = /<!--.*?-->/gs;
const srcRE = /\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s'">]+))/im;
const typeRE = /\btype\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s'">]+))/im;
const langRE = /\blang\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s'">]+))/im;
const contextRE = /\bcontext\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s'">]+))/im;

// scan 插件 setup 方法内部实现
build.onLoad({ filter: htmlTypesRE, namespace: "html" }, async ({ path }) => {
  let raw = fs.readFileSync(path, "utf-8");
  // Avoid matching the content of the comment
  // 去掉注释内容，防止干扰解析过程
  raw = raw.replace(commentRE, "<!---->");
  const isHtml = path.endsWith(".html");
  // HTML 情况下会寻找 type 为 module 的 script
  // 正则：/(<script\b[^>]*type\s*=\s*(?: module |'module')[^>]*>)(.*?)</script>/gims
  const regex = isHtml ? scriptModuleRE : scriptRE;
  regex.lastIndex = 0;
  let js = "";
  let scriptId = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(raw))) {
    // 第一次: openTag 为 <script type= module  src= /src/main.ts >, 无 content
    // 第二次: openTag 为 <script type= module >，有 content
    const [, openTag, content] = match;
    const typeMatch = openTag.match(typeRE);
    const type = typeMatch && (typeMatch[1] || typeMatch[2] || typeMatch[3]);
    const langMatch = openTag.match(langRE);
    const lang = langMatch && (langMatch[1] || langMatch[2] || langMatch[3]);
    // skip type="application/ld+json" and other non-JS types
    if (
      type &&
      !(
        type.includes("javascript") ||
        type.includes("ecmascript") ||
        type === "module"
      )
    ) {
      continue;
    }
    let loader: Loader = "js";
    // 指定 esbuild 的 loader
    if (lang === "ts" || lang === "tsx" || lang === "jsx") {
      loader = lang;
    } else if (path.endsWith(".astro")) {
      loader = "ts";
    }
    const srcMatch = openTag.match(srcRE);
    // 根据有无 src 属性来进行不同的处理
    if (srcMatch) {
      const src = srcMatch[1] || srcMatch[2] || srcMatch[3];
      js += `import ${JSON.stringify(src)}\n`;
    } else if (content.trim()) {
      // 使用虚拟模块

      // The reason why virtual modules are needed:
      // 1. There can be module scripts (`<script context="module">` in Svelte and `<script>` in Vue)
      // or local scripts (`<script>` in Svelte and `<script setup>` in Vue)
      // 2. There can be multiple module scripts in html
      // We need to handle these separately in case variable names are reused between them

      // append imports in TS to prevent esbuild from removing them
      // since they may be used in the template

      // 模板内可以使用，所以在ts内防止esbuild给删除
      const contents =
        content + (loader.startsWith("ts") ? extractImportPaths(content) : "");

      const key = `${path}?id=${scriptId++}`;
      // 对应第二点，有多个模块脚本的时候，防止变量名重复
      if (contents.includes("import.meta.glob")) {
        let transpiledContents;
        // transpile because `transformGlobImport` only expects js
        if (loader !== "js") {
          transpiledContents = (await transform(contents, { loader })).code;
        } else {
          transpiledContents = contents;
        }

        scripts[key] = {
          loader: "js", // since it is transpiled
          contents:
            (
              await transformGlobImport(
                transpiledContents,
                path,
                config.root,
                resolve
              )
            )?.s.toString() || transpiledContents,
          pluginData: {
            htmlType: { loader },
          },
        };
      } else {
        scripts[key] = {
          loader,
          contents,
          pluginData: {
            htmlType: { loader },
          },
        };
      }
      // 虚拟模块地址
      const virtualModulePath = JSON.stringify(virtualModulePrefix + key);

      const contextMatch = openTag.match(contextRE);
      const context =
        contextMatch && (contextMatch[1] || contextMatch[2] || contextMatch[3]);

      // Especially for Svelte files, exports in <script context="module"> means module exports,
      // exports in <script> means component props. To avoid having two same export name from the
      // star exports, we need to ignore exports in <script>

      // 对应上述说明低一点：Svelte中module与vue中的script
      if (path.endsWith(".svelte") && context !== "module") {
        js += `import ${virtualModulePath}\n`;
      } else {
        js += `export * from ${virtualModulePath}\n`;
      }
    }
  }

  // This will trigger incorrectly if `export default` is contained
  // anywhere in a string. Svelte and Astro files can't have
  // `export default` as code so we know if it's encountered it's a
  // false positive (e.g. contained in a string)

  // Svelte和Astro文件不能默认导出
  if (!path.endsWith(".vue") || !js.includes("export default")) {
    js += "\nexport default {}";
  }

  return {
    loader: "js",
    contents: js,
  };
});
```

### 如何记录依赖

Vite 中会把 bare import 的路径当做依赖路径，关于 bare import，你可以理解为直接引入一个包名，比如下面这样:

```ts
import Vue from "vue";
```

而以.开头的相对路径或者以/开头的绝对路径都不能算 bare import:

```ts
import Vue from "../node_modules/vue/index.js";
```

```ts
build.onResolve(
  {
    // avoid matching windows volume
    filter: /^[\w@][^:]/,
  },
  async ({ path: id, importer }) => {
    // 如果在 optimizeDeps.exclude 列表或者已经记录过了，则将其 externalize (排除)，直接 return
    if (moduleListContains(exclude, id)) {
      return externalUnlessEntry({ path: id });
    }
    if (depImports[id]) {
      return externalUnlessEntry({ path: id });
    }
    // 接下来解析路径，内部调用各个插件的 resolveId 方法进行解析
    const resolved = await resolve(id, importer);
    if (resolved) {
      if (shouldExternalizeDep(resolved, id)) {
        return externalUnlessEntry({ path: id });
      }
      if (resolved.includes("node_modules") || include?.includes(id)) {
        // dependency or forced included, externalize and stop crawling

        // 如果 resolved 为 js 或 ts 文件
        if (isOptimizable(resolved, config.optimizeDeps)) {
          // 正式地记录在依赖表中
          depImports[id] = resolved;
        }
        // 进行 externalize，因为这里只用扫描出依赖即可，不需要进行打包
        return externalUnlessEntry({ path: id });
      } else if (isScannable(resolved)) {
        // resolved 为 类html 文件，则标记上 'html' 的 namespace
        const namespace = htmlTypesRE.test(resolved) ? "html" : undefined;
        // linked package, keep crawling
        return {
          path: path.resolve(resolved),
          namespace,
        };
      } else {
        return externalUnlessEntry({ path: id });
      }
    } else {
      // 没有解析到路径，记录到 missing 表中，后续会检测这张表，显示相关路径未找到的报错
      missing[id] = normalizePath(importer);
    }
  }
);
```

顺便说一句，其中调用到了 resolve，也就是路径解析的逻辑，这里面实际上会调用各个插件的 resolveId 方法来进行路径的解析，代码如下所示:

```ts
const resolve = async (
  id: string,
  importer?: string,
  options?: ResolveIdOptions
) => {
  // 通过 seen 对象进行路径缓存

  const key = id + (importer && path.dirname(importer));
  if (seen.has(key)) {
    return seen.get(key);
  }
  // 调用插件容器的 resolveId 方法解析路径即可
  const resolved = await container.resolveId(
    id,
    importer && normalizePath(importer),
    {
      ...options,
      scan: true,
    }
  );
  const res = resolved?.id;
  seen.set(key, res);
  return res;
};
```

### external 的规则如何制定？

external 的路径分为两类: 资源型和模块型。

```ts
// data url，直接标记 external: true，不让 esbuild 继续处理
build.onResolve({ filter: dataUrlRE }, ({ path }) => ({
  path,
  external: true,
}));
// 加了 ?worker 或者 ?raw 这种 query 的资源路径，直接 external
// known vite query types: ?worker, ?raw
build.onResolve({ filter: SPECIAL_QUERY_RE }, ({ path }) => ({
  path,
  external: true,
}));
// css & json
build.onResolve(
  {
    filter: /\.(css|less|sass|scss|styl|stylus|pcss|postcss|json)$/,
  },
  // 非 entry 则直接标记 external
  externalUnlessEntry
);
// // known asset types
// Vite 内置的一些资源类型，比如 .png、.wasm 等等
build.onResolve(
  {
    filter: new RegExp(`\.(${KNOWN_ASSET_TYPES.join("|")})$`),
  },
  // 非 entry 则直接标记 external
  externalUnlessEntry
);
```

其中 externalUnlessEntry 的实现也很简单:

```ts
const externalUnlessEntry = ({ path }: { path: string }) => ({
  path,
  // 非 entry 则标记 external
  external: !entries.includes(path),
});
```

其次，对于模块型的路径，也就是当我们通过 resolve 函数解析出了一个 JS 模块的路径，如何判断是否应该被 externalize 呢？这部分实现主要在 shouldExternalizeDep 函数中，之前在分析 bare import 埋了个伏笔，现在让我们看看具体的实现规则:

```ts
function shouldExternalizeDep(resolvedId: string, rawId: string): boolean {
  // not a valid file path
  // 解析之后不是一个绝对路径，不在 esbuild 中进行加载
  if (!path.isAbsolute(resolvedId)) {
    return true;
  }
  // virtual id
  // 1. import 路径本身就是一个绝对路径
  // 2. 虚拟模块(Rollup 插件中约定虚拟模块以`\0`开头)
  // 都不在 esbuild 中进行加载
  if (resolvedId === rawId || resolvedId.includes("\0")) {
    return true;
  }
  return false;
}
function isScannable(id: string): boolean {
  // 不是 JS 或者 类HTML 文件，不在 esbuild 中进行加载
  return JS_TYPES_RE.test(id) || htmlTypesRE.test(id);
}
```

## 依赖打包详细分析

### 如何达到扁平化的产物文件结构

般情况下，esbuild 会输出嵌套的产物目录结构，比如对 vue 来说，其产物在 dist/vue.runtime.esm-bundler.js 中，那么经过 esbuild 正常打包之后，预构建的产物目录如下:

```
node_modules/.vite
├── _metadata.json
├── vue
│   └── dist
│       └── vue.runtime.esm-bundler.js
```

由于各个第三方包的产物目录结构不一致，这种深层次的嵌套目录对于 Vite 路径解析来说，其实是增加了不少的麻烦的，带来了一些不可控的因素。为了解决嵌套目录带来的问题，Vite 做了两件事情来达到扁平化的预构建产物输出:

1.  嵌套路径扁平化，/被换成下划线，如 react/jsx-dev-runtime，被重写为 react_jsx-dev-runtime；
2.  用虚拟模块来代替真实模块，作为预打包的入口，具体的实现后面会详细介绍。

回到 optimizeDeps 函数中，其中在进行完依赖扫描的步骤后，就会执行路径的扁平化操作

```ts
const flatIdDeps: Record<string, string> = {};
const idToExports: Record<string, ExportsData> = {};
const flatIdToExports: Record<string, ExportsData> = {};
// ...
// depsInfo 即为扫描后的依赖表
for (const id in depsInfo) {
  const src = depsInfo[id].src!;
  const exportsData = await(
    depsInfo[id].exportsData ?? extractExportsData(src, config, ssr)
  );
  if (exportsData.jsxLoader) {
    // Ensure that optimization won't fail by defaulting '.js' to the JSX parser.
    // This is useful for packages such as Gatsby.
    esbuildOptions.loader = {
      ".js": "jsx",
      ...esbuildOptions.loader,
    };
  }
  // 扁平化路径，`react/jsx-dev-runtime`，被重写为`react_jsx-dev-runtime`；
  const flatId = flattenId(id);
  // 填入 flatIdDeps 表，记录 flatId -> 真实路径的映射关系
  flatIdDeps[flatId] = src;
  idToExports[id] = exportsData;
  flatIdToExports[flatId] = exportsData;
}
// ...
```

关于虚拟模块的处理，在 esbuildDepPlugin 函数上面

[esbuildDepPlugin](https://github.com/vitejs/vite/blob/main/packages/vite/src/node/optimizer/esbuildDepPlugin.ts)

```ts
export function esbuildDepPlugin(
  qualified: Record<string, string>,
  exportsData: Record<string, ExportsData>,
  external: string[],
  config: ResolvedConfig,
  ssr: boolean
): Plugin {
  // 定义路径解析的方法

  // 返回 Esbuild 插件
  return {
    name: "vite:dep-pre-bundle",
    set(build) {
      // bare import 的路径
      build.onResolve(
        { filter: /^[\w@][^:]/ },
        async ({ path: id, importer, kind }) => {
          // 判断是否为入口模块，如果是，则标记上`dep`的 namespace，成为一个虚拟模块
          if (moduleListContains(external, id)) {
            return {
              path: id,
              external: true,
            };
          }
          // ...
        }
      );
      // For entry files, we'll read it ourselves and construct a proxy module
      // to retain the entry's raw id instead of file path so that esbuild
      // outputs desired output file structure.
      // It is necessary to do the re-exporting to separate the virtual proxy
      // module from the actual module since the actual module may get
      // referenced via relative imports - if we don't separate the proxy and
      // the actual module, esbuild will create duplicated copies of the same
      // module!
      const root = path.resolve(config.root);
      build.onLoad({ filter: /.*/, namespace: "dep" }, ({ path: id }) => {
        // 加载虚拟模块
      });
      // ...
    },
  };
}
```

如此一来，Esbuild 会将虚拟模块作为入口来进行打包，最后的产物目录会变成下面的扁平结构:

```
node_modules/.vite
├── _metadata.json
├── vue.js
├── react.js
├── react_jsx-dev-runtime.js
```

### 虚拟模块加载

虚拟模块代替了真实模块作为打包入口，因此也可以理解为代理模块，首先来分析一下它到底了包含了哪些内容。

拿 import React from "react"来举例，Vite 会把 react 标记为 namespace 为 dep 的虚拟模块，然后控制 Esbuild 的加载流程，对于真实模块的内容进行重新导出。

那么第一步就是确定真实模块的路径:

```ts
// 真实模块所在的路径，拿 react 来说，即`node_modules/react/index.js`
const entryFile = qualified[id];
// 确定相对路径
let relativePath = normalizePath(path.relative(root, entryFile));
if (
  !relativePath.startsWith("./") &&
  !relativePath.startsWith("../") &&
  relativePath !== "."
) {
  relativePath = `./${relativePath}`;
}
```

确定了路径之后，接下来就是对模块的内容进行重新导出。这里会分为几种情况:

- CommonJS 模块
- ES 模块

实际上在进行真正的依赖打包之前，Vite 会读取各个依赖的入口文件，通过 es-module-lexer 这种工具来解析入口文件的内容。这里稍微解释一下 es-module-lexer，这是一个在 Vite 被经常使用到的工具库，主要是为了解析 ES 导入导出的语法，大致用法：

```ts
import { init, parse } from "es-module-lexer";
// 等待`es-module-lexer`初始化完成
await init;
const sourceStr = `
  import moduleA from './a';
  export * from 'b';
  export const count = 1;
  export default count;
`;
// 开始解析
const exportsData = parse(sourceStr);
// 结果为一个数组，分别保存 import 和 export 的信息
const [imports, exports] = exportsData;
// 返回 `import module from './a'`
sourceStr.substring(imports[0].ss, imports[0].se);
// 返回 ['count', 'default']
console.log(exports);
```

optimizeDeps 函数内

```ts
export async function runOptimizeDeps() {
  // ...
  const exportsData = await (depsInfo[id].exportsData ??
    extractExportsData(src, config, ssr));
  if (exportsData.jsxLoader) {
    // Ensure that optimization won't fail by defaulting '.js' to the JSX parser.
    // This is useful for packages such as Gatsby.
    esbuildOptions.loader = {
      ".js": "jsx",
      ...esbuildOptions.loader,
    };
  }
  const flatId = flattenId(id);
  flatIdDeps[flatId] = src;
  idToExports[id] = exportsData;
  flatIdToExports[flatId] = exportsData;
  // ...
}
export async function extractExportsData() {
  //  读取入口内容
  const entryContent = fs.readFileSync(filePath, "utf-8");
  //  ...
  const exportsData: ExportsData = {
    hasImports: imports.length > 0,
    exports,
    facade,
    hasReExports: imports.some(({ ss, se }) => {
      const exp = entryContent.slice(ss, se);
      // 标记存在 `export * from` 语法
      return /export\s+\*\s+from/.test(exp);
    }),
    jsxLoader: usedJsxLoader,
  };
  // ...
}
```

由于最后会有两张表记录下 ES 模块导入和导出的相关信息，而 flatIdToExports 表会作为入参传给 Esbuild 插件:

```ts
// 第二个入参
plugins.push(
  esbuildDepPlugin(flatIdDeps, flatIdToExports, external, config, ssr)
);
```

如此，我们就能根据真实模块的路径获取到导入和导出的信息，通过这份信息来甄别 CommonJS 和 ES 两种模块规范:

```ts
return {
  name: "vite:dep-pre-bundle",
  setup(build) {
    // 下面的 exportsData 即外部传入的模块导入导出相关的信息表
    // 根据模块 id 拿到对应的导入导出信息
    let contents = "";
    const { hasImports, exports, hasReExports } = exportsData[id];
    if (!hasImports && !exports.length) {
      // cjs
      contents += `export default require("${relativePath}");`;
    } else {
      // 默认导出，即存在 export default 语法
      if (exports.includes("default")) {
        contents += `import d from "${relativePath}";export default d;`;
      }
      if (
        // 1. 存在 `export * from` 语法
        hasReExports ||
        // 2. 多个导出内容
        exports.length > 1 ||
        // 3. 只有一个导出内容，但这个导出不是 export default
        exports[0] !== "default"
      ) {
        contents += `\nexport * from "${relativePath}"`;
      }
    }
  },
};
```

这样就可以给 esbuild 加载了

```ts
// for jsx/tsx, we need to access the content and check for
// presence of import.meta.glob, since it results in import relationships
// but isn't crawled by esbuild.
build.onLoad({ filter: JS_TYPES_RE }, ({ path: id }) => {
  let ext = path.extname(id).slice(1);
  if (ext === "mjs") ext = "js";

  let contents = fs.readFileSync(id, "utf-8");
  if (ext.endsWith("x") && config.esbuild && config.esbuild.jsxInject) {
    contents = config.esbuild.jsxInject + `\n` + contents;
  }

  const loader =
    config.optimizeDeps?.esbuildOptions?.loader?.[`.${ext}`] || (ext as Loader);

  return {
    loader,
    contents,
  };
});
```

### 代理模块为什么要和真实模块分离

理模块，以此作为 Esbuild 打包入口的，整体的思路就是先分析一遍模块真实入口文件的 import 和 export 语法，然后在代理模块中进行重导出。这里不妨回过头来思考一下: 为什么要对真实文件先做语法分析，然后重导出内容呢？

```ts
// It is necessary to do the re-exporting to separate the virtual proxy
// module from the actual module since the actual module may get
// referenced via relative imports - if we don't separate the proxy and
// the actual module, esbuild will create duplicated copies of the same
// module!
```

翻译过来即:

这种重导出的做法是必要的，它可以分离虚拟模块和真实模块，因为真实模块可以通过相对地址来引入。如果不这么做，Esbuild 将会对打包输出两个一样的模块。

```ts
build.onLoad({ filter: /.*/, namespace: 'dep' }, ({ path: id }) => {
  // 拿到查表拿到真实入口模块路径
  const entryFile = qualified[id];
  return {
    loader: 'js',
    contents: fs.readFileSync(entryFile, 'utf8');
  }
}
```

Vite 会使用 dep:vue 这个代理模块来作为入口内容在 Esbuild 中进行加载，与此同时，其他库的预打包也有可能会引入 vue，比如@emotion/vue 这个库里面会有 require('vue')的行为。那么在 Esbuild 打包之后，vue.js 与@emotion_vue.js 的代码中会引用同一份 Chunk 的内容，这份 Chunk 也就对应 vue 入口文件(node_modules/vue/index.js)。

现在如果代理模块通过文件系统直接读取真实模块的内容，而不是进行重导出，因此由于此时代理模块跟真实模块并没有任何的引用关系，这就导致最后的 vue.js 和@emotion/vue.js 两份产物并不会引用同一份 Chunk，Esbuild 最后打包出了内容完全相同的两个 Chunk

参考文档[详解 Vite 依赖预构建流程](https://cloud.tencent.com/developer/article/2025112)
