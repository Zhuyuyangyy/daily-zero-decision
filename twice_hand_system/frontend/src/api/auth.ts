import http from './http'
import type { LoginRequest, RegisterRequest, TokenResponse, User } from '../types/user'

export const authApi = {
  login: (req: LoginRequest) => http.post<{ data: TokenResponse }>('/auth/login', req).then(r => r.data.data),
  register: (req: RegisterRequest) => http.post<{ data: User }>('/auth/register', req).then(r => r.data.data),
  me: () => http.get<{ data: User }>('/users/me').then(r => r.data.data)
}
