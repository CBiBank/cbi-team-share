<template>
  <div>
    <p>home {{ counter.count }}</p>
    <ui-button raised @click="handleClick">Raised</ui-button>
  </div>
</template>

<script setup>
// import { storeToRefs } from 'pinia'
import { indexStore } from '@/store/index'
const counter = indexStore()

const handleClick = () => {
  counter.count++
  // 带自动补全
  counter.$patch({ count: counter.count + 1 })
  // 或使用 action 代替
  counter.changeCount()
}
</script>
