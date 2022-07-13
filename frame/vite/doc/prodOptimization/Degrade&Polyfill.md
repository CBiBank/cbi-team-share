# 底层工具链

## 1. 工具概览

解决语法降级与 polyfill 两类语法兼容问题，主要需要用到两方面的工具，分别包括:

- 编译时工具。代表工具有@babel/preset-env 和@babel/plugin-transform-runtime。
- 运行时基础库。代表库包括 core-js 和 regenerator-runtime。

编译时工具的作用是在代码编译阶段进行语法降级及添加 polyfill 代码的引用语句，如:

```ts
import "core-js/modules/es6.set.js";
```

由于这些工具只是编译阶段用到，运行时并不需要，我们需要将其放入 package.json 中的 devDependencies 中。

而运行时基础库是根据 ESMAScript 官方语言规范提供各种 Polyfill 实现代码，主要包括 core-js 和 regenerator-runtime 两个基础库，不过在 babel 中也会有一些上层的封装，包括：

@babel/polyfill
@babel/runtime
@babel/runtime-corejs2
@babel/runtime-corejs3 看似各种运行时库眼花缭乱，其实都是 core-js 和 regenerator-runtime 不同版本的封装罢了(@babel/runtime 是个特例，不包含 core-js 的 Polyfill)。这类库是项目运行时必须要使用到的，因此一定要放到 package.json 中的 dependencies 中！

## 2. 实际使用

创建项目，添加依赖

```shell
mkdir babel-test
npm init -y
pnpm i @babel/cli @babel/core @babel/preset-env
```

- @babel/cli: 为 babel 官方的脚手架工具，很适合我们练习用。
- @babel/core: babel 核心编译库。
- @babel/preset-env: babel 的预设工具集，基本为 babel 必装的库。

详情查看[babel-test](../../polyfill/babel-test/)

### targets

我们可以通过 targets 参数指定要兼容的浏览器版本

```json
{
  "targets": {
    "ie": "11"
  }
}
```

也可以用 Browserslist 配置语法:

```json
{
  // ie 不低于 11 版本，全球超过 0.5% 使用，且还在维护更新的浏览器
  "targets": "ie >= 11, > 0.5%, not dead"
}
```

Browserslist 是一个帮助我们设置目标浏览器的工具，不光是 Babel 用到，其他的编译工具如 postcss-preset-env、autoprefix 中都有所应用。对于 Browserslist 的配置内容，既可以放到 Babel 这种特定工具当中，也可以在 package.json 中通过 browserslist 声明

```json
// package.json
{
  "browserslist": "ie >= 11"
}
```

或者通过.browserslistrc 进行声明:

```
// .browserslistrc
ie >= 11
```

示例：

```js
// 现代浏览器
last 2 versions and since 2018 and > 0.5%
// 兼容低版本 PC 浏览器
IE >= 11, > 0.5%, not dead
// 兼容低版本移动端浏览器
iOS >= 9, Android >= 4.4, last 2 versions, > 0.2%, not dead
```

