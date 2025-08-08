<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { fetchPointsByName } from '../services/sheets'

// 定義 props
interface Props {
  userName?: string
}

const props = withDefaults(defineProps<Props>(), {
  userName: 'E-Ting'
})

// 動態導入 SVG 文件
const getStickerSrc = (userName: string) => {
  try {
    return new URL(`../assets/${userName}.svg`, import.meta.url).href
  } catch (error) {
    console.error(`無法載入 ${userName}.svg:`, error)
    // 回退到 E-Ting.svg
    return new URL('../assets/E-Ting.svg', import.meta.url).href
  }
}

const points = ref(0)
const loading = ref(true)
const error = ref<string | null>(null)
const showCollectAnimation = ref(false)

// 動態計算總印章數量：目前點數 + 5 個，最少 10 個
const totalSlots = computed(() => {
  return Math.max(points.value + 5, 10)
})

async function load() {
  loading.value = true
  error.value = null
  try {
    const newPoints = await fetchPointsByName(props.userName)
    
    // 如果點數增加，觸發收集動畫
    if (newPoints > points.value) {
      showCollectAnimation.value = true
      setTimeout(() => {
        showCollectAnimation.value = false
      }, 2000)
    }
    points.value = newPoints
  } catch (e: any) {
    error.value = e?.message ?? 'Load error'
  } finally {
    loading.value = false
  }
}
onMounted(load)

// 監聽 userName 變化，自動重新載入資料
watch(() => props.userName, (newUserName, oldUserName) => {
  if (newUserName !== oldUserName) {
    // 重置狀態
    points.value = 0
    showCollectAnimation.value = false
    // 重新載入資料
    load()
  }
}, { immediate: false })

const slots = computed(() => {
  // 產生 1..(totalSlots-1) 與 GOAL（最後一格）
  return Array.from({ length: totalSlots.value }, (_, i) => {
    if (i === totalSlots.value - 1) return { label: 'GOAL', index: i }
    return { label: String(i + 1), index: i }
  })
})

// 獎勵兌換計算
const rewardPoints = 5 // 每5點可兌換一次
const availableRewards = computed(() => {
  return Math.floor(points.value / rewardPoints)
})

const nextRewardProgress = computed(() => {
  return points.value % rewardPoints
})
</script>

<template>
  <div class="card">
    <div class="title">黏TT 集點卡</div>
    <!-- 獎勵兌換進度 -->
    <div class="reward-section" :class="{ 'reward-available': availableRewards > 0 }">
      <div class="reward-info">
        <span class="reward-text">可兌換獎勵</span>
        <span class="reward-count">{{ availableRewards }} 次</span>
      </div>
      <div class="reward-status">
        <div class="reward-badges">
          <div 
            v-for="i in 5" 
            :key="i"
            class="reward-badge"
            :class="{ 
              'completed': i <= nextRewardProgress,
              'available': availableRewards > 0 && i <= rewardPoints
            }"
          >
            <span v-if="i <= nextRewardProgress" class="badge-icon">✓</span>
            <span v-else class="badge-number">{{ i }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 載入動畫 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-hint">載入 {{ props.userName }} 的資料中…（小八嘎幫你偷看試算表🤫）</div>
      <div class="skeleton-grid">
        <div 
          v-for="i in totalSlots" 
          :key="i" 
          class="skeleton-stamp"
          :style="{ animationDelay: `${i * 0.02}s` }"
        ></div>
      </div>
    </div>

    <div v-else-if="error" class="hint error">讀取失敗：{{ error }}</div>

    <!-- 主要印章網格 -->
    <div v-else class="grid">
      <div
        v-for="s in slots"
        :key="s.index"
        class="stamp"
        :class="{ 
          filled: s.index < points,
          'collect-animation': showCollectAnimation && s.index === points - 1
        }"
      >
        <template v-if="s.label === 'GOAL'">
          <span class="goal">GOAL</span>
        </template>
        <template v-else-if="s.index >= points">
          <span class="num">{{ s.label }}</span>
        </template>

        <div v-if="s.index < points" class="check">
          <img :src="getStickerSrc(props.userName)" :alt="`${props.userName} collected`" />   
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  max-width: 100%;
  margin: 80px auto 20px;
  padding: 32px;
  border-radius: 20px;
  background: #b79f94;
  color: #fff;
  box-shadow: 0 8px 25px rgba(0,0,0,.15);
  overflow: visible;
  min-height: calc(100vh - 120px);
  box-sizing: border-box;
  position: relative;
  margin-bottom: 60px;
}

