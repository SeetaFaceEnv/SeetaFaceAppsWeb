<template>
  <div>
    <Card>
      <CardMenuItem slot="cardTitle" title="时间模板" isActive/>
      <div slot="buttonGroup">
        <el-button @click="addForm()" type="primary">添 加</el-button>
      </div>
      <!-- 查询栏 -->
      <QueryBar slot="queryBar">
        <div slot="queryBarLeft">
          模板名称：<el-input v-model="queryForm.name" clearable class="query-bar-item"></el-input>
          <el-button @click="queryGetData()">查询</el-button>
          <el-button @click="resetGetData()">重置</el-button>
        </div>
      </QueryBar>
      <!-- 表格 -->
      <el-table slot="contain" header-cell-class-name="table__header" row-class-name="table__row"
        :data="tableData" stripe height="calc(100% - 30px)">
        <!-- 展开行 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-form inline class="table-expand">
              <el-form-item label="通行日期区间：">
                {{ scope.row.valid_date[0] }} 至 {{ scope.row.valid_date[1] }}
              </el-form-item>
              <el-form-item v-for="(item, index) in scope.row.invalid_date" :key="'invalid_date' + index"
                :label="'停用日期区间' + (parseInt(index) + 1) + '：'">
                <span v-if="item.value.length > 0">
                  {{ item.value[0] }} 至 {{ item.value[1] }}
                </span>
              </el-form-item>
              <el-form-item v-for="(item, index) in scope.row.valid_time" :key="'valid_time' + index"
                :label="'通行时间区间' + (parseInt(index) + 1) + '：'">
                <span v-if="item.value.length > 0">
                  {{ item.value[0] }} 至 {{ item.value[1] }}
                </span>
              </el-form-item>
              <el-form-item label="去除周六日：">
                <span v-if="scope.row.exclude_weekend === 1">开启</span>
                <span v-else-if="scope.row.exclude_weekend === 2">关闭</span>
              </el-form-item>
              <el-form-item  v-if="scope.row.special_valid_date.length > 0" label="特定通行日期">
                <el-tag type="success" v-for="(item, index) in scope.row.special_valid_date" :key="index">
                  {{ item }}
                </el-tag>
              </el-form-item>
              <el-form-item  v-if="scope.row.special_invalid_date.length > 0" label="特定停用日期">
                <el-tag type="danger" v-for="(item, index) in scope.row.special_invalid_date" :key="index">
                  {{ item }}
                </el-tag>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="模板名称"></el-table-column>
        <el-table-column prop="description" label="描述"></el-table-column>
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
      width="700px"
      class="input_box"
      @close="dialogClose()"
    >
      <el-form :model="form" :rules="rules" style="text-align: left" ref="form" label-width="140px">
        <el-form-item label="名称：" prop="name">
          <el-input v-model="form.name" style="width: 220px"></el-input>
        </el-form-item>
        <el-form-item label="描述：" prop="description">
          <el-input v-model="form.description" type="textarea" style="width: 220px"></el-input>
        </el-form-item>
        <el-form-item label="通行日期区间：" prop="valid_date">
          <el-date-picker
            v-model="form.valid_date"
            type="daterange"
            unlink-panels
            :picker-options="pickerThisYearOptionsWithDefaultOptions"
            value-format="yyyy-MM-dd"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
        <!-- 停用日期区间 -->
        <el-divider>停用日期区间</el-divider>
        <el-form-item
          v-for="(item, index) in form.invalid_date"
          :label="'停用日期区间' + (parseInt(index) + 1) + '：'"
          :key="item.key"
          :prop="'invalid_date.' + index + '.value'"
        >
          <el-date-picker
            v-model="item.value"
            type="daterange"
            :picker-options="pickerOptions"
            unlink-panels
            value-format="yyyy-MM-dd"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
          <!-- 尾部操作按钮 -->
          <el-button class="tail-bt" type="primary" icon="el-icon-plus" circle @click="addInvalidDateItem()"
            v-if="index === 0" :disabled="form.invalid_date.length >= 3">
          </el-button>
          <el-button class="tail-bt" type="danger" icon="el-icon-minus" circle
            v-if="index !== 0" @click.prevent="removeInvalidDateItem(item)">
          </el-button>
        </el-form-item>
        <!-- 启用时间区间 -->
        <el-divider>启用时间区间</el-divider>
        <el-form-item
          v-for="(item, index) in form.valid_time"
          :label="'通行时间区间' + (parseInt(index) + 1) + '：'"
          :key="item.key"
          :prop="'valid_time.' + index + '.value'"
        >
          <el-time-picker
            v-model="item.value"
            :clearable="false"
            is-range
            value-format="HH:mm:ss"
            format="HH:mm:ss"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间">
          </el-time-picker>
          <!-- 尾部操作按钮 -->
          <el-button class="tail-bt" type="primary" icon="el-icon-plus" circle @click="addValidTimeItem()"
            v-if="index === 0" :disabled="form.valid_time.length >= 3">
          </el-button>
          <el-button class="tail-bt" type="danger" icon="el-icon-minus" circle
            v-if="index !== 0" @click.prevent="removeValidTimeItem(item)">
          </el-button>
        </el-form-item>
        <!-- 是否去除周末 -->
        <el-form-item label="去除周六日：" prop="exclude_weekend">
          <el-switch v-model="form.exclude_weekend"
            :active-value=1
            :inactive-value=2>
          </el-switch>
        </el-form-item>
        <el-divider></el-divider>
        <!-- 临时添加、删除日期 -->
        <el-form-item label="特定通行日期：" prop="special_valid_date">
          <el-tag
            size="medium"
            type="success"
            :key="tag"
            v-for="tag in form.special_valid_date"
            closable
            :disable-transitions="false"
            @close="handleSpecialValidDateItemClose(tag)">
            {{tag}}
          </el-tag>
        </el-form-item>
        <el-form-item label="添加：" prop="tempValidDate">
          <el-date-picker
            @change="addSpecialValidDateItem"
            :picker-options="pickerThisYearOptions"
            v-model="tempValidDate"
            value-format="yyyy-MM-dd"
            type="date"
            placeholder="选择日期">
          </el-date-picker>
        </el-form-item>
        <el-divider></el-divider>
        <el-form-item label="特定停用日期：" prop="special_invalid_date">
          <el-tag
            size="medium"
            type="danger"
            :key="tag"
            v-for="tag in form.special_invalid_date"
            closable
            :disable-transitions="false"
            @close="handleSpecialInvalidDateItemClose(tag)">
            {{tag}}
          </el-tag>
        </el-form-item>
        <el-form-item label="添加：" prop="tempInvalidDate">
          <el-date-picker
            @change="addSpecialInvalidDateItem"
            :picker-options="pickerThisYearOptions"
            v-model="tempInvalidDate"
            value-format="yyyy-MM-dd"
            type="date"
            placeholder="选择日期">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <p style="text-align: left">Tip：建议新年开始时更新时间模板！闰年的2月29号请注意设置！</p>
        <el-button @click="dialogClose()">取 消</el-button>
        <el-button @click="formSubmit('form')" :loading="$store.state.isSubmitting">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import moment from 'moment'
