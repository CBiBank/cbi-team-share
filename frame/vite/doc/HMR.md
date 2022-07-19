# HMR 热更新简介

HMR 的全称叫做 Hot Module Replacement，即模块热替换或者模块热更新。在计算机领域当中也有一个类似的概念叫热插拔，我们经常使用的 USB 设备就是一个典型的代表，当我们插入 U 盘的时候，系统驱动会加载在新增的 U 盘内容，不会重启系统，也不会修改系统其它模块的内容。HMR 的作用其实一样，就是在页面模块更新的时候，直接把页面中发生变化的模块替换为新的模块，同时不会影响其它模块的正常运作

# 深入 HMR API

Vite 作为一个完整的构建工具，本身实现了一套 HMR 系统，值得注意的是，这套 HMR 系统基于原生的 ESM 模块规范来实现，在文件发生改变时 Vite 会侦测到相应 ES 模块的变化，从而触发相应的 API，实现局部的更新。

Vite 的 HMR API 设计也并非空穴来风，它基于一套完整的 [ESM HMR](https://github.com/FredKSchott/esm-hmr) 规范来实现，这个规范由同时期的 no-bundle 构建工具 Snowpack、WMR 与 Vite 一起制定，是一个比较通用的规范。

HMR API 定义如下：

```js
interface ImportMeta {
  readonly hot?: {
    readonly data: any
    accept(): void
    accept(cb: (mod: any) => void): void
    accept(dep: string, cb: (mod: any) => void): void
    accept(deps: string[], cb: (mods: any[]) => void): void
    prune(cb: () => void): void
    dispose(cb: (data: any) => void): void
    decline(): void
    invalidate(): void
    on(event: string, cb: (...args: any[]) => void): void
  }
}
```

import.meta 对象为现代浏览器原生的一个内置对象，Vite 所做的事情就是在这个对象上的 hot 属性中定义了一套完整的属性和方法。因此，在 Vite 当中，你就可以通过 import.meta.hot 来访问关于 HMR 的这些属性和方法，比如 import.meta.hot.accept()

## 模块更新时逻辑: hot.accept

在 import.meta.hot 对象上有一个非常关键的方法 accept，因为它决定了 Vite 进行热更新的边界

从字面上来看，它表示接受的意思，它就是用来接受模块更新的。 一旦 Vite 接受了这个更新，当前模块就会被认为是 HMR 的边界

一般会有有三种情况：

- 接受自身模块的更新
- 接受某个子模块的更新
- 接受多个子模块的更新

1.  接受自身更新

当模块接受自身的更新时，则当前模块会被认为 HMR 的边界。也就是说，除了当前模块，其他的模块均未受到任何影响

> 首先看: hmr/v0 项目

启动项目，可以看到 count 的值每秒加 1，改动一下，render.ts 的渲染内容
页面更新了，count 瞬间清零，而且页面会闪一下

而且会有 log

```
[vite] page reload src/render.ts
```

很明显，vite 发现没有 HMR 相关的处理，然后直接刷新页面了，
render.ts 内添加一下代码

```js
// 条件守卫
if (import.meta.hot) {
  import.meta.hot.accept((mod) => mod.render());
}
```

import.meta.hot 对象只有在开发阶段才会被注入到全局，生产环境是访问不到的，另外增加条件守卫之后，打包时识别到 if 条件不成立，会自动把这部分代码从打包产物中移除，来优化资源体积。

传入了一个回调函数作为参数，入参即为 Vite 给我们提供的更新后的模块内容，在浏览器中打印 mod 内容如下，正好是 render 模块最新的内容

看一下控制台：

```
[vite] hmr update /src/render.ts
```

改动一下渲染的内容，然后到浏览器中注意一下 count 的情况，并没有被重新置零，而是保留了原有的状态

现在 render 模块更新后，只会重新渲染这个模块的内容，而对于 state 模块的内容并没有影响，并且控制台的 log 也发生了变化

2.  接受依赖模块的更新

> hrml/v1

main 模块依赖 render 模块，也就是说，main 模块是 render 父模块，那么我们也可以在 main 模块中接受 render 模块的更新，此时 HMR 边界就是 main 模块了。

在 main 下新增代码：

```js
if (import.meta.hot) {
  import.meta.hot.accept("./render.ts", (newModule) => {
    newModule.render();
  });
}
```

在这里同样是调用 accept 方法，与之前不同的是，第一个参数传入一个依赖的路径，也就是 render 模块的路径，这就相当于告诉 Vite: 我监听了 render 模块的更新，当它的内容更新的时候，请把最新的内容传给我。同样的，第二个参数中定义了模块变化后的回调函数，这里拿到了 render 模块最新的内容，然后执行其中的渲染逻辑，让页面展示最新的内容。

通过接受一个依赖模块的更新，同样又实现了 HMR 功能，试着改动 render 模块的内容，可以发现页面内容正常更新，并且状态依然保持着原样。

3.  接受多个子模块的更新

父模块可以接受多个子模块的更新，当其中任何一个子模块更新之后，父模块会成为 HMR 边界

在 accept 内加入 state.js

```js
// 条件守卫
if (import.meta.hot) {
  import.meta.hot.accept(["./render.ts", "./state.ts"], (modules) => {
    const [renderModule, stateModule] = modules;
    console.log(modules);
  });
}
```

通过 accept 方法接受了 render 和 state 两个模块的更新，接着让我们手动改动一下某一个模块的代码，观察一下回调中 modules 的打印内容。例如当我改动 state 模块的内容时，回调中拿到的 modules:

```js
[
  0:undefined,
  1:Module{Symbl...}
]
```

可以看到 Vite 给我们的回调传来的参数 modules 其实是一个数组，和我们第一个参数声明的子模块数组一一对应。因此 modules 数组第一个元素是 undefined，表示 render 模块并没有发生变化，第二个元素为一个 Module 对象，也就是经过变动后 state 模块的最新内容。于是在这里，我们根据 modules 进行自定义的更新，修改 main.ts:

```js
import.meta.hot.accept(["./render.ts", "./state.ts"], (modules) => {
  // 自定义更新
  const [renderModule, stateModule] = modules;
  if (renderModule) {
    renderModule.render();
  }
  if (stateModule) {
    stateModule.initState();
  }
});
```

现在，你可以改动两个模块的内容，可以发现，页面的相应模块会更新，并且对其它的模块没有影响。但实际上你会发现另外一个问题，当改动了 state 模块的内容之后，页面的内容会变得错乱

为什么呢？

```js
export function initState() {
  let count = 0;
  setInterval(() => {
    let countEle = document.getElementById('count');
    countEle!.innerText =  ++count + '';
  }, 1000);
}
```

其中设置了一个定时器，但当模块更改之后，这个定时器并没有被销毁，紧接着我们在 accept 方法调用 initState 方法又创建了一个新的定时器，导致 count 的值错乱。那如何来解决这个问题呢？这就涉及到新的 HMR 方法——dispose 方法了。

### 模块销毁时逻辑: hot.dispose

这个方法相较而言就好理解多了，代表在模块更新、旧模块需要销毁时需要做的一些事情，拿刚刚的场景来说，我们可以通过在 state 模块中调用 dispose 方法来轻松解决定时器共存的问题，代码改动如下:

```js
let timer: number | undefined;
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    if (timer) {
      clearInterval(timer);
    }
  })
}
export function initState() {
  let count = 0;
  timer = setInterval(() => {
    let countEle = document.getElementById('count');
    countEle!.innerText =  ++count + '';
  }, 1000);
}

```

看一下效果，改动内容，页面更新了，没有状态错乱的问题了。说明我们在模块销毁前清除定时器的操作是生效的。但又可以很明显地看到一个新的问题: 原来的状态丢失了，count 的内容从 64 突然变成 1。

梳理一下热更新流程：

- state 模块更新
- main 模块接受更新
- 执行 accept 方法回调
- 重新初始化定时器

当改动了 state 模块的代码，main 模块接受更新，执行 accept 方法中的回调，接着会执行 state 模块的 initState 方法。注意了，此时新建的 initState 方法的确会初始化定时器，但同时也会初始化 count 变量，也就是 count 从 0 开始计数了！

这显然是不符合预期的，我们期望的是每次改动 state 模块，之前的状态都保存下来

所以，就有了 host 对象上的 data 属性，这个属性用来在不同的模块实例间共享一些数据

### 共享数据: hot.data 属性

```diff
let timer: number | undefined;
if (import.meta.hot) {
+  // 初始化 count
+ if (!import.meta.hot.data.count) {
+    import.meta.hot.data.count = 0;
+  }
  import.meta.hot.dispose(() => {
    if (timer) {
      clearInterval(timer);
    }
  })
}
export function initState() {
+  const getAndIncCount = () => {
+    const data = import.meta.hot?.data || {
+      count: 0
+    };
+    data.count = data.count + 1;
+    return data.count;
+  };
  timer = setInterval(() => {
    let countEle = document.getElementById('count');
+    countEle!.innerText =  getAndIncCount() + '';
  }, 1000);
}
```

在 import.meta.hot.data 对象上挂载了一个 count 属性，在二次执行 initState 的时候便会复用 import.meta.hot.data 上记录的 count 值，从而实现状态的保存。

### 其他方法

1.  import.meta.hot.decline()

这个方法调用之后，相当于表示此模块不可热更新，当模块更新时会强制进行页面刷新

2.  import.meta.hot.invalidate()

用来强制刷新页面

3.  自定义事件

可以通过 import.meta.hot.on 来监听 HMR 的自定义事件，内部有这么几个事件会自动触发：

- vite:beforeUpdate 当模块更新时触发；
- vite:beforeFullReload 当即将重新刷新页面时触发；
- vite:beforePrune 当不再需要的模块即将被剔除时触发；
- vite:error 当发生错误时（例如，语法错误）触发。

```js
// 插件 Hook
handleHotUpdate({ server }) {
  server.ws.send({
    type: 'custom',
    event: 'custom-update',
    data: {}
  })
  return []
}
// 前端代码
import.meta.hot.on('custom-update', (data) => {
  // 自定义更新逻辑
})
```

# 创建依赖图

[源码地址](https://github.com/vitejs/vite/blob/main/packages/vite/src/node/server/moduleGraph.ts)
