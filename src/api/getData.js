import axios from './axios'
// URL前缀
const BACKEND = 'backend'
// 请求方式
const GET = 'get'
const POST = 'post'

// 系统
const SYSTEM = '/system'
export const getSystemConfig = (data) => axios(GET, BACKEND + SYSTEM + '/list', data) // 获取配置
export const setSystemConfig = (data) => axios(POST, BACKEND + SYSTEM + '/set', data) // 修改配置
export const resetSystemConfig = (data) => axios(POST, BACKEND + SYSTEM + '/reset', data) // 系统重置

// 管理员
const ADMIN = '/admin'
export const adminLogin = (data) => axios(POST, BACKEND + ADMIN + '/login', data) // 登录
export const adminLogout = (data) => axios(POST, BACKEND + ADMIN + '/logout', data) // 登出
export const getAdminList = (data) => axios(POST, BACKEND + ADMIN + '/list', data) // 管理员列表
export const addAdminList = (data) => axios(POST, BACKEND + ADMIN + '/add', data) // 添加管理员
export const editAdminList = (data) => axios(POST, BACKEND + ADMIN + '/edit', data) // 编辑管理员
export const delAdminList = (data) => axios(POST, BACKEND + ADMIN + '/del', data) // 删除管理员

// 设备组
const GROUP = '/group'
export const getGroupList = (data) => axios(POST, BACKEND + GROUP + '/list', data) // 设备组列表
export const addGroupList = (data) => axios(POST, BACKEND + GROUP + '/add', data) // 添加设备组
export const setGroupDeviceParam = (data) => axios(POST, BACKEND + GROUP + '/set', data) // 编辑默认设备参数
export const delGroupList = (data) => axios(POST, BACKEND + GROUP + '/del', data) // 删除设备组

// 设备
const DEVICE = '/device'
export const discoverDeviceList = (data) => axios(GET, BACKEND + DEVICE + '/discover', data) // 设备发现
export const getDeviceList = (data) => axios(POST, BACKEND + DEVICE + '/list', data) // 设备列表
export const addDeviceList = (data) => axios(POST, BACKEND + DEVICE + '/add', data) // 添加设备
export const editDeviceList = (data) => axios(POST, BACKEND + DEVICE + '/edit', data) // 编辑设备
export const delDeviceList = (data) => axios(POST, BACKEND + DEVICE + '/del', data) // 删除设备
// 流媒体
export const addStream = (data) => axios(POST, BACKEND + DEVICE + '/camera_add', data) // 添加流
export const editStream = (data) => axios(POST, BACKEND + DEVICE + '/camera_edit', data) // 编辑流
export const delStream = (data) => axios(POST, BACKEND + DEVICE + '/camera_del', data) // 删除流
// 测试 重载 升级
export const testDevice = (data) => axios(POST, BACKEND + DEVICE + '/test', data) // 设备测试
export const reloadDevice = (data) => axios(POST, BACKEND + DEVICE + '/reload', data) // 数据重载
export const updateDevice = (data) => axios(POST, BACKEND + DEVICE + '/update', data, { 'Content-Type': 'multipart/form-data' }) // 设备升级
// 开、关门 捆绑、解绑样式
export const openDeviceDoor = (data) => axios(POST, BACKEND + DEVICE + '/open', data) // 设备开门
export const closeDeviceDoor = (data) => axios(POST, BACKEND + DEVICE + '/close', data) // 设备关门
export const bindDeviceStyle = (data) => axios(POST, BACKEND + DEVICE + '/bind', data) // 绑定样式
export const unbindDeviceStyle = (data) => axios(POST, BACKEND + DEVICE + '/unbind', data) // 解绑样式

// 样式
const STYLE = '/style'
export const getStyleList = (data) => axios(POST, BACKEND + STYLE + '/list', data) // 样式列表
export const addStyleList = (data) => axios(POST, BACKEND + STYLE + '/add', data, { 'Content-Type': 'multipart/form-data' }) // 添加样式
export const editStyleList = (data) => axios(POST, BACKEND + STYLE + '/edit', data) // 编辑样式
export const delStyleList = (data) => axios(POST, BACKEND + STYLE + '/del', data) // 删除样式

// 时间模板
const TIME_TEMPLATE = '/time_template'
export const getTimeTemplateList = (data) => axios(POST, BACKEND + TIME_TEMPLATE + '/list', data) // 时间模板列表
export const addTimeTemplateList = (data) => axios(POST, BACKEND + TIME_TEMPLATE + '/add', data) // 添加时间模板
export const editTimeTemplateList = (data) => axios(POST, BACKEND + TIME_TEMPLATE + '/edit', data) // 编辑时间模板
export const delTimeTemplateList = (data) => axios(POST, BACKEND + TIME_TEMPLATE + '/del', data) // 删除时间模板

// 人员管理
const PERSON = '/person'
export const getMemberList = (data) => axios(POST, BACKEND + PERSON + '/list', data) // 人员列表
export const addMemberList = (data) => axios(POST, BACKEND + PERSON + '/add', data) // 添加人员
export const editMemberList = (data) => axios(POST, BACKEND + PERSON + '/edit', data) // 编辑人员
export const delMemberList = (data) => axios(POST, BACKEND + PERSON + '/del', data) // 删除人员
// 底库照片 封面照 二维码
export const addMemberImage = (data) => axios(POST, BACKEND + PERSON + '/image_add', data, { 'Content-Type': 'multipart/form-data' }) // 添加底库照片
export const delMemberImage = (data) => axios(POST, BACKEND + PERSON + '/image_del', data) // 删除底库照片
export const updateAvatar = (data) => axios(POST, BACKEND + PERSON + '/avatar_update', data, { 'Content-Type': 'multipart/form-data' }) // 更新封面照
export const getQrCode = (data) => axios(POST, BACKEND + PERSON + '/qr_code', data, { responseType: 'blob' }) // 获取二维码

// 记录日志
export const getPassRecordList = (data) => axios(POST, BACKEND + '/pass_record' + '/list', data) // 通行记录
export const getDeviceLogList = (data) => axios(POST, BACKEND + '/device_log' + '/list', data) // 设备日志
export const getRequestLogList = (data) => axios(POST, BACKEND + '/request_log' + '/list', data) // 请求日志
export const getImageLogList = (data) => axios(POST, BACKEND + '/image_log' + '/list', data) // 照片注册日志
