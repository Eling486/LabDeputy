<template>
  <main class="page">
    <div class="page-box">
      <div class="nav-box">
        <div class="nav nav-right">
          <div
            class="nav-item nav-btn"
            @click="reset"
            v-if="resetVisible && !saving"
          >
            <el-icon><RefreshLeft /></el-icon>
            <span class="nav-text">{{ langs[settings.lang].reset }}</span>
          </div>
          <div
            class="nav-item nav-btn highlight"
            :class="{ saving: saving }"
            @click="save"
            v-if="saveVisible"
          >
            <el-icon v-if="!saving"><Check /></el-icon>
            <el-icon class="is-loading" v-if="saving">
              <Loading />
            </el-icon>
            <span class="nav-text">{{ langs[settings.lang].save }}</span>
          </div>
        </div>
      </div>
      <BoxLoading :loading="loading" />
      <div class="setting-wrap">
        <el-form
          class="setting-form"
          :model="userData"
          trigger="change"
          label-width="auto"
          style="max-width: 600px"
          hide-required-asterisk
          @input="validateForm"
          :disabled="saving"
        >
          <el-form-item :label="langs[settings.lang].setting.uid" prop="uid">
            {{ userData.uid }}
          </el-form-item>
          <el-form-item :label="langs[settings.lang].setting.username" prop="uid">
            {{ userData.username }}
          </el-form-item>
          <el-alert class="setting-alert" type="info" show-icon :closable="false">
            <p>{{ langs[settings.lang].setting.alert_change_realname }}</p>
          </el-alert>
          <el-form-item :label="langs[settings.lang].setting.realname">
            <el-input v-model="userData.realname" style="width: 400px" @input="validateForm"/>
          </el-form-item>
          <el-alert class="setting-alert" type="info" show-icon :closable="false">
            <p>{{ langs[settings.lang].setting.alert_change_password }}</p>
          </el-alert>
          <el-form-item :label="langs[settings.lang].setting.password_old" :error="errorMsg">
            <el-input
              v-model="userData.oldPassword"
              type="password"
              style="width: 400px"
              show-password
              autocomplete="old-password"
            />
          </el-form-item>
          <el-form-item :label="langs[settings.lang].setting.password" :error="errorMsg">
            <el-input
              v-model="userData.password"
              type="password"
              style="width: 400px"
              show-password
              autocomplete="new-password"
            />
          </el-form-item>
          <el-form-item :label="langs[settings.lang].setting.password_repeat" :error="errorMsg">
            <el-input
              v-model="userData.passwordRepeat"
              type="password"
              style="width: 400px"
              show-password
              autocomplete="new-password"
            />
          </el-form-item>
        </el-form>
      </div>
    </div>
  </main>
</template>

