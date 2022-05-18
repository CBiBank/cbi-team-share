// 5.展开运算符

// 数组 set map 字符串 伪数组（nodeList arguments）
var list = [1, 2, 3]
console.log([...list])

var obj = {
  id: 19,
  name: 'yxp'
}

console.log({...obj})
console.log([...obj])
