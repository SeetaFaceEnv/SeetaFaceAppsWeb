<template>
  <div>
    <Card>
      <CardMenuItem slot="cardTitle" title="样式管理" isActive/>
      <div slot="buttonGroup">
        <el-button @click="addForm()" type="primary">添加</el-button>
      </div>
      <!-- 查询栏 -->
      <QueryBar slot="queryBar">
        <div slot="queryBarLeft">
          类型：
          <el-select v-model="queryForm.type" @clear="queryForm.type = ''" clearable class="query-bar-item">
            <el-option
              v-for="item in styleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
          名称：<el-input v-model="queryForm.name" clearable class="query-bar-item"></el-input>
          <el-button @click="queryGetData()">查询</el-button>
          <el-button @click="resetGetData()">重置</el-button>
        </div>
      </QueryBar>
      <!-- 表格 -->
      <el-table slot="contain" header-cell-class-name="table__header" row-class-name="table__row"
        :data="tableData" stripe height="calc(100% - 30px)">
        <el-table-column prop="name" label="名称"></el-table-column>
        <el-table-column prop="isDefault" label="类型">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.type === 1">屏保图</el-tag>
            <el-tag v-else-if="scope.row.type === 2">背景图</el-tag>
            <el-tag v-else-if="scope.row.type === 3">LOGO</el-tag>
            <el-tag v-else-if="scope.row.type === 4">资讯轮播</el-tag>
            <el-tag v-else-if="scope.row.type === 5">头像框</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="info" label="内容">
          <template slot-scope="scope">
            <span v-if="scope.row.type === 4">{{ scope.row.info }}</span>
            <el-image class="member-image" v-else :src="scope.row.info"
              @click="showBigImg(scope.row.info)" :preview-src-list="srcList">
              <div slot="placeholder" class="loading-img">
                <i class="fa fa-spinner fa-3x fa-pulse" aria-hidden="true"></i>
              </div>
            </el-image>
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
      width="500px"
      class="input_box"
      @close="dialogClose()"
    >
      <el-form :model="form" :rules="rules" style="text-align: left" ref="form" label-width="120px">
        <el-form-item label="名称：" prop="name">
          <el-input v-model="form.name" style="width: 200px"></el-input>
        </el-form-item>
        <el-form-item label="类型：" prop="type">
          <el-select v-model="form.type" :disabled="submitType === 'edit'" style="width: 200px">
            <el-option
              v-for="item in styleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.type === 4" label="内容：" prop="info">
          <el-input type="textarea" v-model="form.info" :disabled="submitType === 'edit'" style="width: 200px"></el-input>
        </el-form-item>
        <!-- 照片上传 -->
        <el-form-item id="required-form-item" v-if="submitType === 'add' && form.type !== 4" label="照片：" prop="uploadFiles">
          <el-upload
            ref="upload-images"
            accept=".jpg,.jpeg,.png,.bmp"
            :class="{disabled: imagesUploadDisabled}"
            action=""
            :limit=1
            :file-list="uploadFiles"
            list-type="picture-card"
            :auto-upload="false"
            :on-change="handleChange"
            :on-remove="handleRemove">
            <i class="el-icon-plus"></i>
          </el-upload>
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
import Card from '@comp/Card/Card'
import CardMenuItem from '@comp/Card/CardMenuItem'
import QueryBar from '@comp/Bar/QueryBar'
import { getStyleList, addStyleList, editStyleList, delStyleList } from '@api/getData'
export default {
  data () {
    return {
      tableData: [], // 表格数据
      queryForm: {}, // 查询表单
      srcList: [], // 大图预览的图片地址
      // 分页
      currentPage: 1,
      pageSize: 10,
      totalCount: 1,
      // 对话框
      dialogVisible: false,
      titleText: '新增样式',
      submitType: 'add',
      form: {}, // 表单
      rules: { // 表单校验
        name: [{ required: true, message: '请输入样式名称', trigger: 'blur' }],
        type: [{ required: true, message: '请输选择类型', trigger: 'blur' }],
        info: [{ required: true, message: '请输入资讯内容', trigger: 'blur' }]
      },
      styleOptions: [ // 样式类型
        { value: 1, label: '屏保图' },
        { value: 2, label: '背景图' },
        { value: 3, label: 'LOGO' },
        { value: 4, label: '资讯轮播' },
        { value: 5, label: '头像框' }
      ],
      uploadFiles: [] // 上传图片列表
    }
  },
  computed: {
    imagesUploadDisabled () {
      return this.uploadFiles.length >= 1
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
      const res = await getStyleList({
        skip: (this.currentPage - 1) * this.pageSize,
        limit: this.pageSize,
        name: this.queryForm.name || '',
        type: this.queryForm.type || 0
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
      // 非文字走马灯时，必须上传照片
      if (this.submitType === 'add' && this.form.type !== 4) {
        if (!this.uploadFiles.length) {
          this.$handleErrorMessage('请添加皮肤照片')
          return
        }
      }
      // 表单校验
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          // 深拷贝，消除数据处理对当前显示表单的影响
          const submitForm = JSON.parse(JSON.stringify(this.form))
          // 绑定上传图片
          if (this.submitType === 'add' && this.form.type !== 4) {
            submitForm.image = this.uploadFiles[0].raw
          }
          // 判断表单提交类型
          const submitMethod = this.submitType === 'add' ? addStyleList : editStyleList
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
      this.titleText = '新增样式'
      this.submitType = 'add'
      this.dialogVisible = true
    },
    // 显示编辑表单
    editForm (row) {
      this.titleText = '编辑样式'
      this.submitType = 'edit'
      this.form = JSON.parse(JSON.stringify(row))
      this.dialogVisible = true
    },
    // 关闭对话框
    dialogClose () {
      this.dialogVisible = false
      this.form = {}
      this.uploadFiles = []
      if (this.$refs['upload-images']) {
        this.$refs['upload-images'].clearFiles()
      }
      this.$refs.form.clearValidate()
    },
    // 删除表单
    delForm (row) {
      this.$confirm('是否删除该样式?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const res = await delStyleList({ id: row.id })
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
    // 底库照片上传处理
    handleChange (file, fileList) {
      this.uploadFiles = fileList
    },
    handleRemove (file, fileList) {
      this.uploadFiles = fileList
    },
    // 显示图片预览信息
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
#required-form-item
  &>:first-child
    &:before
      content '*'
      color #F56C6C
      margin-right 4px
</style>
