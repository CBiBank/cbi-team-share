# Babel

ECMAScript 2015 也是 ECMAScript 6.0(简称 ES6) 版本补充了大量提升 JavaScript 开发效率的新特性，包括 class 关键字、块级作用域、ES Module 方案、代理与反射等，使得 JavaScript 可以真正被用于编写复杂的大型应用程序，但知道现在浏览器、Node 等 JavaScript 引擎都或多或少存在兼容性问题。为此，现代 Web 开发流程中通常会引入 Babel 等转译工具。

Babel 是一个开源 JavaScript 转编译器，它能将高版本 —— 如 ES6 代码等价转译为向后兼容，能直接在旧版 JavaScript 引擎运行的低版本代码

如：

```ts
// 使用 Babel 转译前
arr.map((item) => item + 1);

// 转译后
arr.map(function (item) {
  return item + 1;
});
```

高版本的箭头函数语法经过 Babel 处理后被转译为低版本 function 语法，从而能在不支持箭头函数的 JavaScript 引擎中正确执行。借助 Babel 我们既可以始终使用最新版本 ECMAScript 语法编写 Web 应用，又能确保产物在各种环境下正常运行。

Webpack 场景下，只需使用 babel-loader 即可接入 Babel 转译功能：

1.  安装依赖

```bash
npm i -D @babel/core @babel/preset-env babel-loader
```

2.  添加模块处理规则

```ts
module.exports = {
  /* ... */
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ["babel-loader"],
      },
    ],
  },
};
```

module 属性用于声明模块处理规则，module.rules 子属性则用于定义针对什么类型的文件使用哪些 Loader 处理器，上例可解读为：

- test: /\.js$/：用于声明该规则的过滤条件，只有路径名命中该正则的文件才会应用这条规则，示例中的 /\.js$/ 表示对所有 .js 后缀的文件生效
- use：用于声明这条规则的 Loader 处理器序列，所有命中该规则的文件都会被传入 Loader 序列做转译处理

3.  执行编译命令

```bash
npx webpack
```

接入后，可以使用 .babelrc 文件或 rule.options 属性配置 Babel 功能逻辑，例如：

安装@babel/preset-env

```bash
npm i -D @babel/preset-env
```

```ts
module.exports = {
  /* ... */
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
        ],
      },
    ],
  },
};
```

示例中的 @babel/preset-env 是一种 Babel 预设规则集 —— Preset，这种设计能按需将一系列复杂、数量庞大的配置、插件、Polyfill 等打包成一个单一的资源包，从而简化 Babel 的应用、学习成本。Preset 是 Babel 的主要应用方式之一，社区已经针对不同应用场景打包了各种 Preset 资源，例如：

- @babel/preset-typescript：用于转译 TypeScript 代码的规则集
- @babel/preset-flow：用于转译 Flow 代码的规则集

> 提示：关于 Babel 的功能、用法、原理还有非常大的学习空间，感兴趣的同学可以前往阅读官方文档：[babeljs.io/docs/en/](babeljs.io/docs/en/)
