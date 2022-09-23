# Module Federation

Module Federation 的基本逻辑是一端导出模块，另一端导入、使用模块，实现上两端都依赖于 Webpack 5 内置的 ModuleFederationPlugin 插件：

- 对于模块生成方，需要使用 ModuleFederationPlugin 插件的 expose 参数声明需要导出的模块列表；
- 对于模块使用方，需要使用 ModuleFederationPlugin 插件的 remotes 参数声明需要从哪些地方导入远程模块。

# 简单示例

[demo](./demo/) 文件夹内有简单示例，为简化依赖管理，示例引入 lerna 实现 Monorepo 策略。

# 依赖共享

导出方需添加 shared 配置:

```diff
module.exports = {
  // ...
  plugins: [
    new ModuleFederationPlugin({
      // 可被共享的依赖模块
+     shared: {
+       lodash: {
+         requiredVersion: "^4.17.0",
+       },
+     },
    }),
  ],
  // ...
};
```

还需要修改模块导入方，添加相同的 shared 配置

requiredVersion 的作用在于限制依赖版本的上下限，实用性极高

还可以通过 shared.[lib].shareScope 属性更精细地控制依赖的共享范围

```ts
module.exports = {
  // ...
  plugins: [
    new ModuleFederationPlugin({
      // ...
      // 共享依赖及版本要求声明
      shared: {
        lodash: {
          // 任意字符串
          shareScope: "foo",
        },
      },
    }),
  ],
  // ...
};
```

shared 还有其他属性：

- singletong：强制约束多个版本之间共用同一个依赖包，如果依赖包不满足版本 requiredVersion 版本要求则报警告
- version：声明依赖包版本，缺省默认会从包体的 package.json 的 version 字段解析；
- packageName：用于从描述文件中确定所需版本的包名称，仅当无法从请求中自动确定包名称时才需要这样做
- eager：允许 webpack 直接打包该依赖库 —— 而不是通过异步请求获取库；
- import：声明如何导入该模块，默认为 shared 属性名，实用性不高，可忽略。

# 总结

- 需要使用 ModuleFederationPlugin 的 exposes 项声明哪些模块需要被导出；使用 filename 项定义入口文件名称；
- 需要使用 devServer 启动开发服务器能力。

order 应用实际导出的是路由配置文件 routes.js。而 host 则通过 MF 插件导入并消费 order 应用的组件

```ts
module.exports = {
  // ...
  plugins: [
    // 模块使用方也依然使用 ModuleFederationPlugin 插件搭建 MF 环境
    new ModuleFederationPlugin({
      // 使用 remotes 属性声明远程模块列表
      remotes: {
        // 地址需要指向导出方生成的应用入口文件
        RemoteOrder: "order@http://localhost:8081/dist/remoteEntry.js",
      },
    }),
  ],
  // ...
};
```

之后，在 host 应用中引入 order 的路由配置并应用到页面中：

```ts
import localRoutes from "./routes";
// 引入远程 order 模块
import orderRoutes from "RemoteOrder/routes";

const routes = [...localRoutes, ...orderRoutes];
// ...
```

通过这种方式，一是可以将业务代码分解为更细粒度的应用形态；二是应用可以各自管理路由逻辑，降低应用间耦合性。最终能降低系统组件间耦合度，更有利于多团队协作
