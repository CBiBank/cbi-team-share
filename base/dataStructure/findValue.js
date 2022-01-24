

const swap = (arr, i, j) => {
  if (i === j) return;
  let tmp = arr[i];
  arr[i] = arr[j];
  arr[j] = tmp;
}
/**
 * 查找最大值
 */
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
 * 二分查找,查找下标
 */
// 数组必须有序
function biaryFind(sortedArr, target) {
  if (sortedArr.length === 0) return -1
  let low = 0
  let high = sortedArr.length - 1
  while (low <= high) {
    // const mid = Math.floor((low + high) / 2)
    // 优化
    const mid = low + ((high - low) >> 1)

    if (target === sortedArr[mid]) {
      return mid
    } else if (target < sortedArr[mid]) {
      high = mid - 1
    } else {
      low = mid + 1
    }
  }
  return -1
}

// 查找第一个等于给定值
function biaryFindFirst(sortedArr, target) {
  if (sortedArr.length === 0) return -1
  let low = 0
  let high = sortedArr.length - 1
  while (low <= high) {
    const mid = low + ((high - low) >> 1)

    if (target < sortedArr[mid]) {
      high = mid - 1
    } else if (target > sortedArr[mid]) {
      low = mid + 1
    } else {
      if (mid === 0 || sortedArr[mid - 1] < target) return mid
      high = mid - 1
    }
  }
  return -1
}

// 查找最后一个相等的数
function biaryFindLast(sortedArr, target) {
  if (sortedArr.length === 0) return -1
  let low = 0
  let high = sortedArr.length - 1
  while (low <= high) {
    const mid = low + ((high - low) >> 1)
    if (target < sortedArr[mid]) {
      high = mid - 1
    } else if (target > sortedArr[mid]) {
      low = mid + 1
    } else {
      if (mid === sortedArr.length - 1 || sortedArr[mid + 1] > target) return mid
      low = mid + 1
    }
  }
  return -1
}

// 查找第一个大于等于给定值的元素
function biaryFindFistBig(sortedArr, target) {
  if (sortedArr.length === 0) return -1
  let low = 0
  let high = sortedArr.length - 1
  while (low <= high) {
    const mid = low + ((high - low) >> 1)
    if (target <= sortedArr[mid]) {
      if (mid === 0 || sortedArr[mid - 1] < target) return mid
      high = mid - 1
    } else {
      low = mid + 1
    }
  }
  return -1
}

// 查找最后一个小于等于给定值的元素
function biaryFindLastSmall(sortedArr, target) {
  if (sortedArr.length === 0) return -1
  let low = 0
  let high = sortedArr.length - 1
  while (low <= high) {
    const mid = low + ((high - low) >> 1)
    if (target < sortedArr[mid]) {
      high = mid - 1
    } else {
      if (mid === sortedArr.length - 1 || sortedArr[mid + 1] >= target) return mid
      low = mid + 1
    }
  }
  return -1
}
/**
 * 第k大的数
 * @param {array} arr 
 * @param {number} k  
 */
const partition = (arr, start, end) => {
  let i = start;
  let pivot = arr[end];
  for (let j = start; j < end; j++) {
    if (arr[j] < pivot) {
      swap(arr, i, j);
      i += 1;
    }
  }
  swap(arr, i, end);
  return i;
}

function KthNum(arr, k) {
  const len = arr.length;
  if (k > len) {
    return -1;
  }
  let p = partition(arr, 0, len - 1);
  while (p + 1 !== k) {
    if (p + 1 > k) {
      p = partition(arr, 0, p - 1);
    } else {
      p = partition(arr, p + 1, len - 1);
    }
  }
  return arr[p];
}

