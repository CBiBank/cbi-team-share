# 配置别名

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

# SVG 组件方式加载

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

# JSON 加载

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

# Web Worker 脚本

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

# Web Assembly 文件

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

# 其它静态资源

- 媒体类文件，包括 mp4、webm、ogg、mp3、wav、flac 和 aac。
- 字体类文件。包括 woff、woff2、eot、ttf 和 otf。
- 文本类。包括 webmanifest、pdf 和 txt。

```ts
// vite.config.ts
{
  assetsInclude: [".gltf"];
}
```

# 特殊资源后缀

- ?url: 表示获取资源的路径，这在只想获取文件路径而不是内容的场景将会很有用。
- ?raw: 表示获取资源的字符串内容，如果你只想拿到资源的原始内容，可以使用这个后缀。
- ?inline: 表示资源强制内联，而不是打包成单独的文件。
