<template>
  <div>
    <Card>
      <span slot="cardTitle">通行记录</span>
      <div slot="buttonGroup">
        <el-button @click="exportRecordFile()" type="primary">导出</el-button>
        <el-tooltip content="统计导出人员每日早晚记录" placement="top">
          <el-button @click="countRecordFile()" type="danger">统计</el-button>
        </el-tooltip>
      </div>
      <!-- 查询栏 -->
      <QueryBar slot="queryBar">
        <div slot="queryBarLeft">
          设备编码：<el-input v-model="queryForm.code" clearable style="width: 150px;margin-right: 10px"></el-input>
          <el-button @click="getData()">查询</el-button>
          <el-button @click="resetGetData()">重置</el-button>
        </div>
      </QueryBar>
      <!-- 表格 -->
      <el-table slot="contain" header-cell-class-name="table__header" row-class-name="table__row"
        :data="tableData" stripe height="calc(100% - 30px)">
        <el-table-column label="设备名称" prop="device_name"></el-table-column>
        <el-table-column label="设备编码" prop="device_code"></el-table-column>
        <el-table-column label="底库照片">
          <template slot-scope="scope">
            <el-image class="member-image" v-if="scope.row.person_image_path" :src="scope.row.person_image_path"
              @click="showBigImg(scope.row.person_image_path)" :preview-src-list="srcList"/>
          </template>
        </el-table-column>
        <el-table-column label="现场照片">
          <template slot-scope="scope">
            <el-image class="member-image" v-if="scope.row.capture_image_path" :src="scope.row.capture_image_path"
              @click="showBigImg(scope.row.capture_image_path)" :preview-src-list="srcList"/>
          </template>
        </el-table-column>
        <el-table-column label="相似度" prop="score"></el-table-column>
        <el-table-column label="是否通过" prop="is_pass">
          <template slot-scope="props">
            <span v-if="props.row.is_pass === 1">通过</span>
            <span v-if="props.row.is_pass === 2">不通过</span>
          </template>
        </el-table-column>
        <el-table-column label="记录时间">
          <template slot-scope="scope">
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
    <el-dialog
      :title="titleText"
      :visible.sync="dialogVisible"
      width="560px"
      class="input_box"
      @close="dialogClose()"
    >
      <el-form :model="form" :rules="rules" style="text-align: left" ref="form" label-width="140px">
        <el-form-item label="统计日期区间：" prop="dateRange">
          <el-date-picker
            v-model="form.dateRange"
            type="daterange"
            value-format="timestamp"
            range-separator="至"
            unlink-panels
            :default-value="defaultLastMonth"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogClose()">取 消</el-button>
        <el-button @click="formSubmit('form')" :loading=$store.state.isSubmitting>确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import moment from 'moment'
import Card from '@/components/Card/Card'
import QueryBar from '@/components/Bar/QueryBar'
import { getPassRecordList, countPassRecordList } from '@/api/getData'
import { exportCSV } from '@/utils/exportFile.js'
export default {
  data () {
    return {
      tableData: [], // 表格数据
      queryForm: {}, // 查询表单
      // 分页
      currentPage: 1,
      pageSize: 10,
      totalCount: 1,
      srcList: [],
      // 表单
      dialogVisible: false,
      titleText: '统计人员每日早晚记录',
      form: {},
      rules: {
        dateRange: [{ required: true, message: '请输入统计日期区间', trigger: 'blur' }]
      },
      defaultLastMonth: moment().month(moment().month() - 1).startOf('month').valueOf()
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
      const res = await getPassRecordList({
        device_code: this.queryForm.code || '',
        start_index: (this.currentPage - 1) * this.pageSize,
        get_count: this.pageSize
      })
      if (res.data.result === 0) {
        this.tableData = res.data.pass_records
        this.totalCount = res.data.total
      }
    },
    // 重置搜索
    resetGetData () {
      this.queryForm = {}
      this.getData()
    },
    // 提交表单时，计算时间模板信息
    async formSubmit (formName) {
      // 表单校验
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          // 深拷贝，消除数据处理对当前显示表单的影响
          const submitForm = JSON.parse(JSON.stringify(this.form))
          const res = await countPassRecordList({
            time_begin: submitForm.dateRange[0],
            time_end: submitForm.dateRange[1]
          })
          if (res.data.result === 0) {
            this.exportCountRecordFile(res.data)
          }
        }
      })
    },
    // 导出统计通行记录
    exportCountRecordFile (data) {
      this.$confirm('只能导出日期区间内每天最早和最晚通行的信息。确认导出至Excel?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 导出
        let arry = []
        for (let item of data.date) {
          arry.push(item)
        }
        exportCSV(
          data.count_result,
          arry,
          '人员每日早晚统计记录'
        )
        this.dialogClose()
      }).catch((err) => {
        console.log(err)
      })
    },
    // 统计通行记录
    countRecordFile () {
      this.dialogVisible = true
    },
    // 隐藏编辑框，初始化表单、校验信息
    dialogClose () {
      this.dialogVisible = false
      this.form = {}
      this.$refs.form.clearValidate()
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
          tempObj.score = item.score
          tempObj.is_pass = item.is_pass === 1 ? '通过' : '不通过'
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
              label: '相似度',
              value: 'score'
            },
            {
              label: '是否通过',
              value: 'is_pass'
            },
            {
              label: '记录时间',
              value: 'time'
            }
          ],
          '通行记录'
        )
      }).catch((err) => {
        console.log(err)
      })
    },
    // 查看大图
    showBigImg (url) {
      this.srcList = []
      this.srcList.push(url)
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
<style lang="stylus" scoped>
.member-image
  width 100px
  height 100px
</style>
