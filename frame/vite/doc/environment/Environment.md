
# pnpm

[pnpm.md](./pnpm.md)

# 创建项目

```bash
pnpm create vite
```

按需选择

```ts
✔ Project name: vite-project
? Select a framework: › - Use arrow-keys. Return to submit.
    vanilla // 无前端框架
    vue     // 基于 Vue
 >  react   // 基于 React
    preact  // 基于 Preact（一款精简版的类 React 框架）
    lit     // 基于 lit（一款 Web Components 框架）
    svelte  // 基于 Svelte
```

创建项目 vite-demo

# 配置文件

如果，页面的入口文件 index.html 并不在项目根目录下，而在其他地方，可以通过 root 去访问

> 因为使用了 ts，使用 path 等模块儿的时候，需要加 @type/node 依赖

```ts
// ts引入 path 包注意两点:
// 1. 为避免类型报错，需要通过 `pnpm i @types/node -D` 安装类型
// 2. tsconfig.node.json 中设置 `allowSyntheticDefaultImports: true`，以允许下面的 default 导入方式
import path from 'path';
...

export default defineConfig({
  // 手动指定项目根目录位置
  root: path.join(__dirname, 'src')
  plugins: [react()]
})

```

当手动指定 root 参数之后，Vite 会自动从这个路径下寻找 index.html 文件，也就是说当我直接访问 localhost:3000 的时候，Vite 从 src 目录下读取入口文件

# 生产环境打包

开发阶段 Vite 通过 Dev Server 实现了不打包的特性，Vite 会基于 Rollup 进行打包，并采取一系列的打包优化手段

```ts
"scripts": {
  // 开发阶段启动 Vite Dev Server
  "dev": "vite",
  // 生产环境打包
  "build": "tsc && vite build",
  // 生产环境打包完预览产物
  "preview": "vite preview"
},
```

Vite 提供了开箱即用的 TypeScript 以及 JSX 的编译能力，但实际上底层并没有实现 TypeScript 的类型校验系统，因此需要借助 tsc 来完成类型校验(在 Vue 项目中使用 vue-tsc 这个工具来完成)

# 接入 css 方案

一般用 css 会有一下痛点：

1.  开发体验
2.  样式污染
3.  浏览器兼容
4.  代码体积

所以，为了解决痛点，有了不少的方案：

1.  CSS: 与处理器，主流的包括，sass/scss、less、stylus，解决了开发体验问题
2.  CSS Modules: 类名处理成哈希，同名的时候避免样式污染
3.  PostCSS：后处理器，可以将 px 转换为 rem、根据浏览器自动加上--moz--等的属性前缀等
4.  CSS in JS ，主流保安 emotion、styled-components 等等，可以直接在 js 内写样式代码，基本包含 CSS 预处理和 CSS Modules 的各项有点
5.  CSS 原子化框架，如 Tailwind CSS、Windi CSS，通过雷鸣置顶样式，简化样式写法，提升开发效率

## 预处理器

```bash
pnpm i sass -D
```

新建 Header 组件

```ts
// index.tsx
import './index.scss';
export function Header() {
  return <p className="header">Header</p>
};

// index.scss
.header {
  color: red;
}
```

如果加入全局主题色，新建一个 src/variable.scss 文件

```ts
$theme-color: red;
```

使用变量得在文件内引入

```scss
@import "../../variable";

.header {
  color: $theme-color;
}
```

为了偷懒，加入自动化引入方案，修改 vite.config.js

```ts
// vite.config.ts
import { normalizePath } from "vite";
import path from "path";

// 全局 scss 文件的路径
// 用 normalizePath 解决 window 下的路径问题
const variablePath = normalizePath(path.resolve("./src/variable.scss"));

export default defineConfig({
  // css 相关的配置
  css: {
    preprocessorOptions: {
      scss: {
        // additionalData 的内容会在每个 scss 文件的开头自动注入
        additionalData: `@import "${variablePath}";`,
      },
    },
  },
});
```

## CSS Modules

vite 已经集成 CSS Modules，开箱即用。Vite 会对后缀带有.module 的样式文件自动应用 CSS Modules

修改文件名后，可以查看控制台，已经变成了哈希值的形式

而且，还可以通过配置文件中的 css.modules 选项来配置 CSS Modules 的功能

