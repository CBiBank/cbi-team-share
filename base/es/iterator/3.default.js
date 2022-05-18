// 3.默认迭代器

// 3-1.数组 set map 字符串 伪数组(nodeList arguments)

// [Symbol.iterator]
var list = ['1', '2', '3']
console.log(list[Symbol.iterator])

// 3-2.对象不支持迭代

var obj = {
  id: 19,
  name: 'yxp',
  [Symbol.iterator] () {
    var index = 0
    // Object.keys Object.values 利用迭代
    // var list = Object.keys(this)
    var list = []
    for (var key in this) {
      list.push(key)
    }
    return {
      next () {
        var value = list[index]
        var done = list.length <= index
        !done && index++
        return {
          value,
          done
        }
      }
    }
  }
}

for (var value of obj) {
  console.log(value)
}

console.log(typeof Symbol.iterator)
console.log(Object.getOwnPropertySymbols())
