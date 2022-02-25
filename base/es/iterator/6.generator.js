// 6.生成器
// *
// yield 生成

// 声明形式：
function* generator () {
  yield 1
  yield 2
  yield 3
}
var iterator = generator()
console.log(iterator.next())
console.log(iterator.next())
console.log(iterator.next())
console.log(iterator.next())

// 1.yiled的返回值
function* generator () {
  var value = yield 1
  console.log(value)
  yield 2
  yield 3
}
var iterator = generator()
console.log(iterator.next())
console.log(iterator.next())
console.log(iterator.next())
console.log(iterator.next())

// 2.yield的触发时机
function* generator () {
  console.log('hello world')
  var value = yield 1
  console.log(value)
  yield 2
  yield 3
}
var iterator = generator()
console.log(iterator.next())
console.log(iterator.next())
console.log(iterator.next())

// 表达式形式：
// var generator = function* () {}
