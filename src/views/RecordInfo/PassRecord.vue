<template>
  <div>
    <Card>
      <CardMenuItem slot="cardTitle" title="通行记录" isActive/>
      <div slot="buttonGroup">
        <!-- <el-button @click="exportForm()" type="danger">导出</el-button> -->
      </div>
      <!-- 查询栏 -->
      <QueryBar slot="queryBar">
        <div slot="queryBarLeft" style="float: left;text-align: left">
          设备编码：<el-input v-model="queryForm.deviceCode" clearable class="query-bar-item"></el-input>
          识别类型：
          <el-select v-model="queryForm.recognizeType" clearable class="query-bar-item">
            <el-option
              v-for="item in recognizeTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
          相似度：
          <el-input-number v-model="queryForm.score" :min="0.01" :step="0.1" :max="0.99" clearable class="query-bar-item"/>
          <!-- 隐藏 窗口缩小时 控制换行 -->
          <div class="handle-line" style="height: 10px;width: 100%;display: none"></div>
          是否通过：
          <el-select v-model="queryForm.isPass" clearable class="query-bar-item">
            <el-option
              v-for="item in isPassOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
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
        <el-table-column label="人员ID" prop="person_id"></el-table-column>
        <el-table-column label="IC卡" prop="ic_card"></el-table-column>
        <el-table-column label="身份证" prop="id_card"></el-table-column>
        <el-table-column label="二维码" prop="qr_code"></el-table-column>
        <el-table-column label="设备编码" prop="device_code"></el-table-column>
        <el-table-column label="流ID" prop="camera_id"></el-table-column>
        <el-table-column label="底库照片" width="120">
          <template slot-scope="scope">
            <el-image class="member-image" v-if="scope.row.match_url" :src="scope.row.match_url"
              @click="showBigImg(scope.row.match_url)" :preview-src-list="srcList">
              <div slot="placeholder" class="loading-img">
                <i class="fa fa-spinner fa-3x fa-pulse" aria-hidden="true"></i>
              </div>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column label="现场照片" width="120">
          <template slot-scope="scope">
            <el-image class="member-image" v-if="scope.row.capture_url" :src="scope.row.capture_url"
              @click="showBigImg(scope.row.capture_url)" :preview-src-list="srcList">
              <div slot="placeholder" class="loading-img">
                <i class="fa fa-spinner fa-3x fa-pulse" aria-hidden="true"></i>
              </div>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column label="相似度" prop="score">
          <template slot-scope="scope">
            {{ scope.row.score.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="识别类型" prop="recognize_type">
          <template slot-scope="scope">
            <span v-if="scope.row.recognize_type === 1">1:N</span>
            <span v-else-if="scope.row.recognize_type === 2">1:1</span>
            <span v-else-if="scope.row.recognize_type === 3">1:X</span>
          </template>
        </el-table-column>
        <el-table-column label="备选识别类型" prop="recognize_type_backup">
          <template slot-scope="scope">
            <span v-if="scope.row.recognize_type_backup === 0">无</span>
            <span v-else-if="scope.row.recognize_type_backup === 2">1:1</span>
            <span v-else-if="scope.row.recognize_type_backup === 3">1:X</span>
          </template>
        </el-table-column>
        <el-table-column label="是否通过" prop="is_pass">
          <template slot-scope="scope">
            <span v-if="scope.row.is_pass === 1">通过</span>
            <span v-if="scope.row.is_pass === 2">不通过</span>
          </template>
        </el-table-column>
        <el-table-column label="记录时间" width="200px">
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

    <!-- 对话框 -->
    <el-dialog
      :title="titleText"
      :visible.sync="dialogVisible"
      width="600px"
      class="input_box"
      @close="dialogClose()"
    >
      <el-form :model="form" :rules="rules" style="text-align: left" ref="form" label-width="160px">
        <el-form-item label="选择设备：" prop="deviceCodes">
          <el-select v-model="form.deviceCodes" style="width: 200px" multiple clearable>
            <el-option
              v-for="item in deviceList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="选择人员属性：" prop="fieldIds">
          <el-select v-model="form.fieldIds" style="width: 200px" multiple clearable>
            <el-option
              v-for="item in fieldList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="选择是否通过：" prop="isPass">
          <el-select v-model="form.isPass" style="width: 200px" clearable class="query-bar-item">
            <el-option
              v-for="item in isPassOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="选择日期区间：">
          <el-date-picker
            v-model="form.dateRange"
            type="datetimerange"
            format="yyyy-MM-dd HH:mm"
            :default-time="['00:00:00', '23:59:59']"
            value-format="timestamp"
            range-separator="至"
            unlink-panels
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogClose()">取 消</el-button>
        <el-button @click="formSubmit('form')" :loading="$store.state.isSubmitting">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import moment from 'moment'
import Card from '@comp/Card/Card'
import CardMenuItem from '@comp/Card/CardMenuItem'
import QueryBar from '@comp/Bar/QueryBar'
import { getPassRecordList, getDeviceList } from '@api/getData'
export default {
  data () {
    return {
      tableData: [], // 表格数据
      queryForm: {}, // 查询表单
      fieldList: [], // 人员字段列表
      deviceList: [], // 所有设备列表
      srcList: [], // 大图预览的图片地址
      // 分页
      currentPage: 1,
      pageSize: 10,
      totalCount: 1,
      // 对话框
      dialogVisible: false,
      titleText: '导出通行记录',
      submitType: 'add',
      form: {}, // 表单
      rules: {}, // 表单校验
      isPassOptions: [ // 是否通关
        { value: 1, label: '通过' },
        { value: 2, label: '不通过' }
      ],
      recognizeTypeOptions: [ // 识别类型
        { value: 1, label: '1:N' },
        { value: 2, label: '1:1' },
        { value: 3, label: '1:X' }
      ]
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
      const res = await getPassRecordList({
        skip: (this.currentPage - 1) * this.pageSize,
        limit: this.pageSize,
        device_code: this.queryForm.deviceCode || '',
        recognize_type: this.queryForm.recognizeType || 0,
        start_time: this.queryForm.dateRange ? Math.floor(this.queryForm.dateRange[0] / 1000) : 0,
        end_time: this.queryForm.dateRange ? Math.floor(this.queryForm.dateRange[1] / 1000) : 0,
        is_pass: this.queryForm.isPass || 1,
        score: this.queryForm.score
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
    // 提交表单
    formSubmit (formName) {
      // 表单校验
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          this.dialogClose()
        }
      })
    },
    // 显示导出表单
    exportForm () {
      this.titleText = '导出通行记录'
      this.submitType = 'add'
      this.findDeviceList()
      this.dialogVisible = true
    },
    // 关闭对话框
    dialogClose () {
      this.dialogVisible = false
      this.form = {}
      this.$refs.form.clearValidate()
    },
    // 获取所有设备信息
    async findDeviceList () {
      const res = await getDeviceList({
        skip: 0,
        limit: 10000
      })
      if (res.data.res === 0) {
        this.deviceList = res.data.records
      }
    },
    // 时间戳转换为标准时间
    transformToDateTime (val) {
      return moment(val).format('YYYY-MM-DD HH:mm:ss')
    },
    // 查看大图
    showBigImg (url) {
      this.srcList = []
      this.$nextTick(() => {
        this.srcList.push(url)
      })
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
  // 媒体查询 宽度小于1950px时 queryBar展示为两行 优化展示效果
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
