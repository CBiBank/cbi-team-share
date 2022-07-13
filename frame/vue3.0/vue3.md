## vue 3说明
  ### vue3.x官方地址： https://v3.cn.vuejs.org/guide/migration/migration-build.html#%E5%87%86%E5%A4%87%E5%B7%A5%E4%BD%9C

  ### 已知的限制
  虽然我们已经努力使迁移构建版本尽可能地模拟 Vue 2 的行为，但仍有一些限制可能会阻止应用的顺利升级：

  1、基于 Vue 2 内部 API 或文档中未记载行为的依赖。最常见的情况就是使用 VNodes 上的私有 property。如果你的项目依赖诸如 Vuetify、Quasar 或 Element UI 等组件库，那么最好等待一下它们的 Vue 3 兼容版本。

  2、对 IE11 的支持：Vue 3 已经官方放弃对 IE11 的支持。如果仍然需要支持 IE11 或更低版本，那你仍需继续使用 Vue 2。

  3、服务端渲染：该迁移构建版本可以被用于服务端渲染，但是迁移一个自定义的服务端渲染配置还有很多工作要做。大致的思路是将 vue-server-renderer 替换为 @vue/server-renderer。Vue 3 不再提供一个包渲染器，且我们推荐使用 Vite 以支持 Vue 3 服务端渲染。如果你正在使用 Nuxt.js，可以尝试 Nuxt Bridge，一个 Nuxt.js 2 到 3 的兼容层。对于复杂、生产环境的项目来说，可能最好还是等待一下 Nuxt 3 (目前处于 beta 阶段)。

### 全局api
  #### 创建应用实例
  调用 createApp 返回一个应用实例，一个 Vue 3 中的新概念。

  ``` javascript
    import { createApp } from 'vue'

    const app = createApp({})
  ```
  初始化后，应用实例 app 可通过 app.mount(domTarget) 挂载根组件实例：

  ``` javascript
    import { createApp } from 'vue'
    import MyApp from './MyApp.vue'

    const app = createApp(MyApp)
    app.mount('#app')
  ```

  #### 全局 API Treeshaking

  vue 2中，如Vue.nextTick() 是一个直接暴露在单个 Vue 对象上的全局 API，但是，如果你从来都没有过手动操作 DOM 的必要，在这种情况下，nextTick() 的代码就会变成死代码——也就是说，代码写了，但从未使用过。如 webpack 这样的模块打包工具支持 tree-shaking。遗憾的是，由于之前的 Vue 版本中的代码编写方式，如 Vue.nextTick() 这样的全局 API 是不支持 tree-shake 的，不管它们实际上是否被使用了，都会被包含在最终的打包产物中。

  在 Vue 3 中，全局和内部 API 都经过了重构，并考虑到了 tree-shaking 的支持。因此，对于 ES 模块构建版本来说，全局 API 现在通过具名导出进行访问。例如，我们之前的代码片段现在应该如下所示：

  ``` javascript
    import { nextTick } from 'vue'

    nextTick(() => {
      // 一些和 DOM 有关的东西
    })
  ```
  受影响的 API

  Vue 2.x 中的这些全局 API 受此更改的影响：

  1、Vue.nextTick
  2、Vue.observable (用 Vue.reactive 替换)
  3、Vue.version
  4、Vue.compile (仅完整构建版本)
  5、Vue.set (仅兼容构建版本)
  6、Vue.delete (仅兼容构建版本)

###  异步组件

  以前，异步组件是通过将组件定义为返回 Promise 的函数来创建的，例如：

  ``` javascript
    const asyncModal = () => import('./Modal.vue')
  ```

  或者，对于带有选项的更高阶的组件语法：

  ``` javascript
    const asyncModal = {
      component: () => import('./Modal.vue'),
      delay: 200,
      timeout: 3000,
      error: ErrorComponent,
      loading: LoadingComponent
    }
  ```

  现在，在 Vue 3 中，由于函数式组件被定义为纯函数，因此异步组件需要通过将其包裹在新的 defineAsyncComponent 助手方法中来显式地定义：
  https://v3.cn.vuejs.org/guide/migration/async-components.html#_3-x-%E8%AF%AD%E6%B3%95

  ``` javascript
  import { defineAsyncComponent } from 'vue'
  import ErrorComponent from './components/ErrorComponent.vue'
  import LoadingComponent from './components/LoadingComponent.vue'

  // 不带选项的异步组件
  const asyncModal = defineAsyncComponent(() => import('./Modal.vue'))

  // 带选项的异步组件
  const asyncModalWithOptions = defineAsyncComponent({
    loader: () => import('./Modal.vue'),
    delay: 200,
    timeout: 3000,
    errorComponent: ErrorComponent,
    loadingComponent: LoadingComponent
  })
  ```

