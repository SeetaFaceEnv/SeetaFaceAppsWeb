// 根据侧边栏处理后的列表 生成面包屑
function breadcrumbGenerate (routeList) {
  try {
    let breadcrumbObj = {}
    for (let routeItem of routeList) {
      // 获取外层路由及title对应关系
      breadcrumbObj[routeItem.index.substr(1)] = routeItem.title
      for (let item of routeItem.menuItemGroup) {
        // 获取内层路由及title对应关系
        breadcrumbObj[item.routerPath.replace(routeItem.index + '/', '')] = item.title
      }
    }
    return breadcrumbObj
  } catch (e) {
    console.error('请检查全局路由信息!', e)
  }
}

export { breadcrumbGenerate }
