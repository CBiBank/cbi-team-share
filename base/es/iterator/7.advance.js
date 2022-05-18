// 7.高级迭代器功能
/*
7-1.迭代器传参
7-2.迭代器抛错
7-3.生成器的return
7-4.委托生成器
*/
// 7-1.迭代器传参
function* generator () {
  var value = yield 1
  var result = yield value + 2
  yield 2
  yield result
}
var iterator = generator()
console.log(iterator.next(5)) // 1
console.log(iterator.next(5)) // 7
console.log(iterator.next(5)) // 2
console.log(iterator.next(5)) // 5

// next的传参始终影响的是上一次yield的返回值
// yield如果有返回值 就不受next传参的影响了

// 7-2.迭代器抛错
// throw()
// try...catch

function* generator () {
  var value = yield 1
  try {
    var result = yield value + 2
    yield 2 
  } catch (e) {
    console.warn(e)
  }
  yield result
}
var iterator = generator()
console.log(iterator.next(5))
console.log(iterator.next(5))
console.log(iterator.throw(5))

// 7-3.生成器的return

function* generator() {
  yield 1
  return '100'
}
var iterator = generator()
console.log(iterator.next())
console.log(iterator.next())

// 7-4.委托生成器

function* factory() {
  yield 1
  yield 2
  return 100
}

function* person() {
  var result = yield* factory()
  console.log(result)
  yield 3
}
var p = person()
console.log(p.next(1))
console.log(p.next(1))
console.log(p.next(1))
console.log(p.next(1))
