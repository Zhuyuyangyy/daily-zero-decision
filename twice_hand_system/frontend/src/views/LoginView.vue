<template>
  <section class="card">
    <h2>登录</h2>
    <input v-model="form.username" placeholder="用户名" />
    <input v-model="form.password" type="password" placeholder="密码" />
    <button class="btn" @click="submit">登录</button>
  </section>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const form = reactive({ username: '', password: '' })
const auth = useAuthStore()
const router = useRouter()

async function submit() {
  await auth.login(form)
  router.push('/')
}
</script>
