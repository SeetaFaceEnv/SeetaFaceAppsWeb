<template>
  <div class="exception">
    <div class="imgBlock">
      <div class="imgEle" :style="{backgroundImage: `url(${config[type].img})`}">
      </div>
    </div>
    <div class="content">
      <h1>{{ config[type].title }}</h1>
      <div class="desc">{{ config[type].desc }}</div>
      <div class="actions">
        <el-button @click="handleToHome">返回首页</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import types from './type'
export default {
  name: 'Exception',
  props: {
    type: {
      type: String,
      default: '404'
    }
  },
  data () {
    return {
      config: types
    }
  },
  methods: {
    handleToHome () {
      // 是否登录 返回不同页面
      if (sessionStorage.sessionId) {
        this.$router.push({ name: 'welcome' })
      } else {
        this.$router.push({ name: 'login' })
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.exception
  display flex
  display -webkit-flex
  align-items center
  justify-content center
  padding 10% 20%
  min-height 500px

  .imgBlock
    flex 1

  .imgEle
    width 100%
    max-width 430px
    height 360px
    background-repeat no-repeat
    background-position 50% 50%
    background-size contain

  .content
    flex 1

    h1
      margin-bottom 24px
      color #434e59
      font-weight 600
      font-size 72px
      line-height 72px

    .desc
      margin-bottom 16px
      color #434e59
      font-size 20px
      line-height 28px

    .actions
      button:not(:last-child)
        margin-right 8px

@media screen and (max-width: 768px) {
  .exception {
    padding 10% 0
  }
}
</style>
