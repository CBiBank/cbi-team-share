- 参考 尤大的项目：[vue-hackernews-2.0](https://github.com/vuejs/vue-hackernews-2.0)

# 预渲染

## [prerender-spa-plugin](https://github.com/chrisvfritz/prerender-spa-plugin) 插件


简单配置：
```js
const path = require("path");
const PrerenderSPAPlugin = require("prerender-spa-plugin");

module.exports = {
  plugins: [
    ...new PrerenderSPAPlugin({
      // Required - The path to the webpack-outputted app to prerender.
      staticDir: path.join(__dirname, "dist"),
      // Required - Routes to render.
      routes: ["/", "/about", "/some/deep/nested/route"],
    }),
  ],
};
```

# webpack-demo
结合 `vue` 官方提供插件 `vue-server-renderer` 进行配置，通过开启服务

## 项目说明

# `nuxt` 项目搭建

## 项目说明

```bash
yarn create nuxt-app <项目名>
```

然后进行配置选择即可
