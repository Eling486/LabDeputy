<template>
  <main class="page">
    <div class="page-box">
      <div class="nav-box">
        <div class="nav">
          <div class="nav-item" @click="navToggle(0)" :class="{ active: activePanel == 0 }">
            <el-icon><User /></el-icon>
            <span class="nav-text">{{ langs[settings.lang].manage.nav_user }}</span>
          </div>
        </div>
      </div>
      <!-- <BoxLoading :loading="loading" /> -->
      <div class="panel user" v-if="activePanel == 0">
        <el-form
          class="invite-form form"
          :model="inviteCount"
          trigger="change"
          label-width="auto"
          style="max-width: 600px"
          hide-required-asterisk
        >
          <el-alert class="alert" type="info" show-icon :closable="false">
            <p>{{ langs[settings.lang].manage.alert_invite_user }}</p>
          </el-alert>
          <el-form-item :label="langs[settings.lang].manage.invite_count">
            <el-input-number v-model="inviteCount" :min="0" :max="50" />
          </el-form-item>
          <el-form-item :style="{ float: 'right' }">
            <el-button type="primary" @click="inviteUser()" :disabled="inviteCount == 0">{{
              langs[settings.lang].manage.generate_invitation
            }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </main>
</template>

<script setup>
import BoxLoading from '@/components/BoxLoading.vue'
import { ref, h, inject, withDirectives } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox, ElInput } from 'element-plus'
import { User } from '@element-plus/icons-vue'
import { api, logout, refresh } from '@/utils'
import { useStore } from '@/stores'
import { storeToRefs } from 'pinia'

const store = useStore()
const { settings } = storeToRefs(store)
const langs = inject('langs')
const route = useRoute()

const activePanel = ref(0)

const invitationLinkRef = ref()

const navToggle = (index) => {
  activePanel.value = index
}

const inviteCount = ref(0)

const inviteUser = async () => {
  ElMessageBox.confirm(
    langs[settings.value.lang].manage.generate_invitation_confirm,
    langs[settings.value.lang].reconfirmation,
    {
      confirmButtonText: langs[settings.value.lang].confirm,
      cancelButtonText: langs[settings.value.lang].cancel,
      type: 'warning'
    }
  ).then(async () => {
    let result = await api('POST', '/api/user/invite', {
      count: inviteCount.value
    }).catch((err) => {
      ElMessage({
        message: err.msg,
        type: 'error',
        plain: true
      })
      return console.error(err)
    })
    if (result.code !== 0) {
      return
    }
    ElMessageBox({
      title: langs[settings.value.lang].manage.invitation_link_title,
      message: () =>
        h(
          'p',
          {
            ref: invitationLinkRef,
            style: 'cursor: pointer',
            onClick: () => {
              let range = document.createRange()
              range.selectNode(invitationLinkRef.value)
              let selection = document.getSelection()
              selection.removeAllRanges()
              selection.addRange(range)
            }
          },
          `${window.location.protocol}//${window.location.host}/register?invitation=${result.data}`
        )
    })
  })
}
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

.nav-box .nav-item {
  transition: all 0.2s;
  user-select: none;
  box-sizing: border-box;

  &.active {
    background-color: ea-main(1) !important;
    border-bottom: 2px solid $ea-main;
    cursor: default;
  }

  &:hover {
    background-color: ea-main(2);
  }
}

.panel {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  padding: 50px 0;
  overflow-y: auto;
  box-sizing: border-box;

  .form {
    height: fit-content;
    width: 100%;
  }

  .alert {
    margin: 3em 0 1em 0;
    p {
      margin: 0;
    }
  }
}
</style>
