# Module Federation

> [webpack5 的 MF](https://mp.weixin.qq.com/s/JEx2_eVUB-CKIvjKa66Cpg) > [Module Federation 原理剖析](https://zhuanlan.zhihu.com/p/296233114)

在 2020 年上半年，Webpack 提出了一项非常激动人心的特性——Module Federation(译为模块联邦)，这个特性一经推出就获得了业界的广泛关注，甚至被称为前端构建领域的 Game Changer
这项技术确实很好地解决了多应用模块复用的问题，相比之前的各种解决方案，它的解决方式更加优雅和灵活。但从另一个角度来说，Module Federation 代表的是一种通用的解决思路，并不局限于某一个特定的构建工具

因此，在 Vite 中同样可以实现这个特性，并且社区已经有了比较成熟的解决方案。

## 共享代码方案

### 发布 npm 包

发布 npm 包是一种常见的复用模块的做法，我们可以将一些公用的代码封装为一个 npm 包，具体的发布更新流程是这样的:

1.  公共库改动，发布到 npm；
2.  所有的应用安装新的依赖，并进行联调

封装 npm 包可以解决模块复用的问题，但它本身又引入了新的问题:

开发效率问题。每次改动都需要发版，并所有相关的应用安装新依赖，流程比较复杂。
项目构建问题。引入了公共库之后，公共库的代码都需要打包到项目最后的产物后，导致产物体积偏大，构建速度相对较慢。

### Git Submodule

通过 git submodule 的方式，我们可以将代码封装成一个公共的 Git 仓库，然后复用到不同的应用中，但也需要经历如下的步骤：

1.  公共库 lib1 改动，提交到 Git 远程仓库；
2.  所有的应用通过 git submodule 命令更新子仓库代码，并进行联调。

跟封装 npm 包差不多-0-

### 依赖外部化(external)+ CDN 引入

即对于某些第三方依赖我们并不需要让其参与构建，而是使用某一份公用的代码。按照这个思路，我们可以在构建引擎中对某些依赖声明 external，然后在 HTML 中加入依赖的 CDN 地址

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/src/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite App</title>
  </head>
  <body>
    <div id="root"></div>
    <!-- 从 CDN 上引入第三方依赖的代码 -->
    <script src="https://cdn.jsdelivr.net/npm/react@17.0.2/index.min.js"><script>
    <script src="https://cdn.jsdelivr.net/npm/react-dom@17.0.2/index.min.js"><script>
  </body>
</html>
```

我们可以对 react 和 react-dom 使用 CDN 的方式引入，一般使用 UMD 格式产物，这样不同的项目间就可以通过 window.React 来使用同一份依赖的代码了，从而达到模块复用的效果。不过在实际的使用场景，这种方案的局限性也很突出:

1.  兼容性问题。并不是所有的依赖都有 UMD 格式的产物，因此这种方案不能覆盖所有的第三方 npm 包。
2.  依赖顺序问题。我们通常需要考虑间接依赖的问题，如对于 antd 组件库，它本身也依赖了 react 和 moment，那么 react 和 moment 也需要 external，并且在 HTML 中引用这些包，同时也要严格保证引用的顺序，比如说 moment 如果放在了 antd 后面，代码可能无法运行。而第三方包背后的间接依赖数量一般很庞大，如果逐个处理，对于开发者来说简直就是噩梦。
3.  产物体积问题。由于依赖包被声明 external 之后，应用在引用其 CDN 地址时，会全量引用依赖的代码，这种情况下就没有办法通过 Tree Shaking 来去除无用代码了，会导致应用的性能有所下降。

### Monorepo

作为一种新的项目管理方式，Monorepo 也可以很好地解决模块复用的问题。在 Monorepo 架构下，多个项目可以放在同一个 Git 仓库中，各个互相依赖的子项目通过软链的方式进行调试，代码复用显得非常方便，如果有依赖的代码变动，那么用到这个依赖的项目当中会立马感知到

对于应用间模块复用的问题，Monorepo 是一种非常优秀的解决方案，但与此同时，它也给团队带来了一些挑战:

1.  所有的应用代码必须放到同一个仓库。如果是旧有项目，并且每个应用使用一个 Git 仓库的情况，那么使用 Monorepo 之后项目架构调整会比较大，也就是说改造成本会相对比较高。
2.  Monorepo 本身也存在一些天然的局限性，如项目数量多起来之后依赖安装时间会很久、项目整体构建时间会变长等等，我们也需要去解决这些局限性所带来的的开发效率问题。而这项工作一般需要投入专业的人去解决，如果没有足够的人员投入或者基建的保证，Monorepo 可能并不是一个很好的选择。
3.  项目构建问题。跟发 npm 包的方案一样，所有的公共代码都需要进入项目的构建流程中，产物体积还是会偏大。

## MF 核心概念

模块联邦中主要有两种模块: 本地模块和远程模块。

- 本地模块即为普通模块，是当前构建流程中的一部分，而远程模块不属于当前构建流程，在本地模块的运行时进行导入，同时本地模块和远程模块可以共享某些依赖的代码
- 在模块联邦中，每个模块既可以是本地模块，导入其它的远程模块，又可以作为远程模块，被其他的模块导入

优势：

1.  实现任意粒度的模块共享。这里所指的模块粒度可大可小，包括第三方 npm 依赖、业务组件、工具函数，甚至可以是整个前端应用！而整个前端应用能够共享产物，代表着各个应用单独开发、测试、部署，这也是一种微前端的实现。
2.  优化构建产物体积。远程模块可以从本地模块运行时被拉取，而不用参与本地模块的构建，可以加速构建过程，同时也能减小构建产物。
3.  运行时按需加载。远程模块导入的粒度可以很小，如果你只想使用 app1 模块的 add 函数，只需要在 app1 的构建配置中导出这个函数，然后在本地模块中按照诸如 import('app1/add')的方式导入即可，这样就很好地实现了模块按需加载。
4.  第三方依赖共享。通过模块联邦中的共享依赖机制，我们可以很方便地实现在模块间公用依赖代码，从而避免以往的 external + CDN 引入方案的各种问题。

## 搭建项目

社区中已经提供了一个比较成熟的 Vite 模块联邦方案: vite-plugin-federation，这个方案基于 Vite(或者 Rollup) 实现了完整的模块联邦能力

> MF-> host、remote

```ts
// 打包产物
pnpm run build
// 模拟部署效果，一般会在生产环境将产物上传到 CDN
npx vite preview --port=30001 --strictPort
```

让我们来梳理一下整体的使用流程:

1.  远程模块通过 exposes 注册导出的模块，本地模块通过 remotes 注册远程模块地址。
2.  远程模块进行构建，并部署到云端。
3.  本地通过 import '远程模块名称/xxx'的方式来引入远程模块，实现运行时加载。

几个要点需要补充一下:

1.  在模块联邦中的配置中，exposes 和 remotes 参数其实并不冲突，也就是说一个模块既可以作为本地模块，又可以作为远程模块。
2.  由于 Vite 的插件机制与 Rollup 兼容，vite-plugin-federation 方案在 Rollup 中也是完全可以使用的。

## MF 实现原理

Module Federation 使用比较简单，对已有项目来说改造成本并不大。那么，这么强大而易用的特性是如何在 Vite 中得以实现的呢？接下来，我们来深入探究一下 MF 背后的实现原理，分析 vite-plugin-federation 这个插件背后究竟做了些什么。

总体而言，实现模块联邦有三大主要的要素:

1.  Host 模块: 即本地模块，用来消费远程模块。

2.  Remote 模块: 即远程模块，用来生产一些模块，并暴露运行时容器供本地模块消费。

3.  Shared 依赖: 即共享依赖，用来在本地模块和远程模块中实现第三方依赖的共享。

首先，我们来看看本地模块是如何消费远程模块的。之前，我们在本地模块中写过这样的引入语句:

```ts
import RemoteApp from "remote_app/App";
```

> 查看 host 项目 build 后的打包文件

```ts
// 远程模块表
const remotesMap = {
  remote_app: {
    url: "http://localhost:3001/assets/remoteEntry.js",
    format: "esm",
    from: "vite",
  },
  shared: { url: "vue", format: "esm", from: "vite" },
};

async function __federation_method_ensure() {
  const remote = remoteMap[remoteId];
  // 做一些初始化逻辑，暂时忽略
  // 返回的是运行时容器
}

async function __federation_method_getRemote(remoteName, componentName) {
  return (
    __federation_method_ensure(remoteName)
      // 从运行时容器里面获取远程模块
      .then((remote) => remote.get(componentName))
      .then((factory) => factory())
  );
}

// import 语句被编译成了这样
// tip: es2020 产物语法已经支持顶层 await
const __federation_var_remote_appApp = await __federation_method_getRemote(
  "remote_app",
  "./App"
);
```

除了 import 语句被编译之外，在代码中还添加了 remoteMap 和一些工具函数，它们的目的很简单，就是通过访问远端的运行时容器来拉取对应名称的模块。

而运行时容器其实就是指远程模块打包产物 remoteEntry.js 的导出对象，我们来看看它的逻辑是怎样的:

> 查看 remote 项目打包后文件

```ts
// remoteEntry.js
const moduleMap = {
  // ...
};

// 加载 css
const dynamicLoadingCss = (cssFilePath) => {
  // ...
};

// 关键方法，暴露模块
const get = (module) => {
  return moduleMap[module]();
};

const init = () => {
  // 初始化逻辑，用于共享模块
};

export { dynamicLoadingCss, get, init };
```

从运行时容器的代码中可以得出一些关键的信息:

1.  moduleMap 用来记录导出模块的信息，所有在 exposes 参数中声明的模块都会打包成单独的文件，然后通过 dynamic import 进行导入。
2.  容器导出了十分关键的 get 方法，让本地模块能够通过调用这个方法来访问到该远程模块。

![](./img/MF/1.png)

接下来，我们继续分析共享依赖的实现。拿之前的示例项目来说，本地模块设置了 shared: ['vue']参数之后，当它执行远程模块代码的时候，一旦遇到了引入 vue 的情况，会优先使用本地的 vue，而不是远端模块中的 vue

需要看一下导出的 init 模块：

```ts
// 将本地模块的`共享模块表`绑定到远程模块的全局 window 对象上
const init = (shareScope) => {
  globalThis.__federation_shared__ = globalThis.__federation_shared__ || {};
  Object.entries(shareScope).forEach(([key, value]) => {
    const versionKey = Object.keys(value)[0];
    const versionValue = Object.values(value)[0];
    const scope = versionValue.scope || "default";
    globalThis.__federation_shared__[scope] =
      globalThis.__federation_shared__[scope] || {};
    const shared = globalThis.__federation_shared__[scope];
    (shared[key] = shared[key] || {})[versionKey] = versionValue;
  });
};
```

当本地模块的共享依赖表能够在远程模块访问时，远程模块内也就能够使用本地模块的依赖(如 vue)了。现在我们来看看远程模块中对于 import { h } from 'vue'这种引入代码被转换成了什么样子:

```ts
// __federation_fn_import.js
const moduleMap = {
  vue: {
    get: () => () => __federation_import("./__federation_shared_vue.js"),
    import: true,
  },
};
// 第三方模块缓存
const moduleCache = Object.create(null);
async function importShared(name, shareScope = "default") {
  return moduleCache[name]
    ? new Promise((r) => r(moduleCache[name]))
    : getProviderSharedModule(name, shareScope);
}

async function getProviderSharedModule(name, shareScope) {
  // 从 window 对象中寻找第三方包的包名，如果发现有挂载，则获取本地模块的依赖
  if (xxx) {
    return await getHostDep();
  } else {
    return getConsumerSharedModule(name);
  }
}

async function getConsumerSharedModule(name, shareScope) {
  if (moduleMap[name]?.import) {
    const module = (await moduleMap[name].get())();
    moduleCache[name] = module;
    return module;
  } else {
    console.error(
      `consumer config import=false,so cant use callback shared module`
    );
  }
}
```

由于远程模块运行时容器初始化时已经挂载了共享依赖的信息，远程模块内部可以很方便的感知到当前的依赖是不是共享依赖，如果是共享依赖则使用本地模块的依赖代码，否则使用远程模块自身的依赖产物代码
![](./img/MF/1.png)

## 应用场景

1.  微前端：通过 shared 以及 exposes 可以将多个应用引入同一应用中进行管理
2.  资源复用，减少编译体积：可以将多个应用都用到的通用组件单独部署，通过 mf 的功能在 runtime 时引入到其他项目中，这样组件代码就不会编译到项目中，同时亦能满足多个项目同时使用的需求，一举两得。
