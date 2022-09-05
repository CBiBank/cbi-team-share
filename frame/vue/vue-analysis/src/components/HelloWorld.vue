<template>
  <div class="hello">
    <button @click="changeLang">切换中英文：{{ $store.state.lang === 'en' ? '英文' : '中文' }}</button>
    <h1>{{ $t('首页') }}</h1>
    <!-- 简单的变量翻译 -->
    <p>{{ $t('intro', { name, age }) }}</p>

    <!-- 假如名称不仅仅是一个文案，还需要变成红色？我们该怎么办？我们可以直接使用 v-html 渲染 html。这个时候我们就要修改翻译的字符如下 -->
    <!-- 注意：这个方法很可能引发 XSS 攻击，所以不推荐使用该方法 -->
    <p v-html="$t('intro2', { name, age })"></p>

    <!-- 使用 place 属性  -->
    <!-- 直接使用 i18n 组件以及 place 属性，其中 path 指的是上面的 key，place 指定变量  -->
    <i18n path="intro" tag="p">
      <span class="name" place="name">{{ name }}</span>
      <span place="age">{{ age }}</span>
    </i18n>

    <!-- 最终的方案 —— Slot  -->
    <i18n path="intro" tag="p">
      <template v-slot:name>
        <span class="name">{{ name }}</span>
      </template>
      <template v-slot:age>
        <span>{{ age }}</span>
      </template>
    </i18n>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data () {
    return {
      name: '小明',
      age: 18
    }
  },
  methods: {
    changeLang() {
      console.log(this.$i18n.locale)
      this.$i18n.locale = this.$i18n.locale === 'en' ? 'zh-CN' : 'en'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.hello .name {
  color: red;
}
</style>
