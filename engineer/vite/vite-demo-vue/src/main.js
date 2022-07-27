import { createApp } from 'vue'
import router from './router'
import { createPinia } from 'pinia'
import App from './App.vue'

import BalmUI from 'balm-ui' // Official Google Material Components
import BalmUIPlus from 'balm-ui-plus' // BalmJS Team Material Components
import 'balm-ui-css'

const app = createApp(App)

const pinia = createPinia()

app.use(router).use(pinia).use(BalmUI).use(BalmUIPlus).mount('#app')
