<template>
  <div>
    <Card>
      <span slot="cardTitle">流媒体管理</span>
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
        <!-- 展开行 -->
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-form inline class="table-expand">
              <el-form-item label="闪光灯：">
                {{ optionsObj[props.row.camera_params.is_light] }}
              </el-form-item>
              <el-form-item label="活体检测：">
                {{ optionsObj[props.row.camera_params.is_living_detect] }}
              </el-form-item>
              <el-form-item label="识别模式：">
                {{ recognitionModeOptionsObj[props.row.camera_params.recognition_mode] }}
              </el-form-item>
              <el-form-item label="人脸检测框：">
                {{ optionsObj[props.row.camera_params.detect_box] }}
              </el-form-item>
              <el-form-item label="上报未识别人员：">
                {{ optionsObj[props.row.camera_params.not_pass_report] }}
              </el-form-item>
              <el-form-item label="继电器通道：">
                <el-tag v-for="(item, index) in props.row.camera_params.relay_channels" :key="index">
                  {{ item }}
                </el-tag>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <!-- 列表 -->
        <el-table-column prop="name" label="流媒体名称"></el-table-column>
        <el-table-column prop="camera_params.type" label="摄像头类型">
          <template slot-scope="scope">
            {{ cameraTypeObj[scope.row.camera_params.type] }}
          </template>
        </el-table-column>
        <el-table-column prop="time_template_name" label="时间模板">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.time_template_id">
              {{ handleGetTimeTemplateNameById(scope.row.time_template_id) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="camera_params.confidence" label="验证阈值"></el-table-column>
        <el-table-column prop="camera_params.unsure" label="不可信阈值"></el-table-column>
        <el-table-column prop="camera_params.min_clarity" label="最小清晰度"></el-table-column>
        <el-table-column prop="camera_params.min_face" label="最小人脸宽度"></el-table-column>
        <el-table-column prop="camera_params.max_angle" label="最大人脸角度"></el-table-column>
        <el-table-column prop="camera_params.crop_ratio" label="截取比例"></el-table-column>
        <el-table-column prop="camera_params.url" label="流媒体地址"></el-table-column>
        <el-table-column label="操作" width="160">
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

    <!-- 编辑框 -->
    <el-dialog
      :title="titleText"
      :visible.sync="dialogVisible"
      width="450px"
      class="input_box"
      @close="dialogClose()"
    >
      <el-form :model="form" :rules="rules" style="text-align: left" ref="form" label-width="140px">
        <el-form-item label="流媒体名称：" prop="name">
          <el-input v-model="form.name" style="width: 200px"></el-input>
        </el-form-item>
        <el-form-item label="摄像头类型：" prop="camera_params.type">
          <el-select v-model="form.camera_params.type" style="width: 200px">
            <el-option
              v-for="item in cameraTypeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="流媒体地址：" prop="camera_params.url">
          <el-input v-model="form.camera_params.url" style="width: 200px"></el-input>
        </el-form-item>
        <div v-if="submitType === 'edit'">
          <el-divider>流媒体参数</el-divider>
          <!-- 临时修改时间模板位置 -->
          <el-form-item label="时间模板：" prop="time_template_id">
            <el-select v-model="form.time_template_id" style="width: 200px" clearable>
              <el-option
                v-for="item in timeTemplateList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="识别类型：" prop="camera_params.recognize_type">
            <el-tooltip content="1:1识别模式仅对人证一体机设备生效" placement="right">
              <el-select v-model="form.camera_params.recognize_type" disabled style="width: 200px">
                <el-option
                  v-for="item in recognizeTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-tooltip>
          </el-form-item>
          <el-form-item v-if="form.camera_params.recognize_type === 2" label="1:1验证阈值：" prop="camera_params.threshold_11">
            <el-input-number v-model="form.camera_params.threshold_11 " :min="0.01" :max="0.99" :step="0.01"/>
          </el-form-item>
          <el-form-item v-if="form.camera_params.recognize_type === 1" label="1:n验证阈值：" prop="camera_params.confidence">
            <el-input-number v-model="form.camera_params.confidence " :min="0.01" :max="0.99" :step="0.01"/>
          </el-form-item>
          <el-form-item v-if="form.camera_params.recognize_type === 1" label="1:n不可信阈值：" prop="camera_params.unsure">
            <el-input-number v-model="form.camera_params.unsure " :min="0.01" :max="0.99" :step="0.01"/>
          </el-form-item>
          <el-form-item label="最小清晰度：" prop="camera_params.min_clarity">
            <el-input-number v-model="form.camera_params.min_clarity " :min="0.01" :max="0.99" :step="0.01"/>
          </el-form-item>
          <el-form-item label="最小人脸宽度：" prop="camera_params.min_face">
            <el-input-number v-model="form.camera_params.min_face " :min="10" :max="100000" :step="100"/>
          </el-form-item>
          <el-form-item label="最大人脸角度：" prop="camera_params.max_angle">
            <el-input-number v-model="form.camera_params.max_angle " :min="10" :max="90" :step="10"/>
          </el-form-item>
          <el-form-item label="截取比例：" prop="camera_params.crop_ratio">
            <el-input-number v-model="form.camera_params.crop_ratio " :min="0.1" :max="100" :step="1"/>
          </el-form-item>
          <el-form-item label="闪光灯：" prop="camera_params.is_light">
            <el-select v-model="form.camera_params.is_light" style="width: 200px">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="活体检测：" prop="camera_params.is_living_detect">
            <el-tooltip content="活体检测对智能网关设备无效" placement="right">
              <el-select v-model="form.camera_params.is_living_detect" style="width: 200px">
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-tooltip>
          </el-form-item>
          <el-form-item label="识别模式：" prop="camera_params.recognition_mode">
            <el-select v-model="form.camera_params.recognition_mode" style="width: 200px">
              <el-option
                v-for="item in recognitionModeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="人脸检测框：" prop="camera_params.detect_box">
            <el-select v-model="form.camera_params.detect_box" style="width: 200px">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="上报未识别人员：" prop="camera_params.not_pass_report">
            <el-select v-model="form.camera_params.not_pass_report" style="width: 200px">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <!-- 继电器相关 -->
          <el-form-item label="继电器通道：" prop="camera_params.relay_channels">
            <el-select v-model="form.camera_params.relay_channels" multiple :multiple-limit=1 style="width: 200px">
              <el-option
                v-for="item in 16"
                :key="item"
                :label="item"
                :value="item"
              ></el-option>
            </el-select>
          </el-form-item>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogClose()">取 消</el-button>
        <el-button @click="formSubmit('form')" :loading=$store.state.isSubmitting>确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import Card from '@comp/Card/Card'
// import QueryBar from '@comp/Bar/QueryBar'
import { getStreamList, addStreamList, editStreamList, delStreamList, getTimeTemplateList } from '@api/getData'
export default {
  data () {
    return {
      tableData: [], // 表格数据
      // 分页
      currentPage: 1,
      pageSize: 10,
      totalCount: 1,
      // 编辑框
      dialogVisible: false,
      titleText: '新增流媒体',
      submitType: 'add',
      form: { // 表单
        camera_params: {} // 流媒体参数
      },
      rules: { // 表单校验
        name: [{ required: true, message: '请输入流媒体名称', trigger: 'blur' }],
        'camera_params.type': [{ required: true, message: '请选择摄像头类型', trigger: 'blur' }]
      },
      cameraTypeList: [
        // { value: 'webcam', label: '本身摄像头' },
        { value: 'ipc-h264', label: '网络摄像头' },
        { value: 'seeta-hz001', label: '中科视拓智能摄像头-hz' },
        { value: 'seeta-hi001', label: '中科视拓智能摄像头-hi' }
      ],
      options: [ // 开启控制
        { value: 1, label: '开启' },
        { value: 2, label: '关闭' }
      ],
      recognizeTypeOptions: [ // 识别类型
        { value: 1, label: '1:n' }
        // { value: 2, label: '1:1' }
      ],
      recognitionModeOptions: [ // 识别模式
        { value: 1, label: '最大人脸识别' },
        { value: 2, label: '多人脸识别' }
      ],
      // 控制table展示内容
      cameraTypeObj: {
        'ipc-h264': '网络摄像头',
        'seeta-hz001': '中科视拓智能摄像头-hz',
        'seeta-hi001': '中科视拓智能摄像头-hi'
      },
      optionsObj: {
        '1': '开启',
        '2': '关闭'
      },
      recognitionModeOptionsObj: {
        '1': '最大人脸识别',
        '2': '多人脸识别'
      },
      timeTemplateList: [] // 所有时间模板
    }
  },
  components: {
    Card
    // QueryBar
  },
  mounted () {
    this.findTimeTemplateList()
    this.getData()
  },
  methods: {
    // 获取表格数据
    async getData () {
      this.tableData = []
      const res = await getStreamList({
        start_index: (this.currentPage - 1) * this.pageSize,
        get_count: this.pageSize
      })
      if (res.data.result === 0) {
        this.tableData = res.data.streams
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
          // 序列化对象传递
          this.$set(submitForm, 'camera_params', JSON.stringify(submitForm.camera_params))
          // 判断表单提交类型
          const submitMethod = this.submitType === 'add' ? addStreamList : editStreamList
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
      this.titleText = '新增流媒体'
      this.submitType = 'add'
      this.dialogVisible = true
    },
    // 显示编辑表单
    editForm (row) {
      this.titleText = '编辑流媒体'
      this.submitType = 'edit'
      this.form = JSON.parse(JSON.stringify(row))
      this.dialogVisible = true
    },
    // 删除表单
    delForm (row) {
      this.$confirm('是否删除该流媒体?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const res = await delStreamList({ id: row.id })
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
      this.form = { camera_params: {} }
      this.$refs.form.clearValidate()
    },
    // 查找所有时间模板
    async findTimeTemplateList () {
      const res = await getTimeTemplateList()
      if (res.data.result === 0) {
        this.timeTemplateList = res.data.time_templates
      }
    },
    // 使用id查找字段名称
    handleGetTimeTemplateNameById (timeTemplateId) {
      for (let item of this.timeTemplateList) {
        if (item.id === timeTemplateId) {
          return item.name
        }
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
.table-expand
  >>> label
    font-weight 600
  .el-form-item
    width 30%
</style>