### Teleport

  Teleport 提供了一种干净的方法，允许我们控制在 DOM 中哪个父节点下渲染了 HTML，而不必求助于全局状态或将其拆分为两个组件

  ``` javascript
    app.component('modal-button', {
      template: `
        <button @click="modalOpen = true">
            Open full screen modal! (With teleport!)
        </button>

        <teleport to="body">
          <div v-if="modalOpen" class="modal">
            <div>
              I'm a teleported modal! 
              (My parent is "body")
              <button @click="modalOpen = false">
                Close
              </button>
            </div>
          </div>
        </teleport>
      `,
      data() {
        return { 
          modalOpen: false
        }
      }
    })
  ```


### $attrs包含class & style

Vue 2 的虚拟 DOM 实现对 class 和 style attribute 有一些特殊处理。因此，与其它所有 attribute 不一样，它们没有被包含在 $attrs 中。

vue 3 $attrs 包含了所有的 attribute，这使得把它们全部应用到另一个元素上变得更加容易了。

  #### 移除 $listeners

    $listeners 对象在 Vue 3 中已被移除。事件监听器现在是 $attrs 的一部分：

    在 Vue 2 中，你可以通过 this.$attrs 访问传递给组件的 attribute，以及通过 this.$listeners 访问传递给组件的事件监听器。结合 inheritAttrs: false，开发者可以将这些 attribute 和监听器应用到根元素之外的其它元素：

    ``` html
      <template>
        <label>
          <input type="text" v-bind="$attrs" v-on="$listeners" />
        </label>
      </template>
      <script>
        export default {
          // 结合 inheritAttrs: false，开发者可以将这些 attribute 和监听器应用到根元素之外的其它元素
          inheritAttrs: false
        }
      </script>
    ```

    在 Vue 3 的虚拟 DOM 中，事件监听器现在只是以 on 为前缀的 attribute，这样它就成为了 $attrs 对象的一部分，因此 $listeners 被移除了。

    ``` html
      <template>
        <label>
          <input type="text" v-bind="$attrs" />
        </label>
      </template>
      <script>
      export default {
        inheritAttrs: false
      }
      </script>
    ```

    如果这个组件接收一个 id attribute 和一个 v-on:close 监听器，那么 $attrs 对象现在将如下所示:

    ``` json
      {
        id: 'my-input',
        onClose: () => console.log('close 事件被触发')
      }
    ```

### 移除 $children

在 2.x 中，开发者可以使用 this.$children 访问当前实例的直接子组件

vue 3 中，只能使用$refs

### 自定义指令

在 Vue 2 中，自定义指令通过使用下列钩子来创建，以对齐元素的生命周期，它们都是可选的：

bind - 指令绑定到元素后调用。只调用一次。
inserted - 元素插入父 DOM 后调用。
update - 当元素更新，但子元素尚未更新时，将调用此钩子。
componentUpdated - 一旦组件和子级被更新，就会调用这个钩子。
unbind - 一旦指令被移除，就会调用这个钩子。也只调用一次。

 ``` html
    <p v-highlight="'yellow'">以亮黄色高亮显示此文本</p>
  ```

  ``` javascript
    Vue.directive('highlight', {
      bind(el, binding, vnode) {
        el.style.background = binding.value
      }
    })
  ```

然而，在 Vue 3 中，我们为自定义指令创建了一个更具凝聚力的 API。正如你所看到的，它们与我们的组件生命周期方法有很大的不同，即使钩子的目标事件十分相似。我们现在把它们统一起来了：

created - 新增！在元素的 attribute 或事件监听器被应用之前调用。
bind → beforeMount
inserted → mounted
beforeUpdate：新增！在元素本身被更新之前调用，与组件的生命周期钩子十分相似。
update → 移除！该钩子与 updated 有太多相似之处，因此它是多余的。请改用 updated。
componentUpdated → updated
beforeUnmount：新增！与组件的生命周期钩子类似，它将在元素被卸载之前调用。
unbind -> unmounted

最终的 API 如下：

``` javascript
  const MyDirective = {
    created(el, binding, vnode, prevVnode) {}, // 新增
    beforeMount() {},
    mounted() {},
    beforeUpdate() {}, // 新增
    updated() {},
    beforeUnmount() {}, // 新增
    unmounted() {}
  }
```

### Data选项

