<template>
  <div>
    <Card>
      <span slot="cardTitle">设备管理</span>
      <div slot="buttonGroup">
        <el-button @click="updateForm()" type="danger">批量升级</el-button>
        <el-button @click="addForm()" type="primary">添加</el-button>
      </div>
      <!-- 查询栏 -->
      <QueryBar slot="queryBar">
        <div slot="queryBarLeft">
          设备名称：<el-input v-model="queryForm.name" clearable style="width: 150px;margin-right: 10px"></el-input>
          设备编码：<el-input v-model="queryForm.code" clearable style="width: 150px;margin-right: 10px"></el-input>
          <el-button @click="getData()">查询</el-button>
          <el-button @click="resetGetData()">重置</el-button>
        </div>
      </QueryBar>
      <!-- 表格 -->
      <el-table ref="multipleTable" slot="contain" header-cell-class-name="table__header" row-class-name="table__row"
        :data="tableData" stripe height="calc(100% - 30px)" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="name" label="设备名称"></el-table-column>
        <el-table-column prop="code" label="设备编码"></el-table-column>
        <el-table-column prop="type" label="设备类型">
          <template slot-scope="props">
            {{ deviceType[props.row.type] }}
          </template>
        </el-table-column>
        <el-table-column prop="type" label="设备状态">
          <template slot-scope="props">
            <img v-if="props.row.alive === 1" src="@/assets/images/normal_light.png">
            <img v-else src="@/assets/images/abnormal_light.png">
          </template>
        </el-table-column>
        <el-table-column label="操作" width="320">
          <template slot-scope="scope">
            <span v-if="scope.row.type === 3 || scope.row.type === 4">
              <span class="span__bt" @click="editStreamForm(scope.row)">流媒体</span>
              <el-divider direction="vertical"></el-divider>
            </span>
            <span v-if="scope.row.type === 1 || scope.row.type === 2">
              <el-tooltip content="最快2s一次应答" placement="top">
                <span class="span__bt" @click="responseDevice(scope.row)">应 答</span>
              </el-tooltip>
              <el-divider direction="vertical"></el-divider>
            </span>
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
      width="600px"
      class="input_box"
      @close="dialogClose()"
    >
      <el-form :model="form" :rules="rules" style="text-align: left" ref="form" label-width="140px">
        <div v-if="submitType === 'add' || submitType === 'edit' ">
          <el-form-item label="设备名称：" prop="name">
            <el-input v-model="form.name" style="width: 200px"></el-input>
          </el-form-item>
          <el-form-item label="设备编码：" prop="code">
            <el-select @change="showDeviceType" v-model="form.code" style="width: 200px">
              <el-option
                v-for="item in deviceList"
                :key="item.device_code"
                :label="item.device_code"
                :value="item.device_code"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="tempDeviceType" label="设备类型：" prop="tempDeviceType">
            <el-input v-model="tempDeviceType" style="width: 200px" disabled></el-input>
          </el-form-item>
          <el-form-item label="设备组：" prop="group_id">
            <el-select v-model="form.group_id" style="width: 200px" clearable>
              <el-option
                v-for="item in deviceGroupList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </div>
        <div v-if="submitType === 'edit'">
          <!-- 设备参数 -->
          <el-divider>设备参数</el-divider>
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
          <!-- 门禁机、人证一体机 有声音选项 -->
          <div v-if="form.type === 1 || form.type === 2">
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
              <el-input-number v-model="form.device_params.volume " :min="0" :max="100" :step="10"/>
            </el-form-item>
          </div>
          <div v-if="form.type === 1 || form.type === 2">
            <!-- 流媒体参数 (当设备为人证一体机或门禁机时 显示流媒体参数)-->
            <el-divider>流媒体参数</el-divider>
            <!-- 临时修改时间模板位置 -->
            <el-form-item v-if="form.type === 1 || form.type === 2" label="时间模板：" prop="time_template_id">
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
                <el-select v-model="form.camera_params.recognize_type" style="width: 200px">
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
            <el-input-number v-model="form.camera_params.threshold_11 " :min="0.01" :max="0.99" :step="0.1"/>
          </el-form-item>
          <el-form-item v-if="form.camera_params.recognize_type === 1" label="1:n验证阈值：" prop="camera_params.confidence">
            <el-input-number v-model="form.camera_params.confidence " :min="0.01" :max="0.99" :step="0.1"/>
          </el-form-item>
          <el-form-item v-if="form.camera_params.recognize_type === 1" label="1:n不可信阈值：" prop="camera_params.unsure">
            <el-input-number v-model="form.camera_params.unsure " :min="0.01" :max="0.99" :step="0.1"/>
          </el-form-item>
          <el-form-item label="最小清晰度：" prop="camera_params.min_clarity">
            <el-input-number v-model="form.camera_params.min_clarity " :min="0.01" :max="0.99" :step="0.1"/>
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
          <el-form-item label="最大尝试人脸抓拍时长(s)：" prop="camera_params.capture_max_interval">
            <el-input-number v-model="form.camera_params.capture_max_interval " :min="1" :max="1000" :step="1"/>
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
            <el-select v-model="form.camera_params.is_living_detect" style="width: 200px">
              <el-option
                v-for="item in options"
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
          </div>
        </div>
        <el-form-item v-if="submitType === 'editStream'" label="流媒体：" prop="stream_ids">
          <el-select v-model="form.stream_ids" style="width: 200px" multiple>
            <el-option
              v-for="item in streamList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <div v-if="submitType === 'updateApk'">
          <el-form-item label="已选设备：">
            <el-tag
              size="medium"
              type="success"
              :key="tag.id"
              v-for="tag in selectDeviceList">
              {{tag.name}}
            </el-tag>
          </el-form-item>
          <el-form-item label="上传Apk：" prop="stream_ids">
            <el-upload
              ref="upload-apk"
              action=""
              drag
              accept=".apk"
              :limit=1
              :file-list="uploadFile"
              :auto-upload="false"
              :on-change="handleChangeApk"
              :on-remove="handleRemoveApk">
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
              <div class="el-upload__tip" slot="tip">只能上传apk文件，请确保为正确升级apk</div>
            </el-upload>
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
import Card from '@/components/Card/Card'
import QueryBar from '@/components/Bar/QueryBar'
import { getDeviceList, addDeviceList, editDeviceList, delDeviceList, findDeviceList, getDeviceGroupList, getStreamList, editDeviceStreamList, updateApk, responseDeviceList, getTimeTemplateList } from '@/api/getData'
import { setTimeout } from 'timers'
export default {
  data () {
    return {
      tableData: [], // 表格数据
      queryForm: {}, // 查询表单
      isAllowClick: true, // 防止连续点击
      // 分页
      currentPage: 1,
      pageSize: 10,
      totalCount: 1,
      // 编辑框
      dialogVisible: false,
      titleText: '新增设备',
      submitType: 'add',
      tempDeviceType: '', // 编辑框中临时表示设备类型（不可编辑）
      form: { // 表单
        device_params: {}, // 设备参数
        camera_params: {} // 流媒体参数
      },
      rules: { // 表单检验
        name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
        code: [{ required: true, message: '请选择设备编号', trigger: 'blur' }]
      },
      timeTemplateList: [], // 所有时间模板
      deviceType: { // 设备类型（设备发现决定，无法修改）
        1: '人证一体机',
        2: '门禁机',
        3: '智能网关',
        4: 'PC智能网关'
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
      ],
      recognizeTypeOptions: [ // 识别类型
        { value: 1, label: '1:n' },
        { value: 2, label: '1:1' }
      ],
      deviceList: [], // 所有未知设备
      deviceGroupList: [], // 所有设备组
      streamList: [], // 所有流媒体
      tempStreamList: [], // 临时存储原本流媒体列表
      selectDeviceList: [], // 勾选设备组（批量更新时使用）
      uploadFile: [] // apk上传文件
    }
  },
  computed: {
    isRefreshDeviceList () {
      return this.$store.state.isRefreshDeviceList // 是否刷新设备状态列表
    }
  },
  watch: {
    isRefreshDeviceList (val) {
      if (val === true) {
        this.getData()
        console.log('设备状态变更，设备列表刷新！')
        this.$store.commit('changeIsRefreshDeviceList')
      }
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
      const res = await getDeviceList({
        name: this.queryForm.name || '',
        code: this.queryForm.code || '',
        start_index: (this.currentPage - 1) * this.pageSize,
        get_count: this.pageSize
      })
      if (res.data.result === 0) {
        this.tableData = res.data.devices
        this.totalCount = res.data.total
      }
    },
    // 重置搜索
    resetGetData () {
      this.queryForm = {}
      this.getData()
    },
    // 提交表单
    formSubmit (formName) {
      // 表单校验
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          // 深拷贝，消除数据处理对当前显示表单的影响
          const submitForm = JSON.parse(JSON.stringify(this.form))
          // 序列化对象传递
          this.$set(submitForm, 'device_params', JSON.stringify(submitForm.device_params))
          this.$set(submitForm, 'camera_params', JSON.stringify(submitForm.camera_params))
          // 判断表单提交类型
          const submitMethod = this.submitType === 'add' ? addDeviceList : editDeviceList
          // 根据表单提交类型进行相应处理
          switch (this.submitType) {
            case 'add':
            case 'edit':
              const res = await submitMethod({ ...submitForm })
              if (res.data.result === 0) {
                this.$handleSuccessMessage()
                this.dialogClose()
                this.getData()
              }
              break
            case 'editStream':
              this.handleStreamEdit(this.tempStreamList, submitForm)
              break
            case 'updateApk':
              this.handleUpdateApk()
              break
          }
        }
      })
    },
    // 流媒体编辑提交
    async handleStreamEdit (oldStreamIds, submitForm) {
      let delStreamIds = []
      let addStreamIds = []
      let newStreamIds = submitForm.stream_ids
      // 循环原流媒体列表 查找需要删除的流媒体
      for (let key in oldStreamIds) {
        if (newStreamIds.indexOf(oldStreamIds[key]) === -1) {
          delStreamIds.push(oldStreamIds[key])
        }
      }
      // 循环新流媒体列表 查找需要添加的流媒体
      for (let key in newStreamIds) {
        if (oldStreamIds.indexOf(newStreamIds[key]) === -1) {
          addStreamIds.push(newStreamIds[key])
        }
      }
      const res = await editDeviceStreamList({
        id: submitForm.id,
        del_stream_ids: JSON.stringify(delStreamIds),
        add_stream_ids: JSON.stringify(addStreamIds)
      })
      if (res.data.result === 0) {
        this.$handleSuccessMessage()
        this.dialogClose()
        this.getData()
      }
    },
    // apk升级提交
    async handleUpdateApk () {
      // 是否选择设备
      let deviceCodes = []
      if (this.selectDeviceList.length === 0) {
        this.$handleWarningMessage('请先选择需要升级的设备', 2000)
        return
      } else {
        for (let item of this.selectDeviceList) {
          deviceCodes.push(item.code)
        }
      }
      // 是否上传apk文件
      if (this.uploadFile.length === 0) {
        this.$handleWarningMessage('请先上传apk文件', 2000)
        return
      }
      // 提交apk升级
      const res = await updateApk({
        apk_file: this.uploadFile[0].raw,
        device_codes: JSON.stringify(deviceCodes)
      })
      if (res.data.result === 0) {
        this.$handleSuccessMessage()
        this.dialogClose()
        this.getData()
      }
    },
    // 显示新增表单
    addForm () {
      this.titleText = '新增设备'
      this.submitType = 'add'
      this.findUnknownDeviceList()
      this.findDeviceGroupList()
      this.dialogVisible = true
    },
    // 选择设备编码后显示对应的设备类型
    showDeviceType (val) {
      // console.log(this.deviceList)
      for (let item of this.deviceList) {
        if (item.device_code === val) {
          this.tempDeviceType = this.deviceType[item.type]
          break
        }
      }
    },
    // 显示编辑表单
    editForm (row) {
      this.titleText = '编辑设备'
      this.submitType = 'edit'
      this.form = JSON.parse(JSON.stringify(row))
      if (this.form.type === 1 || this.form.type === 2) { // 当为人证一体机或门禁机时 可选时间模板
        this.findTimeTemplateList()
      }
      this.tempDeviceType = this.deviceType[this.form.type] // 临时显示当前设备类型（不会提交）
      this.findUnknownDeviceList()
      this.findDeviceGroupList()
      this.dialogVisible = true
    },
    // 显示流媒体编辑
    editStreamForm (row) {
      this.titleText = '编辑流媒体'
      this.submitType = 'editStream'
      this.tempStreamList = row.stream_ids || [] // 存储原流媒体数组
      this.form = JSON.parse(JSON.stringify(row))
      this.findStreamList()
      this.dialogVisible = true
    },
    // 显示批量更新
    updateForm () {
      if (this.selectDeviceList.length === 0) {
        this.$handleWarningMessage('请先选择需要升级的设备', 2000)
        return
      }
      this.titleText = '批量升级Apk'
      this.submitType = 'updateApk'
      this.dialogVisible = true
    },
    // 勾选变更
    handleSelectionChange (arry) {
      this.selectDeviceList = arry
    },
    // 删除表单
    delForm (row) {
      this.$confirm('是否删除该设备?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        beforeClose: async (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '删除中...'
            // 删除操作
            const res = await delDeviceList({ id: row.id })
            if (res.data.result === 0) {
              // 判断是否为该页最后一条数据且当前页数不为首页，则获取上一页数据
              if (this.tableData.length === 1 && this.currentPage !== 1) {
                this.currentPage = --this.currentPage
              }
              this.$handleSuccessMessage()
              this.getData()
            }
            done()
          } else {
            done()
          }
        },
        callback: (action, instance) => {
          instance.confirmButtonLoading = false // 消息框消失后 取消loading状态
        }
      }).then(() => {
      }).catch(() => {
      })
    },
    // 关闭编辑框
    dialogClose () {
      this.dialogVisible = false
      this.tempDeviceType = ''
      this.form = { device_params: {}, camera_params: {} }
      this.$refs.form.clearValidate()
      this.$refs.multipleTable.clearSelection() // 清空设备勾选
      // 清空上传残留文件
      this.uploadFile = []
      if (this.$refs['upload-apk']) {
        this.$refs['upload-apk'].clearFiles()
      }
    },
    // 发现未知设备
    async findUnknownDeviceList () {
      const res = await findDeviceList()
      if (res.data.result === 0) {
        this.deviceList = res.data.devices
      }
    },
    // 查找所有设备组
    async findDeviceGroupList () {
      const res = await getDeviceGroupList()
      if (res.data.result === 0) {
        this.deviceGroupList = res.data.groups
      }
    },
    // 查找所有流媒体
    async findStreamList () {
      const res = await getStreamList()
      if (res.data.result === 0) {
        this.streamList = res.data.streams
      }
    },
    // 查找所有时间模板
    async findTimeTemplateList () {
      const res = await getTimeTemplateList()
      if (res.data.result === 0) {
        this.timeTemplateList = res.data.time_templates
      }
    },
    // apk上传
    handleChangeApk (file, fileList) {
      this.uploadFile = fileList
    },
    // apk移除
    handleRemoveApk (file, fileList) {
      this.uploadFile = fileList
    },
    // 设备应答
    responseDevice (row) {
      // 防止连续点击
      if (this.isAllowClick) {
        this.isAllowClick = false
        setTimeout(() => {
          this.isAllowClick = true
        }, 2000)
        responseDeviceList({ id: row.id })
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
<style lang="stylus">
</style>
