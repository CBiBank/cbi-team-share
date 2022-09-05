import Vue from 'vue'
import VueI18n from 'vue-i18n'

import enLocale from './en.json'
import zhLocale from './zh-CN.json'
import store from '@/store'

Vue.use(VueI18n)

const messages = {
  en: {
    ...enLocale
  },
  'zh-CN': {
    ...zhLocale
  }
}
console.log(store.state.lang)
const i18n = new VueI18n({
  locale: store.state.lang,
  messages,
  silentFallbackWarn: true,
  silentTranslationWarn: true
})

export {
  i18n as default
}
