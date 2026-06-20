<template>
  <header class="header">
    <h1>校园二手交易平台</h1>
    <div class="header-right">
      <span v-if="auth.user">{{ auth.user.username }}</span>
      <router-link v-if="!auth.isLoggedIn" to="/login">登录</router-link>
      <router-link v-if="!auth.isLoggedIn" to="/register">注册</router-link>
      <button v-else @click="auth.logout">退出</button>
    </div>
  </header>
  <nav class="nav-tabs">
    <router-link to="/">首页</router-link>
    <router-link to="/goods-manage">商品管理</router-link>
    <router-link to="/orders">我的订单</router-link>
    <router-link to="/my">我的发布</router-link>
  </nav>
  <main>
    <router-view />
  </main>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
const auth = useAuthStore()
onMounted(() => { auth.loadMe() })
</script>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f0f2f5; color: #333; }
.header { background: linear-gradient(135deg, #ff6b6b, #ee5a5a); color: white; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; }
.header h1 { font-size: 1.4em; }
.header-right { display: flex; gap: 12px; align-items: center; }
.header-right a, .header-right button { color: white; text-decoration: none; background: rgba(255,255,255,0.2); padding: 6px 12px; border-radius: 6px; border: none; cursor: pointer; }
.nav-tabs { background: white; padding: 8px 20px; display: flex; gap: 12px; }
.nav-tabs a { padding: 10px 14px; text-decoration: none; color: #666; border-bottom: 3px solid transparent; }
.nav-tabs a.router-link-active { color: #ff6b6b; border-bottom-color: #ff6b6b; }
main { max-width: 1200px; margin: 20px auto; padding: 0 20px; }
.card { background: white; border-radius: 12px; padding: 20px; margin-bottom: 16px; }
.btn { padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; background: #ff6b6b; color: white; }
input, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; margin: 4px 0 12px; }
</style>
