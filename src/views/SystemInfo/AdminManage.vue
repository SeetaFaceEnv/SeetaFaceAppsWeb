<template>
  <div>
    <Card>
      <CardMenuItem slot="cardTitle" title="管理员管理" isActive/>
      <div slot="buttonGroup">
        <el-button @click="addForm()" type="primary">添加</el-button>
      </div>
      <!-- 查询栏 -->
      <QueryBar slot="queryBar">
        <div slot="queryBarLeft">
          管理员名称：<el-input v-model="queryForm.name" clearable class="query-bar-item"></el-input>
          <el-button @click="queryGetData()">查询</el-button>
          <el-button @click="resetGetData()">重置</el-button>
        </div>
      </QueryBar>
      <!-- 表格 -->
      <el-table slot="contain" header-cell-class-name="table__header" row-class-name="table__row"
        :data="tableData" stripe height="calc(100% - 30px)">
        <el-table-column prop="name" label="管理员"></el-table-column>
        <el-table-column label="操作" width="140">
          <template slot-scope="scope">
            <span class="span__bt" @click="editForm(scope.row)">修改密码</span>
            <span v-if="currentAdmin !== scope.row.name">
              <el-divider direction="vertical"></el-divider>
              <span class="span__bt" @click="delForm(scope.row)">删 除</span>
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
      width="500px"
      class="input_box"
      @close="dialogClose()"
    >
      <el-form :model="form" :rules="rules" style="text-align: left" ref="form" label-width="120px">
        <el-form-item label="名称：" prop="name">
          <el-input v-model="form.name" :disabled="submitType === 'edit'" style="width: 200px"></el-input>
        </el-form-item>
        <el-form-item :label="submitType === 'add' ? '密码：' : '原密码：'" prop="password">
          <el-input v-model="form.password" style="width: 200px" type="password" show-password></el-input>
        </el-form-item>
        <el-form-item v-if="submitType === 'edit'" label="新密码：" prop="new_password">
          <el-input v-model="form.new_password" style="width: 200px" type="password" show-password></el-input>
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
import md5 from 'md5'
import Card from '@comp/Card/Card'
import CardMenuItem from '@comp/Card/CardMenuItem'
import QueryBar from '@comp/Bar/QueryBar'
import { validatePasswordMoreSixAndLessThirty, validateUserNameMoreSixAndLessThirty } from '@utils/formHandle/validateForm.js'
import { getAdminList, addAdminList, editAdminList, delAdminList } from '@api/getData'
export default {
  data () {
    return {
      tableData: [], // 表格数据
      queryForm: {}, // 查询表单
      currentAdmin: sessionStorage.username, // 当前管理员
      // 分页
      currentPage: 1,
      pageSize: 10,
      totalCount: 1,
      // 对话框
      dialogVisible: false,
      titleText: '新增管理员',
      submitType: 'add',
      form: {}, // 表单
      rules: { // 表单校验
        name: [
          { required: true, message: '请输入管理员名称', trigger: 'blur' },
          { validator: validateUserNameMoreSixAndLessThirty, trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { validator: validatePasswordMoreSixAndLessThirty, trigger: 'blur' }
        ],
        new_password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { validator: validatePasswordMoreSixAndLessThirty, trigger: 'blur' }
        ]
      }
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
      const res = await getAdminList({
        skip: (this.currentPage - 1) * this.pageSize,
        limit: this.pageSize,
        name: this.queryForm.name || ''
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
          // 深拷贝，消除数据处理对当前显示表单的影响
          const submitForm = JSON.parse(JSON.stringify(this.form))
          // 密码 md5哈希
          if (submitForm.password) {
            this.$set(submitForm, 'password', md5(submitForm.password))
          }
          if (submitForm.new_password) {
            this.$set(submitForm, 'new_password', md5(submitForm.new_password))
          }
          // 判断表单提交类型
          const submitMethod = this.submitType === 'add' ? addAdminList : editAdminList
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
      this.titleText = '新增管理员'
      this.submitType = 'add'
      this.dialogVisible = true
    },
    // 显示编辑表单
    editForm (row) {
      this.titleText = '修改密码'
      this.submitType = 'edit'
      this.form = JSON.parse(JSON.stringify(row))
      this.dialogVisible = true
    },
    // 关闭对话框
    dialogClose () {
      this.dialogVisible = false
      this.form = {}
      this.$refs.form.clearValidate()
    },
    // 删除表单
    delForm (row) {
      this.$confirm('是否删除该管理员?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const res = await delAdminList({ id: row.id })
        if (res.data.res === 0) {
          // 判断是否为该页最后一条数据且当前页数不为首页，则获取上一页数据
          if (this.tableData.length === 1 && this.currentPage !== 1) {
            this.currentPage = --this.currentPage
          }
          this.$handleSuccessMessage()
          this.getData()
        }
      }).catch((e) => { console.log(e) })
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
