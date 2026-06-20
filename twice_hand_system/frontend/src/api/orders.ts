import http from './http'
import type { Order } from '../types/order'

export const orderApi = {
  create: (goodsId: number) => http.post<{ data: Order }>('/orders', { goodsId }).then(r => r.data.data),
  myBuy: () => http.get<{ data: Order[] }>('/orders/mine/buy').then(r => r.data.data),
  mySell: () => http.get<{ data: Order[] }>('/orders/mine/sell').then(r => r.data.data),
  setStatus: (id: number, status: number) => http.put<{ data: Order }>(`/orders/${id}/status`, null, { params: { status } })
}
