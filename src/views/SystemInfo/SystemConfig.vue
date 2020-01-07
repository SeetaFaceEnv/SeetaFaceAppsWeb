<template>
  <div>
    <Card>
      <CardMenuItem slot="cardTitle" title="系统配置" isActive/>
      <div slot="buttonGroup">
        <el-button @click="showResetForm()" type="danger">系统重置</el-button>
      </div>
      <!-- 表格 -->
      <el-table slot="contain" header-cell-class-name="table__header" row-class-name="table__row"
        :data="tableData" stripe height="calc(100% - 30px + 48px)">
        <el-table-column prop="seetacloud_url" label="开放云地址"></el-table-column>
        <el-table-column prop="device_status_callback" label="设备状态回调地址"></el-table-column>
        <el-table-column prop="register_image_callback" label="照片注册失败回调地址"></el-table-column>
        <el-table-column prop="log_callback.url" label="设备错误回调地址"></el-table-column>
        <el-table-column prop="log_callback.level" label="日志上报等级">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.log_callback.level === 1">debug</el-tag>
            <el-tag v-else-if="scope.row.log_callback.level === 2">info</el-tag>
            <el-tag v-else-if="scope.row.log_callback.level === 3">warning</el-tag>
            <el-tag v-else-if="scope.row.log_callback.level === 4">error</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="handshake_key" label="Ping"></el-table-column>
        <el-table-column prop="handshake_response" label="Pong"></el-table-column>
        <el-table-column prop="auto_add" label="自动添加设备">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.auto_add === 1" type="info">关闭</el-tag>
            <el-tag v-else-if="scope.row.auto_add === 2" type="success">开启</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="min_clarity" label="清晰度"></el-table-column>
        <el-table-column prop="min_face" label="最小人脸"></el-table-column>
        <el-table-column prop="max_angle" label="最大人脸角度"></el-table-column>
        <el-table-column prop="status_callback_cycle" label="定时上报间隔(s)"></el-table-column>
        <el-table-column label="操作" width="100">
          <template slot-scope="scope">
            <span class="span__bt" @click="editForm(scope.row)">编 辑</span>
          </template>
        </el-table-column>
      </el-table>
    </Card>

    <!-- 对话框 -->
    <el-dialog
      :title="titleText"
      :visible.sync="dialogVisible"
      width="650px"
      class="input_box"
      @close="dialogClose()"
    >
      <el-form :model="submitType === 'edit' ? form : resetForm" :rules="rules" style="text-align: left" ref="form" label-width="180px">
        <div v-if="submitType === 'edit'">
          <el-form-item label="开放云地址：" prop="seetacloud_url">
            <el-input v-model="form.seetacloud_url" placeholder="例如：http://192.168.0.1:8080/xx/xx" style="width: 350px"></el-input>
          </el-form-item>
          <el-form-item label="设备状态回调地址：" prop="device_status_callback">
            <el-input v-model="form.device_status_callback" style="width: 350px"></el-input>
          </el-form-item>
          <el-form-item label="照片注册失败回调地址：" prop="register_image_callback">
            <el-input v-model="form.register_image_callback" style="width: 350px"></el-input>
          </el-form-item>
          <el-form-item label="设备错误回调地址：" prop="log_callback.url">
            <el-input v-model="form.log_callback.url" style="width: 350px"></el-input>
          </el-form-item>
          <el-form-item label="日志上报等级：" prop="log_callback.level">
            <el-select v-model="form.log_callback.level" style="width: 200px">
              <el-option
                v-for="item in levelOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="自动添加设备：" prop="auto_add">
            <el-select v-model="form.auto_add" style="width: 200px">
              <el-option
                v-for="item in autoAddOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Ping：" prop="handshake_key">
            <el-input v-model="form.handshake_key" style="width: 200px"></el-input>
          </el-form-item>
          <el-form-item label="Pong：" prop="handshake_response">
            <el-input v-model="form.handshake_response" style="width: 200px"></el-input>
          </el-form-item>
          <el-form-item label="清晰度：" prop="min_clarity">
            <el-input-number v-model="form.min_clarity" :min="0.01" :max="0.99" :step="0.01"/>
          </el-form-item>
          <el-form-item label="最小人脸：" prop="min_face">
            <el-input-number v-model="form.min_face" :min="10" :max="100000" :step="100"/>
          </el-form-item>
          <el-form-item label="最大人脸角度：" prop="max_angle">
            <el-input-number v-model="form.max_angle" :min="10" :max="90" :step="10"/>
          </el-form-item>
          <el-form-item label="定时上报间隔(s)：" prop="status_callback_cycle">
            <el-input-number v-model="form.status_callback_cycle" :min="30" :step="10"/>
          </el-form-item>
        </div>
        <div v-if="submitType === 'reset'">
          <el-form-item label="重置类型：" prop="reset_types">
            <el-select v-model="resetForm.reset_types" style="width: 200px" multiple clearable>
              <el-option
                v-for="item in resetTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              <el-tooltip :content="item.desc" placement="right">
                <span>{{ item.label }}</span>
              </el-tooltip>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="密码确认：" prop="password">
            <el-input v-model="resetForm.password" type="password" style="width: 200px">
              <i slot="prefix" style="padding-left: 6px" class="fa fa-key" aria-hidden="true"></i>
            </el-input>
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
import md5 from 'md5'
import Card from '@comp/Card/Card'
import CardMenuItem from '@comp/Card/CardMenuItem'
import { getSystemConfig, setSystemConfig, resetSystemConfig } from '@api/getData'
import { validatePasswordMoreSixAndLessThirty } from '@utils/formHandle/validateForm.js'
export default {
  data () {
    return {
      tableData: [], // 表格数据
      fieldList: [], // 人员字段列表
      // 对话框
      dialogVisible: false,
      titleText: '编辑系统配置',
      submitType: 'edit',
      form: { // 表单
        log_callback: {}
      },
      resetForm: {}, // 重置系统表单
      rules: { // 表单校验
        reset_types: [ { required: true, message: '请选择重置类型', trigger: 'blur' } ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { validator: validatePasswordMoreSixAndLessThirty, trigger: 'blur' }
        ]
      },
      autoAddOptions: [
        { value: 1, label: '关闭' },
        { value: 2, label: '开启' }
      ],
      levelOptions: [
        { value: 1, label: 'debug' },
        { value: 2, label: 'info' },
        { value: 3, label: 'warning' },
        { value: 4, label: 'error' }
      ],
      resetTypeOptions: [
        { value: 1, label: '设备重置参数', desc: '包含：设备参数，流参数和样式，清空设备上报日志' },
        { value: 2, label: '清空人员数据', desc: '包含：人员信息，人员同步信息，人员照片' }
      ]
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
      const res = await getSystemConfig()
      if (res.data.res === 0) {
        this.tableData.push(res.data.param)
      }
    },
    // 提交表单
    formSubmit (formName) {
      // 表单校验
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          let submitForm = {}
          // 根据表单提交类型进行相应处理
          switch (this.submitType) {
            case 'edit':
              // 深拷贝，消除数据处理对当前显示表单的影响
              submitForm = JSON.parse(JSON.stringify(this.form))
              // 判断表单提交类型
              const res = await setSystemConfig({ ...submitForm })
              if (res.data.res === 0) {
                this.getData()
                this.$handleSuccessMessage()
                this.dialogClose()
              }
              break
            case 'reset':
              // 深拷贝，消除数据处理对当前显示表单的影响
              submitForm = JSON.parse(JSON.stringify(this.resetForm))
              // 判断表单提交类型
              const res2 = await resetSystemConfig({
                reset_types: submitForm.reset_types,
                password: md5(submitForm.password)
              })
              if (res2.data.res === 0) {
                this.$handleSuccessMessage()
                this.dialogClose()
              }
              break
          }
        }
      })
    },
    // 显示编辑表单
    editForm (row) {
      this.titleText = '编辑系统配置'
      this.submitType = 'edit'
      this.form = JSON.parse(JSON.stringify(row))
      this.dialogVisible = true
    },
    // 显示系统重置表单
    showResetForm () {
      this.titleText = '系统重置'
      this.submitType = 'reset'
      this.dialogVisible = true
    },
    // 关闭对话框
    dialogClose () {
      this.dialogVisible = false
      this.form = {
        log_callback: {}
      }
      this.resetForm = {}
      this.$refs.form.clearValidate()
    }
  }
}
</script>
<style lang="stylus" scoped>
.table-expand
  >>> label
    font-weight 600
    width 120px
  .el-form-item
    width 40%
</style>
