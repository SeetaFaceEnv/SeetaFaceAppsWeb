import axios from './axios'

const BACKEND = 'backend'

// 登录
const ACCOUNT = '/account'
export const accountPreLogin = (data) => axios(BACKEND + ACCOUNT + '/preLogin', data) // 预登录
export const accountLogin = (data) => axios(BACKEND + ACCOUNT + '/login', data) // 登录
export const accountLogout = (data) => axios(BACKEND + ACCOUNT + '/logout', data) // 登出
export const accountResetPassword = (data) => axios(BACKEND + ACCOUNT + '/resetPassword', data) // 修改密码
// 获取websocket url
export const getTcpInfo = (data) => axios(BACKEND + ACCOUNT + '/getTcpInfo', data) // 预登录

// 系统
const CONFIG = '/config'
export const getConfigList = (data) => axios(BACKEND + CONFIG + '/get', data) // 获取配置
export const setConfigList = (data) => axios(BACKEND + CONFIG + '/set', data) // 修改配置

// 字段
const FIELD = '/field'
export const getFieldList = (data) => axios(BACKEND + FIELD + '/list', data) // 字段列表
export const addFieldList = (data) => axios(BACKEND + FIELD + '/add', data) // 添加字段
export const editFieldList = (data) => axios(BACKEND + FIELD + '/edit', data) // 编辑字段
export const delFieldList = (data) => axios(BACKEND + FIELD + '/delete', data) // 删除字段

// 人员
const MEMBER = '/member'
export const getMemberList = (data) => axios(BACKEND + MEMBER + '/list', data) // 人员列表
export const addMemberList = (data) => axios(BACKEND + MEMBER + '/add', data) // 添加人员
export const editMemberList = (data) => axios(BACKEND + MEMBER + '/edit', data) // 编辑人员
export const delMemberList = (data) => axios(BACKEND + MEMBER + '/delete', data) // 删除人员

// 设备
const DEVICE = '/device'
export const getDeviceList = (data) => axios(BACKEND + DEVICE + '/list', data) // 设备列表
export const addDeviceList = (data) => axios(BACKEND + DEVICE + '/add', data) // 添加设备
export const editDeviceList = (data) => axios(BACKEND + DEVICE + '/edit', data) // 编辑设备
export const delDeviceList = (data) => axios(BACKEND + DEVICE + '/delete', data) // 删除设备
export const findDeviceList = (data) => axios(BACKEND + DEVICE + '/find', data) // 发现未知设备
export const editDeviceStreamList = (data) => axios(BACKEND + DEVICE + '/editStream', data) // 编辑流媒体
export const updateApk = (data) => axios(BACKEND + DEVICE + '/updateApk', data) // Apk升级
export const responseDeviceList = (data) => axios(BACKEND + DEVICE + '/response', data) // 设备应答

// 设备组
const GROUP = '/group'
export const getDeviceGroupList = (data) => axios(BACKEND + GROUP + '/list', data) // 设备组列表
export const addDeviceGroupList = (data) => axios(BACKEND + GROUP + '/add', data) // 添加设备组
export const editDeviceGroupList = (data) => axios(BACKEND + GROUP + '/edit', data) // 编辑设备组
export const delDeviceGroupList = (data) => axios(BACKEND + GROUP + '/delete', data) // 删除设备组

// 流媒体
const STREAM = '/stream'
export const getStreamList = (data) => axios(BACKEND + STREAM + '/list', data) // 流媒体列表
export const addStreamList = (data) => axios(BACKEND + STREAM + '/add', data) // 添加流媒体
export const editStreamList = (data) => axios(BACKEND + STREAM + '/edit', data) // 编辑流媒体
export const delStreamList = (data) => axios(BACKEND + STREAM + '/delete', data) // 删除流媒体

// 通行时间模板
const TIME_TEMPLATE = '/time_template'
export const getTimeTemplateList = (data) => axios(BACKEND + TIME_TEMPLATE + '/list', data) // 通行时间模板列表
export const addTimeTemplateList = (data) => axios(BACKEND + TIME_TEMPLATE + '/add', data) // 添加通行时间模板
export const editTimeTemplateList = (data) => axios(BACKEND + TIME_TEMPLATE + '/edit', data) // 编辑通行时间模板
export const delTimeTemplateList = (data) => axios(BACKEND + TIME_TEMPLATE + '/delete', data) // 删除通行时间模板

// 通行记录
const PASS_RECORD = '/pass_record'
export const getPassRecordList = (data) => axios(BACKEND + PASS_RECORD + '/list', data) // 通行记录列表
export const countPassRecordList = (data) => axios(BACKEND + PASS_RECORD + '/countRecord', data) // 统计通行记录

// 日志记录
const ERR_LOG = '/error_log'
export const getLogRecordList = (data) => axios(BACKEND + ERR_LOG + '/list', data) // 日志记录列表
