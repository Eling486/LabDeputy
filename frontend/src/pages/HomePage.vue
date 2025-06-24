<template>
  <main class="page-home">
    <BoxLoading :loading="loading" />
    <div class="panel-left">
      <div class="panel-content">
        <RouterLink class="function-item" to="/booking">
          <el-icon :size="60" class="function-icon"><Calendar /></el-icon>
          <div class="function-title">Booking</div>
        </RouterLink>
      </div>
    </div>
    <div class="panel-right panel-news" ref="panelNews">
      <div class="panel-header">Recents</div>
      <div class="panel-content"></div>
    </div>
  </main>
</template>

<script setup>
import { onMounted, ref, reactive, inject } from 'vue'
import { RouterLink } from 'vue-router'
import { api } from '@/utils'
import { Calendar } from '@element-plus/icons-vue'
import { useStore } from '@/stores'
import { storeToRefs } from 'pinia'

const store = useStore()
const { settings } = storeToRefs(store)
const langs = inject('langs')

const output = ref([])
const info = reactive({
  subscribedRSS: [],
  animeList: [],
  new: {
    today: []
  }
})

const loading = ref(true)

/*
const loadInfo = async () => {
  let result = await api('GET', '/api/info/all').catch((err) => {
    return console.log(err)
  })
  if (!result || result.code < 0) return
  info.subscribedRSS = result.data.subscribedRSS
  info.animeList = result.data.animeList
  info.new = result.data.new
  loading.value = false
}
*/

onMounted(async () => {
  // loadInfo()
  loading.value = false
})
</script>

<style lang="scss" scoped>
.page-home {
  display: grid;
  grid-template-columns: 50% 50%;
  background-color: ea-dark(1);
  height: calc(100dvh - $ea-header-height);
  width: 100%;
  padding: 8dvh 10vw;
  box-sizing: border-box;

  .panel-left {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    align-content: flex-start;
    flex-grow: 1;
    margin-right: 20px;

    .function-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 150px;
      height: 150px;
      background-color: $ea-white;
      box-shadow: $shadow-1;
      cursor: pointer;
      color: $ea-text;
      transition: all 0.2s;

      .function-title {
        margin-top: 10px;
      }

      &:hover {
        color: $ea-text-light;
      }
    }
  }

  .panel-news {
    display: flex;
    flex-direction: column;
    background-color: $ea-white;
    box-shadow: $shadow-1;
    padding: 5px 10px;
    box-sizing: border-box;

    .panel-header {
      padding: 10px 20px;
    }

    p {
      display: block;
      width: max-content;
      margin: 0;
    }
  }
}

@media (max-width: 900px) {
  .page-home {
    display: flex;
    flex-direction: column;
    padding: 5dvh 4vw;

    .panel-left {
      margin: 0 0 20px 0;
      flex-grow: 0;

      .panel-info {
        .info-item {
          width: 100px;
          height: 100px;
          margin: 0 2px 5px 2px;

          .title {
            font-size: 14px;
          }

          .content-number {
            font-size: 2em;
          }
        }
      }
    }

    .panel-news {
      flex-grow: 1;
      font-size: 8px;
      line-height: 8px;
    }
  }
}
</style>
