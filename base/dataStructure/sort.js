const swap = (arr, i, j) => {
  if (i === j) return
  const temp = arr[i]
  arr[i] = arr[j]
  arr[j] = temp
}
function findMaxValue(array) {
  let max = array[0]
  for (let i = 1; i < array.length; i++) {
    if (array[i] > max) {
      max = array[i]
    }
  }
  return max
}
/**
 * 冒泡排序
 * @param {Array} arr 需要排序的数组
 */
function bubbleSort(arr) {
  if (arr.length <= 1) return
  for (let i = 0; i < arr.length; i++) {
    let hashChange = false
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        swap(arr, j, j + 1)
        hashChange = true
      }
    }
    if (!hashChange) break
  }
  return arr
}
/**
 * 插入排序
 * @param {Array} arr 需要排序的数组
 */
function insertionSort(arr) {
  if (arr.length <= 1) return
  for (let i = 0; i < arr.length; i++) {
    const temp = arr[i]
    let j = i - 1
    // 若arr[i]前有大于arr[i]的值的化，向后移位，腾出空间，直到一个<=arr[i]的值
    for (j; j >= 0; j--) {
      if (arr[j] > temp) {
        arr[j + 1] = arr[j]
      } else {
        break
      }
    }
    arr[j + 1] = temp
  }
  return arr
}
/**
 * 选择排序
 * @param {Array} arr 需要排序的数组
 */
function selectionSort(arr) {
  if (arr.length <= 1) return
  // 需要在内层进行 i+1 后的循环，所以外层需要 数组长度 -1
  for (let i = 0; i < arr.length - 1; i++) {
    let minIndex = i
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] < arr[minIndex]) {
        minIndex = j // 找到最小数组
      }
    }
    swap(arr, i, minIndex)
  }
  return arr
}

/**
 * 快排
 */
const partition = (arr, pivot, left, right) => {
  const pivotVal = arr[pivot]
  let startIndex = left
  for (let i = left; i < right; i++) {
    if (arr[i] < pivotVal) {
      swap(arr, i, startIndex)
      startIndex++
    }
  }
  swap(arr, startIndex, pivot)
  return startIndex
}
function quickSort(arr, left, right) {
  if (left < right) {
    let pivot = right
    let partitionIndex = partition(arr, pivot, left, right)
    quickSort(arr, left, partitionIndex - 1 < left ? left : partitionIndex - 1)
    quickSort(arr, partitionIndex + 1 > right ? right : partitionIndex + 1, right)
  }

}

/**
 * 归并排序
 */
const mergeArr = (left, right) => {
  let temp = []
  let leftIndex = 0
  let rightIndex = 0
  // 判断2个数组中元素大小，依次插入数组
  while (left.length > leftIndex && right.length > rightIndex) {
    if (left[leftIndex] <= right[rightIndex]) {
      temp.push(left[leftIndex])
      leftIndex++
    } else {
      temp.push(right[rightIndex])
      rightIndex++
    }
  }
  // 合并 多余数组
  return temp.concat(left.slice(leftIndex)).concat(right.slice(rightIndex))
}

function mergeSort(arr) {
  // 当任意数组分解到只有一个时返回。
  if (arr.length <= 1) return arr
  const middle = Math.floor(arr.length / 2) // 找到中间值
  const left = arr.slice(0, middle) // 分割数组
  const right = arr.slice(middle)
  // 递归 分解 合并
  return mergeArr(mergeSort(left), mergeSort(right))
}

/**
 * 桶排序
 */
const createBuckets = (arr, bucketSize) => {
  let minValue = arr[0]
  let maxValue = arr[0]
  let i = 1
  const len = arr.length
  for (i; i < len; i++) {
    if (arr[i] < minValue) {
      minValue = arr[i]
    } else if (arr[i] > maxValue) {
      maxValue = arr[i]
    }
  }
  // 计算桶的个数
  const bucketCount = Math.floor((maxValue - minValue) / bucketSize) + 1
  // 二维数组，放桶
  const buckets = []
  for (let i = 0; i < bucketCount; i++) {
    buckets[i] = []
  }
  // 计算每一个值应该放在哪一个桶中
  for (let i = 0; i < len; i++) {
    const bucketIndex = Math.floor((arr[i] - minValue) / bucketSize)
    buckets[bucketIndex].push(arr[i])
  }
  return buckets
}
const sortBuckets = (buckets) => {
  const sortedArray = []
  for (let i = 0; i < buckets.length; i++) {
    if (buckets[i] != null) {
      insertionSort(buckets[i])
      sortedArray.push(...buckets[i])
    }
  }
  return sortedArray
}
function bucketSort(arr, bucketSize = 5) {
  if (arr.length <= 1) {
    return arr
  }
  const buckets = createBuckets(arr, bucketSize)
  return sortBuckets(buckets)
}

/**
 * 计数排序
 */
function countingSort(array) {
  if (array.length <= 1) return

  const max = findMaxValue(array)
  const counts = new Array(max + 1)

  // 计算每个元素的个数，放入到counts桶中
  // counts下标是元素，值是元素个数
  array.forEach(element => {
    if (!counts[element]) {
      counts[element] = 0
    }
    counts[element]++
  })

  // counts下标是元素，值是元素个数
  // 例如： array: [6, 4, 3, 1], counts: [empty, 1, empty, 1, 1, empty, 1]
  // i是元素, count是元素个数
  let sortedIndex = 0
  counts.forEach((count, i) => {
    while (count > 0) {
      array[sortedIndex] = i
      sortedIndex++
      count--
    }
  })
  // return array
}


const testArr = []
let i = 0
while (i < 10) {
  testArr.push(Math.floor(Math.random() * 1000))
  i++
}
console.log('unsort', testArr)
const list = bucketSort(testArr);
console.log('sort', list)
