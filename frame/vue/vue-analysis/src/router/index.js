import Vue from 'vue'
import Router from './vue-router'
import HelloWorld from '@/components/HelloWorld'
import About from '@/views/About'

Vue.use(Router)

const routes = [
  {
    path: '/',
    name: 'HelloWorld',
    component: HelloWorld
  },
  {
    path: '/about',
    name: 'About',
    component: About
  }
]

export default new Router({
  routes
})
