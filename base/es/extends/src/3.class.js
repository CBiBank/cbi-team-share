// 1.class写法

class Factory {
  constructor (name) {
    // 实例属性
    this.name = name
    // 实例方法
    this.getInstance = function () {}
  }
  // 原型方法
  // x = 19
  getName () {
    console.log(this.name)
  }
  getPrototype () {}
  // 静态属性
  static id = 19
  // 静态方法
  static getId () {
    console.log(this.id)
  }
}

