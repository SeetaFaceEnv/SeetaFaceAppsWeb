<template>
  <div>
    <Card>
      <span slot="cardTitle">设备组管理</span>
      <div slot="buttonGroup">
        <el-button @click="addForm()" type="primary">添加</el-button>
      </div>
      <!-- 查询栏 -->
      <!-- <QueryBar slot="queryBar">
        <div slot="queryBarLeft">
          <el-button>查询</el-button>
        </div>
      </QueryBar> -->
      <!-- 表格 -->
      <el-table slot="contain" header-cell-class-name="table__header" row-class-name="table__row"
        :data="tableData" stripe height="calc(100% - 30px + 48px)">
        <el-table-column prop="name" label="设备组名称"></el-table-column>
        <el-table-column label="组内设备">
          <template slot-scope="scope">
            <el-tag v-for="(item, index) in scope.row.devices" :key="index">
              {{item.device_name}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- <span class="span__bt" @click="viewDeviceList(scope.row)">查看设备</span>
            <el-divider direction="vertical"></el-divider> -->
            <span class="span__bt" @click="editForm(scope.row)">编 辑</span>
            <el-divider direction="vertical"></el-divider>
            <span class="span__bt" @click="delForm(scope.row)">删 除</span>
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

    <!-- 编辑框 -->
    <el-dialog
      :title="titleText"
      :visible.sync="dialogVisible"
      width="450px"
      class="input_box"
      @close="dialogClose()"
    >
      <el-form :model="form" :rules="rules" style="text-align: left" ref="form" label-width="120px">
        <el-form-item label="设备组名称：" prop="name">
          <el-input v-model="form.name" style="width: 200px"></el-input>
        </el-form-item>
        <div v-if="submitType === 'edit'">
          <!-- 设备参数 -->
          <el-divider>设备参数</el-divider>
          <el-form-item label="设备屏保：" prop="device_params.screensaver_switch">
            <el-select v-model="form.device_params.screensaver_switch" style="width: 200px">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="日志上报等级：" prop="device_params.volume">
            <el-select v-model="form.device_params.log_level" style="width: 200px">
              <el-option
                v-for="item in logLevelOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="声音开启：" prop="device_params.voice_switch">
            <el-select v-model="form.device_params.voice_switch" style="width: 200px">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="音量：" prop="device_params.volume">
            <el-input-number v-model="form.device_params.volume" :min="0" :max="100" :step="10"/>
          </el-form-item>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogClose()">取 消</el-button>
        <el-button @click="formSubmit('form')" :loading=$store.state.isSubmitting>确 定</el-button>
      </div>
    </el-dialog>

    <!-- <el-dialog
      title="查看组内设备"
      :visible.sync="viewDeviceDialogVisible"
      width="450px"
      class="input_box"
      @close="viewDeviceDialogClose()"
    >
      <el-table :data="deviceTableData">
        <el-table-column prop="device_name" label="设备名称"></el-table-column>
        <el-table-column prop="device_code" label="设备编码"></el-table-column>
      </el-table>

      <div slot="footer" class="dialog-footer">
        <el-button @click="viewDeviceDialogClose()">确 定</el-button>
      </div>
    </el-dialog> -->
  </div>
</template>
<script>
import Card from '@comp/Card/Card'
// import QueryBar from '@comp/Bar/QueryBar'
import { getDeviceGroupList, addDeviceGroupList, editDeviceGroupList, delDeviceGroupList } from '@api/getData'
export default {
  data () {
    return {
      tableData: [], // 表格数据
      // 分页
      currentPage: 1,
      pageSize: 10,
      totalCount: 1,
      // 组内设备查看
      // viewDeviceDialogVisible: false,
      // deviceTableData: [], // 组内设备数据
      // 编辑框
      dialogVisible: false,
      titleText: '新增设备组',
      submitType: 'add',
      form: { // 表单
        device_params: {} // 设备组 参数
      },
      rules: { // 表单校验
        name: [{ required: true, message: '请输入设备组名称', trigger: 'blur' }]
      },
      options: [ // 开启控制
        { value: 1, label: '开启' },
        { value: 2, label: '关闭' }
      ],
      logLevelOptions: [ // 设备日志上报等级
        { value: 1, label: 'debug' },
        { value: 2, label: 'info' },
        { value: 3, label: 'warn' },
        { value: 4, label: 'error' }
      ]
    }
  },
  components: {
    Card
    // QueryBar
  },
  mounted () {
    this.getData()
  },
  methods: {
    // 获取表格数据
    async getData () {
      this.tableData = []
      const res = await getDeviceGroupList({
        start_index: (this.currentPage - 1) * this.pageSize,
        get_count: this.pageSize
      })
      if (res.data.result === 0) {
        this.tableData = res.data.groups
        this.totalCount = res.data.total
      }
    },
    // 提交表单
    formSubmit (formName) {
      // 表单校验
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          // 深拷贝，消除数据处理对当前显示表单的影响
          const submitForm = JSON.parse(JSON.stringify(this.form))
          // console.log(submitForm.device_params)
          this.$set(submitForm, 'device_params', JSON.stringify(submitForm.device_params))
          // 判断表单提交类型
          const submitMethod = this.submitType === 'add' ? addDeviceGroupList : editDeviceGroupList
          const res = await submitMethod({ ...submitForm })
          if (res.data.result === 0) {
            this.$handleSuccessMessage()
            this.dialogClose()
            this.getData()
          }
        }
      })
    },
    // 显示新增表单
    addForm () {
      this.titleText = '新增设备组'
      this.submitType = 'add'
      this.dialogVisible = true
    },
    // 查看组内设备
    // viewDeviceList (row) {
    //   this.deviceTableData = row.devices
    //   this.viewDeviceDialogVisible = true
    // },
    // 关闭viewDialog
    // viewDeviceDialogClose () {
    //   this.deviceTableData = []
    //   this.viewDeviceDialogVisible = false
    // },
    // 显示编辑表单
    editForm (row) {
      this.titleText = '编辑设备组'
      this.submitType = 'edit'
      this.form = JSON.parse(JSON.stringify(row))
      this.dialogVisible = true
    },
    // 删除表单
    delForm (row) {
      this.$confirm('是否删除该设备组?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const res = await delDeviceGroupList({ id: row.id })
        if (res.data.result === 0) {
          // 判断是否为该页最后一条数据且当前页数不为首页，则获取上一页数据
          if (this.tableData.length === 1 && this.currentPage !== 1) {
            this.currentPage = --this.currentPage
          }
          this.$handleSuccessMessage()
          this.getData()
        }
      }).catch(() => {})
    },
    // 关闭编辑框
    dialogClose () {
      this.dialogVisible = false
      this.form = { device_params: {} }
      this.$refs.form.clearValidate()
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
</style>
