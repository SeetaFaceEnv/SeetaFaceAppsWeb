<template>
  <div>
    <Card>
      <CardMenuItem slot="cardTitle" title="设备组" isActive/>
      <div slot="buttonGroup">
        <el-button @click="addForm()" type="primary">添加</el-button>
      </div>
      <!-- 查询栏 -->
      <QueryBar slot="queryBar">
        <div slot="queryBarLeft">
          ID：<el-input v-model="queryForm.id" clearable class="query-bar-item"></el-input>
          <el-button  @click="queryGetData()">查询</el-button>
          <el-button @click="resetGetData()">重置</el-button>
        </div>
      </QueryBar>
      <!-- 表格 -->
      <el-table slot="contain" header-cell-class-name="table__header" row-class-name="table__row"
        :data="tableData" stripe height="calc(100% - 30px)">
        <el-table-column prop="group_id" label="设备组ID"></el-table-column>
        <el-table-column prop="device_codes" label="包含设备">
          <template slot-scope="scope">
            <el-tag v-for="(item, index) in scope.row.device_codes" :key="index">
              {{ item }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140">
          <template slot-scope="scope">
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

    <!-- 对话框 -->
    <el-dialog
      :title="titleText"
      :visible.sync="dialogVisible"
      width="600px"
      class="input_box"
      @close="dialogClose()"
    >
      <el-form :model="form" :rules="rules" style="text-align: left" ref="form" label-width="150px">
        <el-form-item label="ID：" prop="group_id">
          <el-input v-model="form.group_id" :disabled="submitType === 'edit'" style="width: 200px"></el-input>
          <el-button v-if="submitType === 'add'" @click="generateGroupId()" style="margin-left: 10px">生成</el-button>
        </el-form-item>
        <div v-if="submitType === 'edit'">
          <el-divider>默认设备参数</el-divider>
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
          <el-form-item label="声音：" prop="device_params.voice_switch">
            <el-select v-model="form.device_params.voice_switch" style="width: 200px">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="form.device_params.voice_switch === 1" label="音量：" prop="device_params.volume">
            <el-input-number v-model="form.device_params.volume " :min="0" :max="100" :step="10"/>
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
          <el-form-item label="识别上报地址：" prop="device_params.report_url">
            <el-input v-model="form.device_params.report_url" style="width: 350px"/>
          </el-form-item>
          <el-form-item label="二次鉴权地址：" prop="device_params.auth_url">
            <el-input v-model="form.device_params.auth_url" style="width: 350px"/>
          </el-form-item>
          <el-form-item label="继电器地址：" prop="device_params.relay_host">
            <el-input v-model="form.device_params.relay_host" style="width: 350px"/>
          </el-form-item>
          <el-form-item label="继电器对调(s)：" prop="device_params.relay_signal_alignment">
            <el-select v-model="form.device_params.relay_signal_alignment" style="width: 200px">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="继电器保持时长(s)：" prop="device_params.relay_hold_time">
            <el-input-number v-model="form.device_params.relay_hold_time" :min="1" :step="1"/>
          </el-form-item>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogClose()">取 消</el-button>
        <el-button @click="formSubmit('form')" :loading="$store.state.isSubmitting">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import uuidv4 from 'uuid/v4'
import Card from '@comp/Card/Card'
import CardMenuItem from '@comp/Card/CardMenuItem'
import QueryBar from '@comp/Bar/QueryBar'
import { getGroupList, addGroupList, setGroupDeviceParam, delGroupList } from '@api/getData'
export default {
  data () {
    return {
      tableData: [], // 表格数据
      queryForm: {}, // 查询表单
      // 分页
      currentPage: 1,
      pageSize: 10,
      totalCount: 1,
      // 对话框
      dialogVisible: false,
      titleText: '新增设备组',
      submitType: 'add',
      form: {
        device_params: {}
      }, // 表单
      rules: { // 表单校验
        group_id: [ { required: true, message: '请输入设备组ID', trigger: 'blur' } ]
      },
      options: [
        { value: 1, label: '开启' },
        { value: 2, label: '关闭' }
      ],
      logLevelOptions: [ // 设备日志上报等级
        { value: 1, label: 'debug' },
        { value: 2, label: 'info' },
        { value: 3, label: 'warning' },
        { value: 4, label: 'error' }
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
      const res = await getGroupList({
        skip: (this.currentPage - 1) * this.pageSize,
        limit: this.pageSize,
        group_id: this.queryForm.id || ''
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
      // console.log(this.form)
      // 表单校验
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          // 深拷贝，消除数据处理对当前显示表单的影响
          const submitForm = JSON.parse(JSON.stringify(this.form))
          // 判断表单提交类型
          const submitMethod = this.submitType === 'add' ? addGroupList : setGroupDeviceParam
          const res = await submitMethod({ ...submitForm })
          if (res.data.res === 0) {
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
    // 显示编辑表单
    editForm (row) {
      this.titleText = '编辑默认设备参数'
      this.submitType = 'edit'
      this.form = JSON.parse(JSON.stringify(row))
      this.dialogVisible = true
    },
    // 关闭对话框
    dialogClose () {
      this.dialogVisible = false
      this.form = {
        device_params: {}
      }
      this.$refs.form.clearValidate()
    },
    // 删除表单
    delForm (row) {
      this.$confirm('是否删除该设备组?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const res = await delGroupList({ group_id: row.group_id })
        if (res.data.res === 0) {
          // 判断是否为该页最后一条数据且当前页数不为首页，则获取上一页数据
          if (this.tableData.length === 1 && this.currentPage !== 1) {
            this.currentPage = --this.currentPage
            this.getData()
          }
          this.$handleSuccessMessage()
          this.getData()
        }
      }).catch((e) => { console.log(e) })
    },
    // 生成设备组ID
    generateGroupId () {
      const id = uuidv4().replace(/-/g, '').substr(0, 24)
      this.$set(this.form, 'group_id', id)
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
