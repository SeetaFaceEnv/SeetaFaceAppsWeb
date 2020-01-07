<template>
  <div id="pass-display">
    <div id="header">
      <!-- <h1>设备管理平台</h1> -->
      <div @click="toWelcome()" id="right-top-title">
        <i class="fa fa-chevron-right" aria-hidden="true"></i>
        管理页面
      </div>
    </div>

    <!-- 中流砥柱 -->
    <div id="pass-info-show">
      <div class="pass-member-item" v-for="(item, index) in passInfoList" :key="index">
        <el-image class="pass-member-image" :src="'data:image/png;base64,' + item.capture_image">
          <div slot="placeholder" class="loading-img">
            <i class="fa fa-spinner fa-3x fa-pulse" aria-hidden="true"></i>
          </div>
        </el-image>
        <!-- <div v-for="(val, key, index2) in item.attributes" :key="index2">
          {{ key }}：{{ val }}
        </div> -->
      </div>
    </div>
  </div>
</template>
<script>
import mqtt from 'mqtt'
import moment from 'moment'
export default {
  data () {
    return {
      isConnected: true, // 是否连接成功
      passInfoList: [],
      topicObj: {} // mqtt订阅主题
    }
  },
  mounted () {
    this.getMqttInfo()
  },
  beforeDestroy () {
    this.$store.state.mqttClient.end() // 离开页面前断开mqtt连接
  },
  methods: {
    toWelcome () {
      this.$router.push({ name: 'welcome' })
    },
    // 获取mqtt url
    getMqttInfo () {
      if (sessionStorage.mqttUrl) {
        this.connectMqtt(sessionStorage.mqttUrl, sessionStorage.mqttUser || '', sessionStorage.mqttPassword || '')
      } else {
        this.$handleErrorNotify('请检查mqtt地址！', 'EMQ连接失败', 0)
      }
    },
    // 连接mqtt
    connectMqtt (url, user, pwd) {
      const options = {
        keepAliveInterval: 30000,
        connectTimeout: 4000, // 超时时间
        username: user,
        password: pwd
      }
      this.$store.state.mqttClient = mqtt.connect(url, options)

      this.$store.state.mqttClient.on('connect', (e) => {
        console.log('成功连接服务器')
        // 订阅识别展示topic
        this.$store.state.mqttClient.subscribe(sessionStorage.recordTopic, { qos: 1 }, (error) => {
          if (!error) {
            this.topicObj.passDisplay = sessionStorage.recordTopic
            console.log('识别展示topic订阅成功')
          } else {
            console.log('识别展示topic订阅失败')
          }
        })
      })
      // 接收消息
      this.$store.state.mqttClient.on('message', (topic, message) => {
        // console.log(JSON.parse(message))
        const msgObj = JSON.parse(message)
        switch (topic) {
          // case this.topicObj.session:
          //   this.$handleErrorNotify(`该账号于 ${this.transformToDateTime(msgObj.timestamp * 1000)} 重复登录`, '重复登录', 0)
          //   this.$store.state.mqttClient.end() // 断开mqtt连接
          //   this.$router.push({ name: 'login' })
          //   break
          case this.topicObj.passDisplay:
            this.passInfoList.push(msgObj)
            if (this.passInfoList.length > 3) {
              this.passInfoList.shift()
            }
            setTimeout(() => {
              this.passInfoList = []
            }, 3000)
            break
        }
      })
      // 断开发起重连
      this.$store.state.mqttClient.on('reconnect', (error) => {
        if (this.isConnected) {
          this.isConnected = false
          console.log('正在重连:', error)
          this.$handleErrorNotify('mqtt连接异常，请联系管理员！', 'EMQ重连失败', 3000)
        }
      })
      // 异常处理
      this.$store.state.mqttClient.on('error', (error) => {
        console.log('连接失败:', error)
      })
    },
    // 时间戳转换为标准时间
    transformToDateTime (val) {
      return moment(val).format('YYYY-MM-DD HH:mm:ss')
    }
  }
}
</script>
<style lang="stylus" scoped>
#pass-display
  color white
  position fixed
  height 100%
  width 100%
  min-height 600px
  min-width 800px
  background url("../../assets/images/pass-bg.png") center no-repeat
  background-color #06121A
  background-size 100% 100%
  #header
    height 8%
    width 100%
    // border 1px solid red
  #right-top-title
    position absolute
    right 0
    top 1%
    font-size 18px
    width 200px
    cursor pointer
    // border 1px solid red
  #pass-info-show
    position absolute
    top 20%
    left 28%
    width 44%
    height 48%
    // background url('../../assets/images/pass-bg.png') center
    // background-size cover
    display flex
    align-items center
    justify-content space-around
    .pass-member-item
      width 30%
      color white
      font-size 20px
      // border 2px solid green
    .pass-member-image
      width 160px
      height 200px
i
  margin-right 10px
#show-pass-member
  position fixed
  display flex
  align-items center
  justify-content space-around
  top 20%
  left 28%
  width 44%
  height 48%
  z-index 1000
  // border 2px solid red
  .pass-member-item
    width 30%
    color white
    font-size 20px
    // border 2px solid green
    .pass-member-image
      width 160px
      height 200px
</style>
