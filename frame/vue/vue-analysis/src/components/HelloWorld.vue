<template>
  <div class="hello">
    <button @click="changeLang">切换中英文：{{ $store.state.lang === 'en' ? '英文' : '中文' }}</button>
    <h1>{{ $t('首页') }}</h1>
    <!-- 简单的变量翻译 -->
    <p>{{ $t('intro', { name, age }) }}</p>
    <!-- 假如名称不仅仅是一个文案，还需要变成红色？我们该怎么办？-->
    <p v-html="$t('intro2', { name, age })"></p>
    <!-- 使用 place 属性  -->
    <i18n tag="p" path="intro">
      <span place="name" class="name">{{ name }}</span>
      <span place="age">{{ age }}</span>
    </i18n>
    <!-- 最终的方案 —— Slot  -->
    <i18n tag="p" path="intro">
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
      name: '刘熠',
      age: 18
    }
  },
  methods: {
    changeLang() {
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
