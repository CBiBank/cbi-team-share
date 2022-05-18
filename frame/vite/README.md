# vite 官网

[https://github.com/vitejs/vite](https://github.com/vitejs/vite)

# 环境搭建

## pnpm

[pnpm.md](./pnpm.md)

## 创建项目

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

## 配置文件

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

## 生产环境打包

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

# 代码规范

## ESLint

项目内安装依赖

```bash
pnpm i eslint -D
```

接着执行 ESLint 的初始化命令，并进行如下的命令行交互:

```bash
npx eslint --init
```

ESLint 会帮我们自动生成.eslintrc.js 配置文件。需要注意的是，在上述初始化流程中我们并没有安装依赖，需要进行手动安装:

```
pnpm i eslint-plugin-react@latest @typescript-eslint/eslint-plugin@latest @typescript-eslint/parser@latest -D
```

### 配置解读

1.  parser - 解析器

    ESLint 底层默认使用 Espree 来进行 AST 解析，这个解析器目前已经基于 Acron 来实现，虽然说 Acron 目前能够解析绝大多数的 ECMAScript 规范的语法，但还是不支持 TypeScript ，因此需要引入其他的解析器完成 TS 的解析。

2.  parserOptions - 解析器选项

    ecmaVersion: 这个配置和 Acron 的 ecmaVersion 是兼容的，可以配置 ES + 数字(如 ES6)或者 ES + 年份(如 ES2015)，也可以直接配置为 latest，启用最新的 ES 语法。
    sourceType: 默认为 script，如果使用 ES Module 则应设置为 module
    ecmaFeatures: 为一个对象，表示想使用的额外语言特性，如开启 jsx。

3.  rules - 具体代码规则
4.  plugins

    ESLint 不能直接解析 js，所以，指定 parser 选项为@typescript-eslint/parser 才能兼容 TS 的解析

5.  extends - 继承配置

    ```ts
    module.exports = {
      "extends": [
        // 第1种情况
        "eslint:recommended",
        // 第2种情况，一般配置的时候可以省略 `eslint-config`
        "standard"
        // 第3种情况，可以省略包名中的 `eslint-plugin`
        // 格式一般为: `plugin:${pluginName}/${configName}`
        "plugin:react/recommended"
        "plugin:@typescript-eslint/recommended",
      ]
    }
    ```

6.  env 和 globals

    运行变量和全局变量

    ```ts
    module.export = {
      env: {
        browser: "true",
        node: "true",
      },
    };
    ```

## 加入 Prettier

ESLint 的主要优势在于代码的风格检查并给出提示,而在代码格式化这一块 Prettier 做的更加专业

```ts
pnpm i prettier -D


// .prettierrc.js
module.exports = {
  printWidth: 80, //一行的字符数，如果超过会进行换行，默认为80
  tabWidth: 2, // 一个 tab 代表几个空格数，默认为 2 个
  useTabs: false, //是否使用 tab 进行缩进，默认为false，表示用空格进行缩减
  singleQuote: true, // 字符串是否使用单引号，默认为 false，使用双引号
  semi: true, // 行尾是否使用分号，默认为true
  trailingComma: "none", // 是否使用尾逗号
  bracketSpacing: true // 对象大括号直接是否有空格，默认为 true，效果：{ a: 1 }
};
```

安装工具包

```bash
pnpm i eslint-config-prettier eslint-plugin-prettier -D
```

定义好，接下来，定义脚本

```json
{
  "scripts": {
    "lint:script": "eslint --ext .js,.jsx,.ts,.tsx --fix --quiet ./"
  }
}
```

```bash
pnpm run lint:script
```

可以在 VSCode 中安装 ESLint 和 Prettier 这两个插件，并且在设置区中开启 Format On Save

保存后自动就修复了

在 Vite 中接入 ESLint

```bash
pnpm i vite-plugin-eslint -D
```

```ts
import viteEslint from "vite-plugin-eslint";

export default defineConfig({
  // 具体配置
  plugins: [
    // 省略其它插件
    viteEslint(),
  ];
})
```

## 加入样式规范 Stylelint

Stylelint 主要专注于样式代码的规范检查，内置了 170 多个 CSS 书写规则，支持 CSS 预处理器(如 Sass、Less)，提供插件化机制以供开发者扩展规则，已经被 Google、Github 等大型团队投入使用

为什么用它？因为够专业

```bash
pnpm i stylelint stylelint-prettier stylelint-config-prettier stylelint-config-recess-order stylelint-config-standard stylelint-config-standard-scss -D
```

添加.stylelintrc.js

```ts
module.exports = {
  // 注册 stylelint 的 prettier 插件
  plugins: ["stylelint-prettier"],
  // 继承一系列规则集合
  extends: [
    // standard 规则集合
    "stylelint-config-standard",
    // standard 规则集合的 scss 版本
    "stylelint-config-standard-scss",
    // 样式属性顺序规则
    "stylelint-config-recess-order",
    // 接入 Prettier 规则
    "stylelint-config-prettier",
    "stylelint-prettier/recommended",
  ],
  // 配置 rules
  rules: {
    // 开启 Prettier 自动格式化功能
    "prettier/prettier": true,
  },
};
```

添加脚本

```json
{
  "scripts": {
    // 整合 lint 命令
    "lint": "npm run lint:script && npm run lint:style",
    // stylelint 命令
    "lint:style": "stylelint --fix \"src/**/*.{css,scss}\""
  }
}
```

在 Vite 中集成 Stylelint

```bash
pnpm i @amatlash/vite-plugin-stylelint -D
```

```ts
import viteStylelint from '@amatlash/vite-plugin-stylelint';

export default defineConfig({
  // 具体配置
  {
    plugins: [
      // 省略其它插件
      viteStylelint({
        // 对某些文件排除检查
        exclude: /windicss|node_modules/
      }),
    ]
  }
})

```

## Husky + lint-staged 的 Git 提交工作流集成

Husky + lint-staged 可以再代码提交的时候进行卡点检查，也就是拦截 git commit 命令，进行代码格式检查，只有确保通过格式检查才允许正常提交代码

区中已经有了对应的工具——Husky

```bash
pnpm i husky -D
```

一般来说，在 package.json 配置 husky 的钩子

```json
{
  "husky": {
    "pre-commit": "npm run lint"
  }
}
```

但是，这种做法在 Husky 4.x 及以下版本没问题，而在最新版本(7.x 版本)中是无效的

在新版中，需要以下步骤

1.  初始化：npx husky install，并将 husky install 作为项目启动前脚本

```json
{
  "scripts": {
    // 会在安装 npm 依赖后自动执行
    "postinstall": "husky install"
  }
}
```

2.  添加 Husky 钩子，在终端执行如下命令:

```bash
npx husky add .husky/pre-commit "npm run lint"
```

将在项目根目录的.husky 目录中看到名为 pre-commit 的文件，里面包含了 git commit 前要执行的脚本。现在，当执行 git commit 的时候，会首先执行 npm run lint 脚本，通过 Lint 检查后才会正式提交代码记录

不过，刚才我们直接在 Husky 的钩子中执行 npm run lint，这会产生一个额外的问题: Husky 中每次执行 npm run lint 都对仓库中的代码进行全量检查，也就是说，即使某些文件并没有改动，也会走一次 Lint 检查，当项目代码越来越多的时候，提交的过程会越来越慢，影响开发体验。

而 lint-staged 就是用来解决上述全量扫描问题的，可以实现只对存入暂存区的文件进行 Lint 检查，大大提高了提交代码的效率。

```bash
pnpm i -D lint-staged
```

然后在 package.json 中添加如下的配置:

```json
{
  "lint-staged": {
    "**/*.{js,jsx,tsx,ts,json}": ["npm run lint:script", "git add --force"],
    "**/*.{scss}": ["npm run lint:style", "git add --force"]
  }
}
```

接下来我们需要在 Husky 中应用 lint-stage，回到.husky/pre-commit 脚本中，将原来的 npm run lint 换成如下脚本:

```bash
npx --no -- lint-staged
```

## 提交时的 commit 规范问题

安装工具库

```bash
pnpm i commitlint @commitlint/cli @commitlint/config-conventional -D
```

新建.commitlintrc.js

```ts
module.exports = {
  extends: ["@commitlint/config-conventional"],
};
```

一般我们直接使用@commitlint/config-conventional 规范集就可以了，它所规定的 commit 信息一般由两个部分: type 和 subject 组成，结构如下:

```js
// type 指提交的类型
// subject 指提交的摘要信息
<type>: <subject>
```

常用的 type 值包括如下:

- feat: 添加新功能。
- fix: 修复 Bug。
- chore: 一些不影响功能的更改。
- docs: 专指文档的修改。
- perf: 性能方面的优化。
- refactor: 代码重构。
- test: 添加一些测试代码等等。
  接下来我们将 commitlint 的功能集成到 Husky 的钩子当中，在终端执行如下命令即可:

```bash
npx husky add .husky/commit-msg "npx --no-install commitlint -e $HUSKY_GIT_PARAMS"
```

可以发现在.husky 目录下多出了 commit-msg 脚本文件，表示 commitlint 命令已经成功接入到 husky 的钩子当中

# 处理静态资源

## 配置别名

```ts
// vite.config.ts
import path from 'path';

{
  resolve: {
    // 别名配置
    alias: {
      '@assets': path.join(__dirname, 'src/assets')
    }
  }
}
```

接下来进行使用

```tsx
// Header/index.tsx
import React, { useEffect } from 'react';
import { devDependencies } from '../../../package.json';
import styles from './index.module.scss';
// 1. 导入图片
import logoSrc from '@assets/imgs/vite.png';

// 方式一
export function Header() {
  return (
    <div className={`p-20px text-center ${styles.header}`}>
      <!-- 省略前面的组件内容 -->
      <!-- 使用图片 -->
      <img className="m-auto mb-4" src={logoSrc} alt="" />
    </div>
  );
}

// 方式二
export function Header() {
  useEffect(() => {
    const img = document.getElementById('logo') as HTMLImageElement;
    img.src = logoSrc;
  }, []);
  return (
    <div className={`p-20px text-center ${styles.header}`}>
      <!-- 省略前面的组件内容 -->
      <!-- 使用图片 -->
      <img id="logo" className="m-auto mb-4" alt="" />
    </div>
  );
}


```

```scss
.header {
  // 前面的样式代码省略
  background: url("@assets/imgs/background.png") no-repeat;
}
```

## SVG 组件方式加载

- Vue2 项目中可以使用 vite-plugin-vue2-svg 插件。
- Vue3 项目中可以引入 vite-svg-loader。
- React 项目使用 vite-plugin-svgr 插件。

安装依赖

```bash
pnpm i vite-plugin-svgr -D
```

配置

```ts
import svgr from "vite-plugin-svgr";

{
  plugins: [
    // 其它插件省略
    svgr(),
  ];
}
```

在 tsconfig.json 中添加配置， 否则会报错

```json
{
  "compilerOptions": {
    // 省略其它配置
    "types": ["vite-plugin-svgr/client"]
  }
}
```

可以进行使用

```tsx
import { ReactComponent as ReactLogo } from "@assets/icons/logo.svg";

export function Header() {
  return (
    // 其他组件内容省略
    <ReactLogo />
  );
}
```

## JSON 加载

Vite 中已经内置了对于 JSON 文件的解析，底层使用@rollup/pluginutils 的 dataToEsm 方法将 JSON 对象转换为一个包含各种具名导出的 ES 模块

```ts
import { version } from "../../../package.json";
```

也可以在配置文件禁用按名导入的方式:

```
{
  json: {
    stringify: true
  }
}
```

这样会将 JSON 的内容解析为 export default JSON.parse("xxx")，这样会失去按名导出的能力，不过在 JSON 数据量比较大的时候，可以优化解析性能

## Web Worker 脚本

Vite 中使用 Web Worker 也非常简单，我们可以在新建 Header/example.js 文件

然后在 Header 组件中引入，引入的时候注意加上?worker 后缀，相当于告诉 Vite 这是一个 Web Worker 脚本文件:

```ts
import Worker from "./example.js?worker";
// 1. 初始化 Worker 实例
const worker = new Worker();
// 2. 主线程监听 worker 的信息
worker.addEventListener("message", (e) => {
  console.log(e);
});
```

## Web Assembly 文件

Vite 对于 .wasm 文件也提供了开箱即用的支持，我们拿一个斐波拉契的 .wasm 文件，原文为 fib.js

导入内容

```tsx
import init from "./fib.wasm";

type FibFunc = (num: number) => number;

init({}).then((exports) => {
  const fibFunc = exports.fib as FibFunc;
  console.log("Fib result:", fibFunc(10));
});
```

Vite 会对.wasm 文件的内容进行封装，默认导出为 init 函数，这个函数返回一个 Promise，因此我们可以在其 then 方法中拿到其导出的成员——fib 方法

## 其它静态资源

- 媒体类文件，包括 mp4、webm、ogg、mp3、wav、flac 和 aac。
- 字体类文件。包括 woff、woff2、eot、ttf 和 otf。
- 文本类。包括 webmanifest、pdf 和 txt。

```ts
// vite.config.ts
{
  assetsInclude: [".gltf"];
}
```

## 特殊资源后缀

- ?url: 表示获取资源的路径，这在只想获取文件路径而不是内容的场景将会很有用。
- ?raw: 表示获取资源的字符串内容，如果你只想拿到资源的原始内容，可以使用这个后缀。
- ?inline: 表示资源强制内联，而不是打包成单独的文件。

# 生产优化

## 自定义部署域名

```ts
// vite.config.ts
// 是否为生产环境，在生产环境一般会注入 NODE_ENV 这个环境变量，见下面的环境变量文件配置
const isProduction = process.env.NODE_ENV === "production";
// 填入项目的 CDN 域名地址
const CDN_URL = "xxxxxx";

// 具体配置
{
  base: isProduction ? CDN_URL : "/";
}

// .env.development
NODE_ENV = development;

// .env.production
NODE_ENV = production;
```

如果有不同的 cdn 怎么办，写死，不太优雅

可以写到.env 内

```ts
VITE_IMG_BASE_URL=https://my-image-cdn.com
```

zaivite-env.d.ts 增加类型声明:

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  // 自定义的环境变量
  readonly VITE_IMG_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

某个环境变量要在 Vite 中通过 import.meta.env 访问，那么它必须以 VITE\_开头，如 VITE_IMG_BASE_URL，与 VueCli 类似

```tsx
<img src={new URL("./logo.png", import.meta.env.VITE_IMG_BASE_URL).href} />
```

## 小图片处理

```json
{
  build: {
    // 8 KB
    assetsInlineLimit: 8 * 1024
  }
}
```

> svg 格式的文件不受这个临时值的影响，始终会打包成单独的文件，因为它和普通格式的图片不一样，需要动态设置一些属性

## 图片压缩

前端的项目中经常基于它来进行图片压缩，比如 Webpack 中的 image-webpack-loader。社区当中也已经有了开箱即用的 Vite 插件——vite-plugin-imagemi

```bash
pnpm i vite-plugin-imagemin -D
```

配置文件：

```ts
//vite.config.ts
import viteImagemin from "vite-plugin-imagemin";

...
{
  plugins: [
    // 忽略前面的插件
    viteImagemin({
      // 无损压缩配置，无损压缩下图片质量不会变差
      optipng: {
        optimizationLevel: 7,
      },
      // 有损压缩配置，有损压缩下图片质量可能会变差
      pngquant: {
        quality: [0.8, 0.9],
      },
      // svg 优化
      svgo: {
        plugins: [
          {
            name: "removeViewBox",
          },
          {
            name: "removeEmptyAttrs",
            active: false,
          },
        ],
      },
    }),
  ];
}
```

打包尝试一下

## 雪碧图优化

Vite 中提供了 import.meta.glob 的语法糖来解决这种批量导入的问题，如上述的 import 语句可以写成下面这样

```ts
const icons = import.meta.glob("../../assets/icons/logo-*.svg");
```

可以看到对象的 value 都是动态 import，适合按需加载的场景。在这里我们只需要同步加载即可，可以使用 import.meta.globEager 来完成:

```ts
const icons = import.meta.globEager("../../assets/icons/logo-*.svg");
```

应用到组件中

```tsx
const iconUrls = Object.values(icons).map((mod) => mod.default);

// 组件返回内容添加如下
{
  iconUrls.map((item) => <img src={item} key={item} width="50" alt="" />);
}
```

可以看到，发送了 5 个 svg 请求

假设页面有 100 个 svg 图标，将会多出 100 个 HTTP 请求，依此类推。。。。。所以需要优化一下

合并图标的方案也叫雪碧图，我们可以通过 vite-plugin-svg-icons 来实现这个方案，首先安装一下这个插件

```bash
pnpm i vite-plugin-svg-icons -D
```

配置文件内增加

```ts
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";

{
  plugins: [
    // 省略其它插件
    createSvgIconsPlugin({
      iconDirs: [path.join(__dirname, "src/assets/icons")],
    }),
  ];
}
```

新建 SvgIcon 组件

```tsx
// SvgIcon/index.tsx
export interface SvgIconProps {
  name?: string;
  prefix: string;
  color: string;
  [key: string]: string;
}

export default function SvgIcon({
  name,
  prefix = "icon",
  color = "#333",
  ...props
}: SvgIconProps) {
  const symbolId = `#${prefix}-${name}`;

  return (
    <svg {...props} aria-hidden="true">
      <use href={symbolId} fill={color} />
    </svg>
  );
}
```

修改 header 组件

```ts
// index.tsx
const icons = import.meta.globEager("../../assets/icons/logo-*.svg");
const iconUrls = Object.values(icons).map((mod) => {
  // 如 ../../assets/icons/logo-1.svg -> logo-1
  const fileName = mod.default.split("/").pop();
  const [svgName] = fileName.split(".");
  return svgName;
});

