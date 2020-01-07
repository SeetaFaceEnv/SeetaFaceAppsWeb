<template>
  <div class="contain">
    <Breadcrumb/>
    <ThemeMenu/>
    <router-view/>
    <!-- <Footer/> -->
  </div>
</template>
<script>
import ThemeMenu from '@comp/Menu/ThemeMenu'
import Breadcrumb from '@comp/Breadcrumb/Breadcrumb'
// import Footer from '@comp/Footer/Footer'
export default {
  components: {
    Breadcrumb,
    ThemeMenu
    // Footer
  }
}
</script>
<style lang="stylus" scoped>
.contain
  position absolute
  top 0
  left 14px
  right 14px
  bottom 0
</style>
