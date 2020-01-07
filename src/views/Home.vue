<template>
  <div class="home">
    <keep-alive>
      <Header/>
    </keep-alive>
    <div class="left" :class="{ collapse: $store.state.isCollapse }">
      <keep-alive>
        <SideMenu/>
      </keep-alive>
    </div>
    <div class="right">
      <Contain/>
    </div>
  </div>
</template>

<script>
import mqtt from 'mqtt'
import moment from 'moment'
import Header from '@comp/Header/Header'
import SideMenu from '@comp/Menu/SideMenu'
import Contain from '@comp/Contain/Contain'
export default {
  name: 'home',
  data () {
    return {
      isConnected: true, // 是否连接成功
      topicObj: {}, // mqtt订阅主题
      descObj: {
        true: '<strong style="color: #0aa858">恢复正常</strong><br>',
        false: '<strong style="color: #f4433c">发生异常</strong><br>'
      },
      onlineDesc: {
        true: '<strong style="color: #0aa858">恢复在线</strong><br>',
        false: '<strong style="color: #f4433c">离线</strong><br>'
      }
    }
  },
  components: {
    Header,
    SideMenu,
    Contain
  },
  mounted () {
    this.getMqttInfo()
  },
  beforeDestroy () {
    this.$store.state.mqttClient.end() // 离开页面前断开mqtt连接
  },
  methods: {
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
        // 订阅设备状态变更topic
        this.$store.state.mqttClient.subscribe(sessionStorage.statusTopic, { qos: 1 }, (error) => {
          if (!error) {
            this.topicObj.statusTopic = sessionStorage.statusTopic
            console.log('设备状态topic订阅成功')
          } else {
            console.log('设备状态topic订阅失败')
          }
        })
      })

      // 接收消息
      this.$store.state.mqttClient.on('message', (topic, message) => {
        // console.log(message.toString())
        const msgObj = JSON.parse(message)
        switch (topic) {
          // case this.topicObj.admin:
          //   this.$handleErrorNotify(`该账号于 ${this.transformToDateTime(msgObj.timestamp * 1000)} 重复登录`, '重复登录', 0)
          //   this.$store.state.mqttClient.end() // 断开mqtt连接
          //   this.$router.push({ name: 'login' })
          //   break
          case this.topicObj.statusTopic:
            const displaySatus = msgObj.display_status === null ? '' : '应用显示' + this.descObj[msgObj.display_status]
            const cameraStatus = msgObj.camera_status === null ? '' : '摄像头' + this.descObj[msgObj.camera_status]
            const alive = msgObj.alive === null ? '' : this.onlineDesc[msgObj.alive]
            this.$handleWarningNotify(
              `${msgObj.device_code} 设备 于${this.transformToDateTime(msgObj.timestamp * 1000)}<br>` +
              displaySatus + cameraStatus + alive, '设备状态变更', 0)
            // 添加异常处理
            try {
              // 页面处于设备管理页面时 发生状态变更刷新页面
              if (this.$route.name === 'device-manage') {
                this.$store.commit('changeIsRefreshDeviceList')
              }
            } catch (e) {
              console.error('Exception occurred by Home.vue', e)
            }
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
@import "../assets/stylus/init.stylus"
.home
  width 100%
  height 100%
  display flex
  padding-top 60px
  .left
    width $sideMenuWidth !important
    height 100%
    position relative
    overflow hidden
    transition all 0.4s ease
  .right
    flex 1
    position relative
    top 0
    left 0
  .collapse
    width 64px !important
</style>
