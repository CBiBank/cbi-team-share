
// 典型的闭包 函数内部的变量key, value通过内部的方法 set get暴露出去， 变量key, value保存在内存中
function defineReactive(obj, key, value) {
  observe(value)
  Object.defineProperty(obj, key, {
    get () {
      console.log('get', key, value)
      return value
    },
    set (newValue) {
      if (newValue !== value) {
        value = newValue
        console.log('set', key, value)
      }
    }
  })
}

class Vue {
  constructor(options) {
    this.options = options
    this.$data = this.options.data

    proxy(this)
  }

  proxy(vm) {
    // Object.defineProperty(vm, )
  }
}

// Vue.set
function set(obj, key, value) {
  defineReactive(obj, key, value)
}

function observe(obj) {
  if (typeof obj !== 'object' || !obj) return obj
  Object.keys(obj).forEach(key => {
    defineReactive(obj, key, obj[key])
  })
}

const obj = {
  foo: 'foo',
  bar: 'bar',
  abc: {
    ls: {
      ls1: '111'
    }
  }
}
observe(obj)
// obj.abc
// obj.abc.ls
// set(obj, 'xxx', '1111143333')
// obj.xxx
// obj.xxx = '22222'