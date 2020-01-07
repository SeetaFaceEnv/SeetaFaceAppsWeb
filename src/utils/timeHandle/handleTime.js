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
      finalDateObjList.push(item) // 添加非周末日期
    }
  }
  return finalDateObjList
}
// 处理单独通行日期
function handleSpecialDate (initDateObjList, specialValidDateList, specialInvalidDateList) {
  // 增加单独通行日期
  for (let item of specialValidDateList) {
    if (initDateObjList.indexOf(item) === -1) {
      initDateObjList.push(item)
    }
  }
  // 除去单独停用日期
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

// 获取某年内所有周末
function getWeekendByYear (year) {
  let finalDateList = []
  let tempStart = moment(year, 'YYYY').startOf('year').format('YYYY-MM-DD')
  let tempEnd = moment(year, 'YYYY').endOf('year').format('YYYY-MM-DD')
  while (moment(tempStart).isSameOrBefore(tempEnd)) {
    if (moment(tempStart).format('E') === '6' || moment(tempStart).format('E') === '7') {
      finalDateList.push(tempStart) // 添加周末日期
    }
    tempStart = moment(tempStart).add(1, 'days').format('YYYY-MM-DD')
  }
  return finalDateList
}

// 去除或添加周末
function mergeWeekend (dateList, weekendList, mergeType) {
  if (mergeType === 'add') {
    // Array => Obj
    let dateObj = {}
    dateList.forEach((date) => {
      dateObj[date] = true
    })
    weekendList.forEach((weekend) => {
      if (!dateObj[weekend]) {
        dateList.push(weekend)
      }
    })
    return dateList
  } else if (mergeType === 'remove') {
    let finalList = []
    // Array => Obj
    let weekendObj = {}
    weekendList.forEach((weekend) => {
      weekendObj[weekend] = true
    })
    dateList.forEach((date) => {
      if (!weekendObj[date]) {
        finalList.push(date)
      }
    })
    return finalList
  } else {
    console.error('请检查周末合并类型是否正确！')
  }
}

export
{
  removeInvalidTimeRange, removeWeekend, handleSpecialDate, mergeDateObjAndTimeRange,
  getWeekendByYear, mergeWeekend
}
