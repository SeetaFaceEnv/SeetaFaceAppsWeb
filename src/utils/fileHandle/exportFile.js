import { Parser } from 'json2csv'

// 导出csv文件
function exportCSV (data, fields, fileName) {
  try {
    const json2csvParser = new Parser({ fields }) // 设置需要导出的字段
    const csv = json2csvParser.parse(data) // 检索数据
    let csvContent = 'data:text/csv;charset=GBK,\uFEFF' + csv // 准备下载格式
    let encodedUri = encodeURI(csvContent) // 生成下载地址
    let link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `${(fileName || 'file')}.csv`)
    document.body.appendChild(link) // Required for FF
    link.click() // This will download the data file named 'my_data.csv'.
    document.body.removeChild(link) // Required for FF
  } catch (err) {
    console.error(err)
  }
}

export { exportCSV }
