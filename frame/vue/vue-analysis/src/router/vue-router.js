let _Vue

class VueRouter {
  constructor(options) {
    this.options = options
    const initial = window.location.hash.slice(1)
    
    // 1.new Vue({data})
    // 2.Vue.util.defineReactive obj, key, value    给obj赋值一个key属性，初始值是value，同时这个key是响应式的
    _Vue.util.defineReactive(this, 'current', initial)

    window.addEventListener('hashchange', this.onChange.bind(this))
    window.addEventListener('load', this.onChange.bind(this))
  }

  onChange() {
    console.log(this)
    this.current = window.location.hash.slice(1)
  }
}

// Vue.use的时候会直接去调用install方法，同时会将Vue传进来
VueRouter.install = function(Vue) {
  _Vue = Vue
  // 1.this.$router
  Vue.mixin({
    beforeCreate() {
      if (this.$options.router) {
        Vue.prototype.$router = this.$options.router
      }
    }
  })

  // 2.两个组件 router-view router-link
  Vue.component('router-link', {
    props: {
      to: {
        type: String,
        default: ''
      }
    },
    render(h) {
      // 1 - 标签、组件
      // 2 - 属性
      // 3 - 子标签、子组件
      // <a href="#/about">about</a>
    // children = children.concat(this.$slots.default)
      return h(
        'a',
        {
          attrs: {
            href: '#' + this.to
          }
        },
        this.$slots.default
      )
    }
  })
  Vue.component('router-view', {
    render(h) {
      // 1.拿到页面当前url
      // 2.与路由表做对比，拿到对应的conponent
      let component = null
      // this.$router.options.routes
      // this.$router.current
      const findItem = this.$router.options.routes.find(item => item.path === this.$router.current)
      if (findItem) {
        component = findItem.component
      }
      
      return h(
        component
      )
    }
  })
}

export default VueRouter