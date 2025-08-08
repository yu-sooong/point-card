import { createRouter, createWebHistory } from 'vue-router'
import StampCard from '../components/StampCard.vue'

const routes = [
  {
    path: '/',
    redirect: '/E-Ting'
  },
  {
    path: '/E-Ting',
    name: 'E-Ting',
    component: StampCard,
    props: { userName: 'E-Ting' }
  },
  {
    path: '/S-Ting',
    name: 'S-Ting',
    component: StampCard,
    props: { userName: 'S-Ting' }
  },
  {
    path: '/:userName',
    name: 'User',
    component: StampCard,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
