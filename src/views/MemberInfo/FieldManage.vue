<template>
  <div>
    <Card>
      <span slot="cardTitle">字段管理</span>
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
        <el-table-column prop="name" label="字段名称"></el-table-column>
        <el-table-column label="操作">
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
      <el-form :model="form" :rules="rules" style="text-align: left" ref="form" label-width="120px">
        <el-form-item label="字段名称：" prop="name">
          <el-input v-model="form.name" style="width: 200px"></el-input>
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
import { getFieldList, addFieldList, editFieldList, delFieldList } from '@/api/getData'
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
      titleText: '新增字段',
      submitType: 'add',
      form: { // 表单
        device_params: {} // 设备组 参数
      },
      rules: { // 表单校验
        name: [{ required: true, message: '请输入字段名称', trigger: 'blur' }]
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
      const res = await getFieldList({
        start_index: (this.currentPage - 1) * this.pageSize,
        get_count: this.pageSize
      })
      if (res.data.result === 0) {
        this.tableData = res.data.fields
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
          // 判断表单提交类型
          const submitMethod = this.submitType === 'add' ? addFieldList : editFieldList
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
      this.titleText = '新增字段'
      this.submitType = 'add'
      this.dialogVisible = true
    },
    // 显示编辑表单
    editForm (row) {
      this.titleText = '编辑字段'
      this.submitType = 'edit'
      this.form = JSON.parse(JSON.stringify(row))
      this.dialogVisible = true
    },
    // 删除表单
    delForm (row) {
      this.$prompt(`字段一经删除，人员对应字段也将删除!&nbsp;&nbsp;&nbsp;&nbsp;请输入<strong> ${row.name} <strong/>`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /\S/,
        inputErrorMessage: '请输入对应字段名',
        dangerouslyUseHTMLString: true
      }).then(async ({ value }) => {
        if (row.name === value) {
          const res = await delFieldList({ id: row.id })
          if (res.data.result === 0) {
            // 判断是否为该页最后一条数据且当前页数不为首页，则获取上一页数据
            if (this.tableData.length === 1 && this.currentPage !== 1) {
              this.currentPage = --this.currentPage
            }
            this.$handleSuccessMessage()
            this.getData()
          }
        } else {
          this.$handleErrorMessage('请输入对应的字段名称！')
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
<style lang="stylus">
</style>
