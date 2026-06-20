<template>
  <section class="card">
    <h2>我发布的商品</h2>
    <form @submit.prevent="create">
      <input v-model="form.name" placeholder="名称" />
      <input v-model.number="form.price" type="number" placeholder="价格" />
      <textarea v-model="form.description" placeholder="描述" />
      <button class="btn" type="submit">发布</button>
    </form>
    <hr />
    <div v-for="g in mine" :key="g.id">{{ g.name }} — ¥{{ g.price }}</div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useGoodsStore } from '../stores/goods'

const goods = useGoodsStore()
const mine = ref<any[]>([])
const form = reactive({ name: '', price: 0, description: '' })

onMounted(async () => { mine.value = await goods.loadMine() })

async function create() {
  await goods.create(form)
  form.name = ''; form.price = 0; form.description = ''
  mine.value = await goods.loadMine()
}
</script>
