<template>
  <div>
    <button @click="show = !show">
      Toggle render
    </button>
    <transition name="slide-fade">
      <p v-show="show">hello</p>
    </transition>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        show: true
      }
    },
    methodes: {
      
    }
  }
</script>

<style>
/* 设置持续时间和动画函数 */
.slide-fade-enter-active {
  transition: all .3s ease;
}
.slide-fade-leave-active {
  transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active for below version 2.1.8 */ {
  transform: translateX(10px);
  opacity: 0;
}


</style>
