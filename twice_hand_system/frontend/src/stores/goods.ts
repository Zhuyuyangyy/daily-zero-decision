import { defineStore } from 'pinia'
import { ref } from 'vue'
import { goodsApi } from '../api/goods'
import type { Goods } from '../types/goods'

export const useGoodsStore = defineStore('goods', () => {
  const list = ref<Goods[]>([])
  const total = ref(0)
  const page = ref(1)
  const size = ref(20)

  async function loadList(keyword = '') {
    const r = await goodsApi.list(page.value, size.value, keyword)
    list.value = r.records
    total.value = r.total
  }

  async function loadMine() {
    return goodsApi.mine()
  }

  async function create(g: Partial<Goods>) {
    const created = await goodsApi.create(g)
    list.value = [created, ...list.value]
    return created
  }

  return { list, total, page, size, loadList, loadMine, create }
})
