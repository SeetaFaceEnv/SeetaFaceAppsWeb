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
          <!-- <li @click="changeLanguage" style="margin-left: 20px">
            <i style="font-size: 20px" class="fa fa-globe" aria-hidden="true"></i>
            {{ $t("headerInfo.language") }}
          </li> -->
          <li style="margin-left: 20px">
            <i style="font-size: 20px" class="el-icon-s-custom"></i>
            <el-dropdown @command="clickDropdownItem">
              <span class="el-dropdown-link">
                {{ username }}
                <i style="color: #9C9C9C" class="fa fa-vimeo-square fa-lg" aria-hidden="true"></i>
                <i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <!-- <el-dropdown-item command="changePassword">
                  <i class="fa fa-key" aria-hidden="true"></i>修改密码
                </el-dropdown-item> -->
                <el-dropdown-item command="exit">
                  <i class="fa fa-sign-out" aria-hidden="true"></i>
                  {{ $t("headerInfo.logout") }}
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
      <!-- 对话框 -->
      <el-dialog
        :title="titleText"
        :modal-append-to-body='false'
        :visible.sync="dialogVisible"
        width="440px"
        class="input_box"
        @close="dialogClose()">
        <el-form :model="form" :rules="rules" style="text-align: left" ref="form" label-width="120px">
          <el-form-item label="原密码：" prop="password">
            <el-input v-model="form.password" type="password" style="width: 200px" show-password>
              <i slot="prefix" style="padding-left: 6px" class="fa fa-lock" aria-hidden="true"></i>
            </el-input>
          </el-form-item>
          <el-form-item label="新密码：" prop="password_new">
            <el-input v-model="form.password_new" type="password" style="width: 200px" show-password>
              <i slot="prefix" style="padding-left: 6px" class="fa fa-unlock-alt" aria-hidden="true"></i>
            </el-input>
          </el-form-item>
          <el-form-item label="确认密码：" prop="password_new_sure">
            <el-input v-model="form.password_new_sure" type="password" style="width: 200px" show-password>
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
import { adminLogout, editAdminList } from '@api/getData'
import { validatePasswordMoreSixAndLessThirty } from '@utils/formHandle/validateForm.js'
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
        { activeName: 'PassDisplay', titleName: '识别展示', routerName: 'pass-display' },
        { activeName: 'Theme', titleName: this.$t('headerInfo.theme'), stateMutation: 'changeIsThemeMenuShow' }
      ],
      activeName: '', // 导航栏激活名称
      color: '',
      menuColor: {
        activeColor: localStorage.color || '#f4433c'
      },
      titleText: '修改密码', // 对话框标题
      dialogVisible: false,
      form: {},
      rules: { // 表单校验
        password: [
          { required: true, message: '请输入原密码', trigger: 'blur' },
          { validator: validatePasswordMoreSixAndLessThirty, trigger: 'blur' }
        ],
        password_new: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { validator: validatePasswordMoreSixAndLessThirty, trigger: 'blur' }
        ],
        password_new_sure: [
          { required: true, message: '请再次确认密码', trigger: 'blur' },
          { validator: validatePasswordMoreSixAndLessThirty, trigger: 'blur' },
          { validator: validatePasswordSure, trigger: 'blur' }
        ]
      }
    }
  },
  mounted () {
    this.isShow = true
    if (!localStorage.locale) {
      localStorage.setItem('locale', 'zh')
    }
  },
  methods: {
    toActiveMenuItem (item) { // 激活导航菜单
      switch (item.activeName) {
        case 'Theme':
          this.$store.commit(item.stateMutation)
          break
        case 'PassDisplay':
          this.$router.push({ name: item.routerName })
          break
        default:
          console.warn('请检查菜单选项！')
          break
      }
      // this.activeName = item.titleName
    },
    async clickDropdownItem (command) {
      switch (command) {
        case 'changePassword':
          this.dialogVisible = true
          break
        case 'exit':
          this.$confirm('是否退出登录?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(async () => {
            const res = await adminLogout()
            if (res.data.res === 0) {
              // if (this.$store.state.mqttClient) {
              //   this.$store.state.mqttClient.end() // 断开mqtt连接
              // }
              this.$router.replace({ name: 'login' })
              this.$handleSuccessMessage('退出成功')
            }
          }).catch((e) => { console.log(e) })
          break
      }
    },
    formSubmit (formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          let tempForm = {}
          // tempForm.password = aesEncryptByLocal(this.form.password)
          // tempForm.newPassword = aesEncryptByLocal(this.form.password_new)
          const res = await editAdminList({
            ...tempForm
          })
          if (res.data.res === 0) {
            this.$handleSuccessMessage('密码修改成功')
            if (this.$store.state.mqttClient) {
              this.$store.state.mqttClient.end() // 断开mqtt连接
            }
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
    },
    changeLanguage () {
      this.$router.go(0)
      localStorage.setItem('locale', localStorage.locale === 'zh' ? 'en' : 'zh')
      this.$i18n.locale = localStorage.locale // 切换显示语言
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
    overflow hidden
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
