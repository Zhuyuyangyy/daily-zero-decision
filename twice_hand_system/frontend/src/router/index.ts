import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import GoodsManageView from '../views/GoodsManageView.vue'
import OrderManageView from '../views/OrderManageView.vue'
import MyGoodsView from '../views/MyGoodsView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/login', component: LoginView },
    { path: '/register', component: RegisterView },
    { path: '/goods-manage', component: GoodsManageView, meta: { auth: true } },
    { path: '/orders', component: OrderManageView, meta: { auth: true } },
    { path: '/my', component: MyGoodsView, meta: { auth: true } }
  ]
})

router.beforeEach((to) => {
  if (to.meta.auth && !localStorage.getItem('accessToken')) return '/login'
})

export default router
