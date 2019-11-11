import axios from './axios'
// URL前缀
const BACKEND = 'backend'
// 请求方式
const POST = 'post'

// 登录
const ACCOUNT = '/account'
export const accountPreLogin = (data) => axios(POST, BACKEND + ACCOUNT + '/preLogin', data) // 预登录
export const accountLogin = (data) => axios(POST, BACKEND + ACCOUNT + '/login', data) // 登录
export const accountLogout = (data) => axios(POST, BACKEND + ACCOUNT + '/logout', data) // 登出
export const accountResetPassword = (data) => axios(POST, BACKEND + ACCOUNT + '/resetPassword', data) // 修改密码
// 获取mqtt url
export const getMqttInfo = (data) => axios(POST, BACKEND + ACCOUNT + '/getMqttInfo', data) // 预登录

// 系统
const CONFIG = '/config'
export const getConfigList = (data) => axios(POST, BACKEND + CONFIG + '/get', data) // 获取配置
export const setConfigList = (data) => axios(POST, BACKEND + CONFIG + '/set', data) // 修改配置

// 字段
const FIELD = '/field'
export const getFieldList = (data) => axios(POST, BACKEND + FIELD + '/list', data) // 字段列表
export const addFieldList = (data) => axios(POST, BACKEND + FIELD + '/add', data) // 添加字段
export const editFieldList = (data) => axios(POST, BACKEND + FIELD + '/edit', data) // 编辑字段
export const delFieldList = (data) => axios(POST, BACKEND + FIELD + '/delete', data) // 删除字段

// 人员
const MEMBER = '/member'
export const getMemberList = (data) => axios(POST, BACKEND + MEMBER + '/list', data) // 人员列表
export const addMemberList = (data) => axios(POST, BACKEND + MEMBER + '/add', data) // 添加人员
export const editMemberList = (data) => axios(POST, BACKEND + MEMBER + '/edit', data) // 编辑人员
export const delMemberList = (data) => axios(POST, BACKEND + MEMBER + '/delete', data) // 删除人员

// 设备
const DEVICE = '/device'
export const getDeviceList = (data) => axios(POST, BACKEND + DEVICE + '/list', data) // 设备列表
export const addDeviceList = (data) => axios(POST, BACKEND + DEVICE + '/add', data) // 添加设备
export const editDeviceList = (data) => axios(POST, BACKEND + DEVICE + '/edit', data) // 编辑设备
export const delDeviceList = (data) => axios(POST, BACKEND + DEVICE + '/delete', data) // 删除设备
export const findDeviceList = (data) => axios(POST, BACKEND + DEVICE + '/find', data) // 发现未知设备
export const editDeviceStreamList = (data) => axios(POST, BACKEND + DEVICE + '/editStream', data) // 编辑流媒体
export const updateApk = (data) => axios(POST, BACKEND + DEVICE + '/updateApk', data) // Apk升级
export const responseDeviceList = (data) => axios(POST, BACKEND + DEVICE + '/test', data) // 设备应答

// 设备组
const GROUP = '/group'
export const getDeviceGroupList = (data) => axios(POST, BACKEND + GROUP + '/list', data) // 设备组列表
export const addDeviceGroupList = (data) => axios(POST, BACKEND + GROUP + '/add', data) // 添加设备组
export const editDeviceGroupList = (data) => axios(POST, BACKEND + GROUP + '/edit', data) // 编辑设备组
export const delDeviceGroupList = (data) => axios(POST, BACKEND + GROUP + '/delete', data) // 删除设备组

// 流媒体
const STREAM = '/stream'
export const getStreamList = (data) => axios(POST, BACKEND + STREAM + '/list', data) // 流媒体列表
export const addStreamList = (data) => axios(POST, BACKEND + STREAM + '/add', data) // 添加流媒体
export const editStreamList = (data) => axios(POST, BACKEND + STREAM + '/edit', data) // 编辑流媒体
export const delStreamList = (data) => axios(POST, BACKEND + STREAM + '/delete', data) // 删除流媒体

// 通行时间模板
const TIME_TEMPLATE = '/time_template'
export const getTimeTemplateList = (data) => axios(POST, BACKEND + TIME_TEMPLATE + '/list', data) // 通行时间模板列表
export const addTimeTemplateList = (data) => axios(POST, BACKEND + TIME_TEMPLATE + '/add', data) // 添加通行时间模板
export const editTimeTemplateList = (data) => axios(POST, BACKEND + TIME_TEMPLATE + '/edit', data) // 编辑通行时间模板
export const delTimeTemplateList = (data) => axios(POST, BACKEND + TIME_TEMPLATE + '/delete', data) // 删除通行时间模板

// 通行记录
const PASS_RECORD = '/pass_record'
export const getPassRecordList = (data) => axios(POST, BACKEND + PASS_RECORD + '/list', data) // 通行记录列表
export const exportMemberRecordList = (data) => axios(POST, BACKEND + PASS_RECORD + '/exportRecord', data, { responseType: 'blob' }) // 导出通行数据
export const exportStatisticsRecordList = (data) => axios(POST, BACKEND + PASS_RECORD + '/statisticsRecord', data, { responseType: 'blob' }) // 导出统计数据

// 日志记录
const ERR_LOG = '/error_log'
export const getLogRecordList = (data) => axios(POST, BACKEND + ERR_LOG + '/list', data) // 日志记录列表
