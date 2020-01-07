<template>
  <div>
    <Card>
      <CardMenuItem slot="cardTitle" :title="$t('welcomePage.pageTitle')" isActive/>
      <div id="welcome-box" slot="contain">
        <h1 style="margin-bottom: 100px">{{ $t("welcomePage.message") }}</h1>
        <img src="../../assets/images/park.svg">
      </div>
    </Card>
  </div>
</template>
<script>
import Card from '@comp/Card/Card'
import CardMenuItem from '@comp/Card/CardMenuItem'
export default {
  components: {
    Card,
    CardMenuItem
  }
}
</script>
<style lang="stylus" scoped>
#welcome-box
  margin-top 100px
</style>