import Card from '@comp/Card/Card'
import CardMenuItem from '@comp/Card/CardMenuItem'
import QueryBar from '@comp/Bar/QueryBar'
import { removeInvalidTimeRange, removeWeekend, handleSpecialDate, mergeDateObjAndTimeRange } from '@utils/timeHandle/handleTime.js'
import { getTimeTemplateList, addTimeTemplateList, editTimeTemplateList, delTimeTemplateList } from '@api/getData'
export default {
  data () {
    let self = this
    return {
      tableData: [], // 表格数据
      queryForm: {}, // 查询表单
      // 分页
      currentPage: 1,
      pageSize: 10,
      totalCount: 1,
      // 对话框
      dialogVisible: false,
      titleText: '添加时间模板',
      submitType: 'add',
      form: { // 时间模板对象
        valid_date: [], // 启用日期区间
        invalid_date: [{ // 停用日期区间列表
          value: []
        }],
        valid_time: [{ // 启用时间区间列表
          value: ['00:00:00', '23:59:59']
        }],
        exclude_weekend: 2, // 是否去除周六日 1开启 2关闭
        special_valid_date: [], // 特定开启日期
        special_invalid_date: [] // 特定停用日期
      },
      tempValidDate: '', // 临时存储特定开启日期
      tempInvalidDate: '', // 临时存储特定停用日期
      rules: {
        name: [{ required: true, message: '请输入时间模板名称', trigger: 'blur' }],
        valid_date: [{ required: true, message: '请选择通行日期区间', trigger: 'blur' }]
      },
      pickerThisYearOptionsWithDefaultOptions: { // 设置启用时间为今年可选且带有快捷选项
        disabledDate (time) {
          return time.getTime() > moment().endOf('year').valueOf() ||
            time.getTime() < moment().startOf('year').valueOf()
        },
        shortcuts: [
          {
            text: '今年全年',
            onClick (picker) {
              const start = moment().startOf('year')._d
              const end = moment().endOf('year')._d
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '近六个月',
            onClick (picker) {
              const start = new Date()
              const endDayInYear = moment().endOf('year')
              const afterSixMonth = moment(new Date()).add('month', 6)
              const end = afterSixMonth.isSameOrBefore(endDayInYear) ? afterSixMonth._d : endDayInYear._d
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '近三个月',
            onClick (picker) {
              const start = new Date()
              const endDayInYear = moment().endOf('year')
              const afterSixMonth = moment(new Date()).add('month', 3)
              const end = afterSixMonth.isSameOrBefore(endDayInYear) ? afterSixMonth._d : endDayInYear._d
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '近一个月',
            onClick (picker) {
              const start = new Date()
              const endDayInYear = moment().endOf('year')
              const afterSixMonth = moment(new Date()).add('month', 1)
              const end = afterSixMonth.isSameOrBefore(endDayInYear) ? afterSixMonth._d : endDayInYear._d
              picker.$emit('pick', [start, end])
            }
          }
        ]
      },
      pickerThisYearOptions: { // 设置启用时间为今年可选
        disabledDate (time) {
          return time.getTime() > moment().endOf('year').valueOf() ||
            time.getTime() < moment().startOf('year').valueOf()
        }
      },
      pickerOptions: {
        disabledDate (time) { // 停用时间应设置在使用时间区间内
          return time.getTime() > moment(self.form.valid_date[1]).valueOf() ||
            time.getTime() < moment(self.form.valid_date[0]).valueOf()
        }
      },
      dateObjList: []
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
      const res = await getTimeTemplateList({
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
    // 提交表单时，计算时间模板信息
    async formSubmit (formName) {
      // 表单校验
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          // 深拷贝，消除数据处理对当前显示表单的影响
          const submitForm = JSON.parse(JSON.stringify(this.form))
          // 时间模板处理
          this.handeleTimeTemplate(submitForm)
          // 当时间模板处理后为空数组时，提示无法实现
          if (submitForm.time_slots.length === 0) {
            this.$handleErrorMessage('可用时间为空，请检查时间模板配置！')
            return
          }
          // 判断表单提交类型
          const submitMethod = this.submitType === 'add' ? addTimeTemplateList : editTimeTemplateList
          const res = await submitMethod({ ...submitForm })
          if (res.data.res === 0) {
            this.$handleSuccessMessage()
            this.dialogClose()
            this.getData()
          }
        }
      })
    },
    // 表单提交前，处理时间模板
    handeleTimeTemplate (submitForm) {
      let dateObjList = []
      // 启用日期中去除停用时间 (停用日期区间存在时)
      dateObjList = removeInvalidTimeRange(submitForm.valid_date, submitForm.invalid_date)
      // 当开启去除周末时，重新计算具体开启日期
      if (submitForm.exclude_weekend === 1) {
        dateObjList = removeWeekend(dateObjList)
      }
      // 处理特定通行日期
      dateObjList = handleSpecialDate(dateObjList, submitForm.special_valid_date, submitForm.special_invalid_date)
      // 合并日期对象及时间区间
      let finalTimeObjList = mergeDateObjAndTimeRange(dateObjList, submitForm.valid_time)
      // 序列化对象传递
      this.$set(submitForm, 'time_slots', finalTimeObjList)
    },
    // 显示新增表单
    addForm () {
      this.titleText = '新增通行时间模板'
      this.submitType = 'add'
      this.dialogVisible = true
    },
    // 显示编辑表单
    editForm (row) {
      this.titleText = '编辑通行时间模板'
      this.submitType = 'edit'
      this.form = JSON.parse(JSON.stringify(row))
      this.dialogVisible = true
    },
    // 删除表单
    delForm (row) {
      this.$confirm('是否删除该通行时间模板?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const res = await delTimeTemplateList({ id: row.id })
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
    // 隐藏对话框，初始化表单、校验信息
    dialogClose () {
      this.dialogVisible = false
      this.form = {
        valid_date: [],
        invalid_date: [{
          value: []
        }],
        valid_time: [{
          value: ['00:00:00', '23:59:59']
        }],
        exclude_weekend: 2,
        special_valid_date: [],
        special_invalid_date: []
      }
      this.$refs.form.clearValidate()
    },
    // 动态增加停用日期区间
    addInvalidDateItem () {
      this.form.invalid_date.push(
        {
          value: [],
          key: Date.now()
        }
      )
    },
    // 动态减少停用日期区间
    removeInvalidDateItem (item) {
      let index = this.form.invalid_date.indexOf(item)
      if (index !== -1) {
        this.form.invalid_date.splice(index, 1)
      }
    },
    // 动态增加启用时间区间
    addValidTimeItem () {
      this.form.valid_time.push(
        {
          value: ['00:00:00', '23:59:59'],
          key: Date.now()
        }
      )
    },
    // 动态减少启用时间区间
    removeValidTimeItem (item) {
      let index = this.form.valid_time.indexOf(item)
      if (index !== -1) {
        this.form.valid_time.splice(index, 1)
      }
    },
    // 增加特定开启日期
    addSpecialValidDateItem (val) {
      if (this.isSelectedDate(val)) { // 未添加过则加入
        this.form.special_valid_date.push(val)
        this.tempValidDate = ''
      }
    },
    // 删除特定开启日期
    handleSpecialValidDateItemClose (tag) {
      this.form.special_valid_date.splice(this.form.special_valid_date.indexOf(tag), 1)
    },
    // 增加特定停用日期
    addSpecialInvalidDateItem (val) {
      if (this.isSelectedDate(val)) { // 未添加过则加入
        this.form.special_invalid_date.push(val)
        this.tempInvalidDate = ''
      }
    },
    // 删除特定停用日期
    handleSpecialInvalidDateItemClose (tag) {
      this.form.special_invalid_date.splice(this.form.special_invalid_date.indexOf(tag), 1)
    },
    // 判断选择日期是否已经选择过
    isSelectedDate (val) {
      // 判断日期是否已存在
      if (this.form.special_valid_date.indexOf(val) !== -1) {
        this.$handleWarningMessage(val + ' 已被设置为特定通行日期', 3000)
        this.tempValidDate = ''
        this.tempInvalidDate = ''
        return false // 存在  返回false 不能添加到数组
      } else if (this.form.special_invalid_date.indexOf(val) !== -1) {
        this.$handleWarningMessage(val + ' 已被设置为特定停用日期', 3000)
        this.tempValidDate = ''
        this.tempInvalidDate = ''
        return false // 存在  返回false 不能添加到数组
      } else {
        return true // 不存在  返回true 可以添加到数组
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
    width 100%
.tail-bt
  margin-left 10px
</style>
