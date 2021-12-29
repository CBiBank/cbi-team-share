---
title: WXML
order: 1
nav:
   title: 语法
   order: 2

---

### 1.语法与html保持一致

```html

<!-- 布局view 块级 -->
<view></view>

<!-- text 显示文字 内联 -->
<text></text>

<!-- 按钮 内联 -->
<button></button>

<!-- 输入框 内联 -->
<input />


```

### 2.数据绑定

```html
<!--wxml-->
<view> {{message}} </view>

```

```js
// page.js
Page({
  data: {
    message: 'Hello MINA!'
  }
})

```

### 3.列表渲染

```html
<!--wxml-->
<view wx:for="{{array}}"> {{item}} </view>
```

```js
// page.js
Page({
  data: {
    array: [1, 2, 3, 4, 5]
  }
})

```

### 4.条件渲染

```html
<!--wxml-->
<view wx:if="{{view == 'WEBVIEW'}}"> WEBVIEW </view>
<view wx:elif="{{view == 'APP'}}"> APP </view>
<view wx:else="{{view == 'MINA'}}"> MINA </view>
```

```js
// page.js
Page({
  data: {
    view: 'MINA'
  }
})

```

###  5,模板

```html
<!--wxml-->
<template name="staffName">
  <view>
    FirstName: {{firstName}}, LastName: {{lastName}}
  </view>
</template>

<template is="staffName" data="{{...staffA}}"></template>
<template is="staffName" data="{{...staffB}}"></template>
<template is="staffName" data="{{...staffC}}"></template>
```

```js
// page.js
Page({
  data: {
    staffA: {firstName: 'Hulk', lastName: 'Hu'},
    staffB: {firstName: 'Shang', lastName: 'You'},
    staffC: {firstName: 'Gideon', lastName: 'Lin'}
  }
})
```



更多请查看 [小程序内置组件](https://developers.weixin.qq.com/miniprogram/dev/component/)