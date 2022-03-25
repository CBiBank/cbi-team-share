function defineReactive(obj, key, val) {
  // 向下递归遍历
  observe(val);

  // 创建Dep实例
  const dep = new Dep()

  Object.defineProperty(obj, key, {
    get() {
      // 依赖收集
      Dep.target && dep.addDep(Dep.target)

      return val;
    },
    set(newVal) {
      if (newVal !== val) {
        observe(newVal);
        val = newVal;
        // update()
        dep.notify()
      }
    },
  });
}

// 自动设置一个对象的所有属性为响应式的
function observe(obj) {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  // 只要obj是对象，就创建一个伴生的Observer实例
  // new Observer(obj);
  Object.keys(obj).forEach((key) => {
    defineReactive(obj, key, obj[key]);
  });
}

// 根据传入对象类型做相应的响应化处理
class Observer {
  constructor(value) {
    if (Array.isArray(value)) {
      // todo
    } else {
      this.walk(value);
    }
  }

  walk(obj) {
    Object.keys(obj).forEach((key) => {
      defineReactive(obj, key, obj[key]);
    });
  }
}

// 将data中的所有属性代理到KVue实例上方便用户使用
function proxy(vm) {
  Object.keys(vm.$data).forEach((key) => {
    Object.defineProperty(vm, key, {
      get() {
        return vm.$data[key];
      },
      set(v) {
        vm.$data[key] = v;
      },
    });
  });
}

class KVue {
  constructor(options) {
    this.$options = options;
    this.$data = options.data;

    // 1.数据响应式
    observe(this.$data);

    // 1.5代理
    proxy(this);

    // 2.编译
    new Compile("#app", this);
  }
}

// 将宿主的模板编译，获取它里面的动态内容，找到相关
// 依赖并且生成watcher
// new Compile('#app', vm)
class Compile {
  constructor(el, vm) {
    // 1.获取模板
    this.$el = document.querySelector(el);
    this.$vm = vm;

    // 2.执行编译
    this.compile(this.$el);
  }

  // 递归遍历el
  compile(el) {
    // 获取所有子节点
    const childNodes = el.childNodes;
    childNodes.forEach((node) => {
      // 判断节点类型
      if (node.nodeType === 1) {
        // element
        this.compileElement(node);
      } else if (this.isInter(node)) {
        // text
        this.compileText(node);
      }

      // 判断是否存在孩子
      if (node.childNodes) {
        this.compile(node);
      }
    });
  }

  // 判断是否是插值绑定 {{xxx}}
  isInter(node) {
    return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent);
  }

  // 初始化显示，watcher创建
  update(node, exp, dir) {
    // 1.初始化
    const fn = this[dir + "Updater"];
    fn && fn(node, this.$vm[exp]);
    // 2.更新：创建watcher
    new Watcher(this.$vm, exp, function(val) {
      fn && fn(node, val);
    });
  }

  // 节点更新实操方法
  textUpdater(node, val) {
    node.textContent = val;
  }

  // 编译文本
  compileText(node) {
    this.update(node, RegExp.$1, "text");
  }

  // k-text
  text(node, exp) {
    this.update(node, exp, "text");
  }

  // k-html
  html(node, exp) {
    this.update(node, exp, "html");
  }

  htmlUpdater(node, val) {
    node.innerHTML = val;
  }

  compileElement(node) {
    // 遍历元素所有特性，判断是否动态
    let nodeAttrs = node.attributes;
    Array.from(nodeAttrs).forEach((attr) => {
      // k-text="counter"
      const attrName = attr.name; // k-text
      const exp = attr.value; // counter
      // 判断是否是一个指令
      if (attrName.startsWith("k-")) {
        // 获取指令名称
        const dir = attrName.substring(2); // text
        // 执行dir对应的方法
        this[dir] && this[dir](node, exp);
      }
    });
  }
}

// 负责更新视图，它和依赖一一对应
class Watcher {
  constructor(vm, key, update) {
    this.vm = vm;
    this.key = key;
    this.updateFn = update;
    // 触发依赖收集
    Dep.target = this
    this.vm[this.key]
    Dep.target = null
    console.log(Dep)
  }

  // Dep未来会通知更新
  update() {
    this.updateFn.call(this.vm, this.vm[this.key]);
  }
}

// 依赖：和响应式对象的key一一对应
class Dep {
  constructor() {
    this.deps = []
  }

  addDep(dep) {
    this.deps.push(dep);
  }

  notify() {
    this.deps.forEach((dep) => dep.update());
  }
}
