<template>
  <span @click="toPath(index)" class="card-menu-item" :style="{ color: isActive ? activeColor : 'black', borderBottom: isActive ? `3px solid ${activeColor}` : ''}">
    {{ title }}
  </span>
</template>

<script>
export default {
  props: {
    index: Object, // 路由名称
    title: String,
    isActive: Boolean
  },
  data () {
    return {
      activeColor: localStorage.localStorageThemeColor || 'green' // 菜单激活时颜色（跟随主题）
    }
  },
  mounted () {
    // console.log(localStorage.localStorageThemeColor === true)
    // document.getElementById('sidebar').style.background = localStorage.localStorageThemeColor || ''
  },
  methods: {
    // 路由跳转
    toPath (path) {
      if (path) {
        // console.log(path)
        this.$router.push(path)
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
@import "../../assets/stylus/params.stylus"
.card-menu-item
  display inline-block
  font-size 16px
  font-weight: 900
  margin-right $card-menu-item-margin-right
  height $card-menu-item-height
  line-height $card-menu-item-height
  padding $card-menu-item-padding
  user-select none
  cursor pointer
</style>
