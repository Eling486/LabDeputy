<template>
  <main class="page">
    <div class="page-box">
        <div class="nav"></div>
        <BoxLoading :loading="loading"/>
    </div>
  </main>
</template>

<script setup>
import BoxLoading from '@/components/BoxLoading.vue';
import { ref, reactive, onMounted, inject } from 'vue';
import { api } from '@/utils';
import { useStore } from '@/stores'
import { storeToRefs } from 'pinia'

const store = useStore()
const { settings } = storeToRefs(store)
const langs = inject('langs')

const data = reactive({
  rss: null
})
const loading = ref(true)

onMounted(async () => {
  let result = await api('GET', '/api/rss/all').catch((err) => {
    return console.log(err)
  })
  data.rss = result.data
  loading.value = false
})
</script>

<style lang="scss" scoped>
.page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100dvh - $ea-header-height);
  background-color: ea-dark(1);
}

.page-box {
    position: relative;
  height: 80dvh;
  width: 80vw;
  box-shadow: $shadow-1;
  border-radius: 10px;
  background-color: $ea-white;
  padding-top: $ea-nav-height;
  overflow: hidden;
}
.nav {
  position: absolute;
  top: 0;
  z-index: 9999;
  width: 100%;
  height: $ea-nav-height;
  border-bottom: $light-gray 1px solid;
}
</style>
