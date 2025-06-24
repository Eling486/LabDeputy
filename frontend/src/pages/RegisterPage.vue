<template>
  <div class="login-wrap">
    <div class="login-box">
      <div class="login-title">{{ langs[settings.lang].login.register }}</div>
      <el-form
        ref="registerFormRef"
        :model="userData"
        :rules="rules"
        label-width="auto"
        style="max-width: 600px"
        hide-required-asterisk
      >
        <el-form-item
          :label="langs[settings.lang].login.username"
          prop="username"
          :error="errorMsgUsername"
        >
          <el-input v-model="userData.username" style="width: 220px" />
        </el-form-item>
        <el-form-item :label="langs[settings.lang].login.realname" prop="realname">
          <el-input v-model="userData.realname" style="width: 220px" name="realname" />
        </el-form-item>
        <el-form-item
          :label="langs[settings.lang].login.password"
          prop="password"
          :error="errorMsgPassword"
        >
          <el-input
            v-model="userData.password"
            type="password"
            style="width: 220px"
            show-password
          />
        </el-form-item>
        <el-form-item :label="langs[settings.lang].login.password_repeat" prop="password_repeat">
          <el-input
            v-model="userData.passwordRepeat"
            type="password"
            style="width: 220px"
            show-password
          />
        </el-form-item>
        <el-form-item :style="{ float: 'right' }">
          <el-button type="primary" @click="onSubmit(registerFormRef)" :loading="submiting" :disable="redirecting">{{
            langs[settings.lang].login.register
          }}</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive, inject, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { sha256 } from 'js-sha256'
import { api } from '../utils'
import { useStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const store = useStore()
const { settings } = storeToRefs(store)
const langs = inject('langs')

const errorMsgPassword = ref('')
const errorMsgUsername = ref('')
const submiting = ref(false)
const redirecting = ref(false)

const userData = reactive({
  username: '',
  realname: '',
  password: '',
  passwordRepeat: ''
})

const registerFormRef = ref()

let passwordRe = new RegExp(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/)

const validatePassword = (rule, value, callback) => {
  if (value === '') {
    return callback(new Error(langs[settings.value.lang].login.msg_need_password))
  }

  console.log(value)
  if (!passwordRe.test(value)) {
    return callback(new Error(langs[settings.value.lang].login.msg_error_password_illegal))
  }
  return callback()
}

const validateRepeatPassword = (rule, value, callback) => {
  if (userData.passwordRepeat === '') {
    return callback(new Error(langs[settings.value.lang].login.msg_need_repeat_password))
  }
  if (userData.passwordRepeat !== userData.password) {
    return callback(new Error(langs[settings.value.lang].login.msg_error_password_repeat))
  }
  return callback()
}

const rules = reactive({
  username: [
    {
      required: true,
      message: langs[settings.value.lang].login.msg_need_username,
      trigger: 'change'
    }
  ],
  realname: [
    {
      required: true,
      message: langs[settings.value.lang].login.msg_need_realname,
      trigger: 'change'
    }
  ],
  password: [
    {
      validator: validatePassword,
      trigger: 'change'
    }
  ],
  password_repeat: [
    {
      validator: validateRepeatPassword,
      trigger: 'change'
    }
  ]
})

const onSubmit = async (formEl) => {
  formEl.validate(async (valid) => {
    errorMsgUsername.value = ''
    errorMsgPassword.value = ''
    if (valid) {
      submiting.value = true
      let result = await api('POST', '/api/user/register', {
        invitation: route.query.invitation,
        username: userData.username,
        realname: userData.realname,
        password: sha256(`${userData.username}${sha256(userData.password)}`)
      }).catch((err) => {
        submiting.value = false
        if (err.code === -50302) {
          return (errorMsgUsername.value = err.msg)
        }
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
      console.log(result)
      redirecting.value = true
      submiting.value = false
      ElMessage({
        message: langs[settings.value.lang].login.msg_success_register,
        type: 'success'
      })
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    }
  })
}

onMounted(() => {
  if (!route.query.invitation) {
    return router.push('/login')
  }
})
</script>

<style lang="scss" scoped>
.login-wrap {
  position: fixed;
  z-index: 1000;
  top: 0;
  left: 0;
  height: 100dvh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;

  .login-box {
    padding: 24px 48px;
    border-radius: 10px;
    box-shadow: $shadow-1;

    .login-title {
      font-size: 1.5em;
      margin-bottom: 1.5em;
      text-align: center;
    }
  }
}
</style>
