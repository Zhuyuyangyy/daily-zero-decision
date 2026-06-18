<template>
  <section class="card">
    <h2>注册</h2>
    <input v-model="form.username" placeholder="用户名" />
    <input v-model="form.password" type="password" placeholder="密码" />
    <input v-model="form.phone" placeholder="手机号" />
    <button class="btn" @click="submit">注册</button>
  </section>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const form = reactive({ username: '', password: '', phone: '' })
const auth = useAuthStore()
const router = useRouter()

async function submit() {
  await auth.register(form)
  router.push('/login')
}
</script>
