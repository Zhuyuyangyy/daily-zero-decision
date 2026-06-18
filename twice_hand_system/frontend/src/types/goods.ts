export interface Goods {
  id: number
  userId: number
  name: string
  description?: string
  price: number
  status: number
  images?: string
  createTime?: string
}

export interface PageResponse<T> {
  records: T[]
  total: number
  page: number
  size: number
}
