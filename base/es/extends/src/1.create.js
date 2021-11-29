// Object.create
var o1 = {}

var o2 = Object.create(null)

Object.create(obj)

Object.newCreate = function(obj) {
  var o = {}
  o.__proto__ = obj
  return o
}

var obj = {
  id: 19
}
var o = Object.create(obj, {
  name: {
    // 数据属性
    value: 'yxp',
    writable: true,
    // 公共
    enumerable: true,
    configable: true
  }
})

// Object.setPrototypeOf

var o1 = {}
var o2 = {id: 19}
Object.setPrototypeOf(o1, o2)


// Object.defineProperty(obj, prop, descriptors)
var obj = {}
Object.defineProperty(obj, 'id', {
  // 访问器属性
  get () {
    return 19
  },
  set (value) {
    obj.num = value
  },
  enumerable: true,
  configable: true
})


// Object.defineProperties(obj, propAndDescriptors)
var obj = {}
Object.defineProperties(obj, {
  id: {
    // 访问器属性
    get () {
      return 19
    },
    set (value) {
      obj.num = value
    },
    enumerable: true,
    configable: true
  },
  name: {
    // 数据属性
    value: 'yxp',
    writable: true,
    // 公共
    enumerable: true,
    configable: true
  }
})
console.log(obj)



