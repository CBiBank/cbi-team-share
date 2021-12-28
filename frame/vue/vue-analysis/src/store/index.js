import Vue from 'vue'
import Vuex from './kvuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    count: 0,
  },
  mutations: {
    add(state) {
      state.count ++;
    }
  },
  actions: {
    add({commit}) {
      setTimeout(() => {
        commit('add')
      }, 1000)
    }
  },
  strict: true // 开启严格模式后，无论何时发生了状态变更且不是由 mutation 函数引起的，将会抛出错误
})
