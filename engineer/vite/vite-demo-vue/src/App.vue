<template>
  <HeaderVue />
  <div>
    <ui-button raised @click="handleClick">Home</ui-button>

    <router-link to="/home/home">home</router-link>
    <router-view v-slot="{ Component }">
      <keep-alive :include="/Cache/">
        <transition>
          <component :is="Component" />
        </transition>
      </keep-alive>
    </router-view>
  </div>
  <FooterVue />
</template>
<script setup>
import HeaderVue from '@/components/Header.vue'
import FooterVue from '@/components/Footer.vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const handleClick = () => {
  router.push({
    path: '/home/home'
  })
}
</script>
