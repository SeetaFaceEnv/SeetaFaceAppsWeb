<template>
  <div>
    <Card>
      <CardMenuItem slot="cardTitle" title="人员管理" :index="{ name: 'member-manage'}"/>
      <CardMenuItem slot="cardTitle" title="照片墙" isActive/>
      <!-- <div slot="buttonGroup">
        <el-button @click="addForm()" type="primary">添加</el-button>
      </div> -->
      <!-- 照片墙 -->
      <div slot="contain" class="photo-wall">
        <div class="photo-box" v-for="(item, index) in tableData" :key="index">
          <el-image @click="dialogShow(item)" class="photo-wall-image" v-for="image in item.images" :key="image.image_id" :src="image.image_url">
            <div slot="placeholder" class="loading-img">
              <i class="fa fa-spinner fa-3x fa-pulse" aria-hidden="true"></i>
            </div>
          </el-image>
        </div>
      </div>
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
        <el-form-item label="人员ID：" prop="person_id">
          <p>{{ form.person_id }}</p>
        </el-form-item>
        <el-form-item label="IC卡：" prop="ic_card">
          <p>{{ form.ic_card }}</p>
        </el-form-item>
        <el-form-item label="身份证：" prop="id_card">
          <p>{{ form.id_card }}</p>
        </el-form-item>
        <el-form-item label="微信ID：" prop="wechat_user_id">
          <p>{{ form.wechat_user_id }}</p>
        </el-form-item>
        <el-form-item label="二维码：" prop="qr_code">
          <p>{{ form.qr_code }}</p>
        </el-form-item>
        <el-form-item label="显示内容：" prop="subtitle_pattern">
          <p v-for="(item, index) in form.subtitle_pattern" :key="index">
            {{ item }}
          </p>
        </el-form-item>
        <el-form-item label="封面照：">
          <el-image class="member-image" :src="form.portrait_image">
            <div slot="placeholder" class="loading-img">
              <i class="fa fa-spinner fa-3x fa-pulse" aria-hidden="true"></i>
            </div>
          </el-image>
        </el-form-item>
        <el-form-item label="照片：">
          <el-image class="member-image" v-for="(item, index) in form.images" :key="index" :src="item.image_url">
            <div slot="placeholder" class="loading-img">
              <i class="fa fa-spinner fa-3x fa-pulse" aria-hidden="true"></i>
            </div>
          </el-image>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogClose()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import Card from '@comp/Card/Card'
import CardMenuItem from '@comp/Card/CardMenuItem'
import { getMemberList } from '@api/getData'
export default {
  data () {
    return {
      tableData: [], // 表格数据
      fieldList: [], // 人员字段列表
      // 分页
      currentPage: 1,
      pageSize: 10,
      totalCount: 1,
      // 对话框
      dialogVisible: false,
      titleText: '详细信息',
      form: { // 表单
        attributes: {} // 人员属性
      },
      rules: {} // 表单校验
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
      const res = await getMemberList({
        skip: (this.currentPage - 1) * this.pageSize,
        limit: this.pageSize
      })
      if (res.data.res === 0) {
        this.tableData = res.data.records
        this.totalCount = res.data.total
      }
    },
    // 显示编辑表单
    dialogShow (item) {
      this.form = JSON.parse(JSON.stringify(item))
      this.dialogVisible = true
    },
    // 关闭对话框
    dialogClose () {
      this.dialogVisible = false
      this.form = {
        attributes: {}
      }
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
.photo-wall
  // border 1px solid red
  height 100%
  width 100%
  overflow-y scroll
  .photo-box
    display inline-block
    float left
    .photo-wall-image
      width 180px
      height 220px
</style>
