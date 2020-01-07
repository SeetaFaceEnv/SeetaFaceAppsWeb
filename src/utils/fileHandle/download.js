function download (data, fileName) {
  const blob = new Blob([data])
  const downloadElement = document.createElement('a')
  const href = window.URL.createObjectURL(blob) // 创建下载的链接
  downloadElement.href = href
  downloadElement.download = fileName // 下载后文件名(含有后缀)
  document.body.appendChild(downloadElement) // 追加a标签
  downloadElement.click() // 点击下载
  document.body.removeChild(downloadElement) // 下载完成移除元素
  window.URL.revokeObjectURL(href) // 释放掉blob对象
}

export { download }
