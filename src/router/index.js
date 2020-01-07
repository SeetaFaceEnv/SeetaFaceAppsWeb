import Vue from 'vue'
import VueRouter from 'vue-router'
// 页面加载进度条
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
// 引入状态管理
import store from '@/store/index.js'
/* 引入国际化
   去除路由多语言 可直接修改title
*/
import i18n from '@/i18n/index.js'
const routerInfo = localStorage.locale === 'en' ? i18n._vm.messages.en.routerInfo : i18n._vm.messages.zh.routerInfo

Vue.use(VueRouter)

const routes = [
  // 根路由
  {
    path: '/',
    redirect: '/login'
  },
  // 登录路由
  {
    path: '/login',
    name: 'login',
    component: () => import('@views/Login/Login.vue')
  },
  // 识别展示页
  {
    path: '/pass-display',
    name: 'pass-display',
    component: () => import('@views/PassDisplay/PassDisplay.vue')
  },
  // 欢迎页
  {
    path: '/welcome',
    redirect: '/welcome',
    component: () => import('@views/Home.vue'),
    children: [
      {
        path: '/welcome',
        name: 'welcome',
        component: () => import('@views/Welcome/Welcome.vue')
      }
    ]
  },
  // 系统配置相关路由
  {
    path: '/system',
    redirect: '/system/system-config',
    meta: {
      title: routerInfo.system.systemTitle,
      iconClass: 'el-icon-s-tools'
    },
    component: () => import('@views/Home.vue'),
    children: [
      {
        path: '/system/system-config',
        name: 'system-config',
        meta: { title: routerInfo.system.systemConfigTitle, isShow: true },
        component: () => import('@views/SystemInfo/SystemConfig.vue')
      },
      {
        path: '/system/admin-manage',
        name: 'admin-manage',
        meta: { title: routerInfo.system.adminManageTitle, isShow: true },
        component: () => import('@views/SystemInfo/AdminManage.vue')
      }
    ]
  },
  // 人员相关路由
  {
    path: '/member',
    redirect: '/member/member-manage',
    meta: {
      title: routerInfo.member.memberTitle,
      iconClass: 'el-icon-user-solid'
    },
    component: () => import('@views/Home.vue'),
    children: [
      {
        path: '/member/member-manage',
        name: 'member-manage',
        meta: { title: routerInfo.member.memberManageTitle, isShow: true },
        component: () => import('@views/PersonInfo/MemberManage.vue')
      },
      {
        path: '/member/photo-wall',
        name: 'photo-wall',
        meta: { title: '照片墙' },
        component: () => import('@views/PersonInfo/PhotoWall.vue')
      }
    ]
  },
  // 设备相关路由
  {
    path: '/device',
    redirect: '/device/device-group-manage',
    meta: {
      title: routerInfo.device.deviceTitle,
      iconClass: 'el-icon-s-platform'
    },
    component: () => import('@views/Home.vue'),
    children: [
      {
        path: '/device/device-group-manage',
        name: 'device-group-manage',
        meta: { title: routerInfo.device.deviceGroupManageTitle, isShow: true },
        component: () => import('@views/DeviceInfo/DeviceGroupManage.vue')
      },
      {
        path: '/device/unknown-device-manage',
        name: 'unknown-device-manage',
        meta: { title: routerInfo.device.unknownDeviceTitle, isShow: true },
        component: () => import('@views/DeviceInfo/UnknownDeviceManage.vue')
      },
      {
        path: '/device/device-manage',
        name: 'device-manage',
        meta: { title: routerInfo.device.deviceManageTitle, isShow: true },
        component: () => import('@views/DeviceInfo/DeviceManage.vue')
      },
      {
        path: '/device/style-manage',
        name: 'style-manage',
        meta: { title: routerInfo.device.styleManageTitle, isShow: true },
        component: () => import('@views/DeviceInfo/StyleManage.vue')
      },
      {
        path: '/device/time-template-manage',
        name: 'time-template-manage',
        meta: { title: routerInfo.device.timeTemplateManageTitle, isShow: true },
        component: () => import('@views/DeviceInfo/TimeTemplateManage.vue')
      }
    ]
  },
  // 记录日志相关路由
  {
    path: '/record',
    redirect: '/record/pass-record',
    meta: {
      title: routerInfo.record.recordTitle,
      iconClass: 'el-icon-s-data'
    },
    component: () => import('@views/Home.vue'),
    children: [
      {
        path: '/record/pass-record',
        name: 'pass-record',
        meta: { title: routerInfo.record.passRecordTitle, isShow: true },
        component: () => import('@views/RecordInfo/PassRecord.vue')
      },
      {
        path: '/record/device-log',
        name: 'device-log',
        meta: { title: routerInfo.record.deviceLogTitle, isShow: true },
        component: () => import('@views/RecordInfo/DeviceLog.vue')
      },
      {
        path: '/record/request-log',
        name: 'request-log',
        meta: { title: routerInfo.record.requestLogTitle, isShow: true },
        component: () => import('@views/RecordInfo/RequestLog.vue')
      },
      {
        path: '/record/image-log',
        name: 'image-log',
        meta: { title: routerInfo.record.imageLogTitle, isShow: true },
        component: () => import('@views/RecordInfo/ImageLog.vue')
      }
    ]
  },
  // 匹配不到，展示404
  {
    path: '/*',
    component: () => import('@comp/Exception/Exception')
  }
]

const router = new VueRouter({
  // mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// 路由变动前启动NProgress
NProgress.configure({ showSpinner: false })
router.beforeEach((to, from, next) => {
  // 跳转login页面时无需校验
  if (to.name !== 'login') {
    if (sessionStorage.token) {
      store.commit('changeBreadcrumb', to.path)
      NProgress.start()
      next()
    } else {
      next({
        path: '/login'
      })
    }
  } else {
    NProgress.start()
    next()
  }
})
// 路由变动后结束NProgress
router.afterEach(() => {
  NProgress.done()
})

export default router
