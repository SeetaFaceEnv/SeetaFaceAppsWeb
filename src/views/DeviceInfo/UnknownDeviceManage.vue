<template>
  <div>
    <Card>
      <CardMenuItem slot="cardTitle" title="未知设备" isActive/>
      <!-- 表格 -->
      <el-table slot="contain" header-cell-class-name="table__header" row-class-name="table__row"
        :data="tableData" stripe height="calc(100% - 30px + 48px)">
        <el-table-column prop="group_id" label="设备组ID"></el-table-column>
        <el-table-column prop="device_code" label="设备编码"></el-table-column>
        <el-table-column prop="type" label="类型">
          <template slot-scope="scope">
            <span v-if="scope.row.type === 1">人证一体机</span>
            <span v-else-if="scope.row.type === 2">安卓设备</span>
            <span v-else-if="scope.row.type === 3">智能网关</span>
            <span v-else-if="scope.row.type === 4">PC智能网关</span>
            <span v-else-if="scope.row.type === 5">注册机</span>
            <span v-else-if="scope.row.type === 6">识别服务器</span>
            <span v-else-if="scope.row.type === 7">网络继电器</span>
          </template>
        </el-table-column>
        <el-table-column prop="ip" label="IP"></el-table-column>
        <el-table-column prop="apk_version" label="APK版本"></el-table-column>
        <el-table-column prop="device_version" label="设备版本"></el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination class="pagination" slot="footer"
        layout="total"
        :total="totalCount">
      </el-pagination>
    </Card>
  </div>
</template>
<script>
import Card from '@comp/Card/Card'
import CardMenuItem from '@comp/Card/CardMenuItem'
import { discoverDeviceList } from '@api/getData'
export default {
  data () {
    return {
      tableData: [], // 表格数据
      // 分页
      totalCount: 1
    }
  },
  components: {
    Card,
    CardMenuItem
  },
  mounted () {
    this.getData()
  },
  methods: {
    // 获取表格数据
    async getData () {
      this.tableData = []
      const res = await discoverDeviceList()
      if (res.data.res === 0) {
        this.tableData = res.data.devices
        this.totalCount = res.data.devices.length
      }
    }
  }
}
</script>
<style lang="stylus" scoped>
</style>
