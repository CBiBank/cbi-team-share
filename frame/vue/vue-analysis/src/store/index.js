import Vue from 'vue'
// import Vuex from './kvuex'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    count: 0,
    lang: 'zh-CN'
  },
  mutations: {
    add(state) {
      state.count ++;
    },
    setLang(state, value) {
      state.lang = value || 'zh-CN'
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
