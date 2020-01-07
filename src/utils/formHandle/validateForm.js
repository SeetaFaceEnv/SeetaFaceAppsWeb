// 密码校验 6位以上 30位以下
function validatePasswordMoreSixAndLessThirty (rule, value, callback) {
  const reg = /^.{6,30}$/
  if (value && !reg.test(value)) {
    callback(new Error('密码必须大于等于6位且小于30位'))
  } else {
    callback()
  }
}
// 用户名校验 6位以上 30位以下
function validateUserNameMoreSixAndLessThirty (rule, value, callback) {
  const reg = /^.{6,30}$/
  if (value && !reg.test(value)) {
    callback(new Error('用户名必须大于等于6位且小于30位'))
  } else {
    callback()
  }
}
// 设备名校验 30位以下
function validateDeviceNameLessThirty (rule, value, callback) {
  const reg = /^.{0,30}$/
  if (value && !reg.test(value)) {
    callback(new Error('设备名必须小于30位'))
  } else {
    callback()
  }
}

export { validatePasswordMoreSixAndLessThirty, validateUserNameMoreSixAndLessThirty, validateDeviceNameLessThirty }
