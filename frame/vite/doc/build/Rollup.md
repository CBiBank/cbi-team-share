# Rollup

Rollup 在 Vite 中的重要性一点也不亚于 Esbuild，它既是 Vite 用作生产环境打包的核心工具，也直接决定了 Vite 插件机制的设计

## 生产环境 Bundle

虽然 ESM 已经得到众多浏览器的原生支持，但生产环境做到完全 no-bundle 也不行，会有网络性能问题。为了在生产环境中也能取得优秀的产物性能，Vite 默认选择在生产环境中利用 Rollup 打包，并基于 Rollup 本身成熟的打包能力进行扩展和优化，主要包含 3 个方面:

1.  CSS 代码分割。如果某个异步模块中引入了一些 CSS 代码，Vite 就会自动将这些 CSS 抽取出来生成单独的文件，提高线上产物的缓存复用率。

2.  自动预加载。Vite 会自动为入口 chunk 的依赖自动生成预加载标签<link rel="moduelpreload">

```html
<head>
  <!-- 省略其它内容 -->
  <!-- 入口 chunk -->
  <script type="module" crossorigin src="/assets/index.250e0340.js"></script>
  <!--  自动预加载入口 chunk 所依赖的 chunk-->
  <link rel="modulepreload" href="/assets/vendor.293dca09.js" />
</head>
```

这种适当预加载的做法会让浏览器提前下载好资源，优化页面性能。

3.  异步 Chunk 加载优化。在异步引入的 Chunk 中，通常会有一些公用的模块，如现有两个异步引入的 Chunk: A 和 B

一般情况下，Rollup 打包之后，会先请求 A，然后浏览器在加载 A 的过程中才决定请求和加载 C，但 Vite 进行优化之后，请求 A 的同时会自动预加载 C，通过优化 Rollup 产物依赖加载方式节省了不必要的网络开销。

## 开始上手

### 安装依赖

```bash
pnpm i rollup
```

创建 index.js

```js
// src/index.js
import { add } from "./util";
console.log(add(1, 2));

// src/util.js
export const add = (a, b) => a + b;

export const multi = (a, b) => a * b;
// rollup.config.js
// 以下注释是为了能使用 VSCode 的类型提示
/**
 * @type { import('rollup').RollupOptions }
 */
const buildOptions = {
  input: ["src/index.js"],
  output: {
    // 产物输出目录
    dir: "dist/es",
    // 产物格式
    format: "esm",
  },
};

export default buildOptions;
```

package.json 中加入构建脚本

```json
{
  // rollup 打包命令，`-c` 表示使用配置文件中的配置
  "build": "rollup -c"
}
```

### 配置内容

1.  多出口配置

```ts
const buildOptions = {
  input: ["src/index.js"],
  // 将 output 改造成一个数组
  output: [
    {
      dir: "dist/es",
      format: "esm",
    },
    {
      dir: "dist/cjs",
      format: "cjs",
    },
  ],
};

export default buildOptions;
```

2.  多入口配置

```ts
{
  input: ["src/index.js", "src/util.js"]
}
// 或者
{
  input: {
    index: "src/index.js",
    util: "src/util.js",
  },
}
```

3.  自定义 output 配置

[查看文件](./rollup/rollup.config.js)

4. 依赖 external

第三方依赖，不想打包

```
{
  external: ['react', 'react-dom']
}
```

5.  接入插件能力

在 Rollup 的日常使用中，我们难免会遇到一些 Rollup 本身不支持的场景，比如兼容 CommonJS 打包、注入环境变量、配置路径别名、压缩产物代码 等等。这个时候就需要我们引入相应的 Rollup 插件了

首先需要安装两个核心的插件包:

```bash
pnpm i @rollup/plugin-node-resolve @rollup/plugin-commonjs
```

- @rollup/plugin-node-resolve 是为了允许我们加载第三方依赖，否则像 import React from 'react' 的依赖导入语句将不会被 Rollup 识别。
- @rollup/plugin-commonjs 的作用是将 CommonJS 格式的代码转换为 ESM 格式

rollup.config.js 配置文件中导入

```ts
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

/**
 * @type { import('rollup').RollupOptions }
 */
export default {
  input: ["src/index.js"],
  output: [
    {
      dir: "dist/es",
      format: "esm",
    },
    {
      dir: "dist/cjs",
      format: "cjs",
    },
  ],
  // 通过 plugins 参数添加插件
  plugins: [resolve(), commonjs()],
};
```

加入一个 lodash

```bash
pnpm i lodash
```

```ts
import { merge } from "lodash";
console.log(merge);
```

打包查看

在 Rollup 配置文件中，plugins 除了可以与 output 配置在同一级，也可以配置在 output 参数里面

```ts
// rollup.config.js
import { terser } from "rollup-plugin-terser";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
  output: {
    // 加入 terser 插件，用来压缩代码
    plugins: [terser()],
  },
  plugins: [resolve(), commonjs()],
};
```

