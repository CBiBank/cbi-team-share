function Person(name) {
  this.name = name
}
Person.prototype.getName = function () {
  console.log(this.name)
}
var p = new Person('yxp')
Object.defineProperty(p, 'age', {
  value: 19,
  // 是否可枚举
  enumerable: false,
  writable: true,
  configable: true
})
console.log(p)

// 1.for...in 遍历原型上的属性 
// in 操作符 遍历原型上的属性 
for (var k in p) {
  console.log(k)
}

// 2.Object.keys 不会遍历 不可枚举的属性
var list1 = Object.keys(p)
console.log(list1)

// 3.Object.getOwnPropertyNames 会遍历自身所有属性
var list2 = Object.getOwnPropertyNames(p)
console.log(list2)







