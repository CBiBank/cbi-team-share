// 2.迭代器的定义

/*
1.本身是一个对象
2.有一个next方法
3.next执行之后 返回是一个对象
4.该对象有两个属性 value done
*/ 

var list = ['1', '2', '3']

function generator (list) {
  var index = 0
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

var iterator = generator(list)
console.log(iterator.next())
console.log(iterator.next())
console.log(iterator.next())
console.log(iterator.next())
console.log(iterator.next())
