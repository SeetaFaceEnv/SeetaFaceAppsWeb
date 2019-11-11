<template>
  <transition name="header-fade-show">
    <nav v-show="isShow" class="header">
      <!-- 顶部导航 -->
      <div class="container">
        <ul class="container-left-ul">
          <li style="width: 150px">
            <img id="icon" src="@assets/images/logo.png"/>
          </li>
          <li :class="activeName === item.titleName ? 'menu-item-active' : 'container-left-li'" @click="toActiveMenuItem(item)"
            v-for="(item, index) in leftMenuList" :key="index">
            {{ item.titleName }}
          </li>
        </ul>
        <ul class="container-right-ul">
          <li style="width: 70px" :class="activeName === item.titleName ? 'menu-item-active' : 'container-right-li'" @click="toActiveMenuItem(item)"
            v-for="(item, index) in rightMenuList" :key="index">
            {{ item.titleName }}
          </li>
          <li style="margin-left: 20px">
            <i style="font-size: 20px" class="el-icon-s-custom"></i>
            <el-dropdown @command="clickDropdownItem">
              <span class="el-dropdown-link">
                {{username}}<i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="changePassword">
                  <i class="fa fa-key" aria-hidden="true"></i>修改密码
                </el-dropdown-item>
                <el-dropdown-item command="exit">
                  <i class="fa fa-sign-out" aria-hidden="true"></i>退出
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </li>
          <!-- <li id="bars" @click="dropDownShow = !dropDownShow">
            <i class="fa fa-bars fa-lg"/>
          </li> -->
        </ul>
      </div>
      <!-- 下拉菜单 -->
      <!-- <transition name="el-zoom-in-top">
        <div v-show="dropDownShow" class="dropdown">
          <ul class="dropdown-top-ul">
            <li @click="toActiveMenuItem(item)" class="dropdown-top-li" v-for="(item, index) in leftMenuList" :key="index">{{ item.titleName }}</li>
          </ul>
          <ul class="dropdown-bottom-ul">
            <li @click="toActiveMenuItem(item)" class="dropdown-bottom-li" v-for="(item, index) in rightMenuList" :key="index">{{ item.titleName }}</li>
          </ul>
        </div>
      </transition> -->
      <!-- 编辑框 -->
      <el-dialog
        :title="titleText"
        :modal-append-to-body='false'
        :visible.sync="dialogVisible"
        width="440px"
        class="input_box"
        @close="dialogClose()">
        <el-form :model="form" :rules="rules" style="text-align: left" ref="form" label-width="120px">
          <el-form-item label="原密码：" prop="password">
            <el-input v-model="form.password" type="password" style="width: 200px">
              <i slot="prefix" style="padding-left: 6px" class="fa fa-lock" aria-hidden="true"></i>
            </el-input>
          </el-form-item>
          <el-form-item label="新密码：" prop="password_new">
            <el-input v-model="form.password_new" type="password" style="width: 200px">
              <i slot="prefix" style="padding-left: 6px" class="fa fa-unlock-alt" aria-hidden="true"></i>
            </el-input>
          </el-form-item>
          <el-form-item label="确认密码：" prop="password_new_sure">
            <el-input v-model="form.password_new_sure" type="password" style="width: 200px">
              <i slot="prefix" style="padding-left: 6px" class="fa fa-unlock-alt" aria-hidden="true"></i>
            </el-input>
            <!-- 待添加二次确认密码验证 -->
            <!-- <i v-if="validatePasswordSure" class="el-icon-success" style="font-size: 22px;margin-left:5px;color: #0aa858"></i> -->
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogClose()">取 消</el-button>
          <el-button @click="formSubmit('form')">确 定</el-button>
        </div>
      </el-dialog>
    </nav>
  </transition>
