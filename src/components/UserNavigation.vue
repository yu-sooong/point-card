<script lang="ts" setup>
import { useRouter, useRoute } from 'vue-router'
import { ref } from 'vue'

const router = useRouter()
const route = useRoute()
const isSwitching = ref(false)

const users = [
  { name: '森森', path: '/E-Ting' },
  { name: '松松', path: '/S-Ting' }
]

async function switchUser(userPath: string) {
  if (route.path === userPath) return // 如果已經是當前路徑，不重複切換
  
  isSwitching.value = true
  await router.push(userPath)
  
  // 給一點時間讓組件重新渲染
  setTimeout(() => {
    isSwitching.value = false
  }, 500)
}
</script>

<template>
  <div class="user-nav">
    <div class="nav-container" :class="{ switching: isSwitching }">
      <div 
        v-for="user in users" 
        :key="user.name"
        class="nav-item"
        :class="{ 
          active: route.path === user.path,
          switching: isSwitching && route.path === user.path
        }"
        @click="switchUser(user.path)"
      >
        <span v-if="isSwitching && route.path === user.path" class="loading-dot">⋯</span>
        {{ user.name }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-nav {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
}

.nav-container {
  display: flex;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 25px;
  padding: 4px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.nav-item {
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  color: #666;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.nav-item:hover {
  background: rgba(183, 159, 148, 0.1);
  color: #b79f94;
}

.nav-item.active {
  background: #b79f94;
  color: white;
  box-shadow: 0 2px 8px rgba(183, 159, 148, 0.3);
}

.nav-item.switching {
  opacity: 0.7;
  pointer-events: none;
}

.loading-dot {
  display: inline-block;
  animation: loadingPulse 1s ease-in-out infinite;
  margin-right: 4px;
}

@keyframes loadingPulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.nav-container.switching {
  pointer-events: none;
}

@media (max-width: 480px) {
  .user-nav {
    top: 16px;
  }
  
  .nav-item {
    padding: 6px 12px;
    font-size: 13px;
  }
}
</style>
