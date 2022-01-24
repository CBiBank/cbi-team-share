---
title: 目录与代码
order: 0
toc: menu
nav:
  title: 示例
  order: 1
---

### 1. 目录结构

一个常见的小程序目录结构大致如下：

<Tree>
  <ul>
    <li>
      pages
      <ul>
       <li>
        page1
          <ul>
            <li>page1.js</li>
            <li>page1.wxs</li>
            <li>page1.wxss</li>
            <li>page1.json</li>
          </ul>
       </li>
       <li>page2</li>
       <li>page3</li>
      </ul>
      <small>小程序页面目录</small>
    </li>
    <li>
      utils
      <ul>
       <li>format.js</li>
       <li>number.js</li>
       <li>string.js</li>
       <li>...xxx.js</li>
      </ul>
      <small>工具类方法</small>
    </li>
    <li>
      images
      <ul>
        <li>bg.png</li>
        <li>success-icon.jpeg</li>
      </ul>
       <small>图片资源</small>
    </li>
    <li>
      app.js
      <small>小程序入口文件</small>
    </li>
    <li>
      app.wxss
      <small>小程序全局样式</small>
    </li>
    <li>
      app.json
      <small>小程序全局配置</small>
    </li>
    <li>
      README.md
       <small>项目说明</small>
    </li>
    <li>
      project.config.json
       <small>项目配置（微信开发者工具）</small>
    </li>
    <li>
      sitemap.json
       <small>项目索引声明文件，类似robot.txt （微信生态的搜索引擎）</small>
    </li>
  </ul>
</Tree>


### 2.代码示例

`project.config.json`

```json
{
    "description": "项目配置文件",
    "packOptions": {
        "ignore": []
    },
    "miniprogramRoot": "miniprogram/",
    "compileType": "miniprogram",
    "libVersion": "2.20.1",
    "projectname": "example",
    "setting": {
        "urlCheck": true, // 是否检查安全域名和 TLS 版本
        "es6": true, // 是否启用 es6 转 es5
        "enhance": true, // 是否打开增强编译
        "postcss": true, // 上传代码时样式是否自动补全
        "preloadBackgroundData": false,
        "minified": true, // 上传代码时是否自动压缩
        "newFeature": false,
        "coverView": true,
        "nodeModules": false,
        "autoAudits": false,
        "showShadowRootInWxmlPanel": true,
        "scopeDataCheck": false,
        "uglifyFileName": false,
        "checkInvalidKey": true,
        "checkSiteMap": true,
        "uploadWithSourceMap": true,
        "compileHotReLoad": false,
        "lazyloadPlaceholderEnable": false,
        "useMultiFrameRuntime": true,
        "useApiHook": true,
        "useApiHostProcess": true,
        "babelSetting": {
            "ignore": [],
            "disablePlugins": [],
            "outputPath": ""
        },
        "enableEngineNative": false,
        "useIsolateContext": true,
        "userConfirmedBundleSwitch": false,
        "packNpmManually": false,
        "packNpmRelationList": [],
        "minifyWXSS": true,
        "disableUseStrict": false,
        "showES6CompileOption": false,
        "useCompilerPlugins": [
            "typescript",
            "sass"
        ]
    },
    "simulatorType": "wechat",
    "simulatorPluginLibVersion": {},
    "appid": "xxxxxxxxxxxx",
    "condition": {}
}
```



