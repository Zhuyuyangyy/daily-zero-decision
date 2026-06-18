<template>
  <section class="card">
    <h2>全部商品</h2>
    <div v-if="goods.list.length">
      <div v-for="g in goods.list" :key="g.id" style="border-bottom: 1px solid #eee; padding: 8px 0;">
        <strong>{{ g.name }}</strong> — ¥{{ g.price }}
        <button v-if="auth.isLoggedIn" class="btn" @click="buy(g.id)">购买</button>
      </div>
    </div>
    <p v-else>暂无商品</p>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useGoodsStore } from '../stores/goods'
import { useOrdersStore } from '../stores/orders'

const auth = useAuthStore()
const goods = useGoodsStore()
const orders = useOrdersStore()

onMounted(() => goods.loadList())

async function buy(goodsId: number) {
  await orders.create(goodsId)
  alert('下单成功')
}
</script>