.title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 20px;
  letter-spacing: 2px;
  text-align: center;
}

/* 點數區域樣式 */
.points-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px;
  background: rgba(255,255,255,.1);
  border-radius: 12px;
  position: relative;
}

.points-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.points-text {
  font-size: 16px;
  opacity: .9;
}

.points-count {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
}

/* 獎勵兌換樣式 */
.reward-section {
  margin-bottom: 24px;
  padding: 20px;
  background: rgba(255,255,255,.1);
  border-radius: 16px;
  position: relative;
  overflow: hidden;
}

.reward-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(255,215,0,0.1), rgba(255,193,7,0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.reward-section.reward-available::before {
  opacity: 1;
  animation: rewardGlow 2s ease-in-out infinite;
}

.reward-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  position: relative;
  z-index: 1;
}

.reward-text {
  font-size: 16px;
  opacity: .9;
}

.reward-count {
  font-size: 24px;
  font-weight: 700;
  color: #FFD700;
  text-shadow: 0 0 10px rgba(255,215,0,0.5);
  animation: rewardCountPulse 1s ease-in-out;
}

.reward-status {
  position: relative;
  z-index: 1;
  margin-top: 12px;
}

.reward-badges {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
}

.reward-badge {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255,255,255,.1);
  border: 2px solid rgba(255,255,255,.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255,255,255,.6);
  transition: all 0.3s ease;
  position: relative;
}

.reward-badge.completed {
  background: #4CAF50;
  border-color: #4CAF50;
  color: white;
  box-shadow: 0 0 10px rgba(76,175,80,0.4);
  animation: badgeComplete 0.5s ease-in-out;
}

.reward-badge.available {
  background: rgba(255,215,0,0.2);
  border-color: #FFD700;
  color: #FFD700;
  box-shadow: 0 0 8px rgba(255,215,0,0.3);
}

.badge-icon {
  font-size: 16px;
  font-weight: 700;
}

.badge-number {
  font-size: 14px;
  font-weight: 600;
}

.reward-progress-text {
  text-align: center;
  font-size: 14px;
  line-height: 1.4;
}

.progress-info {
  color: #FFE082;
  font-weight: 500;
}

.ready-info {
  color: #4CAF50;
  font-weight: 600;
  animation: readyPulse 2s ease-in-out infinite;
}

.start-info {
  color: rgba(255,255,255,.7);
  font-style: italic;
}

.reward-message {
  text-align: center;
  font-size: 16px;
  margin-top: 10px;
  position: relative;
  z-index: 1;
}

.can-reward {
  color: #FFD700;
  font-weight: 700;
  animation: canRewardBounce 0.6s ease-in-out;
}

.next-reward {
  color: #FFE082;
  opacity: .9;
}

/* 載入動畫 */
.loading-container {
  text-align: center;
}

.loading-hint {
  margin: 8px 0 16px;
  opacity: .9;
  font-size: 14px;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin: 16px 0 8px;
}

.skeleton-stamp {
  aspect-ratio: 1/1;
  border-radius: 50%;
  background: rgba(255,255,255,.1);
  animation: skeletonPulse 1.5s ease-in-out infinite;
}

/* 收集動畫 */
.collect-animation {
  animation: collectStamp 0.6s ease-in-out;
}

.hint {
  margin: 8px 0 16px;
  opacity: .9;
  text-align: center;
}

.hint.error {
  color: #ffe3e3;
}

.grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin: 20px 0 12px;
  padding-bottom: 20px;
  padding-left: 8px;
  padding-right: 8px;
}

.stamp {
  position: relative;
  aspect-ratio: 1/1;
  border-radius: 50%;
  border: 2px dashed rgba(255,255,255,.8);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,.06);
  min-width: 0;
  min-height: 0;
  transition: all 0.3s ease;
  overflow: hidden;
}

.stamp.filled {
  border-style: solid;
  background: #fff;
  color: #333;
}

.num {
  font-size: 18px;
  font-weight: 700;
  opacity: .9;
}

.goal {
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 1px;
}

.check {
  position: absolute;
  width: 85%;
  height: 85%;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,.15);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.check img {
  width: 90%;
  height: 90%;
  object-fit: contain;
}

.btn {
  border: none;
  padding: 12px 16px;
  border-radius: 12px;
  cursor: pointer;
  background: #fff;
  color: #333;
  font-weight: 600;
  font-size: 16px;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn:not(:disabled):hover {
  background: #f0f0f0;
  transform: translateY(-1px);
}

.btn-loading {
  display: inline-block;
  animation: btnLoading 1s ease-in-out infinite;
}

/* 動畫定義 */
@keyframes skeletonPulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

@keyframes collectStamp {
  0% { 
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255,255,255,0.7);
  }
  50% { 
    transform: scale(1.2);
    box-shadow: 0 0 0 10px rgba(255,255,255,0);
  }
  100% { 
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255,255,255,0);
  }
}

@keyframes rewardGlow {
  0%, 100% { 
    opacity: 0.3;
    transform: scale(1);
  }
  50% { 
    opacity: 0.6;
    transform: scale(1.02);
  }
}

@keyframes rewardCountPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

