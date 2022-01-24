---
title: 常用API
order: 1
toc: menu
nav:
  title: 常见问题
  order: 1
---

### 1.如何区分小程序当前运行环境(开发、体验、生产)

使用 `wx.getAccountInfoSync()` 获取环境信息, 以下为此方法返回值的接口签名
```ts
 wx.getAccountInfoSync(): AccountInfo

/** 帐号信息 */
interface AccountInfo {
    /** 小程序帐号信息 */
    miniProgram: MiniProgram
    /** 插件帐号信息（仅在插件中调用时包含这一项） */
    plugin: Plugin
}

/** 小程序帐号信息 */
interface MiniProgram {
    /** 小程序 appId */
    appId: string
    /** 小程序版本
     *
     * 可选值：
     * - 'develop': 开发版;
     * - 'trial': 体验版;
     * - 'release': 正式版;
     *
     * 最低基础库： `2.10.0` */
    envVersion: 'develop' | 'trial' | 'release'
    /** 线上小程序版本号
     *
     * 最低基础库： `2.10.2` */
    version: string
}


```


### 2.如何在小程序中展示loading/toast

使用`wx.showLoading()`、`wx.showToast()`

```ts
 wx.showLoading({
      title: '正在加载'
  })

wx.showToast({
  title: '成功'
})


```


### 更多API体验

使用官方示例
![](https://res.wx.qq.com/wxdoc/dist/assets/img/demo.ef5c5bef.jpg)

查看[示例源代码](https://github.com/wechat-miniprogram/miniprogram-demo)
