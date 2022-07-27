import { defineStore } from 'pinia'

// 定义并导出容器，第一个参数是容器id，必须唯一，用来将所有的容器
// 挂载到根容器上
export const indexStore = defineStore('indexStore', {
  // 定义state，用来存储状态的
  state() {
    return {
      count: 0
    }
  },
  // 定义getters，类似于computed，具有缓存功能
  getters: {},
  // 定义actions，类似于methods，用来修改state，做一些业务逻辑
  actions: {
    changeCount() {
      this.count++
    }
  }
})
