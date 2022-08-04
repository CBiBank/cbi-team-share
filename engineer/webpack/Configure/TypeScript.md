# TypeScript

从 1999 年 ECMAScript 发布第二个版本到 2015 年发布 ES6 之间十余年时间内，JavaScript 语言本身并没有发生太大变化，语言本身许多老旧特性、不合理设计、功能缺失已经很难满足日益复杂的 Web 应用场景。为了解决这一问题，社区陆续推出了一些 JavaScript 超集方言，例如 TypeScript、CoffeeScript、Flow。

其中，TypeScript 借鉴 C# 语言，在 JavaScript 基础上提供了一系列类型约束特性

如：用一个数字类型的变量 num 减去字符串类型的变量 str，这在 TypeScript 的代码编译过程就能提前发现问题，而 JavaScript 环境下则需要到启动运行后才报错。这种类型检查特性虽然一定程度上损失了语言本身的灵活性，但能够让问题在编译阶段提前暴露，确保运行阶段的类型安全性，特别适合用于构建多人协作的大型 JavaScript 项目，也因此，时至今日 TypeScript 依然是一项应用广泛的 JavaScript 超集语言。

Webpack 有很多种接入 TypeScript 的方法，包括 ts-loader、awesome-ts-loader、 babel-loader。通常可使用 ts-loader 构建 TypeScript 代码：

1.  安装依赖

```bash
npm i -D typescript ts-loader
```

2.  配置 Webpack

```ts
const path = require("path");

module.exports = {
  /* xxx */
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
};
```

- 使用 module.rules 声明对所有符合 /\.ts$/ 正则 —— 即 .ts 结尾的文件应用 ts-loader 加载器
- 使用 resolve.extensions 声明自动解析 .ts 后缀文件，这意味着代码如 import "./a.ts" 可以忽略后缀声明，简化为 import "./a" 文件

3.  创建 tsconfig.json 配置文件，并补充 TypeScript 配置信息

```json
// tsconfig.json
{
  "compilerOptions": {
    "noImplicitAny": true,
    "moduleResolution": "node"
  }
}
```

4.  执行编译命令

```
npx webpack
```

如果项目中已经使用 babel-loader，也可以选择使用 @babel/preset-typescript 规则集，借助 babel-loader 完成 JavaScript 与 TypeScript 的转码工作：

1.  安装依赖

```
npm i -D @babel/preset-typescript @babel/preset-env
```

2.  配置 Webpack

```ts
module.exports = {
  /* ... */
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-typescript"],
            },
          },
        ],
      },
    ],
  },
};
```

不过，@babel/preset-typescript 只是简单完成代码转换，并未做类似 ts-loader 的类型检查工作