// 渲染 svg 组件
{
  iconUrls.map((item) => (
    <SvgIcon name={item} key={item} width="50" height="50" />
  ));
}
```

在 main.tsx 中添加代码

```ts
import "virtual:svg-icons-register";
```

# 预构建

## 自动开启的

在.vite 中是产物存放目录

在浏览器访问页面后，打开 Dev Tools 中的网络调试面板，你可以发现第三方包的引入路径已经被重写:

```ts
import React from "react";
// 路径被重写，定向到预构建产物文件中
import __vite__cjsImport0_react from "/node_modules/.vite/react.js?v=979739df";
const React = __vite__cjsImport0_react.__esModule
  ? __vite__cjsImport0_react.default
  : __vite__cjsImport0_react;
```

并且对于依赖的请求结果，Vite 的 Dev Server 会设置强缓存:

```ts
Cache-Control: max-age=31536000,immutable
```

缓存过期时间被设置为一年，表示缓存过期前浏览器对 react 预构建产物的请求不会再经过 Vite Dev Server，直接用缓存结果

所有的预构建产物默认缓存在 node_modules/.vite 目录中。如果以下 3 个地方都没有改动，Vite 将一直使用缓存文件:

1.  package.json 的 dependencies 字段
2.  各种包管理器的 lock 文件
3.  optimizeDeps 配置内容

## 手动开启

1.  删除 node_modules/.vite 目录。
2.  在 Vite 配置文件中，将 server.force 设为 true。
3.  命令行执行 npx vite --force 或者 npx vite optimize。

## 自定义配置

主要是 optimizeDeps 属性

1.  入口文件——entries
2.  添加一些依赖——include

- 动态 import

```ts
// src/locales/zh_CN.js
import objectAssign from "object-assign";
console.log(objectAssign);

