import Vue from 'vue'
import Router from 'vue-router'
// 页面加载进度条
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
// 引入状态管理
import store from './store'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      meta: { requiresAuth: true },
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('./views/Login/Login.vue')
    },
    {
      path: '/system', // 系统配置相关路由
      redirect: '/system/system-config',
      meta: { requiresAuth: true },
      component: () => import('./views/Home.vue'),
      children: [
        {
          path: '/system/system-config',
          name: 'system-config',
          meta: { requiresAuth: true },
          component: () => import('./views/SystemInfo/SystemConfig.vue')
        }
      ]
    },
    {
      path: '/member', // 人员管理相关路由
      redirect: '/member/field-manage',
      meta: { requiresAuth: true },
      component: () => import('./views/Home.vue'),
      children: [
        {
          path: '/member/field-manage',
          name: 'field-manage',
          meta: { requiresAuth: true },
          component: () => import('./views/MemberInfo/FieldManage.vue')
        },
        {
          path: '/member/member-manage',
          name: 'member-manage',
          meta: { requiresAuth: true },
          component: () => import('./views/MemberInfo/MemberManage.vue')
        }
      ]
    },
    {
      path: '/device', // 设备管理相关路由
      redirect: '/device/device-manage',
      meta: { requiresAuth: true },
      component: () => import('./views/Home.vue'),
      children: [
        {
          path: '/device/device-manage',
          name: 'device-manage',
          meta: { requiresAuth: true },
          component: () => import('./views/DeviceInfo/DeviceManage.vue')
        },
        {
          path: '/device/device-group-manage',
          name: 'device-group-manage',
          meta: { requiresAuth: true },
          component: () => import('./views/DeviceInfo/DeviceGroupManage.vue')
        },
        {
          path: '/device/device-stream-manage',
          name: 'device-stream-manage',
          meta: { requiresAuth: true },
          component: () => import('./views/DeviceInfo/DeviceStreamManage.vue')
        },
        {
          path: '/device/device-time-manage',
          name: 'device-time-manage',
          meta: { requiresAuth: true },
          component: () => import('./views/DeviceInfo/TimeTemplateManage.vue')
        }
      ]
    },
    {
      path: '/record', // 记录信息相关路由
      redirect: '/record/pass-record',
      meta: { requiresAuth: true },
      component: () => import('./views/Home.vue'),
      children: [
        {
          path: '/record/pass-record',
          name: 'pass-record',
          meta: { requiresAuth: true },
          component: () => import('./views/RecordInfo/PassRecord.vue')
        },
        {
          path: '/record/log-record',
          name: 'log-record',
          meta: { requiresAuth: true },
          component: () => import('./views/RecordInfo/LogRecord.vue')
        }
      ]
    },
    // 匹配不到，展示404
    {
      path: '/*',
      component: () => import('./views/ExceptionPages/404.vue')
    }
  ]
})

// 路由变动前启动NProgress
NProgress.configure({ showSpinner: false })
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    if (sessionStorage.session_id) {
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
