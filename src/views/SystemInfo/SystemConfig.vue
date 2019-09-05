<template>
  <div>
    <Card>
      <span slot="cardTitle">系统配置</span>
      <!-- <div slot="buttonGroup">
        <el-button @click="addForm()" type="primary">添加</el-button>
      </div> -->
      <!-- 查询栏 -->
      <!-- <QueryBar slot="queryBar">
        <div slot="queryBarLeft">
          <el-button>查询</el-button>
        </div>
      </QueryBar> -->
      <!-- 表格 -->
      <el-table slot="contain" header-cell-class-name="table__header" row-class-name="table__row"
        :data="tableData" stripe height="calc(100% - 30px + 48px)">
        <el-table-column prop="server_url" label="服务器地址"></el-table-column>
        <el-table-column prop="seetacloud_url" label="开放云地址"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <span class="span__bt" @click="editForm(scope.row)">编 辑</span>
          </template>
        </el-table-column>
      </el-table>
    </Card>

    <!-- 编辑框 -->
    <el-dialog
      :title="titleText"
      :visible.sync="dialogVisible"
      width="550px"
      class="input_box"
      @close="dialogClose()"
    >
      <el-form :model="form" :rules="rules" style="text-align: left" ref="form" label-width="120px">
        <el-form-item label="服务器地址：" prop="server_url">
          <el-input v-model="form.server_url" placeholder="例如：http://192.168.0.1:8080" style="width: 350px"></el-input>
        </el-form-item>
        <el-form-item label="开放云地址：" prop="seetacloud_url">
          <el-input v-model="form.seetacloud_url" placeholder="例如：http://192.168.0.1:8080/xx/xx" style="width: 350px"></el-input>
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
import Card from '@/components/Card/Card'
// import QueryBar from '@/components/Bar/QueryBar'
import { getConfigList, setConfigList } from '@/api/getData'
export default {
  data () {
    return {
      tableData: [], // 表格数据
      // 编辑框
      dialogVisible: false,
      titleText: '编辑系统配置',
      submitType: 'add',
      form: {}, // 表单
      rules: { // 表单校验
        server_url: [{ required: true, message: '请输入服务器地址', trigger: 'blur' }]
      }
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
      const res = await getConfigList({})
      if (res.data.result === 0) {
        this.tableData.push(res.data.api)
      }
    },
    // 提交表单
    formSubmit (formName) {
      // 表单校验
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          // 深拷贝，消除数据处理对当前显示表单的影响
          const submitForm = JSON.parse(JSON.stringify(this.form))
          // 判断表单提交类型
          const res = await setConfigList({ ...submitForm })
          if (res.data.result === 0) {
            this.$handleSuccessMessage()
            this.dialogClose()
            this.getData()
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
    // 关闭编辑框
    dialogClose () {
      this.dialogVisible = false
      this.form = {}
      this.$refs.form.clearValidate()
    }
  }
}
</script>
<style lang="stylus">
</style>