```ts
export default defineConfig({
  css: {
    modules: {
      // 可以通过 generateScopedName 属性来对生成的类名进行自定义
      // 其中，name 表示当前文件名，local 表示类名
      generateScopedName: "[name]__[local]___[hash:base64:5]",
    },
  },
});
```

打开控制台，可以看到已经变成了自定义的形式

## PostCSS

一般可以通过 postcss.config.js 来配置，不过 Vite 已经提供了配置入口,
如，添加 autoprefixer

```ts
import autoprefixer from "autoprefixer";

export default defineConfig({
  css: {
    // 进行 PostCSS 配置
    postcss: {
      plugins: [
        autoprefixer({
          // 指定目标浏览器
          overrideBrowserslist: ["Chrome > 40", "ff > 31", "ie 11"],
        }),
      ],
    },
  },
};
```

还有其他插件，如：

- postcss-pxtorem
- postcss-preset-env(可以使用最新 css 语法，跟 babel 类似，做兼容)
- cssnano(压缩，更加智能，比如：公共样式复用、缩短属性值等)

## CSS In Js

CSS In Js 一般有两种方案，一个是 styled-components 和 emotion

在 Vite 内集成，需要添加配置内容

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        // 加入 babel 插件
        // 以下插件包都需要提前安装
        // 当然，通过这个配置你也可以添加其它的 Babel 插件
        plugins: [
          // 适配 styled-component
          "babel-plugin-styled-components"
          // 适配 emotion
          "@emotion/babel-plugin"
        ]
      },
      // 注意: 对于 emotion，需要单独加上这个配置
      // 通过 `@emotion/react` 包编译 emotion 中的特殊 jsx 语法
      jsxImportSource: "@emotion/react"
    })
  ]
})
```

## CSS 原子化框架

CSS 原子化框架主要包括 Tailwind CSS 和 Windi CSS
推荐 Windi，实现了按需生成 CSS 类名的功能，开发环境代码体积大大减少，比 Tailwind 快了 20-100 倍，当然 Tailwind 后续版本引入了[JIT 即时编译](https://v2.tailwindcss.com/docs/just-in-time-mode) 功能，解决了开发环境体积问题。

以引入 Windi CSS 为例

```bash
pnpm i windicss vite-plugin-windicss -D
```

在配置文件中使用

```ts
import windi from "vite-plugin-windicss";

export default {
  plugins: [
    // 省略其他内容
    windi(),
  ],
};
```

要注意在 src/main.tsx 中引入一个必需的 import 语句:

```ts
// 用来注入 Windi CSS 所需的样式，一定要加上
import "virtual:windi.css";
```

来试试，(ps:可 json 静态文件引入，后续说明)

```ts
import { devDependencies } from "../../../package.json";

export function Header() {
  return (
    <div className="p-20px text-center">
      <h1 className="font-bold text-2xl mb-2">
        vite version: {devDependencies.vite}
      </h1>
    </div>
  );
}
```

如果想要单独配置 Windi 内容的话，需要新创建 windi.config.js 文件：

```ts
import { defineConfig } from "vite-plugin-windicss";

export default defineConfig({
  // 开启 attributify
  attributify: true,
});
```

attributify，翻译过来就是属性化，也就是说我们可以用 props 的方式去定义样式属性，如下所示:

```html
<button
  bg="blue-400 hover:blue-500 dark:blue-500 dark:hover:blue-600"
  text="sm white"
  font="mono light"
  p="y-2 x-4"
  border="2 rounded blue-200"
>
  Button
</button>
```

不过使用 attributify 的时候需要注意类型问题，你需要添加 shim.d.ts 来增加类型声明，以防类型报错:

```ts
import { AttributifyAttributes } from "windicss/types/jsx";

declare module "react" {
  type HTMLAttributes<T> = AttributifyAttributes;
}
```

shortcuts 用来封装一系列的原子化能力，尤其是一些常见的类名集合，可以在 windi.config.ts 来配置

```ts
import { defineConfig } from "vite-plugin-windicss";

export default defineConfig({
  attributify: true,
  shortcuts: {
    "flex-c": "flex justify-center items-center",
  },
});
```

比如这里封装了 flex-c 的类名，接下来我们可以在业务代码直接使用这个类名:

```html
<div className="flex-c"></div>
<!-- 等同于下面这段 -->
<div className="flex justify-center items-center"></div>
```
