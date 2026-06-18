export interface User {
  id: number
  username: string
  nickname?: string
  phone?: string
  email?: string
  school?: string
  studentId?: string
  status?: number
}

export interface LoginRequest { username: string; password: string }
export interface RegisterRequest {
  username: string; password: string
  nickname?: string; phone?: string; email?: string
  school?: string; studentId?: string
}
export interface TokenResponse {
  accessToken: string
  refreshToken: string
  accessExpiresIn: number
  user: User
}