非兼容：组件选项 data 的声明不再接收纯 JavaScript object，而是接收一个 function。

  在 2.x 中，开发者可以通过 object 或者是 function 定义 data 选项。
  在 3.x 中，data 选项已标准化为只接受返回 object 的 function。


非兼容：当合并来自 mixin 或 extend 的多个 data 返回值时，合并操作现在是浅层次的而非深层次的 (只合并根级属性)。

  当来自组件的 data() 及其 mixin 或 extends 基类被合并时，合并操作现在将被浅层次地执行：

  ``` javascript
  const Mixin = {
    data() {
      return {
        user: {
          name: 'Jack',
          id: 1
        }
      }
    }
  }

  const CompA = {
    mixins: [Mixin],
    data() {
      return {
        user: {
          id: 2
        }
      }
    }
  }
```

在 Vue 2.x 中，生成的 $data 是：
 ``` javascript
  {
    "user": {
      "id": 2,
      "name": "Jack"
    }
  }
 ```

在 3.0 中，其结果将会是：
 ``` javascript
  {
    "user": {
      "id": 2
    }
  }
 ```

### 事件 API

  时间总线中$on，$off 和 $once 实例方法已被移除，组件实例不再实现事件触发接口

### 过滤器

  从 Vue 3.0 开始，过滤器已移除，且不再支持。

  在 3.x 中，过滤器已移除，且不再支持。取而代之的是，我们建议用方法调用或计算属性来替换它们。

  如果在应用中全局注册了过滤器，那么在每个组件中用计算属性或方法调用来替换它可能就没那么方便了。取而代之的是，你可以通过全局属性以让它能够被所有组件使用到：

   ``` javascript
    // main.js
    const app = createApp(App)

    app.config.globalProperties.$filters = {
      currencyUSD(value) {
        return '$' + value
      }
    }
  ```

  ``` html
    <template>
      <h1>Bank Account Balance</h1>
      <p>{{ $filters.currencyUSD(accountBalance) }}</p>
    </template>
  ```

### 片段
  Vue 3 现在正式支持了多根节点的组件，也就是片段！

### 函数式组件

  函数组件(不要与 Vue 的 render 函数混淆)是一个不包含状态和实例的组件。 简单的说,就是组件不支持响应式,并且不能通过 this 关键字引用自己。

  在 Vue 2 中，需要声明functional: true, 函数式组件主要有两个应用场景：

  作为性能优化，因为它们的初始化速度比有状态组件快得多
  返回多个根节点
  然而，在 Vue 3 中，有状态组件的性能已经提高到它们之间的区别可以忽略不计的程度。此外，有状态组件现在也支持返回多个根节点。

  因此，函数式组件剩下的唯一应用场景就是简单组件，比如创建动态标题的组件。否则，建议你像平常一样使用有状态组件

### 按键修饰符

  非兼容：不再支持使用数字 (即键码) 作为 v-on 修饰符
  非兼容：不再支持 config.keyCodes

  从 KeyboardEvent.keyCode 已被废弃开始，Vue 3 继续支持这一点就不再有意义了。因此，现在建议对任何要用作修饰符的键使用 kebab-cased (短横线) 名称。

  ``` html
    <!-- Vue 3 在 v-on 上使用按键修饰符 -->
    <input v-on:keyup.page-down="nextPage">

    <!-- 同时匹配 q 和 Q -->
    <input v-on:keypress.q="quit">
  ```

### 生成 prop 默认值的工厂函数不再能访问 this

### 移除v-on.native修饰符 emits选项

    Vue 3 现在提供一个 emits 选项，和现有的 props 选项类似。这个选项可以用来定义一个组件可以向其父组件触发的事件。

    强烈建议使用 emits 记录每个组件所触发的所有事件。

    这尤为重要，因为我们移除了 .native 修饰符。任何未在 emits 中声明的事件监听器都会被算入组件的 $attrs，并将默认绑定到组件的根节点上。

### v-model

    以下是对变化的总体概述：

    非兼容：用于自定义组件时，v-model prop 和事件默认名称已更改：
    prop：value -> modelValue；
    事件：input -> update:modelValue；
    非兼容：v-bind 的 .sync 修饰符和组件的 model 选项已移除，可在 v-model 上加一个参数代替；
    新增：现在可以在同一个组件上使用多个 v-model 绑定；
    新增：现在可以自定义 v-model 修饰符。

### v-if 与 v-for 的优先级对比

    两者作用于同一个元素上时，v-if 会拥有比 v-for 更高的优先级。

