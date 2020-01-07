import axios from 'axios'
import store from '@/store/index.js' // 引入状态管理
import Router from '@/router/index.js'
import baseUrl from './baseUrl'
import { getType } from '@utils/dataHandle/getType.js' // 获取准确数据类型
import { Notification } from 'element-ui'

axios.defaults.baseURL = baseUrl
// axios.defaults.timeout = 10000

export default (method, url, data, config) => {
  method = method.toLowerCase()
  // 根据method实现对应请求方式
  switch (method) {
    case 'get':
      return axios({ method: 'get', url, headers: { 'Token': sessionStorage.token }, params: data })
      // return axios.get(url, { params: data })
    case 'post':
      // 判断headers中添加token
      if (sessionStorage.token) {
        if (config && config['Content-Type'] === 'multipart/form-data') {
          return axios({
            method: 'post',
            url,
            headers: {
              'Token': sessionStorage.token,
              'Content-Type': 'multipart/form-data'
            },
            data,
            config
          })
        }
        if (config) {
          return axios({ method: 'post', url, headers: { 'Token': sessionStorage.token }, data, responseType: 'blob' })
        }
        return axios({ method: 'post', url, headers: { 'Token': sessionStorage.token }, data })
      } else {
        return axios.post(url, data, config)
      }
    default:
      notificationError('错误', '请检查请求方式', 0)
      return false
  }
}

// 一、请求拦截器
axios.interceptors.request.use((config) => {
  store.commit('openIsSubmitting') // 更改为提交中
  if (config.headers['Content-Type'] === 'multipart/form-data') {
    const fm = new FormData()
    if (config.data) {
      for (let key in config.data) {
        // 参数存在时，FormData传递该参数
        if (config.data[key]) {
          fm.append(key, config.data[key])
        }
      }
    }
    config.data = fm
    return config
  }
  return config
}, (error) => {
  // 对请求错误做些什么
  notificationError('系统错误', '服务器连接失败')
  return Promise.reject(error)
})

// 二、响应拦截器
axios.interceptors.response.use((res) => {
  store.commit('closeIsSubmitting') // 更改为提交完成
  /*
    判断 返回值是否为 blob （两种情况）
    1、返回值为 文件流 （无需处理 直接返回下载）
    2、返回值为 错误码转化的blob （转为obj 并提示错误信息）
  */
  if (getType(res.data) === 'Blob') {
    // console.log(res.data)
    if (res.data.type === 'application/json') {
      let fileReader = new FileReader()
      fileReader.onload = (e) => {
        // console.log(e.target)
        let tempData = JSON.parse(e.target.result)
        notificationError('错误', tempData.msg, 2000)
      }
      fileReader.readAsText(res.data)
    }
    return res
  }
  // 返回值不为0，提示用户错误信息
  if (res.data.res !== 0) {
    notificationError('错误', res.data.msg, 2000)
  }
  return res
}, (error) => {
  if (error.response.status === 401) {
    // 防止异常导致无法退出
    try {
      if (store.state.mqttClient) {
        store.state.mqttClient.end() // 断开mqtt连接
      }
    } catch (e) { console.error(e) }
    store.commit('closeIsSubmitting') // 更改为提交完成
    notificationError('错误', 'Token失效', 3000)
    Router.push('/')
  } else {
    // 对响应错误做点什么
    notificationError('系统错误', '服务器连接失败')
  }
  return Promise.reject(error)
})

function notificationError (title, msg, duration) {
  Notification.error({
    title: title,
    message: msg,
    duration: duration !== null ? duration : 1500
  })
}
