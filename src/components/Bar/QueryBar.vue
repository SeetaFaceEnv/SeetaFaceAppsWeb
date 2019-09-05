<template>
  <div class="query-bar">
    <div class="query-bar-left">
      <slot name="queryBarLeft"/>
    </div>
    <div class="query-bar-right">
      <slot name="queryBarRight"/>
    </div>
  </div>
</template>
<style lang="stylus" scoped>
.query-bar
  width 100%
  padding 10px 0
  overflow hidden
  // border 1px red solid
  .query-bar-left
    float left
  .query-bar-right
    float right
</style>
