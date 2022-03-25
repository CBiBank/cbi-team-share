// const wathers = []
function defineReactive(obj, key, val) {
  // 向下递归遍历
  observe(val);
  const dep = new Dep()
  Object.defineProperty(obj, key, {
    get() {
      // console.log('get')
      Dep.target && dep.addDep(Dep.target)
      return val;
    },
    set(newVal) {
      // console.log('set')
      if (newVal !== val) {
        observe(newVal);
        val = newVal;

        dep.notify()
      }
    }
  })
}

// 自动设置一个对象的所有属性为响应式的
function observe(obj) {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  Object.keys(obj).forEach((key) => {
    defineReactive(obj, key, obj[key]);
  });
}

class Compile {
  constructor(el, vm) {
    this.$el = document.querySelector(el)
    this.$vm = vm

    // 编译
    this.compile(this.$el)
  }

  compile(el) {
    const childNodes = el.childNodes

    childNodes.forEach(node => {
      if (this.isText(node)) {
        this.compileText(node)
      } else if (node.nodeType === 1) {
        // element
        this.compileElement(node)
      }

      if (node.childNodes) {
        this.compile(node)
      }
    })
  }

  isText(node) {
    return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
  }

  compileText(node) {
    this.update(node, RegExp.$1, 'text')
    // node.textContent = this.$vm[RegExp.$1]
  }

  compileElement(node) {
    const attributes = node.attributes
    Array.from(attributes).forEach(attr => {
      // k-text="counter"
      const name = attr.name // k-text
      const value = attr.value // counter
      
      if (name.startsWith('k-')) {
        const exp = name.substring(2)
        this[exp] && this[exp](node, value)
      }
    })
  }

  update(node, exp, type) {
    // 1.初始化视图
    const fn = this[type + 'Updater']
    const value = this.$vm[exp]
    fn && fn(node, value)
    // 2.创建watcher
    new Watcher(this.$vm, exp, function(val) {
      fn && fn(node, val)
    })
  }

  textUpdater(node, value) {
    node.textContent = value
  }

  text(node, exp) {
    this.update(node, exp, 'text')
    // node.textContent = this.$vm[exp]
  }

  htmlUpdater(node, value) {
    node.innerHTML = value
  }

  html(node, exp) {
    this.update(node, exp, 'html')
    // node.innerHTML = this.$vm[exp]
  }
}

class Dep {
  constructor() {
    this.watchers = []
  }

  addDep(watcher) {
    this.watchers.push(watcher)
  }

  notify() {
    this.watchers.forEach(watcher => watcher.update())
  }
} 

class Watcher {
  constructor(vm, key, updateFn) {
    this.vm = vm
    this.key = key
    this.updateFn = updateFn

    Dep.target = this
    this.vm[key]
    Dep.target = null
  }

  update() {
    this.updateFn.call(this.vm, this.vm[this.key])
  }
}

class KVue {
  constructor(options) {
    this.$options = options
    this.$data = options.data

    // 1.数据劫持
    observe(this.$data)
    // 1.5 代理
    this.proxy()
    // 2.编译
    new Compile(options.el, this)
  }

  proxy() {
    Object.keys(this.$data).forEach(key => {
      Object.defineProperty(this, key, {
        get() {
          return this.$data[key]
        },
        set(v) {
          this.$data[key] = v
        }
      })
    })
    // Object.defineProperty
  }
}