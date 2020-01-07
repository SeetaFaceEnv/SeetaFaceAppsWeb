# 前端项目

## 一、项目简介
> 设备管理平台社区版，通过简洁、精致的页面呈现，帮助用户精准、便捷的使用设备管理平台的功能，还提供实时设备状态变更提醒功能，给予用户友好的使用体验。

## 二、核心目录简介
- dist 【打包构建后资源目录】
- node_modules 【项目依赖库相关】
- public 【静态资源】
- src 【资源目录】
  - api 【接口目录】
    - axios.js 【拦截器】
    - baseUrl.js 【基础路径】
    - getData.js 【接口定义】
  - assets 【静态资源】
    - css 【项目初始化样式】
    - Exception 【异常处理资源】
    - font-awesome 【图标资源】
    - images 【图片资源】
    - stylus 【自定义样式】
  - components 【组件目录】
    - Bar 【查询栏】
    - Breadcrumb 【面包屑】
    - Card 【卡片】
    - Contain 【包裹容器】
    - Exception 【异常处理】
    - Header 【头部导航】
    - Menu 【菜单导航】
  - utils 【工具类】
  - views 【视图目录】
    - DeviceInfo 【设备相关视图】
    - Login 【登录相关视图】
    - PassDisplay 【识别展示视图】
    - PersonInfo 【人员相关视图】
    - RecordInfo 【记录相关视图】
    - SystemInfo 【系统相关视图】
    - Welcome 【欢迎页视图】
    - Home.vue 【页面布局视图】
  - App.vue 【视图入口】
  - main.js 【项目主入口】
  - router 【路由管理】
  - store 【全局状态管理】
- package.json 【项目说明及依赖】
- vue.config.js 【webpack相关配置】

## 三、项目实现
### Vue 2.x
基于`Vue cli 3.0`初始化项目
基于`Vue 2.6.10`实现

### Element-UI
基于`Element-UI 2.13.0`实现页面展示

## 四、项目运行
使用项目前，请确保已成功安装node、npm工具。

拉取代码后，安装依赖
```bash
npm install
```
开发环境 热加载
```bash
npm run serve
```
生产环境 打包构建
```bash
npm run build
```

**配置文件**

调整后台地址可修改 public/config.js 文件
```
window.g = {
  baseURL: 'http://192.168.0.110:xxxx/' // 后台地址
}
```