### v-bind 合并行为

    在一个元素上动态绑定 attribute 时，同时使用 v-bind="object" 语法和独立 attribute 是常见的场景。然而，这就引出了关于合并的优先级的问题。

    在 2.x 中，如果一个元素同时定义了 v-bind="object" 和一个相同的独立 attribute，那么这个独立 attribute 总是会覆盖 object 中的绑定。

    ``` html
      <!-- 模板 -->
      <div id="red" v-bind="{ id: 'blue' }"></div>
      <!-- 结果 -->
      <div id="red"></div>
    ```

    在 3.x 中，如果一个元素同时定义了 v-bind="object" 和一个相同的独立 attribute，那么绑定的声明顺序将决定它们如何被合并。换句话说，相对于假设开发者总是希望独立 attribute 覆盖 object 中定义的内容，现在开发者能够对自己所希望的合并行为做更好的控制。

    ``` html
      <!-- 模板 -->
      <div id="red" v-bind="{ id: 'blue' }"></div>
      <!-- 结果 -->
      <div id="blue"></div>

      <!-- 模板 -->
      <div v-bind="{ id: 'blue' }" id="red"></div>
      <!-- 结果 -->
      <div id="red"></div>
    ```

### 生命周期

    与 2.x 版本生命周期相对应的组合式 API

    beforeCreate -> 使用 setup()
    created -> 使用 setup()
    beforeMount -> onBeforeMount
    mounted -> onMounted
    beforeUpdate -> onBeforeUpdate
    updated -> onUpdated
    beforeUnmount -> onBeforeUnmount
    unmounted -> onUnmounted
    errorCaptured -> onErrorCaptured
    renderTracked -> onRenderTracked
    renderTriggered -> onRenderTriggered
    activated -> onActivated
    deactivated -> onDeactivated

### Composition Api

  #### setup

    在新版的生命周期函数，可以按需导入到组件中，且只能在setup()函数中使用.
    setup()函数是vue3中专门新增的方法，可以理解为Composition Api的入口.
    执行时机 - 在beforecreate之后，create之前执行.
    接收props数据

    ``` javascript
      export default {
        props: {
          msg: {
            type: String,
            default: () => {}
          }
        },
        setup(props) {
          console.log(props);
        }
      }
    ```

    setup()的第二个参数是一个上下文对象，这个上下文对象大致包含了这些属性,注意：在setup()函数中无法访问this

    ``` javascript
      const MyComponent = {
        setup(props, context) {
          context.attrs
          context.slots
          context.emit
        }
      }
    ```

  #### reactive

    reactive是用来创建一个响应式对象，等价于2.x的Vue.observable

    ``` html
      <template>
        <div>
          <p @click="incment()">
            click Me!
          </p>
          <p>
            一:{{ state.count }} 二: {{ state.addCount }}
          </p>
        </div>
      </template>
      
      <script>
    ```

    ``` javascript
      import { reactive } from 'vue';
      export default {
        setup () {
          const state = reactive({ // 创建响应式数据
            count: 0,
            addCount: 0
          });
  
          function incment () {
            state.count++;
            state.addCount = state.count * 2;
          }
          
          return {
            state,
            incment
          };
        }
      }
      </script>
    ```
  
  #### ref

    接受一个内部值并返回一个响应式且可变的 ref 对象。ref 对象仅有一个 .value property，指向该内部值。

    ``` javascript
      const count = ref(0)
      console.log(count.value) // 0

      count.value++
      console.log(count.value) // 1
    ```

### toRefs

    将响应式对象转换为普通对象，其中结果对象的每个 property 都是指向原始对象相应 property 的 ref

    ``` javascript
      const state = reactive({
        foo: 1,
        bar: 2
      })

      const stateAsRefs = toRefs(state)
      /*
      stateAsRefs 的类型:

      {
        foo: Ref<number>,
        bar: Ref<number>
      }
      */

      // ref 和原始 property 已经“链接”起来了
      state.foo++
      console.log(stateAsRefs.foo.value) // 2

      stateAsRefs.foo.value++
      console.log(state.foo) // 3
    ```

### toRef

    可以用来为源响应式对象上的某个 property 新创建一个 ref。然后，ref 可以被传递，它会保持对其源 property 的响应式连接。

    ``` javascript
      const state = reactive({
        foo: 1,
        bar: 2
      })

      const fooRef = toRef(state, 'foo')

      fooRef.value++
      console.log(state.foo) // 2

      state.foo++
      console.log(fooRef.value) // 3
    ```

### computed

### watch

### 怎么优雅的封装

    https://blog.csdn.net/u011068996/article/details/111337403