</template>
<script>
import NodeRSA from 'node-rsa'
import { accountLogout, accountResetPassword } from '@api/getData'
import { validatePasswordMoreSix } from '@utils/validateForm'
export default {
  name: 'Header',
  data () {
    // 校验确认密码是否一致
    let validatePasswordSure = (rule, value, callback) => {
      if (value !== this.form.password_new) {
        callback(new Error('新密码与确认密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      isShow: false,
      username: sessionStorage.username,
      dropDownShow: false, // 控制下拉菜单显示
      leftMenuList: [ // 左侧菜单内容
      ],
      rightMenuList: [ // 右侧菜单内容
        { activeName: 'About', titleName: '关于我们', activeUrl: 'http://www.seetatech.com/index.html' }
      ],
      activeName: '', // 导航栏激活名称
      color: '',
      menuColor: {
        activeColor: localStorage.color || '#f4433c'
      },
      titleText: '修改密码', // 编辑框标题
      dialogVisible: false,
      form: {},
      rules: { // 表单校验
        password: [
          { required: true, message: '请输入原密码', trigger: 'blur' },
          { validator: validatePasswordMoreSix, trigger: 'blur' }
        ],
        password_new: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { validator: validatePasswordMoreSix, trigger: 'blur' }
        ],
        password_new_sure: [
          { required: true, message: '请再次确认密码', trigger: 'blur' },
          { validator: validatePasswordMoreSix, trigger: 'blur' },
          { validator: validatePasswordSure, trigger: 'blur' }
        ]
      }
    }
  },
  mounted () {
    this.isShow = true
  },
  methods: {
    toActiveMenuItem (item) { // 激活导航菜单
      // this.activeName = item.titleName
      window.open(item.activeUrl, '_blank')
    },
    async clickDropdownItem (command) {
      switch (command) {
        case 'changePassword':
          this.dialogVisible = true
          break
        case 'exit':
          const res = await accountLogout({})
          if (res.data.result === 0) {
            if (this.$store.state.mqttClient && this.$store.state.mqttTopic) {
              this.$store.state.mqttClient.unsubscribe(this.$store.state.mqttTopic) // 退出登录前 取消订阅当前消息通道
            }
            this.$router.push({ name: 'login' })
            this.$handleSuccessMessage('退出成功')
          }
          break
      }
    },
    formSubmit (formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          let pubKey = new NodeRSA(sessionStorage.getItem('public_key'))
          let tempForm = {}
          this.$set(tempForm, 'password', pubKey.encrypt(this.form.password, 'base64'))
          this.$set(tempForm, 'password_new', pubKey.encrypt(this.form.password_new, 'base64'))
          const res = await accountResetPassword({
            ...tempForm
          })
          if (res.data.result === 0) {
            this.$handleSuccessMessage('密码修改成功')
            this.$router.push({ name: 'login' }) // 回到登录页面
            this.dialogVisible = false
          }
        }
      })
    },
    dialogClose () {
      this.dialogVisible = false
      // 清除校验信息
      this.$refs.form.clearValidate()
      this.form = {}
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "../../assets/stylus/init.stylus"
.header
  color $headerTextColor
  background $headerBg
  height $header-height
  width 100%
  position fixed
  top 0
  padding 0 40px 0 20px
  z-index 100
  box-shadow darkgrey 0 0 20px 0
  .container
    width 100%
    height 100%
    .container-left-ul
      float left
      li
        height 100%
        user-select none
        line-height $header-height
        width $header-li-width
        display inline-block
      #icon
        height 30px
        vertical-align middle
        user-select none
      .container-left-li:hover
        color $activeColor
        box-shadow 0px -4px 0px $activeColor inset
    .container-right-ul
      float right
      li
        height 100%
        user-select none
        line-height $header-height
        // width $header-li-width
        display inline-block
      .container-right-li:hover
        color $activeColor
        box-shadow:0px -4px 0px $activeColor inset
      #bars > i
        margin-left 20px
        padding 8px 14px
        border 1px $headerTextColor solid
        border-radius 5px
  .dropdown
    width 100%
    background $headerBg
    li
      height 40px
      line-height 40px
      font-weight 900
    li:hover
      color $activeColor

.menu-item-active
  color $activeColor
  box-shadow 0px -4px 0px $activeColor inset

// @media screen and (max-width: 1200px) {
//   .header {
//     padding 0
//   }
// }
// @media screen and (max-width: 768px) {
//   .container-left-li {
//     display none !important
//   }
//   .container-right-li {
//     display none !important
//   }
// }
// @media screen and (min-width: 768px) {
//   #bars {
//     display none
//   }
//   .dropdown {
//     display none
//   }
// }
</style>