<script setup>
import BoxLoading from '@/components/BoxLoading.vue'
import { ref, onMounted, inject } from 'vue'
import { ElMessage } from 'element-plus'
import { Check, Loading, RefreshLeft } from '@element-plus/icons-vue'
import { api, logout, refresh } from '@/utils'
import { useStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { sha256 } from 'js-sha256'

const store = useStore()
const { settings } = storeToRefs(store)
const langs = inject('langs')

const originalUserData = ref({})
const userData = ref({
  uid: null,
  username: null,
  realname: null,
  oldPassword: null,
  password: null,
  passwordRepeat: null
})
const loading = ref(true)
const saving = ref(false)
const saveVisible = ref(false)
const resetVisible = ref(false)

const validateForm = async () => {
  if (userData.value.realname !== originalUserData.value.realname || userData.value.password || userData.value.passwordRepeat || userData.value.oldPassword) {
    resetVisible.value = true
  } else {
    resetVisible.value = false
  }
  if (userData.value.oldPassword && userData.value.password && userData.value.passwordRepeat) {
    saveVisible.value = true
    return
  }
  if (userData.value.realname !== originalUserData.value.realname && userData.value.realname) {
    saveVisible.value = true
    return
  }
  saveVisible.value = false
}

const reset = async () => {
  userData.value.realname = originalUserData.value.realname
  userData.value.oldPassword = null
  userData.value.password = null
  userData.value.passwordRepeat = null
  resetVisible.value = false
  saveVisible.value = false
}

const save = async () => {
  if (saving.value) return

  if(!userData.value.realname) {
    ElMessage({
      message: langs[settings.value.lang].setting.msg_error_empty_realname,
      type: 'error'
    })
    return
  }

  if (userData.value.password && !userData.value.oldPassword) {
    ElMessage({
      message: langs[settings.value.lang].setting.msg_error_empty_old_password,
      type: 'error'
    })
    return
  }

  if (userData.value.password !== userData.value.passwordRepeat) {
    ElMessage({
      message: langs[settings.value.lang].setting.msg_error_password_repeat,
      type: 'error'
    })
    return
  }

  let passwordRe = new RegExp(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d$@$!%*#?&]{6,}$/)

  if (userData.value.password && !passwordRe.test(userData.value.password)) {
    ElMessage({
      message: langs[settings.value.lang].setting.msg_error_password_illegal,
      type: 'error'
    })
    return
  }
  saving.value = true
  let needLogout = false

  let reqData = {
    uid: userData.value.uid,
    username: userData.value.username
  }
  if (userData.value.password) {
    let oldPassword = sha256(`${userData.value.username}${sha256(userData.value.oldPassword)}`)
    let newPassword = sha256(`${userData.value.username}${sha256(userData.value.password)}`)
    reqData['password'] = {
      old: oldPassword,
      new: newPassword
    }
    needLogout = true
  }

  if (userData.value.realname !== originalUserData.value.realname) {
    reqData['realname'] = userData.value.realname
  }

  let result = await api('POST', '/api/user/update', reqData).catch((err) => {
    if(err.code === -50104){
      ElMessage({
        message: langs[settings.value.lang].setting.msg_err_old_password,
        type: 'error'
      })
      saving.value = false
      return
    }
    ElMessage({
      message: err.msg || langs[settings.value.lang].msg_err_reload,
      type: 'error'
    })
    saving.value = false
    return console.log(err)
  })
  if (!result) return

  await refresh()

  if (needLogout) {
    ElMessage({
      message: langs[settings.value.lang].setting.msg_save_success_reload,
      type: 'success'
    })
    setTimeout(() => {
      logout()
      location.reload()
    }, 5000)
    return
  }
  ElMessage({
    message: langs[settings.value.lang].setting.msg_save_success,
    type: 'success'
  })
  saving.value = false
  loadUserData()
}

const loadUserData = async () => {
  loading.value = true
  reset()
  await refresh()
  let result = await api('POST', '/api/user/validate').catch((err) => {
    return console.log(err)
  })
  userData.value.uid = result.data.payload.uid
  userData.value.username = result.data.payload.username
  userData.value.realname = result.data.payload.realname
  originalUserData.value = result.data.payload
  loading.value = false
}

onMounted(async () => {
  await loadUserData()
})
</script>

<style lang="scss" scoped>
.page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100vh - $ea-header-height);
  background-color: ea-dark(1);
}

.page-box {
  position: relative;
  height: 80vh;
  width: 80vw;
  box-shadow: $shadow-1;
  border-radius: 10px;
  background-color: $ea-white;
  padding-top: $ea-nav-height;
  overflow: hidden;
}

.nav-box .nav-item.nav-btn.highlight {
  background-color: $ea-main;
  color: $ea-white;
  transition: all 0.2s;
  user-select: none;

  &:hover {
    background-color: ea-main(7);
  }

  &.saving {
    background-color: ea-main(5);
    cursor: not-allowed;
  }
}

.setting-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  padding: 50px 0;
  overflow-y: auto;
  box-sizing: border-box;

  .setting-form {
    height: fit-content;
  }

  .setting-alert {
    margin: 3em 0 1em 0;
    p {
      margin: 0;
    }
  }
}

@media (max-width: 900px) {
  :deep(.el-form) {
    width: 90% !important;
  }
}
</style>
