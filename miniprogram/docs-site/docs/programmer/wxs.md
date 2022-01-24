---
title: WXS（WeiXin Script)
---

### 1.wxs标签
类似html中的`script`, 可直接在标签内编写逻辑代码

```js
<wxs module="m1">
var getMax = function(array) {
  var max = undefined;
  for (var i = 0; i < array.length; ++i) {
    max = max === undefined ?
      array[i] :
      (max >= array[i] ? max : array[i]);
  }
  return max;
}

module.exports.getMax = getMax;
</wxs>
```
