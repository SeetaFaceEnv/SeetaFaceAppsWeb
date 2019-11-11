<template>
  <div>
    <Card>
      <span slot="cardTitle">通行记录</span>
      <div slot="buttonGroup">
        <el-button @click="memberRecordForm()" type="primary">导出</el-button>
        <el-tooltip content="统计导出人员每日早晚记录" placement="top">
          <el-button @click="statisticsRecordFile()" type="danger">统计</el-button>
        </el-tooltip>
      </div>
      <!-- 查询栏 -->
      <QueryBar slot="queryBar">
        <div slot="queryBarLeft" style="float: left;text-align: left">
          查询字段：
          <el-select v-model="queryForm.field_id" @clear="queryForm.search_value = ''" clearable class="query-bar-item">
            <el-option
              v-for="item in fieldList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
          查询内容：<el-input v-model="queryForm.search_value" :disabled="!queryForm.field_id" clearable class="query-bar-item"></el-input>
          设备名称：<el-input v-model="queryForm.name" clearable class="query-bar-item"></el-input>
          <!-- 隐藏 窗口缩小时 控制换行 -->
          <div class="handle-line" style="height: 10px;width: 100%;display:none"></div>
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
        <!-- 展开行 -->
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-form inline class="table-expand">
              <el-form-item :label="key" v-for="(value, key, index) in props.row.attributes" :key="index">
                {{ value }}
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column label="设备名称" prop="device_name"></el-table-column>
        <el-table-column label="设备编码" prop="device_code"></el-table-column>
        <el-table-column label="人员信息" prop="attributes">
          <template slot-scope="scope">
            <!-- 至多展示 5条 属性 -->
            <div v-for="(key, index) in Object.keys(scope.row.attributes).slice(0, 5)" :key="index">
              <label>{{ key }}：</label>{{ scope.row.attributes[key] }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="底库照片" width="120">
          <template slot-scope="scope">
            <el-image class="member-image" v-if="scope.row.person_image_path" :src="scope.row.person_image_path"
              @click="showBigImg(scope.row.person_image_path)" :preview-src-list="srcList">
              <div slot="placeholder" class="loading-img">
                <i class="fa fa-spinner fa-3x fa-pulse" aria-hidden="true"></i>
              </div>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column label="现场照片" width="120">
          <template slot-scope="scope">
            <el-image class="member-image" v-if="scope.row.capture_image_path" :src="scope.row.capture_image_path"
              @click="showBigImg(scope.row.capture_image_path)" :preview-src-list="srcList">
              <div slot="placeholder" class="loading-img">
                <i class="fa fa-spinner fa-3x fa-pulse" aria-hidden="true"></i>
              </div>
            </el-image>
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

    <el-dialog
      :title="titleText"
      :visible.sync="dialogVisible"
      width="600px"
      class="input_box"
      @close="dialogClose()"
    >
      <el-form :model="form" :rules="rules" style="text-align: left" ref="form" label-width="160px">
        <el-form-item label="选择设备：" prop="device_codes">
          <el-select v-model="form.device_codes" style="width: 200px" multiple clearable>
              <el-option
                v-for="item in deviceList"
                :key="item.code"
                :label="item.name"
                :value="item.code"
              ></el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="选择人员属性：" prop="field_ids">
          <el-select v-model="form.field_ids" style="width: 200px" multiple clearable>
              <el-option
                v-for="item in fieldList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="选择日期区间：" :prop="submitType === 'statisticsRecord' ? 'dateRange' : ''">
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
import Card from '@comp/Card/Card'
import QueryBar from '@comp/Bar/QueryBar'
import { download } from '@utils/download.js'
import { getPassRecordList, exportMemberRecordList, exportStatisticsRecordList, getFieldList, getDeviceList } from '@api/getData'
export default {
  data () {
    return {
      tableData: [], // 表格数据
      queryForm: {}, // 查询表单
      fieldList: [], // 人员字段列表
      deviceList: [], // 全部设备列表
      // 分页
      currentPage: 1,
      pageSize: 10,
      totalCount: 1,
      srcList: [],
      // 表单
      dialogVisible: false,
      titleText: '导出通行记录',
      submitType: 'memberRecord', // statisticsRecord 统计
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
    this.getFieldList() // 获取所有组态字段
    this.getData()
  },
  methods: {
    // 获取表格数据
    async getData () {
      this.tableData = []
      let fieldObj = {}
      if (this.queryForm.field_id) { // 当选择查询字段后 构造fieldObj
        fieldObj[this.queryForm.field_id] = this.queryForm.search_value
      }
      const res = await getPassRecordList({
        field: JSON.stringify(fieldObj) === '{}' ? '' : JSON.stringify(fieldObj),
        device_name: this.queryForm.name || '',
        time_begin: this.queryForm.dateRange ? this.queryForm.dateRange[0] : '',
        time_end: this.queryForm.dateRange ? this.queryForm.dateRange[1] : '',
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
          // 判断表单提交类型
          const submitMethod = this.submitType === 'memberRecord' ? exportMemberRecordList : exportStatisticsRecordList
          const res = await submitMethod({
            // 序列化数组传递
            field_ids: JSON.stringify(submitForm.field_ids),
            device_codes: JSON.stringify(submitForm.device_codes),
            time_begin: submitForm.dateRange ? submitForm.dateRange[0] : '',
            time_end: submitForm.dateRange ? submitForm.dateRange[1] : ''
          })
          if (res.headers['content-type'] === 'application/octet-stream') {
            console.log(res.headers['filename'])
            download(res, res.headers['filename'])
          }
          this.dialogClose()
        }
      })
    },
    // 显示导出通行记录
    memberRecordForm () {
      this.titleText = '导出通行记录'
      this.submitType = 'memberRecord'
      this.dialogVisible = true
      this.getDeviceList()
    },
    // 显示统计通行记录
    statisticsRecordFile () {
      this.titleText = '导出人员每日早晚记录'
      this.submitType = 'statisticsRecord'
      this.dialogVisible = true
      this.getDeviceList()
    },
    // 隐藏编辑框，初始化表单、校验信息
    dialogClose () {
      this.dialogVisible = false
      this.form = {}
      this.$refs.form.clearValidate()
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
    // 获取所有设备信息
    async getDeviceList () {
      const res = await getDeviceList()
      if (res.data.result === 0) {
        this.deviceList = res.data.devices
      }
    },
    // 查找人员属性
    async getFieldList () {
      const res = await getFieldList()
      if (res.data.result === 0) {
        this.fieldList = res.data.fields
      }
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
.table-expand
  >>> label
    font-weight 600
  .el-form-item
    width 20%
</style>