// main.tsx
const importModule = (m) => import(`./locales/${m}.ts`);
importModule("zh_CN");
```

动态 import 的路径只有运行时才能确定，无法在预构建阶段被扫描出来。因此，我们在访问项目时控制台会出现下面的日志信息

```bash
[vite] new dependencies found: object-assign updating...
[vite] dependencies updated, reloading page...
```

这段 log 的意思是: Vite 运行时发现了新的依赖，随之重新进行依赖预构建，并刷新页面。这个过程也叫二次预构建。在一些比较复杂的项目中，这个过程会执行很多次，如下面的日志信息所示:

```bash
[vite] new dependencies found: @material-ui/icons/Dehaze, @material-ui/core/Box, @material-ui/core/Checkbox, updating...
[vite] ✨ dependencies updated, reloading page...
[vite] new dependencies found: @material-ui/core/Dialog, @material-ui/core/DialogActions, updating...
[vite] ✨ dependencies updated, reloading page...
[vite] new dependencies found: @material-ui/core/Accordion, @material-ui/core/AccordionSummary, updating...
[vite] ✨ dependencies updated, reloading page...

```

然而，二次预构建的成本也比较大。我们不仅需要把预构建的流程重新运行一遍，还得重新刷新页面，并且需要重新请求所有的模块。尤其是在大型项目中，这个过程会严重拖慢应用的加载速度！因此，我们要尽力避免运行时的二次预构建。具体怎么做呢？你可以通过 include 参数提前声明需要按需加载的依赖:

```ts
// vite.config.ts
{
  optimizeDeps: {
    include: [
      // 按需加载的依赖都可以声明到这个数组里
      "object-assign",
    ];
  }
}
```

- 某些包被手动 exclude

exclude 是 optimizeDeps 中的另一个配置项，与 include 相对，用于将某些依赖从预构建的过程中排除。不过这个配置并不常用，也不推荐大家使用。如果真遇到了要在预构建中排除某个包的情况，需要注意它所依赖的包是否具有 ESM 格式，如下面这个例子:

```ts
{
  optimizeDeps: {
    exclude: ["@loadable/component"];
  }
}
```

就会报错。。。

刚刚手动 exclude 的包@loadable/component 本身具有 ESM 格式的产物，但它的某个依赖 hoist-non-react-statics 的产物并没有提供 ESM 格式，导致运行时加载失败。

这个时候 include 配置就派上用场了，可以强制对 hoist-non-react-statics 这个间接依赖进行预构建:

```ts
{
  optimizeDeps: {
    include: [
      // 间接依赖的声明语法，通过`>`分开, 如`a > b`表示 a 中依赖的 b
      "@loadable/component > hoist-non-react-statics",
    ];
  }
}
```

在 include 参数中，将所有不具备 ESM 格式产物包都声明一遍，这样再次启动项目就没有问题了。

- 自定义 Esbuild 行为

Vite 提供了 esbuildOptions 参数来让我们自定义 Esbuild 本身的配置，常用的场景是加入一些 Esbuild 插件:

```ts
{
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        // 加入 Esbuild 插件
      ];
    }
  }
}
```

- 特殊情况：第三方包出现问题
  如：react-virtualized
  这个库被许多组件库用到，但它的 ESM 格式产物有明显的问题，在 Vite 进行预构建的时候会直接抛出错误

1.  改第三方库代码
    我们能想到的思路是直接修改第三方库的代码，不过这会带来团队协作的问题，你的改动需要同步到团队所有成员，比较麻烦

    可以使用 patch-package 这个库来解决这类问题。一方面，它能记录第三方库代码的改动，另一方面也能将改动同步到团队每个成员。
    安装一个社区包，官网包只支持 npm 和 yarn

    ```bash
    pnpm i @milahu/patch-package-with-pnpm-support -D
    ```

    > 注意: 要改动的包在 package.json 中必须声明确定的版本，不能有~或者^的前缀

    接着，我们进入第三方库的代码中进行修改，先删掉无用的 import 语句，再在命令行输入

    ```bash
    npx patch-package react-virtualized
    ```

    现在根目录会多出 patches 目录记录第三方包内容的更改，随后我们在 package.json 的 scripts 中增加如下内容：

    ```json
    {
      "scripts": {
        // 省略其它 script
        "postinstall": "patch-package"
      }
    }
    ```

2.  加入 Esbuild 插件
    通过 Esbuild 插件修改指定模块的内容

```ts
const esbuildPatchPlugin = {
  name: "react-virtualized-patch",
  setup(build) {
    build.onLoad(
      {
        filter:
          /react-virtualized\/dist\/es\/WindowScroller\/utils\/onScroll.js$/,
      },
      async (args) => {
        const text = await fs.promises.readFile(args.path, "utf8");

        return {
          contents: text.replace(
            'import { bpfrpt_proptype_WindowScroller } from "../WindowScroller.js";',
            ""
          ),
        };
      }
    );
  },
};

// 插件加入 Vite 预构建配置
{
  optimizeDeps: {
    esbuildOptions: {
      plugins: [esbuildPatchPlugin];
    }
  }
}
```

基本内容如下

```ts
// 预构建
  optimizeDeps: {
    // 为一个字符串数组
    // entries: ["./src/main.vue"],
    // 将所有的 .vue 文件作为扫描入口
    entries: ["**/*.vue"],

    // 配置为一个字符串数组，将 `lodash-es` 和 `vue`两个包强制进行预构建
    include: ["lodash-es", "vue"],

    // 自定义esbuild
    esbuildOptions: {
      plugins: [
        // 加入 Esbuild 插件
      ]
    }

  },
```

# 双引擎架构

## Rollup

[Rollup](Rollup.md)

## Esbuild

[Esbuild](Esbuild.md)
