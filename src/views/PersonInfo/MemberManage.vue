<template>
  <div>
    <Card>
      <CardMenuItem slot="cardTitle" title="人员管理" isActive/>
      <CardMenuItem slot="cardTitle" title="照片墙" :index="{ name: 'photo-wall'}"/>
      <div slot="buttonGroup">
        <el-button @click="delMemberListForm()" type="danger">批量删除</el-button>
        <el-button @click="addForm()" type="primary">添加</el-button>
      </div>
      <!-- 查询栏 -->
      <QueryBar slot="queryBar">
        <div slot="queryBarLeft" style="float: left;text-align: left">
          人员ID：<el-input v-model="queryForm.personId" clearable class="query-bar-item"></el-input>
          IC卡：<el-input v-model="queryForm.icCard" clearable class="query-bar-item"></el-input>
          身份证：<el-input v-model="queryForm.idCard" clearable class="query-bar-item"></el-input>
          <!-- 隐藏 窗口缩小时 控制换行 -->
          <div class="handle-line" style="height: 10px;width: 100%;display: none"></div>
          微信ID：<el-input v-model="queryForm.wechatUserId" clearable class="query-bar-item"></el-input>
          <el-button @click="queryGetData()">查询</el-button>
          <el-button @click="resetGetData()">重置</el-button>
        </div>
      </QueryBar>
      <!-- 表格 -->
      <el-table slot="contain" header-cell-class-name="table__header" row-class-name="table__row"
        :data="tableData" stripe height="calc(100% - 30px)" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50"></el-table-column>
        <!-- 展开行 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-form inline class="table-expand">
              <!-- TODO 后续优化 -->
              人员照片：
              <el-form-item v-for="(item, index) in scope.row.images" :key="index">
                <el-image class="member-image" :src="item.image_url">
                  <div slot="placeholder" class="loading-img">
                    <i class="fa fa-spinner fa-3x fa-pulse" aria-hidden="true"></i>
                  </div>
                </el-image>
                <i @click="delImageForm(scope.row.person_id, item.image_id)" class="image-bt-del el-icon-circle-close"></i>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column label="人员ID" prop="person_id"></el-table-column>
        <el-table-column label="IC卡" prop="ic_card"></el-table-column>
        <el-table-column label="身份证" prop="id_card"></el-table-column>
        <el-table-column label="微信ID" prop="wechat_user_id"></el-table-column>
        <el-table-column label="二维码" prop="qr_code"></el-table-column>
        <el-table-column label="显示内容" prop="subtitle_pattern">
          <template slot-scope="scope">
            <p v-for="(item, index) in scope.row.subtitle_pattern" :key="index">
              {{ item }}
            </p>
          </template>
        </el-table-column>
        <el-table-column label="二次鉴权" prop="auth_switch">
          <template slot-scope="scope">
            <span v-if="scope.row.auth_switch === 1">开启</span>
            <span v-else-if="scope.row.auth_switch === 2">关闭</span>
          </template>
        </el-table-column>
        <el-table-column label="设备组" width="200" prop="group_ids">
          <template slot-scope="scope">
            <el-tag type="info" v-for="(item, index) in scope.row.group_ids" :key="index">
              {{ item }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="封面照" width="120">
          <template slot-scope="scope">
            <el-image class="member-image" v-if="scope.row.portrait_image" :src="scope.row.portrait_image"
              @click="showMaskImg(scope.row)" :preview-src-list="srcList">
              <div slot="placeholder" class="loading-img">
                <i class="fa fa-spinner fa-3x fa-pulse" aria-hidden="true"></i>
              </div>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column label="底库照片" width="120">
          <template slot-scope="scope">
            <el-image class="member-image" v-if="scope.row.images && scope.row.images.length > 0" :src="scope.row.images[0].image_url"
              @click="showBigImg(scope.row)" :preview-src-list="srcList">
              <div slot="placeholder" class="loading-img">
                <i class="fa fa-spinner fa-3x fa-pulse" aria-hidden="true"></i>
              </div>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column label="开始时间" prop="date_begin" width="150">
          <template slot-scope="scope">
            <span v-if="scope.row.date_begin">
              <i class="el-icon-time"></i>
              {{ transformToDateTime(scope.row.date_begin) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="结束时间" prop="date_end" width="150">
          <template slot-scope="scope">
            <span v-if="scope.row.date_end">
              <i class="el-icon-time"></i>
              {{ transformToDateTime(scope.row.date_end) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="320">
          <template slot-scope="scope">
            <span class="span__bt" @click="setAvatarForm(scope.row)">封面照</span>
            <el-divider direction="vertical"></el-divider>
            <span v-if="scope.row.images.length < 3">
              <span class="span__bt" @click="addImageForm(scope.row)">添加照片</span>
              <el-divider direction="vertical"></el-divider>
            </span>
            <span v-if="scope.row.qr_code">
              <span class="span__bt" @click="qrCodeForm(scope.row)">二维码</span>
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

    <!-- 对话框 -->
    <el-dialog
      :title="titleText"
      :visible.sync="dialogVisible"
      width="650px"
      class="input_box"
      @close="dialogClose()"
    >
      <el-form :model="form" :rules="rules" style="text-align: left" ref="form" label-width="120px">
        <!-- 新增、编辑 人员信息 -->
        <div v-if="submitType === 'addPerson' || submitType === 'editPerson'">
          <el-form-item
            v-for="(item, index) in form.subtitle_pattern"
            :label="'展示内容' + (parseInt(index) + 1) + '：'"
            :key="index"
          >
            <el-input v-model="form.subtitle_pattern[index]" style="width: 200px"></el-input>
            <!-- 尾部操作按钮 -->
            <el-button class="tail-bt" type="primary" icon="el-icon-plus" circle @click="addSubtitlePattern()"
              v-if="index === 0" :disabled="form.subtitle_pattern.length >= 4">
            </el-button>
            <el-button class="tail-bt" type="danger" icon="el-icon-minus" circle
              v-if="index !== 0" @click.prevent="removeSubtitlePattern(item)">
            </el-button>
          </el-form-item>
          <el-form-item label="设备组：" prop="group_ids">
            <el-select v-model="form.group_ids" style="width: 200px" multiple filterable clearable>
              <el-option
                v-for="item in groupInfoList"
                :key="item.group_id"
                :label="item.group_id"
                :value="item.group_id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="人员ID：" prop="person_id">
            <el-input v-model="form.person_id" :disabled="submitType === 'editPerson'" style="width: 200px"></el-input>
          </el-form-item>
          <el-form-item label="IC卡：" prop="ic_card">
            <el-input v-model="form.ic_card" style="width: 200px"></el-input>
          </el-form-item>
          <el-form-item label="身份证：" prop="id_card">
            <el-input v-model="form.id_card" style="width: 200px"></el-input>
          </el-form-item>
          <el-form-item label="微信ID：" prop="wechat_user_id">
            <el-input v-model="form.wechat_user_id" style="width: 200px"></el-input>
          </el-form-item>
          <el-form-item label="二维码：" prop="qr_code">
            <el-input v-model="form.qr_code" style="width: 200px"></el-input>
          </el-form-item>
          <el-form-item label="二次鉴权：" prop="auth_switch">
            <el-select v-model="form.auth_switch" style="width: 200px">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="通行时限：" prop="date_range">
            <el-date-picker
              v-model="form.date_range"
              type="datetimerange"
              format="yyyy-MM-dd HH:mm"
              :default-time="['00:00:00', '23:59:59']"
              unlink-panels
              value-format="timestamp"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期">
            </el-date-picker>
          </el-form-item>
        </div>
        <!-- 照片上传 -->
        <div v-if="submitType === 'setAvatar' || submitType === 'addImage'">
          <el-form-item id="required-form-item" :label="submitType === 'setAvatar' ? '封面照：' : '人员照片：'" prop="uploadFiles">
            <el-upload
              ref="upload-images"
              accept=".jpg,.jpeg,.png,.bmp"
              :class="{disabled: uploadFiles.length >= maxUploadImageNumber }"
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
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogClose()">取 消</el-button>
        <el-button @click="formSubmit('form')" :loading="$store.state.isSubmitting">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 抽屉 -->
    <el-drawer
      :visible.sync="drawerVisible"
      direction="btt"
      size="400px"
      :before-close="drawerClose">
      <h1 slot="title">二维码展示</h1>
      <div style="text-align: center">
        <el-image :src="qrCodeObj.url">
          <div slot="placeholder" class="loading-img">
            <i class="fa fa-spinner fa-3x fa-pulse" aria-hidden="true"></i>
          </div>
        </el-image>
        <i @click="qrCodeDownload()" class="fa fa-download fa-3x" aria-hidden="true"></i>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import moment from 'moment'
import Card from '@comp/Card/Card'
import CardMenuItem from '@comp/Card/CardMenuItem'
import { download } from '@utils/fileHandle/download.js'
import QueryBar from '@comp/Bar/QueryBar'
import {
  getMemberList, addMemberList, editMemberList, delMemberList,
  addMemberImage, delMemberImage, updateAvatar,
  getGroupList, getQrCode
} from '@api/getData'
// delMemberImage
export default {
  data () {
    return {
      tableData: [], // 表格数据
      queryForm: {}, // 查询表单
      groupInfoList: [], // 所有设备组
      srcList: [], // 大图预览的图片地址
      selectMemberList: [], // 勾选人员（批量删除时使用）
      // 分页
      currentPage: 1,
      pageSize: 10,
      totalCount: 1,
      // 对话框
      dialogVisible: false,
      drawerVisible: false, // 抽屉
      titleText: '新增人员',
      submitType: 'addPerson',
      form: { // 表单
        attributes: {}, // 人员属性
        subtitle_pattern: [''] // 展示字段
      },
      rules: { // 表单校验
        person_id: [{ required: true, message: '请输入人员ID', trigger: 'blur' }]
      },
      options: [
        { value: 1, label: '开启' },
        { value: 2, label: '关闭' }
      ],
      uploadFiles: [], // 上传图片列表
      maxUploadImageNumber: 1, // 最大上传底库图片数量
      qrCodeObj: {}
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
      const res = await getMemberList({
        person_id: this.queryForm.personId,
        ic_card: this.queryForm.icCard,
        id_card: this.queryForm.idCard,
        wechat_user_id: this.queryForm.wechatUserId,
        skip: (this.currentPage - 1) * this.pageSize,
        limit: this.pageSize
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
      // 设置封面照、人员底库照片 必须上传照片
      if (this.submitType === 'setAvatar' || this.submitType === 'addImage') {
        if (!this.uploadFiles.length) {
          this.$handleErrorMessage('请先添加照片')
          return
        }
      }
      // 表单校验
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          // 深拷贝，消除数据处理对当前显示表单的影响
          const submitForm = JSON.parse(JSON.stringify(this.form))
          // 判断表单提交类型
          if (this.submitType === 'addPerson' || this.submitType === 'editPerson') {
            this.personSubmit(submitForm)
          } else if (this.submitType === 'setAvatar' || this.submitType === 'addImage') {
            this.imageSubmit(submitForm)
          }
        }
      })
    },
    // 提交人员信息
    async personSubmit (submitForm) {
      if (submitForm.date_range) {
        submitForm.date_begin = Math.floor(submitForm.date_range[0] / 1000)
        submitForm.date_end = Math.floor(submitForm.date_range[1] / 1000)
      } else {
        submitForm.date_begin = 0
        submitForm.date_end = 0
      }
      delete submitForm.date_range // 清除多余属性
      const submitMethod = this.submitType === 'addPerson' ? addMemberList : editMemberList
      const res = await submitMethod({ ...submitForm })
      if (res.data.res === 0) {
        this.$handleSuccessMessage()
        this.dialogClose()
        this.getData()
      }
    },
    // 提交照片信息
    async imageSubmit (submitForm) {
      const submitMethod = this.submitType === 'setAvatar' ? updateAvatar : addMemberImage
      const res = await submitMethod({
        person_id: submitForm.person_id,
        image: this.uploadFiles[0].raw
      })
      if (res.data.res === 0) {
        this.$handleSuccessMessage()
        this.dialogClose()
        this.getData()
      }
    },
    // 显示新增表单
    addForm () {
      this.titleText = '新增人员'
      this.submitType = 'addPerson'
      this.findGroupInfoList()
      this.$set(this.form, 'auth_switch', 2)
      this.dialogVisible = true
    },
    // 显示编辑表单
    editForm (row) {
      this.titleText = '编辑人员'
      this.submitType = 'editPerson'
      this.form = JSON.parse(JSON.stringify(row))
      if (this.form.date_begin && this.form.date_end) {
        let temp = []
        temp.push(this.form.date_begin * 1000)
        temp.push(this.form.date_end * 1000)
        this.$set(this.form, 'date_range', temp) // 防止时间组件不能及时更新
      }
      this.findGroupInfoList()
      // this.handleEditImageShow(row)
      this.dialogVisible = true
    },
    // 显示设置封面照
    setAvatarForm (row) {
      this.titleText = '设置封面照'
      this.submitType = 'setAvatar'
      this.form = JSON.parse(JSON.stringify(row))
      this.dialogVisible = true
    },
    // 显示设置封面照
    addImageForm (row) {
      this.titleText = '添加人员照片'
      this.submitType = 'addImage'
      this.form = JSON.parse(JSON.stringify(row))
      this.dialogVisible = true
    },
    // 删除表单
    delForm (row) {
      this.$confirm('是否删除该人员?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        let delPersonIds = []
        delPersonIds.push(row.person_id)
        const res = await delMemberList({ person_ids: delPersonIds })
        if (res.data.res === 0) {
          // 判断是否为该页最后一条数据且当前页数不为首页，则获取上一页数据
          if (this.tableData.length === 1 && this.currentPage !== 1) {
            this.currentPage = --this.currentPage
          }
          this.$handleSuccessMessage()
          this.getData()
        }
      }).catch(() => {})
    },
    // 批量删除
    delMemberListForm () {
      // 是否选择设备
      let delPersonIds = []
      if (this.selectMemberList.length === 0) {
        this.$handleWarningMessage('请先选择需要删除的人员', 2000)
        return
      } else {
        for (let item of this.selectMemberList) {
          delPersonIds.push(item.person_id)
        }
      }
      this.$confirm('是否批量删除人员?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const res = await delMemberList({ person_ids: delPersonIds })
        if (res.data.res === 0) {
          // 判断是否为该页最后一条数据且当前页数不为首页，则获取上一页数据
          if (this.tableData.length === 1 && this.currentPage !== 1) {
            this.currentPage = --this.currentPage
          }
          this.$handleSuccessMessage()
          this.getData()
        }
      }).catch(() => {})
    },
    // 删除底库照片
    delImageForm (personId, imageId) {
      this.$confirm('是否删除该人员?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const res = await delMemberImage({
          person_id: personId,
          image_id: imageId
        })
        if (res.data.res === 0) {
          // 判断是否为该页最后一条数据且当前页数不为首页，则获取上一页数据
          if (this.tableData.length === 1 && this.currentPage !== 1) {
            this.currentPage = --this.currentPage
          }
          this.$handleSuccessMessage()
          this.getData()
        }
      }).catch(() => {})
    },
    // 关闭对话框
    dialogClose () {
      this.dialogVisible = false
      this.form = {
        attributes: {},
        subtitle_pattern: [''] // 展示字段
      }
      this.uploadFiles = []
      if (this.$refs['upload-images']) {
        this.$refs['upload-images'].clearFiles()
      }
      this.$refs.form.clearValidate()
    },
    // 照片上传处理
    handleChange (file, fileList) {
      this.uploadFiles = fileList
    },
    handleRemove (file, fileList) {
      this.uploadFiles = fileList
    },
    // 显示封面照预览信息
    showMaskImg (row) {
      this.srcList = []
      this.$nextTick(() => {
        this.srcList.push(row.portrait_image)
      })
    },
    // 显示底库预览信息
    showBigImg (row) {
      this.srcList = []
      this.$nextTick(() => {
        for (let item of row.images) {
          this.srcList.push(item.image_url)
        }
      })
    },
    // 生成二维码
    async qrCodeForm (row) {
      const res = await getQrCode({ qr_code: row.qr_code })
      if (res.headers['content-type'] === 'image/png') {
        this.qrCodeObj.data = res.data
        this.qrCodeObj.url = window.URL.createObjectURL(res.data)
        this.drawerVisible = true
      }
    },
    // 二维码下载
    qrCodeDownload () {
      download(this.qrCodeObj.data, '二维码.png')
    },
    // 关闭抽屉
    drawerClose () {
      this.drawerVisible = false
      this.qrCodeObj = {}
    },
    // 查找所有地点
    async findGroupInfoList () {
      const res = await getGroupList({
        skip: 0,
        limit: 10000
      })
      if (res.data.res === 0) {
        this.groupInfoList = res.data.records
      }
    },
    // 时间戳转换为标准时间
    transformToDateTime (val) {
      return moment(val * 1000).format('YYYY-MM-DD HH:mm')
    },
    // 动态添加展示内容
    addSubtitlePattern () {
      this.form.subtitle_pattern.push('')
    },
    // 动态减少展示内容
    removeSubtitlePattern (item) {
      const index = this.form.subtitle_pattern.indexOf(item)
      if (index !== -1) {
        this.form.subtitle_pattern.splice(index, 1)
      }
    },
    // 勾选变更
    handleSelectionChange (arry) {
      this.selectMemberList = arry
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
@media screen and (max-width: 1770px) {
  // 媒体查询 宽度小于1950px时 queryBar展示为两行 优化展示效果
  .handle-line { // 显示分行box
    display block !important
  }
  .el-card .el-table--fit { // 减少 card 内容区 高度
    height calc(100% - 30px - 44px) !important
  }
}
.tail-bt
  margin-left 10px
.image-bt-del
  position absolute
  cursor pointer
  color red
  font-size 18px
  top 2px
  right 2px
.table-expand
  >>> label
    font-weight 600
#required-form-item
  &>:first-child
    &:before
      content '*'
      color #F56C6C
      margin-right 4px
</style>
