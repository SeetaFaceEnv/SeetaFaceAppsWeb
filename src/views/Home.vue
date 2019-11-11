<template>
  <div class="home">
    <Header></Header>
    <div class="left" :class="{ collapse: $store.state.isCollapse }">
      <SideMenu/>
    </div>
    <div class="right">
      <Contain></Contain>
    </div>
  </div>
</template>

<script>
import mqtt from 'mqtt'
import moment from 'moment'
import Header from '@comp/Header/Header'
import SideMenu from '@comp/Menu/SideMenu'
import Contain from '@comp/Contain/Contain'
import { getMqttInfo } from '@api/getData'
export default {
  components: {
    Header,
    SideMenu,
    Contain
  },
  mounted () {
    this.getMqttUrl()
  },
  methods: {
    // 获取mqtt url
    async getMqttUrl () {
      const res = await getMqttInfo()
      if (res.data.result === 0) {
        const url = window.atob(res.data.mqtt_url)
        this.connectMqtt(url, res.data.mqtt_user || '', res.data.mqtt_pwd || '')
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
        // 订阅一个主题
        this.$store.state.mqttClient.subscribe(`admin:topic_id:${sessionStorage.topic_id}`, { qos: 1 }, (error) => {
          if (!error) {
            this.$store.state.mqttTopic = `admin:topic_id:${sessionStorage.topic_id}`
            console.log('订阅成功')
          } else {
            console.log('订阅失败')
          }
        })
      })
      // 接收消息
      this.$store.state.mqttClient.on('message', (topic, message) => {
        // console.log('收到来自', topic, '的消息', message.toString())
        const msgObj = JSON.parse(message)
        switch (msgObj.command) {
          case 'device_status_change':
            this.notifyDeviceStatusChange(msgObj)
            // 添加异常处理
            try {
              // 页面处于设备管理页面时 发生状态变更刷新页面
              if ((msgObj.content.status_type === 5 || msgObj.content.status_type === 6) &&
                this.$route.name === 'device-manage') {
                this.$store.commit('changeIsRefreshDeviceList')
              }
            } catch (e) {
              console.log('Exception occurred by Home.vue', e)
            }
            break
          case 'image_register_fail':
            this.$handleErrorNotify('人员照片注册失败')
            break
          case 'repeat_login':
            this.$handleErrorNotify(`该账号于 ${this.transformToDateTime(msgObj.content.time)} 重复登录`, '重复登录', 0)
            this.$store.state.mqttClient.unsubscribe(topic) // 退出登录前 取消订阅当前消息通道
            this.$router.push({ name: 'login' })
            break
        }
      })
      // 断开发起重连
      this.$store.state.mqttClient.on('reconnect', (error) => {
        console.log('正在重连:', error)
      })
      // 异常处理
      this.$store.state.mqttClient.on('error', (error) => {
        console.log('连接失败:', error)
      })
    },
    // 通知用户设备状态变更
    notifyDeviceStatusChange (msgObj) {
      const normalType = {
        1: '摄像头恢复正常',
        3: '应用显示恢复正常',
        5: '恢复在线'
      }
      const exceptionType = {
        2: '摄像头异常',
        4: '应用显示异常',
        6: '离线'
      }
      if (msgObj.content.status_type in normalType) { // 提示设备状态恢复正常
        this.$handleSuccessNotify(` ${msgObj.content.device_name} 设备于 ${this.transformToDateTime(msgObj.content.time)}
          ${normalType[msgObj.content.status_type]}`, '恢复', 0)
      } else { // 提示设备状态出现异常
        this.$handleErrorNotify(` ${msgObj.content.device_name} 设备于 ${this.transformToDateTime(msgObj.content.time)}
          ${exceptionType[msgObj.content.status_type]}`, '异常', 0)
      }
    },
    // 时间戳转换为标准时间
    transformToDateTime (val) {
      return moment(val).format('YYYY-MM-DD HH:mm:ss')
    }
  }
}
</script>
<style lang="stylus" scoped>
.home
  width 100%
  height 100%
  display flex
  padding-top 60px
  .left
    width 200px !important
    height 100%
    position relative
    overflow hidden
  .right
    flex 1
    position relative
    top 0
    left 0

  .collapse
    width 64px !important
</style>
