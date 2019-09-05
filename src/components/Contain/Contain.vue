<template>
  <div class="contain">
    <Breadcrumb/>
    <router-view/>
    <!-- <Footer/> -->
  </div>
</template>
<script>
import Breadcrumb from '../Breadcrumb/Breadcrumb'
// import Footer from '../Footer/Footer'
export default {
  components: {
    Breadcrumb
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
