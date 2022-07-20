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
