import { defineStore } from 'pinia'
import { ref } from 'vue'
import { orderApi } from '../api/orders'
import type { Order } from '../types/order'

export const useOrdersStore = defineStore('orders', () => {
  const buyList = ref<Order[]>([])
  const sellList = ref<Order[]>([])

  async function loadBuy() { buyList.value = await orderApi.myBuy() }
  async function loadSell() { sellList.value = await orderApi.mySell() }
  async function create(goodsId: number) { return orderApi.create(goodsId) }
  async function setStatus(id: number, status: number) { return orderApi.setStatus(id, status) }

  return { buyList, sellList, loadBuy, loadSell, create, setStatus }
})
