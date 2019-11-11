# 前端项目
## 一、项目简介
> **智慧园区社区版前端系统，通过简洁、精致的页面呈现，帮助用户精准、便捷的使用智慧园区的功能，还提供实时设备状态变更提醒功能，给予用户友好的使用体验。**

## 二、核心目录简介
- dist 【打包构建后资源目录】
- node_modules 【项目依赖库相关】
- public 【静态资源】
- src 【资源目录】
  - api 【接口目录】
    - axios.js 【拦截器】
    - baseUrl.js 【基础路径】
    - getData.js 【接口定义】
  - assets 【静态资源目录（webpack打包）】
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
    - MemberInfo 【人员相关视图】
    - RecordInfo 【记录相关视图】
    - SystemInfo 【系统相关视图】
    - Home.vue 【页面布局视图】
  - App.vue 【视图入口】
  - main.js 【项目主入口】
  - router.js 【路由管理】
  - store.js 【全局状态管理】
- package.json 【项目说明及依赖】
- vue.config.js 【webpack相关配置】

## 三、项目实现（前端部分）
### Vue 2.x
基于Vue cli 3.0 初始化项目
基于Vue 2.6.10  实现

### Element-UI
基于Element-UI 2.11.0 实现页面展示

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
## 五、项目部署
部署前请确保已成功安装nginx。

**nginx 配置**
```
server {
  listen xxxx;  // 监听端口号
  location / {
    root /home/ABC/vue_web; // 服务器中项目 打包后路径
    index index.html; // 首页地址
    try_files $uri $uri/ /index.html; // 防止刷新页面丢失
  }
}
```

**配置文件**

调整后台地址可修改 public/config.js 文件
```
window.g = {
  baseURL: 'http://192.168.0.8:xxxx/' // 后台地址
}
```

**Tips**
```
src/assets/stylus/custom.stylus // 自定义样式
src/assets/stylus/element-ui.stylus // element-ui相关样式
```