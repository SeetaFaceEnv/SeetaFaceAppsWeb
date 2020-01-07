// 根据路由信息生成侧边栏
function sideMenuGenerate (routeList) {
  try {
    let sideMenuList = []
    // 循环生成一级菜单
    for (let routeItem of routeList) {
      let menu = {}
      // 存在children 则存在二级菜单
      if (routeItem.children) {
        menu.menuItemGroup = []
        // 循环生成二级菜单
        for (let item of routeItem.children) {
          // meta下存在title 则填充为二级菜单
          if (item.meta && item.meta.title) {
            let temp = {}
            temp.routerPath = item.path // 设置二级菜单route-path
            temp.title = item.meta.title // 设置二级菜单标题
            temp.isShow = item.meta.isShow // 设置二级菜单是否显示 isShow为true则跳过权限判断
            if (item.meta.role) {
              temp.role = item.meta.role
            }
            menu.menuItemGroup.push(temp)
          }
        }
      }
      // meta下存在title 则填充为一级菜单
      if (routeItem.meta && routeItem.meta.title) {
        menu.index = routeItem.path // 设置一级菜单index
        menu.title = routeItem.meta.title // 设置一级菜单标题
        menu.iconClass = routeItem.meta.iconClass // 设置一级菜单图标类
        sideMenuList.push(menu)
      }
    }
    return sideMenuList
  } catch (e) {
    console.error('请检查全局路由信息!', e)
  }
}

export { sideMenuGenerate }