### api 调用

1.  build

具体查看[build.js](./rollup/build.js)

2.  watch

每次源文件变动后自动进行重新打包

具体查看[watch.js](./rollup/watch.js)

## 整个构建流程

在执行 rollup 命令之后，在 cli 内部的主要逻辑简化如下:

```ts
// Build 阶段
const bundle = await rollup.rollup(inputOptions);

// Output 阶段
await Promise.all(outputOptions.map(bundle.write));

// 构建结束
await bundle.close();
```

Input -> Build -> Output

可以打印查看

```ts
const rollup = require("rollup");
const util = require("util");
async function build() {
  const bundle = await rollup.rollup({
    input: ["./src/index.js"],
  });
  console.log(util.inspect(bundle));
}
build();
```

输出类似的信息

```json
{
  cache: {
    modules: [
      {
        ast: 'AST 节点信息，具体内容省略',
        code: 'export const a = 1;',
        dependencies: [],
        id: '/Users/code/rollup-demo/src/data.js',
        // 其它属性省略
      },
      {
        ast: 'AST 节点信息，具体内容省略',
        code: "import { a } from './data';\n\nconsole.log(a);",
        dependencies: [
          '/Users/code/rollup-demo/src/data.js'
        ],
        id: '/Users/code/rollup-demo/src/index.js',
        // 其它属性省略
      }
    ],
    plugins: {}
  },
  closed: false,
  // 挂载后续阶段会执行的方法
  close: [AsyncFunction: close],
  generate: [AsyncFunction: generate],
  write: [AsyncFunction: write]
}
```

因此，对于一次完整的构建过程而言， Rollup 会先进入到 Build 阶段，解析各模块的内容及依赖关系，然后进入 Output 阶段，完成打包及输出的过程

## 插件工作流

插件的各种 Hook 可以根据这两个构建阶段分为两类: Build Hook 与 Output Hook。

- Build Hook 即在 Build 阶段执行的钩子函数，在这个阶段主要进行模块代码的转换、AST 解析以及模块依赖的解析，那么这个阶段的 Hook 对于代码的操作粒度一般为模块级别，也就是单文件级别。
- Ouput Hook(官方称为 Output Generation Hook)，则主要进行代码的打包，对于代码而言，操作粒度一般为 chunk 级别(一个 chunk 通常指很多文件打包到一起的产物)。

除了根据构建阶段可以将 Rollup 插件进行分类，根据不同的 Hook 执行方式也会有不同的分类，主要包括 Async、Sync、Parallel、Squential、First 这五种

### Async & Sync

异步和同步的钩子函数

### Parallel

指并行的钩子函数。如果有多个插件实现了这个钩子的逻辑，一旦有钩子函数是异步逻辑，则并发执行钩子函数，不会等待当前钩子完成(底层使用 Promise.all)

### Sequential

Sequential 指串行的钩子函数。这种 Hook 往往适用于插件间处理结果相互依赖的情况，前一个插件 Hook 的返回值作为后续插件的入参，这种情况就需要等待前一个插件执行完 Hook，获得其执行结果，然后才能进行下一个插件相应 Hook 的调用，如 transform

### First

如果有多个插件实现了这个 Hook，那么 Hook 将依次运行，直到返回一个非 null 或非 undefined 的值为止

## 完整的插件

vite-plugin-dev

### vite 插件的执行顺序

服务启动阶段: config、configResolved、options、configureServer、buildStart
请求响应阶段: 如果是 html 文件，仅执行 transformIndexHtml 钩子；对于非 HTML 文件，则依次执行 resolveId、load 和 transform 钩子
热更新阶段: 执行 handleHotUpdate 钩子
服务关闭阶段: 依次执行 buildEnd 和 closeBundle 钩子

> 查看控制台，test-hooks 打印

插件执行顺序：

- Alias (路径别名)相关的插件。
- 带有 enforce: 'pre' 的用户插件。--- 用户插件
- Vite 核心插件。
- 没有 enforce 值的用户插件，也叫普通插件。--- 用户插件
- Vite 生产环境构建用的插件。
- 带有 enforce: 'post' 的用户插件。--- 用户插件
- Vite 后置构建插件(如压缩插件)。

默认情况下 Vite 插件同时被用于开发环境和生产环境，你可以通过 apply 属性来决定应用场景

```ts
{
  // 'serve' 表示仅用于开发环境，'build'表示仅用于生产环境
  apply: "serve";
}
```

apply 参数还可以配置成一个函数，进行更灵活的控制:

```ts
apply(config, { command }) {
  // 只用于非 SSR 情况下的生产环境构建
  return command === 'build' && !config.build.ssr
}

```

也可以通过 enforce 属性来指定插件的执行顺序:

```ts
{
  // 默认为`normal`，可取值还有`pre`和`post`
  enforce: "pre";
}
```
