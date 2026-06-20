import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import type { TokenResponse } from '../types/user'

const baseURL = import.meta.env.VITE_API_BASE || '/api/v1'

const http: AxiosInstance = axios.create({ baseURL, withCredentials: true })

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

let refreshing: Promise<string | null> | null = null

async function refreshTokens(): Promise<string | null> {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) return null
  if (!refreshing) {
    refreshing = axios
      .post<{ code: number; data: TokenResponse }>(`${baseURL}/auth/refresh`, { refreshToken }, { withCredentials: true })
      .then(r => {
        const t = r.data.data
        localStorage.setItem('accessToken', t.accessToken)
        localStorage.setItem('refreshToken', t.refreshToken)
        return t.accessToken
      })
      .catch(() => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        return null
      })
      .finally(() => { refreshing = null })
  }
  return refreshing
}

http.interceptors.response.use(
  r => r,
  async (err: AxiosError<{ code: number; message: string }>) => {
    const original: any = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      const newToken = await refreshTokens()
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`
        return http(original)
      }
      window.location.assign('/login')
    }
    return Promise.reject(err)
  }
)

export default http
