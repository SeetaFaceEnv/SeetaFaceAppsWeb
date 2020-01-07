<template>
  <div>
    <Card>
      <CardMenuItem slot="cardTitle" title="照片日志" isActive/>
      <!-- <div slot="buttonGroup">
        <el-button @click="exportForm()" type="danger">导出</el-button>
      </div> -->
      <!-- 查询栏 -->
      <QueryBar slot="queryBar">
        <div slot="queryBarLeft" style="float: left;text-align: left">
          设备编码：<el-input v-model="queryForm.deviceCode" clearable class="query-bar-item"></el-input>
          照片ID：<el-input v-model="queryForm.imageId" clearable class="query-bar-item"></el-input>
          <!-- 隐藏 窗口缩小时 控制换行 -->
          <div class="handle-line" style="height: 10px;width: 100%;display:none"></div>
          日期区间：
          <el-date-picker
            style="margin-right: 10px"
            v-model="queryForm.dateRange"
            type="datetimerange"
            format="yyyy-MM-dd HH:mm"
            :default-time="['00:00:00', '23:59:59']"
            unlink-panels
            value-format="timestamp"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
          <el-button @click="queryGetData()">查询</el-button>
          <el-button @click="resetGetData()">重置</el-button>
        </div>
      </QueryBar>
      <!-- 表格 -->
      <el-table slot="contain" header-cell-class-name="table__header" row-class-name="table__row"
        :data="tableData" stripe height="calc(100% - 30px)">
        <el-table-column label="设备编码" prop="device_code"></el-table-column>
        <el-table-column label="图片ID" prop="image_id"></el-table-column>
        <el-table-column label="内容" prop="data"></el-table-column>
        <el-table-column label="状态" prop="sync_result">
          <template slot-scope="scope">
            <span v-if="scope.row.sync_result === 1">成功</span>
            <span v-if="scope.row.sync_result === 2">失败</span>
            <span v-if="scope.row.sync_result === 3">等待下发</span>
            <span v-if="scope.row.sync_result === 4">等待下发结果</span>
          </template>
        </el-table-column>
        <el-table-column label="操作时间">
          <template slot-scope="scope">
            <span v-if="scope.row.timestamp">
              <i class="el-icon-time"></i>
              {{ transformToDateTime(scope.row.timestamp) }}
            </span>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination class="pagination" slot="footer"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next"
        :total="totalCount">
      </el-pagination>
    </Card>
  </div>
</template>
<script>
import moment from 'moment'
import Card from '@comp/Card/Card'
import CardMenuItem from '@comp/Card/CardMenuItem'
import QueryBar from '@comp/Bar/QueryBar'
import { getImageLogList } from '@api/getData'
export default {
  data () {
    return {
      tableData: [], // 表格数据
      queryForm: {}, // 查询表单
      // 分页
      currentPage: 1,
      pageSize: 10,
      totalCount: 1
    }
  },
  components: {
    Card,
    CardMenuItem,
    QueryBar
  },
  mounted () {
    this.getData()
  },
  methods: {
    // 获取表格数据
    async getData () {
      this.tableData = []
      const res = await getImageLogList({
        skip: (this.currentPage - 1) * this.pageSize,
        limit: this.pageSize,
        begin_date: this.queryForm.dateRange ? Math.floor(this.queryForm.dateRange[0] / 1000) : 0,
        end_date: this.queryForm.dateRange ? Math.floor(this.queryForm.dateRange[1] / 1000) : 0,
        device_code: this.queryForm.deviceCode || '',
        image_id: this.queryForm.imageId || ''
      })
      if (res.data.res === 0) {
        this.tableData = res.data.records
        this.totalCount = res.data.total
      }
    },
    // 查询数据
    queryGetData () {
      this.currentPage = 1
      this.pageSize = 10
      this.getData()
    },
    // 重置搜索
    resetGetData () {
      this.queryForm = {}
      this.currentPage = 1
      this.pageSize = 10
      this.getData()
    },
    // 时间戳转换为标准时间
    transformToDateTime (val) {
      return moment(val * 1000).format('YYYY-MM-DD HH:mm:ss')
    },
    // 切换分页条件
    handleSizeChange (val) {
      this.pageSize = val
      this.getData()
    },
    handleCurrentChange (val) {
      this.currentPage = val
      this.getData()
    }
  }
}
</script>
<style lang="stylus" scoped>
@media screen and (max-width: 1770px) {
  // 媒体查询 宽度小于1770px时 queryBar展示为两行 优化展示效果
  .handle-line { // 显示分行box
    display block !important
  }
  .el-card .el-table--fit { // 减少 card 内容区 高度
    height calc(100% - 30px - 44px) !important
  }
}
</style>
