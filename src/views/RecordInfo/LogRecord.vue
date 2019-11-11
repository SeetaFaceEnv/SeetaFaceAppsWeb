<template>
  <div>
    <Card>
      <span slot="cardTitle">日志记录</span>
      <div slot="buttonGroup">
        <el-button @click="exportRecordFile()" type="primary">导出</el-button>
      </div>
      <!-- 查询栏 -->
      <QueryBar slot="queryBar">
        <div slot="queryBarLeft">
          设备名称：<el-input v-model="queryForm.name" clearable class="query-bar-item"></el-input>
          日期区间：
          <el-date-picker
            style="margin-right: 10px"
            v-model="queryForm.dateRange"
            type="daterange"
            unlink-panels
            value-format="timestamp"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
          <el-button @click="getData()">查询</el-button>
          <el-button @click="resetGetData()">重置</el-button>
        </div>
      </QueryBar>
      <!-- 表格 -->
      <el-table slot="contain" header-cell-class-name="table__header" row-class-name="table__row"
        :data="tableData" stripe height="calc(100% - 30px)">
        <el-table-column label="设备名称" prop="device_name"></el-table-column>
        <el-table-column label="设备编码" prop="device_code"></el-table-column>
        <el-table-column label="内容" prop="content"></el-table-column>
        <el-table-column label="记录时间">
          <template slot-scope="scope">
            <i class="el-icon-time"></i>
            {{ transformToDateTime(scope.row.time) }}
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
import QueryBar from '@comp/Bar/QueryBar'
import { getLogRecordList } from '@api/getData'
import { exportCSV } from '@utils/exportFile.js'
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
    QueryBar
  },
  mounted () {
    this.getData()
  },
  methods: {
    // 获取表格数据
    async getData () {
      this.tableData = []
      const res = await getLogRecordList({
        device_name: this.queryForm.name || '',
        time_begin: this.queryForm.dateRange ? this.queryForm.dateRange[0] : '',
        time_end: this.queryForm.dateRange ? this.queryForm.dateRange[1] : '',
        start_index: (this.currentPage - 1) * this.pageSize,
        get_count: this.pageSize
      })
      if (res.data.result === 0) {
        this.tableData = res.data.error_logs
        this.totalCount = res.data.total
      }
    },
    // 重置搜索
    resetGetData () {
      this.queryForm = {}
      this.getData()
    },
    // 导出通行记录
    exportRecordFile () {
      this.$confirm('只能导出当前页面的信息，建议先调整每页的条数。确认导出至Excel?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 导出
        let arry = []
        for (let item of this.tableData) {
          let tempObj = {}
          tempObj.device_name = item.device_name
          tempObj.device_code = item.device_code
          tempObj.content = item.content
          tempObj.time = this.transformToDateTime(item.time)
          arry.push(tempObj)
        }
        exportCSV(
          arry,
          [
            {
              label: '设备名称',
              value: 'device_name'
            },
            {
              label: '设备编码',
              value: 'device_code'
            },
            {
              label: '内容',
              value: 'content'
            },
            {
              label: '记录时间',
              value: 'time'
            }
          ],
          '日志记录'
        )
      }).catch((err) => {
        console.log(err)
      })
    },
    // 时间戳转换为标准时间
    transformToDateTime (val) {
      return moment(val).format('YYYY-MM-DD HH:mm:ss')
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
