# 智慧园区社区版
## 项目简介
> **智慧园区是一款集成人脸识别功能的智能社区服务管理平台。配合人脸识别云服务、智能硬件设备管理平台，实现对所支持的所有智能终端的一站式管理。**

拥有以下功能：
- 系统信息
  - 系统配置
    调整系统级相关参数配置
- 人员信息
  - 字段管理
  灵活配置人员组态属性信息
  - 人员管理
  管理人员、照片等信息，并控制其绑定至相应设备、设备组中
- 设备信息
  - 设备管理
    自动发现未知设备以供添加，管理所有已知设备及相关参数信息
  - 设备组管理
    设备组统一管理组内设备
  - 流媒体管理
    管理外部rtsp流及相关参数设置
  - 时间模板管理
    统一管理设备通行时间模板
- 记录信息
  - 通行记录
    查看、导出通行记录
  - 日志记录
    查看、导出日志记录

> **Tip:** 详细功能介绍及使用手册请参考以下资料
##### 参考资料
[使用手册](https://github.com/SeetaFaceEnv/SeetaAccessControlComminty/blob/master/doc/manual.md)

## 项目实现（前端部分）
### Vue 2.x
基于Vue cli 3.0 初始化项目
基于Vue 2.6.10  实现

### Element-UI
基于Element-UI 2.11.0 实现页面展示

## 使用
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
## 部署
部署前请确保已成功安装nginx。

nginx 配置
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

## 配置文件
调整后台地址可修改 public/config.js 文件
```
window.g = {
  baseURL: 'http://192.168.0.8:xxxx/' // 后台地址
}
```