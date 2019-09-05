import moment from 'moment'
// 启用日期中去除停用时间
function removeInvalidTimeRange (timeRangeList, clearTimeRangeList) {
  let tempStart = timeRangeList[0]
  let tempEnd = timeRangeList[1]
  let finalDateObjList = []
  let temp = 0 // 临时标志位（表示是否启用时间未出现在所有停用日期区间内的次数）
  let length = clearTimeRangeList.length

  while (moment(tempStart).isSameOrBefore(tempEnd)) {
    for (let item of clearTimeRangeList) { // 循环所有停用日期区间，判断启用日期是否存在于停用日期区间内
      // item为空时 开始下次循环
      if (item.value === null) {
        temp = temp + 1
        continue
      }
      if (moment(tempStart).isBetween(item.value[0], item.value[1])) {
        break
      } else if (moment(tempStart).isSame(item.value[0]) || moment(tempStart).isSame(item.value[1])) {
        break
      } else {
        temp = temp + 1
      }
    }
    if (temp === length) { // 当启用日期不存在于所有停用日期区间内时存储为最终日期数组
      finalDateObjList.push(tempStart)
    }
    temp = 0
    tempStart = moment(tempStart).add(1, 'days').format('YYYY-MM-DD')
  }
  // console.log(finalDateObjList)
  return finalDateObjList
}
// 移除所有周末
function removeWeekend (initDateObjList) {
  let finalDateObjList = []
  for (let item of initDateObjList) {
    if (moment(item).format('E') !== '6' && moment(item).format('E') !== '7') {
      finalDateObjList.push(item)
      // console.log(item + '是周末')
    }
  }
  // console.log('执行去除周末')
  return finalDateObjList
}
// 处理单独通行日期
function handeleSpecialDate (initDateObjList, specialValidDateList, specialInvalidDateList) {
  // 增加单独通行日期
  for (let item of specialValidDateList) {
    if (initDateObjList.indexOf(item) === -1) {
      initDateObjList.push(item)
    }
  }
  // // 除去单独停用日期
  for (let item of specialInvalidDateList) {
    let index = initDateObjList.indexOf(item)
    if (index !== -1) {
      initDateObjList.splice(initDateObjList.indexOf(item), 1)
    }
  }
  return initDateObjList
}

// 合并日期和时间区间
function mergeDateObjAndTimeRange (initDateObjList, timeRangeList) {
  // 处理启用时间区间
  // let tempTimeList = []
  // for (let item of timeRangeList) {
  //   let tempObj = {}
  //   tempObj.begin = item.value[0]
  //   tempObj.end = item.value[1]
  //   tempTimeList.push(tempObj)
  // }
  // let finalDateObj = {}
  // // 生成最终时间对象
  // for (let item of initDateObjList) {
  //   finalDateObj[item.substring(5)] = tempTimeList
  // }
  // return finalDateObj

  let finalDateObjList = []
  // slots value 生成
  let solts = []
  for (let item of timeRangeList) {
    let tempObj = {}
    tempObj.begin = item.value[0]
    tempObj.end = item.value[1]
    solts.push(tempObj)
  }
  for (let item of initDateObjList) {
    let tempObj = {}
    tempObj.date = item
    tempObj.slots = solts
    finalDateObjList.push(tempObj)
  }
  return finalDateObjList
}

export { removeInvalidTimeRange, removeWeekend, handeleSpecialDate, mergeDateObjAndTimeRange }
