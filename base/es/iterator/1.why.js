// 1.为什么需要迭代器

var list = [1, 2, 3, 4]

// for (var i = 0; i < list.length; i++)

// 1.冗余
// 2.直接

for (var value of list) {
  console.log(value)
}

