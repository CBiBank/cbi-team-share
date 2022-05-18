// 异步任务
var url = 'https://img2.doubanio.com/img/files/file-1513305186-3.jpg'
$.ajax({
  method: 'get',
  url,
  xhrFields: {
    responseType: 'blob'
  },
  success (res) {
    var result = new Blob([res], { type: 'image/jpg'})
    var url = URL.createObjectURL(result)
    // window.open(url)
  },
  error (e) {
    console.error(e)
  }
})

// ajax
function getImage() {
  return function (success, error) {
    $.ajax({
      method: 'get',
      url,
      xhrFields: {
        responseType: 'blob'
      },
      success,
      error
    })
  }
}

function* generator () {
  var value = yield 1
  var result = yield value + 2
  yield result
  try {
    var res = yield getImage()
    console.log('res', res)
    var result = new Blob([res], { type: 'image/jpg'})
    var url = URL.createObjectURL(result)
    console.log(url)
  } catch (e) {
    console.error('e', e)
  }
  yield 'hello world'
}
// 辅助函数 自动调用迭代器的next方法
function exec (generator) {
  var iterator = generator()
  var result = iterator.next()
  function step () {
    console.log(result)
    if (!result.done) {
      if (typeof result.value === 'function') {
        // 异步
        var success = function (res) {
          result = iterator.next(res)
          step()
        }
        var error = function (err) {
          result = iterator.throw(err)
          step()
        }
        result.value(success, error)
      } else {
        // 同步
        result = iterator.next(result.value)
        step()
      }
    }
  }
  step()
}
exec(generator)
