---
title: 小程序底层架构
order: 9
nav:
 title: 框架
---

### 1.小程序底层框架（MINA）
![](https://i.loli.net/2021/11/29/fVt8P3oABZaQzW1.png)


### 2.小程序生命周期
![](https://res.wx.qq.com/wxdoc/dist/assets/img/page-lifecycle.2e646c86.png)

### 3.小程序Javascript运行环境

|     运行环境     |     逻辑层     | 渲染层           |
| :--------------: | :------------: | :----------------: |
|       iOS        | JavaScriptCore | WKWebView        |
|       安卓       |       V8       | chromium定制内核 |
| 小程序开发者工具 |      NWJS      | Chrome WebView   |


### 4.基本代码构成
- .json 后缀的 JSON 配置文件
- .wxml 后缀的 WXML 模板文件
- .wxss 后缀的 WXSS 样式文件
- .js 后缀的 JS 脚本逻辑文件


