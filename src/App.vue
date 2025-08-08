<script setup lang="ts">
import UserNavigation from './components/UserNavigation.vue'
</script>

<template>
  <UserNavigation />
  <router-view />
</template>

<style>
html,body,#app{ height:100%; margin:0; }
body{ 
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans TC", sans-serif; 
  background: #f5f5f5; 
  min-height: 100vh;
  overflow-x: hidden;
}

#app {
  background: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 60px;
  position: relative;
}

/* 確保背景顏色一致 */
html {
  background: #f5f5f5;
}
</style>
