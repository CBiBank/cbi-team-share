// 1.原型式继承
Object.create()

// 2.原型链继承
function Factory (name) {
  this.name = name
  this.list = [1,2,3]
}
Factory.prototype.getName = function () {
  console.log(this.name)
}

function Person () {
}
Person.prototype = new Factory()

var p = new Person()
console.log(p)

// 3.构造函数继承
function Factory (name) {
  this.name = name
  this.list = [1,2,3]
}
Factory.prototype.getName = function () {
  console.log(this.name)
}
function Person () {
  Factory.call(this, 'yxp')
}

var p = new Person()
console.log(p)

// 4.组合继承
// 原型链继承 + 构造函数继承
function Factory (name) {
  this.name = name
  this.list = [1,2,3]
}
Factory.prototype.getName = function () {
  console.log(this.name)
}

function Person () {
  Factory.call(this, 'yxp')
}
Person.prototype = new Factory()

var p = new Person()
console.log(p)

// 5.寄生式继承 => 原型式继承的拓展
function Factory (name) {
  this.name = name
  this.list = [1,2,3]
}
Factory.prototype.getName = function () {
  console.log(this.name)
}

function Person () {
}
Person.prototype = Object.create(Factory.prototype)
Person.prototype.constructor = Person
Person.prototype.getId = function () {
  console.log(this.id)
}

var p = new Person()
console.log(p)

// 6.寄生组合式继承
function Factory (name) {
  this.name = name
  this.list = [1,2,3]
}
Factory.prototype.getName = function () {
  console.log(this.name)
}

function Person (name) {
  Factory.call(this, name)
}

Person.prototype = Object.create(Factory.prototype)
Person.prototype.constructor = Person
Person.prototype.getId = function () {
  console.log(this.id)
}

var p = new Person('yxp')
console.log(p)

// 7.class 继承
