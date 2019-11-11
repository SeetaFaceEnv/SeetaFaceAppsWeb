// 获取准确数据类型
function getType (val) {
  let type = typeof val
  if (type !== 'object') {
    return type
  }
  return Object.prototype.toString.call(val).replace(/^\[object (\S+)\]$/, '$1')
}

export { getType }
