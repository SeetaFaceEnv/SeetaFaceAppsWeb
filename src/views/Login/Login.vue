<template>
  <div class="login-bg">
    <img id="logo" src="@assets/images/login-logo.png"/>
    <transition name="card-fade-show">
      <el-card v-show="isShow" class="login-box">
        <h1 style="margin-bottom: 50px">{{ $t('loginPage.pageTitle') }}</h1>
        <el-form :model="form" :rules="rules" ref="form" @submit.native.prevent>
          <el-form-item :label="`${ $t('label.username') }：`" prop="username">
            <el-input v-model="form.username">
              <i slot="prefix" style="padding-left: 6px" class="fa fa-user" aria-hidden="true"></i>
            </el-input>
          </el-form-item>
          <el-form-item :label="`${ $t('label.password') }：`" prop="password">
            <el-input v-model="form.password" type="password" show-password>
              <i slot="prefix" style="padding-left: 6px" class="fa fa-key" aria-hidden="true"></i>
            </el-input>
          </el-form-item>
          <el-form-item :label="`${ $t('label.code') }：`" prop="verificationCode">
            <br/>
            <el-input v-model="form.verificationCode" style="width: 140px;margin-right: 40px">
              <i slot="prefix" style="padding-left: 6px" class="fa fa-picture-o" aria-hidden="true"></i>
            </el-input>
            <el-tooltip :content="$t('tip.changeCode')" placement="top">
              <img @click="changeVerifyCodeImg()" :src="baseUrl + 'backend/admin/captcha?tag=' + uuid" alt="验证码"/>
            </el-tooltip>
          </el-form-item>
          <el-form-item>
            <el-button id="login-bt" @click="loginSubmit('form')" native-type="submit" type="primary" :loading="$store.state.isSubmitting">
              {{ $t('buttonText.login') }}
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </transition>
  </div>
</template>
<script>
import md5 from 'md5'
import uuidv4 from 'uuid/v4'
import baseUrl from '@api/baseUrl'
import { adminLogin } from '@api/getData'
import { validatePasswordMoreSixAndLessThirty } from '@utils/formHandle/validateForm.js'
export default {
  data () {
    return {
      isShow: false,
      baseUrl: baseUrl,
      uuid: uuidv4(), // 用于生成验证码信息
      form: {},
      rules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { validator: validatePasswordMoreSixAndLessThirty, trigger: 'blur' }
        ],
        verificationCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
      }
    }
  },
  mounted () {
    this.isShow = true
    sessionStorage.clear()
  },
  methods: {
    // 提交登录
    loginSubmit (formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          this.login()
        }
      })
    },
    // 正式登录
    async login (publicKey, preSessionId) {
      const res = await adminLogin({
        tag: this.uuid,
        code: this.form.verificationCode,
        name: this.form.username,
        password: md5(this.form.password)
      })
      if (res.data.res === 0) {
        // 保存用户名、token
        sessionStorage.setItem('username', this.form.username)
        sessionStorage.setItem('token', res.data.token)
        // 保存EMQ连接信息
        sessionStorage.setItem('mqttUrl', res.data.mqtt_url)
        sessionStorage.setItem('mqttUser', window.atob(res.data.mqtt_user))
        sessionStorage.setItem('mqttPassword', window.atob(res.data.mqtt_password))
        sessionStorage.setItem('statusTopic', res.data.status_topic) // 设备状态变更topic
        sessionStorage.setItem('recordTopic', res.data.record_topic) // 人员通行topic
        this.$router.push({ name: 'welcome' }) // 进入欢迎页
        this.$handleSuccessMessage('登录成功')
      } else {
        this.changeVerifyCodeImg()
      }
    },
    // 修改验证码图片
    changeVerifyCodeImg () {
      this.uuid = uuidv4()
      this.$set(this.form, 'verificationCode', '')
    }
  }
}
</script>

<style lang="stylus" scoped>
.login-bg
  height 100%
  width 100%
  background url("../../assets/images/login-bg.png") 100% no-repeat
  background-position center center
  background-attachment fixed
  background-size cover
  display flex
  align-items center
  flex-direction row-reverse
  position fixed
  overflow hidden

  #logo
    position absolute
    top 50px
    right 110px
  .login-box
    margin-right 100px
    padding 80px 60px
    text-align left
    #login-bt
      display inline-block
      width 100%
      margin-top 40px

@media screen and (max-width: 1366px) {
  #logo {
    right 40px
  }
  .login-box {
    margin-right 40px !important
    padding 30px 20px !important
  }
}

@media screen and (max-width: 768px) {
  #logo {
    right 10px
  }
  .login-box {
    margin-right 10px !important
    padding 10px 5px !important
  }
}
</style>
