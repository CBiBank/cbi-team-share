// 4.内置迭代器

// 数组 set map 字符串 伪数组（nodeList arguments）

/*
entries()
keys()
values()

Object.entries() Object.keys() Object.values()
*/ 

var arr = [1, 2, 3]
var set = new Set(['1', '2', '3'])
var map = new Map([['id', 19], ['name', 'yxp']])

console.log('arr', arr.entries())
console.log('arr', arr.keys())
console.log('arr', arr.values())

console.log('set', set.entries())
console.log('set', set.keys())
console.log('set', set.values())

console.log('map', map.entries())
console.log('map', map.keys())
console.log('map', map.values())