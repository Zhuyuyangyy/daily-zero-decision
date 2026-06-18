<template>
  <section class="card">
    <h2>我的订单</h2>
    <div v-for="o in orders.buyList" :key="o.id" style="border-bottom:1px solid #eee; padding: 8px 0;">
      {{ o.orderNo }} — {{ o.goodsTitle }} — ¥{{ o.goodsPrice }}
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useOrdersStore } from '../stores/orders'
const orders = useOrdersStore()
onMounted(() => orders.loadBuy())
</script>
