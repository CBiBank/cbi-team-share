// 8.任务执行
/*
8-1.简单任务执行
8-2.任务执行传参
8-3.异步任务执行
*/
// 1.同步
// 2.异步
function* generator () {
  var value = yield 1
  var result = yield value + 2
  yield result
}
// 辅助函数 自动调用迭代器的next方法
function exec (generator) {
  var iterator = generator()
  var result = iterator.next()
  function step () {
    console.log(result)
    if (!result.done) {
      result = iterator.next(result.value)
      step()
    }
  }
  step()
}
exec(generator)
