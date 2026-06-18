import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authApi } from '../api/auth'
import type { LoginRequest, RegisterRequest, User } from '../types/user'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isLoggedIn = ref(!!localStorage.getItem('accessToken'))

  async function login(req: LoginRequest) {
    const r = await authApi.login(req)
    localStorage.setItem('accessToken', r.accessToken)
    localStorage.setItem('refreshToken', r.refreshToken)
    user.value = r.user
    isLoggedIn.value = true
  }

  async function register(req: RegisterRequest) {
    await authApi.register(req)
  }

  async function loadMe() {
    if (!isLoggedIn.value) return
    try { user.value = await authApi.me() }
    catch { logout() }
  }

  function logout() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    user.value = null
    isLoggedIn.value = false
  }

  return { user, isLoggedIn, login, register, loadMe, logout }
})
