class SuperClass {
  constructor(name = 'super-name') {
    this.name = name
    this.age = 'super-age'
    this.job = 'super-job'
  }
  getAge() {
    return this.age
  }
  static time = 'super-time'
  static getTime() {
    // 静态方法 this 指向构造函数
    return this.time
  }
}
// SuperClass.getTime()
class SubClass extends SuperClass {
  constructor(name = 'sub-name', age = 'sub-age', job = 'sub-job') {
    // 1.super作为函数使用 指向 父类构造函数
    super(name)
    this.age = age
    // 2.super作为对象使用 指向 子类实例
    super.job = job
  }
  getSubAge() {
    // 3.super作为对象使用（在子类的原型方法上使用）指向 父类的原型，this绑定了子类实例
    return super.getAge() // SuperClass.prototype.getAge.call(this)
  }
  static time = 'sub-time'
  static getSubTime() {
    // 4.super作为对象使用（在子类的静态方法上使用）指向 父类构造函数，this绑定了子类构造函数
    return super.getTime() // SuperClass.getTime.call(this)
  }
}

const sub = new SubClass()

console.log(sub.job)
console.log(sub.getSubAge())
console.log(SubClass.getSubTime())


