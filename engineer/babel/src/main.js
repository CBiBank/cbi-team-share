
// 0.ESM
import utils from './utils'
utils.getName()

import '@babel/polyfill'
// import 'core-js/stable'
// import 'regenerator-runtime/runtime'
// 1.arrow function
const arrowFun = () => {
  console.log('arrow-function', this)
}

// 2.class
class Factory {
  constructor(name, age) {
    this.name = name
    this.age = age
    this.hobbyMap = {
      read: true,
      write: true
    }
  }
  getName() {
    return this.name
  }
  static say() {
    alert('hello')
  }
}
Factory.play = function() {
  alert('play')
}
class Person extends Factory {
  constructor(name, age, job) {
    // super(name)
    this.age = age
    this.job = job
  }
  getJob() {
    return this.job
  }
}
var p = new Person('yxp', 19, 'programmer')

// 3.promise es6新增
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    if (Math.random() * 10 >= 5) {
      resolve('大于5')
    } else {
      reject('小于5')
    }
  }, 2000)
})
promise.then(res => console.log(res))

// 4.async await es7 需要polyfill 否则执行代码报错 regeneratorRuntime不存在
async function fn() {
  try {
    const result = await promise
    console.log(result)
  } catch(err) {
    console.warn('error', err)
  }
  console.log('--- after promise ---')
}

fn()

// 5.includes
const flag = [1, 2, 3].includes(1)
console.log('includes', flag)

exports.default =  {
  name: 'yxp'
} 
