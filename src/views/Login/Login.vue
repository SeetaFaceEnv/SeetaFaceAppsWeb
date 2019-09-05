<template>
  <div class="login-bg">
    <img id="logo" src="@/assets/images/login-logo.png"/>
    <transition name="card-fade-show">
      <el-card v-show="isShow" class="login-box">
        <h1 style="margin-bottom: 50px">账号登录</h1>
        <el-form :model="form" :rules="rules" ref="form" @submit.native.prevent>
          <el-form-item label="用户名：" prop="username">
            <el-input v-model="form.username"></el-input>
          </el-form-item>
          <el-form-item label="密码：" prop="password">
            <el-input v-model="form.password" type="password"></el-input>
          </el-form-item>
          <el-form-item label="验证码：" prop="verificationCode">
            <br/>
            <el-input v-model="form.verificationCode" style="width: 140px;margin-right: 40px"></el-input>
            <el-tooltip content="点击更换验证码" placement="top">
              <img @click="changeImg()" :src="baseUrl + 'backend/account/generateVerifyCode?code_tag=' + time" alt="验证码"/>
            </el-tooltip>
          </el-form-item>
          <el-form-item>
            <el-button id="login-bt" @click="preLogin('form')" native-type="submit" type="primary" :loading=$store.state.isSubmitting>登录</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </transition>
  </div>
</template>
<script>
import NodeRSA from 'node-rsa'
import baseUrl from '@/api/baseUrl'
import { accountPreLogin, accountLogin } from '@/api/getData'
import { validatePasswordMoreSix } from '@/utils/validateForm'
export default {
  data () {
    return {
      isShow: false,
      baseUrl: baseUrl,
      rsaKey: { // 前端公、私钥
        publicKey: '',
        privateKey: ''
      },
      time: Date.now() + '' + Math.floor(Math.random() * 100000), // 用于生成验证码信息
      form: {},
      rules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { validator: validatePasswordMoreSix, trigger: 'blur' }
        ],
        verificationCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
      }
    }
  },
  mounted () {
    this.isShow = true
    sessionStorage.clear()
    const key = new NodeRSA({ b: 1024 })
    this.rsaKey.publicKey = key.exportKey('public')
    this.rsaKey.privateKey = key.exportKey('private')
  },
  methods: {
    // 预登录 获取后台公钥
    preLogin (formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          const res = await accountPreLogin({
            account: this.form.username,
            public_key: this.rsaKey.publicKey,
            verify_code: this.form.verificationCode,
            code_tag: this.time
          })
          if (res.data.result === 0) {
            // 保存session_id、后台公钥
            sessionStorage.setItem('session_id', res.data.session_id)
            sessionStorage.setItem('public_key', new NodeRSA(this.rsaKey.privateKey)
              .decrypt(res.data.public_key, 'utf8'))
            this.login()
          } else {
            this.form.verificationCode = ''
            this.time = Date.now() + '' + Math.floor(Math.random() * 100000)
          }
        }
      })
    },
    // 正式登录
    async login () {
      let pubKey = new NodeRSA(sessionStorage.getItem('public_key'))
      const res = await accountLogin({
        account: this.form.username,
        password: pubKey.encrypt(this.form.password, 'base64'),
        session_id: sessionStorage.getItem('session_id')
      })
      if (res.data.result === 0) {
        const accessToken = pubKey.decryptPublic(res.data.access_token, 'utf-8')
        sessionStorage.setItem('access_token', accessToken.substr(92))
        sessionStorage.setItem('username', res.data.username)
        this.$router.push({ name: 'field-manage' }) // 进入管理页面
        this.$handleSuccessMessage('登录成功')
      } else {
        this.form.verificationCode = ''
        this.time = Date.now() + '' + Math.floor(Math.random() * 100000)
      }
    },
    // 修改验证码图片
    changeImg () {
      this.time = Date.now() + '' + Math.floor(Math.random() * 100000)
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
