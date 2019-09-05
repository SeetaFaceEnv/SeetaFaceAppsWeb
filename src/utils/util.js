const Utils = {
  install (Vue, option) {
    // 成功消息
    Vue.prototype.$handleSuccessMessage = msg => {
      Vue.prototype.$message({
        type: 'success',
        message: msg || '操作成功',
        duration: 1500
      })
    }
    // 失败消息
    Vue.prototype.$handleErrorMessage = msg => {
      Vue.prototype.$message({
        type: 'error',
        message: msg || '操作失败',
        duration: 1500
      })
    }
    // 警告消息
    Vue.prototype.$handleWarningMessage = (msg, duration) => {
      Vue.prototype.$message({
        type: 'warning',
        message: msg || '警告',
        duration: duration !== null ? duration : 1500
      })
    }
    // 信息消息
    Vue.prototype.$handleInfoMessage = msg => {
      Vue.prototype.$message({
        type: 'info',
        message: msg || '消息',
        duration: 1500
      })
    }
    // 成功通知
    Vue.prototype.$handleSuccessNotify = (msg, title, duration) => {
      Vue.prototype.$notify({
        type: 'success',
        title: title || '成功',
        message: msg || '操作成功',
        duration: duration !== null ? duration : 1500
      })
    }
    // 错误通知
    Vue.prototype.$handleErrorNotify = (msg, title, duration) => {
      Vue.prototype.$notify({
        type: 'error',
        title: title || '错误',
        message: msg || '未知错误',
        duration: duration !== null ? duration : 1500
      })
    }
    // 警告通知
    Vue.prototype.$handleWarningNotify = (msg, title, duration) => {
      Vue.prototype.$notify({
        type: 'warning',
        title: title || '警告',
        message: msg,
        duration: duration !== null ? duration : 1500
      })
    }
    // 消息通知
    Vue.prototype.$handleInfoNotify = (msg, title, duration) => {
      Vue.prototype.$notify({
        type: 'info',
        title: title || '消息',
        message: msg,
        duration: duration !== null ? duration : 1500
      })
    }
  }
}

export default Utils
