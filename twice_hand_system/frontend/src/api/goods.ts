import http from './http'
import type { Goods, PageResponse } from '../types/goods'

export const goodsApi = {
  list: (page = 1, size = 20, keyword?: string) =>
    http.get<{ data: PageResponse<Goods> }>('/goods', { params: { page, size, keyword } }).then(r => r.data.data),
  detail: (id: number) => http.get<{ data: Goods }>(`/goods/${id}`).then(r => r.data.data),
  mine: () => http.get<{ data: Goods[] }>('/goods/mine').then(r => r.data.data),
  create: (g: Partial<Goods>) => http.post<{ data: Goods }>('/goods', g).then(r => r.data.data),
  update: (id: number, g: Partial<Goods>) => http.put<{ data: Goods }>(`/goods/${id}`, g).then(r => r.data.data),
  remove: (id: number) => http.delete(`/goods/${id}`),
  setStatus: (id: number, status: number) => http.put(`/goods/${id}/status`, null, { params: { status } })
}
