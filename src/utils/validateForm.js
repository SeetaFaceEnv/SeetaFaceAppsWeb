// 密码校验 6位以上
export function validatePasswordMoreSix (rule, value, callback) {
  const reg = /^.{6,}$/
  if (value && !reg.test(value)) {
    callback(new Error('密码必须大于等于6位'))
  } else {
    callback()
  }
}