官网：[browserslist.dev](https://browserslist.dev)

### useBuiltIns

它决定了添加 Polyfill 策略，默认是 false，即不添加任何的 Polyfill。你可以手动将 useBuiltIns 配置为 entry 或者 usage

首先可以将这个字段配置为 entry，需要注意的是，entry 配置规定你必须在入口文件手动添加一行这样的代码:

```ts
// index.js 开头加上
import "core-js";
```

接着在终端执行下面的命令进行 Babel 编译:

```
npx babel src --out-dir dist
```

这里会加入很多 polyfill 内容，但是，不是可以按需导入的

设置一下 useBuiltIns: usage 这个按需导入的配置，改动配置后执行上述编译命令，再次查看打包产物

可以发现内容已经精简了很多，实现了按需导入，因此，项目推荐使用 useBuiltIns: usage

稍微总结一下：

利用@babel/preset-env 进行了目标浏览器语法的降级和 Polyfill 注入，同时用到了 core-js 和 regenerator-runtime 两个核心的运行时库。但@babel/preset-env 的方案也存在一定局限性：

1.  如果使用新特性，往往是通过基础库(如 core-js)往全局环境添加 Polyfill，如果是开发应用没有任何问题，如果是开发第三方工具库，则很可能会对全局空间造成污染。
2.  很多工具函数的实现代码(如上面示例中的\_defineProperty 方法)，会在许多文件中重现出现，造成文件体积冗余。

## 3. transform-runtime

> 需要提前说明的是，transform-runtime 方案可以作为@babel/preset-env 中 useBuiltIns 配置的替代品，也就是说，一旦使用 transform-runtime 方案，应该把 useBuiltIns 属性设为 false。

安装依赖：

```shell
pnpm i @babel/plugin-transform-runtime -D
pnpm i @babel/runtime-corejs3 -S
```

前者是编译时工具，用来转换语法和添加 Polyfill，后者是运行时基础库，封装了 core-js、regenerator-runtime 和各种语法转换用到的工具函数。

> core-js 有三种产物，分别是 core-js、core-js-pure 和 core-js-bundle。第一种是全局 Polyfill 的做法，@babel/preset-env 就是用的这种产物；第二种不会把 Polyfill 注入到全局环境，可以按需引入；第三种是打包好的版本，包含所有的 Polyfill，不太常用。@babel/runtime-corejs3 使用的是第二种产物。

transform-runtime 一方面能够让我们在代码中使用非全局版本的 Polyfill，这样就避免全局空间的污染，这也得益于 core-js 的 pure 版本产物特性；另一方面对于 asyncToGenerator 这类的工具函数，它也将其转换成了一段引入语句，不再将完整的实现放到文件中，节省了编译后文件的体积。

另外，transform-runtime 方案引用的基础库也发生了变化，不再是直接引入 core-js 和 regenerator-runtime，而是引入@babel/runtime-corejs3。

## Vite 语法降级与 Polyfill 注入

Vite 官方已经为我们封装好了一个开箱即用的方案: @vitejs/plugin-legacy，我们可以基于它来解决项目语法的浏览器兼容问题。这个插件内部同样使用 @babel/preset-env 以及 core-js 等一系列基础库来进行语法降级和 Polyfill 注入

### 插件使用

```shell
pnpm i @vitejs/plugin-legacy -D
```

项目中使用

```
// vite.config.ts
import legacy from '@vitejs/plugin-legacy';
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    // 省略其它插件
    legacy({
      // 设置目标浏览器，browserslist 配置语法
      targets: ['ie >= 11'],
    })
  ]
})
```

同样可以通过 targets 指定目标浏览器，这个参数在插件内部会透传给@babel/preset-env。

可自己尝试打包内容

相比一般的打包过程，多出了 index-legacy.js、vendor-legacy.js 以及 polyfills-legacy.js 三份产物文件

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/assets/favicon.17e50649.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite App</title>
    <!-- 1. Modern 模式产物 -->
    <script type="module" crossorigin src="/assets/index.c1383506.js"></script>
    <link rel="modulepreload" href="/assets/vendor.0f99bfcc.js" />
    <link rel="stylesheet" href="/assets/index.91183920.css" />
  </head>
  <body>
    <div id="root"></div>
    <!-- 2. Legacy 模式产物 -->
    <script nomodule>
      兼容 iOS nomodule 特性的 polyfill，省略具体代码
    </script>
    <script
      nomodule
      id="vite-legacy-polyfill"
      src="/assets/polyfills-legacy.36fe2f9e.js"
    ></script>
    <script
      nomodule
      id="vite-legacy-entry"
      data-src="/assets/index-legacy.c3d3f501.js"
    >
      System.import(
        document.getElementById("vite-legacy-entry").getAttribute("data-src")
      );
    </script>
  </body>
</html>
```

通过官方的 legacy 插件， Vite 会分别打包出 Modern 模式和 Legacy 模式的产物，然后将两种产物插入同一个 HTML 里面，Modern 产物被放到 type="module"的 script 标签中，而 Legacy 产物则被放到带有 nomodule 的 script 标签中

这样产物便就能够同时放到现代浏览器和不支持 type="module"的低版本浏览器当中执行。当然，在具体的代码语法层面，插件还需要考虑语法降级和 Polyfill 按需注入的问题

### 插件执行原理

方的 legacy 插件是一个相对复杂度比较高的插件，直接看源码可能会很难理解

- configResolved: 增加 output 选项，增加 system 格式的 legacy 产物
- renderChunk: 通过@bobel/preset-env 进行语法转换，记录 polyfill 集合
- generatorBundle: 将收集的 polyfill 单独打包
- transformIndexHtml: 将生成的 legacy 产物以及 polyfill 文件插入到 html 中

首先是在 configResolved 钩子中调整了 output 属性，这么做的目的是让 Vite 底层使用的打包引擎 Rollup 能另外打包出一份 Legacy 模式的产物，实现代码如下:

```ts
const createLegacyOutput = (options = {}) => {
  return {
    ...options,
    // system 格式产物
    format: "system",
    // 转换效果: index.[hash].js -> index-legacy.[hash].js
    entryFileNames: getLegacyOutputFileName(options.entryFileNames),
    chunkFileNames: getLegacyOutputFileName(options.chunkFileNames),
  };
};

const { rollupOptions } = config.build;
const { output } = rollupOptions;
if (Array.isArray(output)) {
  rollupOptions.output = [...output.map(createLegacyOutput), ...output];
} else {
  rollupOptions.output = [createLegacyOutput(output), output || {}];
}
```

在 renderChunk 阶段，插件会对 Legacy 模式产物进行语法转译和 Polyfill 收集，值得注意的是，这里并不会真正注入 Polyfill，而仅仅只是收集 Polyfill，:

```js
{
  renderChunk(raw, chunk, opts) {
    // 1. 使用 babel + @babel/preset-env 进行语法转换与 Polyfill 注入
    // 2. 由于此时已经打包后的 Chunk 已经生成
    //   这里需要去掉 babel 注入的 import 语句，并记录所需的 Polyfill
    // 3. 最后的 Polyfill 代码将会在 generateBundle 阶段生成
  }
}
```

进入 generateChunk 钩子阶段，现在 Vite 会对之前收集到的 Polyfill 进行统一的打包，实现也比较精妙，主要逻辑集中在 buildPolyfillChunk 函数中:

```js
// 打包 Polyfill 代码
async function buildPolyfillChunk(
  name,
  imports
  bundle,
  facadeToChunkMap,
  buildOptions,
  externalSystemJS
) {
  let { minify, assetsDir } = buildOptions
  minify = minify ? 'terser' : false
  // 调用 Vite 的 build API 进行打包
  const res = await build({
    // 根路径设置为插件所在目录
    // 由于插件的依赖包含`core-js`、`regenerator-runtime`这些运行时基础库
    // 因此这里 Vite 可以正常解析到基础 Polyfill 库的路径
    root: __dirname,
    write: false,
    // 这里的插件实现了一个虚拟模块
    // Vite 对于 polyfillId 会返回所有 Polyfill 的引入语句
    plugins: [polyfillsPlugin(imports, externalSystemJS)],
    build: {
      rollupOptions: {
        // 访问 polyfillId
        input: {
          // name 暂可视作`polyfills-legacy`
          // pofyfillId 为一个虚拟模块，经过插件处理后会拿到所有 Polyfill 的引入语句
          [name]: polyfillId
        },
      }
    }
  });
  // 拿到 polyfill 产物 chunk
  const _polyfillChunk = Array.isArray(res) ? res[0] : res
  if (!('output' in _polyfillChunk)) return
  const polyfillChunk = _polyfillChunk.output[0]
  // 后续做两件事情:
  // 1. 记录 polyfill chunk 的文件名，方便后续插入到 Modern 模式产物的 HTML 中；
  // 2. 在 bundle 对象上手动添加 polyfill 的 chunk，保证产物写到磁盘中
}
```

通过 vite build 对 renderChunk 中收集到 polyfill 代码进行打包，生成一个单独的 chunk

> 需要注意的是，polyfill chunk 中除了包含一些 core-js 和 regenerator-runtime 的相关代码，也包含了 SystemJS 的实现代码，可以将其理解为 ESM 的加载器，实现了在旧版浏览器下的模块加载能力。

通过 transformIndexHtml 钩子来将这些产物插入到 HTML 的结构中:

```js
{
  transformIndexHtml(html) {
    // 1. 插入 Polyfill chunk 对应的 <script nomodule> 标签
    // 2. 插入 Legacy 产物入口文件对应的 <script nomodule> 标签
  }
}
```


- 当插件参数中开启了modernPolyfills选项时，Vite 也会自动对 Modern 模式的产物进行 Polyfill 收集，并单独打包成polyfills-modern.js的 chunk，原理和 Legacy 模式下处理 Polyfill 一样。
- Sarari 10.1 版本不支持 nomodule，为此需要单独引入一些补丁代码，[safari-nomodule.js](https://gist.github.com/samthor/64b114e4a4f539915a95b91ffd340acc)