@keyframes badgeComplete {
  0% { 
    transform: scale(0.8);
    opacity: 0.5;
  }
  50% { 
    transform: scale(1.1);
  }
  100% { 
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes readyPulse {
  0%, 100% { 
    opacity: 1;
  }
  50% { 
    opacity: 0.7;
  }
}

@keyframes canRewardBounce {
  0% { transform: scale(1); }
  25% { transform: scale(1.05); }
  50% { transform: scale(0.95); }
  75% { transform: scale(1.02); }
  100% { transform: scale(1); }
}

@keyframes btnLoading {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* RWD 響應式設計 */
@media (max-width: 480px) {
  .card {
    margin: 70px 8px 8px;
    padding: 24px;
    min-height: calc(100vh - 120px);
  }
  
  .title {
    font-size: 24px;
  }
  
  .reward-section {
    padding: 20px;
  }
  
  .reward-count {
    font-size: 22px;
  }
  
  .reward-badges {
    gap: 8px;
  }
  
  .reward-badge {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
  
  .reward-progress-text {
    font-size: 15px;
  }
  
  .grid {
    gap: 12px;
    padding-bottom: 40px;
    padding-left: 4px;
    padding-right: 4px;
  }
  
  .skeleton-grid {
    gap: 12px;
  }
  
  .num {
    font-size: 16px;
  }
  
  .goal {
    font-size: 14px;
  }
  
  .check {
    width: 85%;
    height: 85%;
  }
  
  .check img {
    width: 90%;
    height: 90%;
  }
  
  .points-section {
    padding: 14px;
    margin-bottom: 16px;
  }
  
  .points-text {
    font-size: 14px;
  }
  
  .points-count {
    font-size: 20px;
  }
  
  .btn {
    align-self: center;
    padding: 12px 16px;
    font-size: 16px;
  }
}

/* iPhone 14 Pro Max 專用樣式 */
@media (min-width: 430px) and (max-width: 430px) {
  .card {
    margin: 80px 12px 20px;
    padding: 28px;
    min-height: calc(100vh - 120px);
  }
  
  .title {
    font-size: 28px;
  }
  
  .reward-section {
    padding: 24px;
  }
  
  .reward-count {
    font-size: 24px;
  }
  
  .reward-badges {
    gap: 10px;
  }
  
  .reward-badge {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
  
  .reward-progress-text {
    font-size: 16px;
  }
  
  .grid {
    gap: 14px;
    padding-left: 6px;
    padding-right: 6px;
  }
  
  .num {
    font-size: 18px;
  }
  
  .goal {
    font-size: 16px;
  }
  
  .check {
    width: 90%;
    height: 90%;
  }
  
  .check img {
    width: 95%;
    height: 95%;
  }
  
  .footer {
    font-size: 18px;
  }
  
  .btn {
    padding: 14px 18px;
    font-size: 18px;
  }
}

/* iPhone SE 和更小螢幕的專用樣式 */
@media (max-width: 375px) {
  .card {
    margin: 60px 8px 8px;
    padding: 12px;
    min-height: calc(100vh - 140px);
  }
  
  .title {
    font-size: 18px;
    margin-bottom: 16px;
  }
  
  .reward-section {
    padding: 12px;
    margin-bottom: 16px;
  }
  
  .reward-count {
    font-size: 18px;
  }
  
  .reward-badges {
    gap: 4px;
  }
  
  .reward-badge {
    width: 22px;
    height: 22px;
    font-size: 10px;
  }
  
  .reward-progress-text {
    font-size: 11px;
  }
  
  .grid {
    gap: 8px;
    padding-bottom: 50px;
  }
  
  .skeleton-grid {
    gap: 8px;
  }
  
  .num {
    font-size: 11px;
  }
  
  .goal {
    font-size: 9px;
  }
  
  .check {
    width: 75%;
    height: 75%;
  }
  
  .check img {
    width: 80%;
    height: 80%;
  }
  
  .footer {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    font-size: 12px;
    margin-bottom: 30px;
  }
  
  .btn {
    align-self: center;
    padding: 8px 12px;
    font-size: 12px;
  }
}

/* 超小螢幕的最後防線 */
@media (max-width: 360px) {
  .card {
    margin: 50px 4px 4px;
    padding: 8px;
    min-height: calc(100vh - 160px);
  }
  
  .title {
    font-size: 16px;
    margin-bottom: 12px;
  }
  
  .reward-section {
    padding: 8px;
    margin-bottom: 12px;
  }
  
  .reward-count {
    font-size: 16px;
  }
  
  .reward-badges {
    gap: 2px;
  }
  
  .reward-badge {
    width: 20px;
    height: 20px;
    font-size: 9px;
  }
  
  .reward-progress-text {
    font-size: 10px;
  }
  
  .grid {
    gap: 6px;
    padding-bottom: 50px;
  }
  
  .skeleton-grid {
    gap: 6px;
  }
  
  .num {
    font-size: 10px;
  }
  
  .goal {
    font-size: 8px;
  }
  
  .check {
    width: 70%;
    height: 70%;
  }
  
  .check img {
    width: 75%;
    height: 75%;
  }
  
  .points-section {
    padding: 10px;
    margin-bottom: 12px;
  }
  
  .points-text {
    font-size: 12px;
  }
  
  .points-count {
    font-size: 18px;
  }
  
  .btn {
    align-self: center;
    padding: 6px 10px;
    font-size: 11px;
  }
}

/* 確保在各種螢幕尺寸下都有良好的顯示 */
@media (min-width: 481px) and (max-width: 768px) {
  .card {
    max-width: 90%;
    padding: 30px;
  }
  
  .grid {
    gap: 16px;
    padding-left: 12px;
    padding-right: 12px;
  }
  
  .skeleton-grid {
    gap: 12px;
  }
}

@media (min-width: 769px) {
  .card {
    max-width: 800px;
    padding: 36px;
  }
  
  .grid {
    gap: 14px;
    padding-left: 12px;
    padding-right: 12px;
  }
  
  .skeleton-grid {
    gap: 14px;
  }
  
  .num {
    font-size: 18px;
  }
  
  .goal {
    font-size: 16px;
  }
}
</style>
