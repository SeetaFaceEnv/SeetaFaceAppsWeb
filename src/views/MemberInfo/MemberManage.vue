<template>
  <div>
    <Card>
      <span slot="cardTitle">人员管理</span>
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
        <el-table-column v-for="(item, index) in fieldList" :key="index" :label="item.name" show-overflow-tooltip>
          <template slot-scope="scope">
            {{ scope.row.attributes[item.id] }}
          </template>
        </el-table-column>
        <el-table-column label="照片" >
          <template slot-scope="scope">
            <el-image class="member-image" v-if="scope.row.images[0]" :src="scope.row.images[0].image_url"
              @click="showBigImg(scope.row)" :preview-src-list="srcList"/>
          </template>
        </el-table-column>
        <!-- 所属设备、设备组 -->
        <el-table-column label="所属设备" >
          <template slot-scope="scope">
            <el-tag v-for="(item, index) in scope.row.device_names" :key="index">
              {{item}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="所属设备组" >
          <template slot-scope="scope">
            <el-tag v-for="(item, index) in scope.row.group_names" :key="index">
              {{item}}
            </el-tag>
          </template>
        </el-table-column>
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
      width="650px"
      class="input_box"
      @close="dialogClose()"
    >
      <el-form :model="form" :rules="rules" style="text-align: left" ref="form" label-width="120px">
        <el-form-item label="设备：" prop="device_ids">
          <el-select v-model="form.device_ids" style="width: 200px" multiple>
            <el-option
              v-for="item in deviceList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="设备组：" prop="group_ids">
          <el-select v-model="form.group_ids" style="width: 200px" multiple>
            <el-option
              v-for="item in deviceGroupList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- v-for 内层对象获取外层参数时，可使用[]获取 -->
        <el-form-item v-for="(item, index) in fieldList" :key="index" :label="item.name + '：'" prop="index">
          <el-input v-model="form.attributes[item.id]" style="width: 200px"></el-input>
        </el-form-item>
        <!-- 照片上传 -->
        <el-form-item label="照片：" prop="uploadFiles">
          <el-upload
            ref="upload-images"
            accept=".jpg,.png,.JPG,.PNG"
            :class="{disabled: imagesUploadDisabled}"
            action=""
            :limit="maxUploadImageNumber"
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
        <el-button @click="formSubmit('form')" :loading=$store.state.isSubmitting>确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import Card from '@/components/Card/Card'
// import QueryBar from '@/components/Bar/QueryBar'
import { getMemberList, addMemberList, editMemberList, delMemberList, getFieldList, getDeviceList, getDeviceGroupList } from '@/api/getData'
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
      titleText: '新增人员',
      submitType: 'add',
      form: { // 表单
        attributes: {} // 设备组 参数
      },
      rules: { // 表单校验
        name: [{ required: true, message: '请输入人员名称', trigger: 'blur' }]
      },
      fieldList: [], // 人员字段列表
      deviceList: [], // 设备列表
      deviceGroupList: [], // 设备组列表
      uploadFiles: [], // 上传底库图片列表
      tempUploadFiles: [], // 编辑时保存编辑前底库图片列表
      maxUploadImageNumber: 1, // 最大上传底库图片数量
      srcList: [] // 大图预览的图片地址
    }
  },
  computed: {
    imagesUploadDisabled () {
      return this.uploadFiles.length >= this.maxUploadImageNumber
    }
  },
  components: {
    Card
    // QueryBar
  },
  mounted () {
    this.getFieldList()
    this.getData()
  },
  methods: {
    // 获取表格数据
    async getData () {
      this.tableData = []
      const res = await getMemberList({
        start_index: (this.currentPage - 1) * this.pageSize,
        get_count: this.pageSize
      })
      if (res.data.result === 0) {
        this.tableData = res.data.members
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
          this.$set(submitForm, 'attributes', JSON.stringify(submitForm.attributes))
          // 序列化数组传递
          this.$set(submitForm, 'device_ids', JSON.stringify(submitForm.device_ids))
          this.$set(submitForm, 'group_ids', JSON.stringify(submitForm.group_ids))
          // 判断表单提交类型
          if (this.submitType === 'add') {
            this.addSubmit(submitForm)
          } else if (this.submitType === 'edit') {
            this.editSubmit(submitForm)
          }
        }
      })
    },
    // 提交添加
    async addSubmit (submitForm) {
      // 添加上传照片至表单
      for (let key in this.uploadFiles) {
        this.$set(submitForm, 'image' + (Number(key) + 1), this.uploadFiles[key].raw)
      }
      const res = await addMemberList({ ...submitForm })
      if (res.data.result === 0) {
        this.$handleSuccessMessage()
      }
      // 因逻辑需要，当传入非人脸照片时，发生错误需关闭编辑框
      this.dialogClose()
      this.getData()
    },
    // 提交编辑
    async editSubmit (submitForm) {
      // 循环旧的图片列表查找删除的图片
      let delImageIds = []
      for (let key in this.tempUploadFiles) {
        if (this.uploadFiles.indexOf(this.tempUploadFiles[key]) === -1) {
          delImageIds.push(this.tempUploadFiles[key].id)
        }
      }
      this.$set(submitForm, 'del_image_ids', JSON.stringify(delImageIds))
      // 循环新的图片列表查找新增的图片
      let addImages = []
      for (let key in this.uploadFiles) {
        if (this.tempUploadFiles.indexOf(this.uploadFiles[key]) === -1) {
          addImages.push(this.uploadFiles[key])
        }
      }
      for (let key in addImages) {
        this.$set(submitForm, 'image' + (Number(key) + 1), addImages[key].raw)
      }
      // 清除不需要的属性
      if (submitForm.images) {
        delete submitForm.images
      }
      const res = await editMemberList({ ...submitForm })
      if (res.data.result === 0) {
        this.$handleSuccessMessage()
        this.dialogClose()
        this.getData()
      }
    },
    // 显示新增表单
    addForm () {
      this.titleText = '新增人员'
      this.submitType = 'add'
      this.findDeviceList()
      this.findDeviceGroupList()
      this.dialogVisible = true
    },
    // 显示编辑表单
    editForm (row) {
      this.titleText = '编辑人员'
      this.submitType = 'edit'
      this.findDeviceList()
      this.findDeviceGroupList()
      this.form = JSON.parse(JSON.stringify(row))
      this.handleEditImageShow(row)
      this.dialogVisible = true
    },
    // 编辑时显示图片处理
    handleEditImageShow (row) {
      // 如果存在地库照片，进行展示
      if (this.form.images) {
        this.tempUploadFiles = []
        for (let item of row.images) {
          let file = { id: '', url: '' }
          file.id = item.id
          file.url = item.image_url
          this.tempUploadFiles.push(file)
        }
        this.uploadFiles = this.tempUploadFiles
      }
    },
    // 删除表单
    delForm (row) {
      this.$confirm('是否删除该人员?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const res = await delMemberList({ id: row.id })
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
      this.form = { attributes: {} }
      this.uploadFiles = []
      this.$refs['upload-images'].clearFiles()
      this.$refs.form.clearValidate()
    },
    // 查找人员属性
    async getFieldList () {
      const res = await getFieldList()
      if (res.data.result === 0) {
        this.fieldList = res.data.fields
      }
    },
    // 查找所有设备
    async findDeviceList () {
      const res = await getDeviceList()
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
    // 底库照片上传处理
    handleChange (file, fileList) {
      this.uploadFiles = fileList
    },
    handleRemove (file, fileList) {
      this.uploadFiles = fileList
    },
    // 显示底库预览信息
    showBigImg (row) {
      this.srcList = []
      for (let item of row.images) {
        this.srcList.push(item.image_url)
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
.member-image
  width 100px
  height 100px
</style>
