import axios from 'axios'
import Router from '@/router'
import { Notification } from 'element-ui'
// 引入状态管理
import store from '../store'

const baseUrl = window.g.baseURL

axios.defaults.baseURL = baseUrl

// axios.defaults.timeout = 10000

export default async (url, data) => {
  let res
  res = await axios.post(url, data)
  // token过期，返回登录页
  if (res.data.result === 1111) {
    Notification.error({
      title: '错误',
      message: res.data.msg,
      duration: 3000
    })
    Router.push('/')
  } else if (res.data.result !== 0) {
    // 返回值不为0，提示用户错误信息
    Notification.error({
      title: '错误',
      message: res.data.msg,
      duration: 2000
    })
  }
  return res
}

// 一、请求拦截器
axios.interceptors.request.use(function (config) {
  store.commit('openIsSubmitting') // 更改为提交中
  const fm = new FormData()
  if (config.data) {
    for (let key in config.data) {
      // 参数存在时，FormData传递该参数
      if (config.data[key]) {
        fm.append(key, config.data[key])
      }
    }
  }
  // 添加session_id
  if (sessionStorage.session_id) {
    fm.append('session_id', sessionStorage.session_id)
  }
  config.data = fm
  return config
}, function (error) {
  // 对请求错误做些什么
  Notification.error({
    title: '系统错误',
    message: '服务器连接失败',
    duration: 1500
  })
  return Promise.reject(error)
})
// 二、响应拦截器
axios.interceptors.response.use(function (response) {
  store.commit('closeIsSubmitting') // 更改为提交完成
  return response
}, function (error) {
  // 对响应错误做点什么
  Notification.error({
    title: '系统错误',
    message: '服务器连接失败',
    duration: 1500
  })
  return Promise.reject(error)
})
