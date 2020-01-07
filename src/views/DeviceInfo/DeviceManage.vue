<template>
  <div>
    <Card>
      <CardMenuItem slot="cardTitle" title="设备管理" isActive/>
      <div slot="buttonGroup">
        <el-button @click="updateForm()" type="danger">批量升级</el-button>
        <el-button @click="addForm()" type="primary">添加</el-button>
      </div>
      <!-- 查询栏 -->
      <QueryBar slot="queryBar">
        <div slot="queryBarLeft" style="float: left;text-align: left">
          设备组：
          <el-select v-model="queryForm.groupId" style="width: 150px" filterable clearable class="query-bar-item">
            <el-option
              v-for="item in groupInfoList"
              :key="item.group_id"
              :label="item.group_id"
              :value="item.group_id"
            ></el-option>
          </el-select>
          设备编码：<el-input v-model="queryForm.deviceCode" clearable class="query-bar-item"></el-input>
          <!-- 隐藏 窗口缩小时 控制换行 -->
          <div class="handle-line-one" style="height: 10px;width: 100%;display: none"></div>
          IP：<el-input v-model="queryForm.ip" clearable class="query-bar-item"></el-input>
          设备状态：
          <el-select v-model="queryForm.alive" clearable class="query-bar-item">
            <el-option
              v-for="item in isAliveOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
          <el-button @click="queryGetData()">查询</el-button>
          <el-button @click="resetGetData()">重置</el-button>
        </div>
      </QueryBar>
      <!-- 表格 -->
      <el-table ref="multipleTable" slot="contain" header-cell-class-name="table__header" row-class-name="table__row"
        :data="tableData" stripe height="calc(100% - 30px)" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50"></el-table-column>
        <el-table-column prop="device_code" label="设备编码"></el-table-column>
        <el-table-column prop="group_id" label="设备组"></el-table-column>
        <el-table-column prop="type" label="类型">
          <template slot-scope="scope">
            <span v-if="scope.row.type === 1">人证一体机</span>
            <span v-else-if="scope.row.type === 2">安卓设备</span>
            <span v-else-if="scope.row.type === 3">智能网关</span>
            <span v-else-if="scope.row.type === 4">PC智能网关</span>
            <span v-else-if="scope.row.type === 5">注册机</span>
            <span v-else-if="scope.row.type === 6">识别服务器</span>
            <span v-else-if="scope.row.type === 7">网络继电器</span>
          </template>
        </el-table-column>
        <el-table-column prop="ip" label="IP"></el-table-column>
        <el-table-column prop="apk_version" label="APK版本"></el-table-column>
        <el-table-column prop="device_version" label="设备版本"></el-table-column>
        <el-table-column prop="alive" label="设备状态">
          <template slot-scope="scope">
            <el-tooltip v-if="scope.row.alive === 1" content="在线" placement="right" :open-delay=200>
              <img src="@assets/images/normal_light.png">
            </el-tooltip>
            <el-tooltip v-else content="离线" placement="right" :open-delay=200>
              <img src="@assets/images/abnormal_light.png">
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="camera_status" label="摄像头状态">
          <template slot-scope="scope">
            <span v-if="scope.row.type === 1 || scope.row.type === 2">
              <i v-if="scope.row.camera_status" class="fa fa-check fa-lg" aria-hidden="true" style="color: #1A8D68"></i>
              <i v-else class="fa fa-times fa-lg" aria-hidden="true" style="color: #D83415"></i>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="display_status" label="应用状态">
          <template slot-scope="scope">
            <span v-if="scope.row.type === 1 || scope.row.type === 2">
              <i v-if="scope.row.display_status" class="fa fa-check fa-lg" aria-hidden="true" style="color: #1A8D68"></i>
              <i v-else class="fa fa-times fa-lg" aria-hidden="true" style="color: #D83415"></i>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="流媒体-开门" width="240px">
          <template slot-scope="scope" v-if="scope.row.type === 1 || scope.row.type === 2 || scope.row.type === 3 || scope.row.type === 4">
            <div v-for="(item, index) in scope.row.camera_params" :key="index">
              <el-tag
                class="stream-tag"
                :closable="scope.row.type === 3 || scope.row.type === 4"
                :key="item.id"
                @click="editStreamForm(scope.row.device_code, scope.row.type, item)"
                @close="delStreamForm(scope.row.device_code, item)"
              >
                {{ item.name }}
              </el-tag>
              <i type="success" class="fa fa-angle-double-right" aria-hidden="true"></i>
              <span class="span__bt" @click="openDoorForm(scope.row.device_code, item)">
                开门
              </span>
              <i type="success" class="fa fa-angle-double-right" aria-hidden="true"></i>
              <span class="span__bt" @click="deviceCloseByStreamId(scope.row.device_code, item)">
                关门
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280">
          <template slot-scope="scope">
            <span v-if="scope.row.type === 1 || scope.row.type === 2 || scope.row.type === 3 || scope.row.type === 4">
              <span class="span__bt" @click="editStyleForm(scope.row)">样 式</span>
              <el-divider direction="vertical"></el-divider>
            </span>
            <span v-if="scope.row.type === 1 || scope.row.type === 2">
              <span class="span__bt" @click="testDeviceForm(scope.row)">测 试</span>
              <el-divider direction="vertical"></el-divider>
            </span>
            <span v-if="scope.row.type === 3 || scope.row.type === 4">
              <span class="span__bt" @click="addStreamForm(scope.row.device_code, scope.row.type)">添 流</span>
              <el-divider direction="vertical"></el-divider>
            </span>
            <span v-if="scope.row.type === 1 || scope.row.type === 2 || scope.row.type === 3 || scope.row.type === 4">
              <span class="span__bt" @click="reloadForm(scope.row)">重 载</span>
              <el-divider direction="vertical"></el-divider>
              <span class="span__bt" @click="editForm(scope.row)">编 辑</span>
              <el-divider direction="vertical"></el-divider>
            </span>
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
      <el-form :model="submitType === 'editStream' || submitType === 'addStream' ? streamForm : form" :rules="rules" style="text-align: left" ref="form" label-width="200px">
        <div v-if="submitType === 'add' || submitType === 'edit'">
          <el-form-item label="设备编码：" prop="device_code">
            <el-select @change="showDeviceType" v-model="form.device_code" :disabled="submitType === 'edit'" style="width: 200px">
              <el-option
                v-for="item in deviceList"
                :key="item.device_code"
                :label="item.device_code"
                :value="item.device_code"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="form.device_code" label="设备类型：" prop="type">
            <el-select v-model="form.type" disabled style="width: 200px">
              <el-option
                v-for="item in deviceTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="设备组：" prop="group_id">
            <el-select v-model="form.group_id" style="width: 200px" clearable>
              <el-option
                v-for="item in groupInfoList"
                :key="item.group_id"
                :label="item.group_id"
                :value="item.group_id"
              ></el-option>
            </el-select>
          </el-form-item>
        </div>
        <!-- 编辑设备 -->
        <div v-if="submitType === 'edit'">
          <!-- 设备参数 -->
          <el-divider>设备参数</el-divider>
          <!-- 门禁机、人证一体机、小盒子 -->
          <div v-if="form.type === 1 || form.type === 2 || form.type === 3">
            <el-form-item label="日志上报等级：" prop="device_params.log_level">
              <el-select v-model="form.device_params.log_level" style="width: 200px">
                <el-option
                  v-for="item in logLevelOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="继电器对调：" prop="device_params.relay_signal_alignment">
              <el-select v-model="form.device_params.relay_signal_alignment" style="width: 200px">
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <!-- 门禁机、人证一体机 -->
            <div v-if="form.type === 1 || form.type === 2">
              <el-form-item label="设备屏保：" prop="device_params.screensaver_switch">
                <el-select v-model="form.device_params.screensaver_switch" style="width: 200px">
                  <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="声音：" prop="device_params.voice_switch">
                <el-select v-model="form.device_params.voice_switch" style="width: 200px">
                  <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item v-if="form.device_params.voice_switch === 1" label="音量：" prop="device_params.volume">
                <el-input-number v-model="form.device_params.volume " :min="0" :max="100" :step="10"/>
              </el-form-item>
              <el-form-item label="闪光灯：" prop="device_params.is_light">
                <el-select v-model="form.device_params.is_light" style="width: 200px">
                  <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </el-form-item>
            </div>
            <!-- 小盒子 -->
            <div v-if="form.type === 3">
              <el-form-item label="1:n验证阈值：" prop="device_params.confidence">
                <el-input-number v-model="form.device_params.confidence" :min="0.01" :max="0.99" :step="0.01"/>
              </el-form-item>
              <el-form-item label="最小人脸宽度：" prop="device_params.min_face">
                <el-input-number v-model="form.device_params.min_face" :min="10" :max="100000" :step="100"/>
              </el-form-item>
              <el-form-item label="最大人脸角度：" prop="device_params.max_angle">
                <el-input-number v-model="form.device_params.max_angle" :min="10" :max="90" :step="10"/>
              </el-form-item>
            </div>
          </div>
          <!-- PC智能网关(特殊：上报地址、二次鉴权为设备参数) -->
          <div v-if="form.type === 4">
            <el-form-item label="上报地址：" prop="device_params.report_url">
              <el-input v-model="form.device_params.report_url" style="width: 350px"/>
            </el-form-item>
            <el-form-item label="二次鉴权：" prop="device_params.auth_url">
              <el-input v-model="form.device_params.auth_url" style="width: 350px"/>
            </el-form-item>
            <el-form-item label="继电器地址：" prop="device_params.relay_host">
              <el-input v-model="form.device_params.relay_host" style="width: 350px"/>
            </el-form-item>
          </div>
          <!-- 通用设备参数 -->
          <el-form-item label="继电器保持时长(s)：" prop="device_params.relay_hold_time">
            <el-input-number v-model="form.device_params.relay_hold_time" :min="1" :step="1"/>
          </el-form-item>
          <el-form-item label="对接企业微信：" prop="device_params.wechat_switch">
            <el-select v-model="form.device_params.wechat_switch" style="width: 200px">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="form.device_params.wechat_switch === 1" label="微信SecretNo：" prop="device_params.seed_secret_no">
            <el-input v-model="form.device_params.seed_secret_no" style="width: 200px"/>
          </el-form-item>
          <!-- 识别类型 -->
          <el-divider>识别类型</el-divider>
          <el-form-item label="识别类型：" prop="device_params.recognize_type">
            <el-select v-model="form.device_params.recognize_type" @change="handleRecognizeTypeSelect"
              :disabled="form.type === 3 || streamForm.type === 4" style="width: 200px">
              <el-option
                v-for="item in recognizeTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="(form.type === 1 || form.type === 2) && form.device_params.recognize_type === 1" label="备选识别类型：" prop="device_params.recognize_type_backup">
            <el-select v-model="form.device_params.recognize_type_backup" style="width: 200px">
              <el-option
                v-for="item in recognizeTypeBackUpOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="form.device_params.recognize_type === 3 || form.device_params.recognize_type_backup === 3" label="底库比对：" prop="device_params.feature_comparison">
            <el-select v-model="form.device_params.feature_comparison" style="width: 200px">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="form.device_params.recognize_type === 2 || form.device_params.recognize_type_backup === 2" label="存在性验证：" prop="device_params.is_exist">
            <el-select v-model="form.device_params.is_exist" style="width: 200px">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <div v-if="form.device_params.recognize_type === 3 || form.device_params.recognize_type_backup === 3">
            <el-form-item label="外接设备：" prop="device_params.external_devices">
              <el-select v-model="form.device_params.external_devices" multiple clearable style="width: 200px">
                <el-option
                  v-for="item in externalDevicesOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </div>
        </div>
        <!-- 添加、编辑 流参数 -->
        <div v-if="submitType === 'editStream' || submitType === 'addStream'">
          <el-form-item label="名称：" prop="camera_param.name">
            <el-input v-model="streamForm.camera_param.name" style="width: 200px"/>
          </el-form-item>
          <el-form-item label="摄像头类型：" prop="camera_param.type">
            <el-select v-model="streamForm.camera_param.type" :disabled="streamForm.type === 1 || streamForm.type === 2 || streamForm.type === 3 ? true : false" style="width: 200px">
              <el-option
                v-for="item in streamTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="流媒体地址：" v-if="streamForm.type === 3 || streamForm.type === 4" prop="camera_param.url">
            <el-input v-model="streamForm.camera_param.url" style="width: 200px"></el-input>
          </el-form-item>
          <el-form-item label="时间模板：" prop="camera_param.timeTemplateId">
            <el-select v-model="streamForm.camera_param.timeTemplateId" style="width: 200px" clearable>
              <el-option
                v-for="item in timeTemplateList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="1:1验证阈值：" prop="camera_param.threshold_11">
            <el-input-number v-model="streamForm.camera_param.threshold_11" :min="0.01" :max="0.99" :step="0.01"/>
          </el-form-item>
          <el-form-item label="最大尝试人脸抓拍时长(s)：" prop="camera_param.capture_max_interval">
            <el-input-number v-model="streamForm.camera_param.capture_max_interval" :min="1" :max="1000" :step="1"/>
          </el-form-item>
          <el-form-item label="识别模式：" prop="camera_param.recognition_mode">
            <el-select v-model="streamForm.camera_param.recognition_mode" style="width: 200px">
              <el-option
                v-for="item in recognitionModeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <!--
            为方便后续扩展 将设备拆分两类，分别管理自身流参数
            1、门禁机、人证一体机、小盒子(小盒子不支持的部分参数 区分)
            2、PC智能网关
          -->
          <!-- 门禁机、人证一体机、小盒子 -->
          <!-- TODO 流参数规划 -->
          <div v-if="streamForm.type === 1 || streamForm.type === 2 || streamForm.type === 3">
            <!-- 通用参数 -->
            <el-form-item label="截取比例：" prop="camera_param.crop_ratio">
              <el-input-number v-model="streamForm.camera_param.crop_ratio" :min="0.1" :max="100" :step="1"/>
            </el-form-item>
            <el-form-item label="上报未识别人员：" prop="camera_param.not_pass_report">
              <el-select v-model="streamForm.camera_param.not_pass_report" style="width: 200px">
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="上报地址：" prop="camera_param.report_url">
              <el-input v-model="streamForm.camera_param.report_url" style="width: 350px"/>
            </el-form-item>
            <el-form-item label="二次鉴权：" prop="camera_param.auth_url">
              <el-input v-model="streamForm.camera_param.auth_url" style="width: 350px"/>
            </el-form-item>
            <el-form-item label="识别开关：" prop="camera_param.is_working">
              <el-select v-model="streamForm.camera_param.is_working" style="width: 200px">
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <!-- 门禁机、人证一体机 专属参数 -->
            <div v-if="streamForm.type === 1 || streamForm.type === 2">
              <el-form-item label="1:n验证阈值：" prop="camera_param.confidence">
                <el-input-number v-model="streamForm.camera_param.confidence" :min="0.01" :max="0.99" :step="0.01"/>
              </el-form-item>
              <el-form-item label="清晰度：" prop="camera_param.clarity_switch">
                <el-select v-model="streamForm.camera_param.clarity_switch" style="width: 200px">
                  <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item v-if="streamForm.camera_param.clarity_switch === 1" label="最小清晰度：" prop="camera_param.min_clarity">
                <el-input-number v-model="streamForm.camera_param.min_clarity" :min="0.01" :max="0.99" :step="0.01"/>
              </el-form-item>
              <el-form-item label="最小人脸宽度：" prop="camera_param.min_face">
                <el-input-number v-model="streamForm.camera_param.min_face" :min="10" :max="100000" :step="100"/>
              </el-form-item>
              <el-form-item label="最大人脸角度：" prop="camera_param.max_angle">
                <el-input-number v-model="streamForm.camera_param.max_angle" :min="10" :max="90" :step="10"/>
              </el-form-item>
              <el-form-item label="分辨率：" prop="camera_param.frame_size">
                <el-select v-model="streamForm.camera_param.frame_size" style="width: 200px">
                  <el-option
                    v-for="item in frameSizeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="活体检测：" prop="camera_param.bio_detection_open">
                <el-select v-model="streamForm.camera_param.bio_detection_open" placeholder="请选择" size="mini">
                  <el-option
                    v-for="item in bioDetectionOpenOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item v-if="streamForm.camera_param.bio_detection_open === 1" label="模型活体阈值：" prop="camera_param.threshold_living">
                <el-input-number :min="0.85" :max="0.9999" :step="0.01" v-model="streamForm.camera_param.threshold_living" size="mini"></el-input-number>
              </el-form-item>
              <el-form-item v-if="streamForm.type === 1" label="人脸检测框：" prop="camera_param.detect_box">
                <el-select v-model="streamForm.camera_param.detect_box" style="width: 200px">
                  <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </el-form-item>
              <!-- 抽帧策略参数 -->
              <el-form-item label="抽帧频率(ms)：" prop="camera_param.frame_rate">
                <el-input-number :min="100" :max="1000" :step="100" v-model="streamForm.camera_param.frame_rate" size="mini"></el-input-number>
              </el-form-item>
              <el-form-item label="识别时限(s)：" prop="camera_param.recognize_expire">
                <el-input-number :min="2" :max="6" :step="1" v-model="streamForm.camera_param.recognize_expire" size="mini"></el-input-number>
              </el-form-item>
              <el-form-item label="屏保间隔(帧)：" prop="camera_param.unrecognized_rate">
                <el-input-number :min="5" :max="20" :step="1" v-model="streamForm.camera_param.unrecognized_rate" size="mini"></el-input-number>
              </el-form-item>
              <el-form-item label="重复识别间隔(次)：" prop="camera_param.interval_frame_count">
                <el-input-number :min="1" :max="20" :step="1" v-model="streamForm.camera_param.interval_frame_count" size="mini"></el-input-number>
              </el-form-item>
              <el-form-item label="屏幕唤醒灵敏度(ms)：" prop="camera_param.sampling_frame">
                <el-input-number :min="300" :max="2000" :step="100" v-model="streamForm.camera_param.sampling_frame" size="mini"></el-input-number>
              </el-form-item>
            </div>
          </div>
          <!-- PC智能网关 专属参数 -->
          <div v-if="streamForm.type === 4">
            <el-form-item label="1:n验证阈值：" prop="camera_param.confidence">
              <el-input-number v-model="streamForm.camera_param.confidence" :min="0.01" :max="0.99" :step="0.01"/>
            </el-form-item>
            <el-form-item label="1:n不可信阈值：" prop="camera_param.unsure">
              <el-input-number v-model="streamForm.camera_param.unsure" :min="0.01" :max="0.99" :step="0.01"/>
            </el-form-item>
            <el-form-item label="上报未识别人员：" prop="camera_param.not_pass_report">
              <el-select v-model="streamForm.camera_param.not_pass_report" style="width: 200px">
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="过滤类型：" prop="camera_param.filter_type">
              <el-select v-model="streamForm.camera_param.filter_type_web" style="width: 200px" multiple clearable>
                <el-option
                  v-for="item in filterTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item v-if="streamForm.camera_param.filter_type_web.indexOf(1) > -1" label="过滤频率(ms)：" prop="camera_param.capture_frequency">
              <el-input-number v-model="streamForm.camera_param.capture_frequency" :min="1" :step="20"/>
            </el-form-item>
            <el-form-item v-if="streamForm.camera_param.filter_type_web.indexOf(2) > -1" label="最大人脸角度：" prop="camera_param.max_angle">
              <el-input-number v-model="streamForm.camera_param.max_angle" :min="10" :max="90" :step="10"/>
            </el-form-item>
            <el-form-item v-if="streamForm.camera_param.filter_type_web.indexOf(4) > -1" label="最小清晰度：" prop="camera_param.min_clarity">
              <el-input-number v-model="streamForm.camera_param.min_clarity" :min="0.01" :max="0.99" :step="0.01"/>
            </el-form-item>
            <el-form-item v-if="streamForm.camera_param.filter_type_web.indexOf(8) > -1" label="画面边缘像素：" prop="camera_param.filter_boundary">
              <el-input-number v-model="streamForm.camera_param.filter_boundary" :min="1" :max="100" :step="10"/>
            </el-form-item>
            <el-form-item v-if="streamForm.camera_param.filter_type_web.indexOf(16) > -1" label="最大人脸：" prop="camera_param.filter_max_face">
              <el-input-number v-model="streamForm.camera_param.filter_max_face" :min="streamForm.camera_param.min_face" :step="50"/>
            </el-form-item>
            <el-form-item v-if="streamForm.camera_param.filter_type_web.indexOf(32) > -1" label="活体检测过滤程度：" prop="camera_param.filter_live">
              <el-select v-model="streamForm.camera_param.filter_live" style="width: 200px">
                <el-option
                  v-for="item in filterLiveOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="视拓算法人脸重检：" prop="camera_param.smartipc_redetect">
              <el-select v-model="streamForm.camera_param.smartipc_redetect" style="width: 200px">
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="继电器通道：" prop="camera_param.relay_channels">
              <el-select v-model="streamForm.camera_param.relay_channels" multiple style="width: 200px">
                <el-option
                  v-for="item in 16"
                  :key="item"
                  :label="item"
                  :value="item"
                ></el-option>
              </el-select>
            </el-form-item>
          </div>
        </div>
        <!-- 设备升级 -->
        <div v-if="submitType === 'updateDevice'">
          <el-form-item label="已选设备：">
            <el-tag
              size="medium"
              type="success"
              :key="tag.id"
              v-for="tag in selectDeviceList">
              {{ tag.device_code }}
            </el-tag>
          </el-form-item>
          <el-form-item label="上传Apk：">
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
        <!-- 设备开门 -->
        <div v-if="submitType === 'openDoor'">
          <el-form-item label="设备编码：" prop="device_code">
            <el-select v-model="form.device_code" disabled style="width: 200px">
              <el-option
                v-for="item in deviceList"
                :key="item.device_code"
                :label="item.device_code"
                :value="item.device_code"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="流名称：" prop="name">
            <el-input v-model="form.name" disabled style="width: 200px"/>
          </el-form-item>
          <el-form-item label="流ID：" prop="camera_id">
            <el-input v-model="form.camera_id" disabled style="width: 200px"/>
          </el-form-item>
          <el-form-item label="是否常开：" prop="lasting">
            <el-select v-model="form.lasting" style="width: 200px">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </div>
        <!-- 设备测试 -->
        <div v-if="submitType === 'testDevice'">
          <el-form-item label="设备编码：" prop="device_code">
            <el-select v-model="form.device_code" disabled style="width: 200px">
              <el-option
                v-for="item in deviceList"
                :key="item.device_code"
                :label="item.device_code"
                :value="item.device_code"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="流名称：" prop="name">
            <el-input v-model="form.name" disabled style="width: 200px"/>
          </el-form-item>
          <el-form-item label="流ID：" prop="camera_id">
            <el-input v-model="form.camera_id" disabled style="width: 200px"/>
          </el-form-item>
          <el-form-item label="测试类型：" prop="types">
            <el-select v-model="form.types" multiple clearable style="width: 200px">
              <el-option
                v-for="item in testTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="form.types && form.types.indexOf(4) > -1" label="显示文字：" prop="display">
            <el-input v-model="form.display" style="width: 200px"/>
          </el-form-item>
          <el-form-item v-if="testCaptureImg" label="抓拍图片：">
            <el-image class="capture-image" :src="testCaptureImg"
              @click="showCaptureImg()" :preview-src-list="srcList">
              <div slot="placeholder" class="loading-img">
                <i class="fa fa-spinner fa-3x fa-pulse" aria-hidden="true"></i>
              </div>
            </el-image>
          </el-form-item>
        </div>
        <!-- 重置样式 -->
        <div v-if="submitType === 'resetStyle'">
          <el-form-item label="设备编码：" prop="device_code">
            <el-select v-model="form.device_code" disabled style="width: 200px">
              <el-option
                v-for="item in deviceList"
                :key="item.device_code"
                :label="item.device_code"
                :value="item.device_code"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="样式类型：" prop="reset_types">
            <el-select v-model="form.reset_types" multiple filterable clearable style="width: 200px">
              <el-option
                v-for="item in form.type === 1 || form.type === 2 ? androidStyleOptions : pcStyleOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
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
      direction="rtl"
      size="400px"
      :before-close="drawerClose">
      <h1 slot="title">编辑样式</h1>
      <el-form :model="styleForm" :rules="styleFormRules" style="text-align: left" ref="styleForm" label-width="100px">
        <el-form-item v-if="styleForm.type === 1 || styleForm.type === 2" label="屏保图：" prop="screen_savers">
          <el-select v-model="styleForm.screen_savers" style="width: 200px" multiple clearable>
            <el-option
              v-for="item in filteredStyleList.screenSaverList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="背景图：" prop="background">
          <el-select v-model="styleForm.background" style="width: 200px" clearable>
            <el-option
              v-for="item in filteredStyleList.bgList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="styleForm.type === 1 || styleForm.type === 2" label="LOGO：" prop="logo">
          <el-select v-model="styleForm.logo" style="width: 200px" clearable>
            <el-option
              v-for="item in filteredStyleList.logoList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="资讯轮播：" prop="marquee">
          <el-select v-model="styleForm.marquee" style="width: 200px" clearable>
            <el-option
              v-for="item in filteredStyleList.marqueeList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="styleForm.type === 1 || styleForm.type === 2" label="头像框：" prop="box">
          <el-select v-model="styleForm.box" style="width: 200px" clearable>
            <el-option
              v-for="item in filteredStyleList.avatarList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div class="drawer-footer">
        <el-button v-if="styleForm.style_num > 0" @click="resetStyleForm()">重置</el-button>
        <el-button @click="styleFormSubmit('styleForm')" :loading="$store.state.isSubmitting">保存</el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import md5 from 'md5'
import Card from '@comp/Card/Card'
import QueryBar from '@comp/Bar/QueryBar'
import CardMenuItem from '@comp/Card/CardMenuItem'
import {
  discoverDeviceList, getDeviceList, addDeviceList, editDeviceList, delDeviceList,
  addStream, editStream, delStream,
  openDeviceDoor, closeDeviceDoor, reloadDevice, testDevice,
  updateDevice, bindDeviceStyle, unbindDeviceStyle,
  getGroupList, getTimeTemplateList, getStyleList
} from '@api/getData'
export default {
  data () {
    return {
      tableData: [], // 表格数据
      queryForm: {}, // 查询表单
      groupInfoList: [], // 所有设备组
      isAllowClick: true, // 防止连续点击
      testCaptureImg: '', // 设备测试返回 现场抓拍图(base64)
      srcList: [], // 大图预览
      tempTimeTemplateId: '', // 临时时间模板ID(编辑、删除时 赋值 del_time_template_id)
      // 分页
      currentPage: 1,
      pageSize: 10,
      totalCount: 1,
      // 对话框
      dialogVisible: false,
      drawerVisible: false, // 抽屉
      titleText: '新增设备',
      submitType: 'add',
      form: { // 表单
        device_params: {} // 设备参数
      },
      streamForm: { // 流媒体参数表单
        camera_param: {} // 流参数
      },
      styleForm: {}, // 样式表单
      rules: { // 表单检验
        'device_code': [{ required: true, message: '请选择设备编码', trigger: 'blur' }],
        'group_id': [{ required: true, message: '请选择设备组', trigger: 'blur' }],
        'device_params.seed_secret_no': [{ required: true, message: '请输入微信SecretNo', trigger: 'blur' }],
        'device_params.external_devices': [{ required: true, message: '请至少选择一个外接设备', trigger: 'blur' }],
        'camera_param.name': [{ required: true, message: '请输入流媒体名称', trigger: 'blur' }],
        code: [{ required: true, message: '请选择设备编号', trigger: 'blur' }],
        organizationId: [{ required: true, message: '请选择设机构', trigger: 'blur' }],
        types: [{ required: true, message: '请选择测试类型', trigger: 'blur' }],
        display: [{ required: true, message: '请输入需要显示的文字', trigger: 'blur' }]
      },
      styleFormRules: {}, // 样式表单检验
      timeTemplateList: [], // 所有时间模板
      deviceTypeOptions: [ // 所有设备类型
        { value: 1, label: '人证一体机' },
        { value: 2, label: '安卓设备' },
        { value: 3, label: '智能网关' },
        { value: 4, label: 'PC智能网关' },
        { value: 5, label: '注册机' },
        { value: 6, label: '识别服务器' },
        { value: 7, label: '网络继电器' }
      ],
      androidStyleOptions: [ // 样式类型(安卓设备、人证一体机)
        { value: 1, label: '屏保图' },
        { value: 2, label: '背景图' },
        { value: 3, label: 'LOGO' },
        { value: 4, label: '资讯轮播' },
        { value: 5, label: '头像框' }
      ],
      pcStyleOptions: [ // 样式类型(小盒子、PC智能网关)
        { value: 2, label: '背景图' },
        { value: 4, label: '资讯轮播' }
      ],
      testTypeOptions: [
        { value: 1, label: '闪光灯' },
        { value: 2, label: '声音' },
        { value: 3, label: '摄像头' },
        { value: 4, label: '显示' }
      ],
      isAliveOptions: [
        { value: 1, label: '在线' },
        { value: 2, label: '离线' }
      ],
      options: [ // 开启控制
        { value: 1, label: '开启' },
        { value: 2, label: '关闭' }
      ],
      logLevelOptions: [ // 设备日志上报等级
        { value: 1, label: 'debug' },
        { value: 2, label: 'info' },
        { value: 3, label: 'warning' },
        { value: 4, label: 'error' }
      ],
      recognizeTypeOptions: [ // 识别类型
        { value: 1, label: '1:N' },
        { value: 2, label: '1:1' },
        { value: 3, label: '1:X' }
      ],
      recognizeTypeBackUpOptions: [ // 备选识别类型
        { value: 0, label: '无' },
        { value: 2, label: '1:1' },
        { value: 3, label: '1:X' }
      ],
      externalDevicesOptions: [ // 识别介质类型
        { value: 1, label: '二维码' },
        { value: 2, label: '身份证' },
        { value: 3, label: 'IC卡' }
      ],
      recognitionModeOptions: [ // 识别模式
        { value: 1, label: '最大人脸识别' },
        { value: 2, label: '多人脸识别' }
      ],
      // 活体检测类型
      bioDetectionOpenOptions: [
        { label: '模型活体', value: 1 },
        { label: '关闭', value: 2 },
        { label: '简单活体', value: 3 }
      ],
      deviceList: [], // 所有未知设备
      addressList: [], // 所有地点
      organizationList: [], // 所有机构
      streamList: [], // 所有流媒体
      styleList: [], // 所有样式
      selectDeviceList: [], // 勾选设备组（批量更新时使用）
      uploadFile: [], // apk上传文件
      streamTypeOptions: [
        // { value: 'webcam', label: '本身摄像头' },
        { value: 'ipc-h264', label: '网络摄像头' },
        { value: 'seeta-hz001', label: '中科视拓智能摄像头-hz' },
        { value: 'seeta-hi001', label: '中科视拓智能摄像头-hi' }
      ],
      filterLiveOptions: [ // 活体检测过滤严格程度
        { label: '严格', value: 1 },
        { label: '宽松', value: 2 }
      ],
      frameSizeOptions: [ // 活体检测过滤严格程度
        { label: '640x480', value: 1 },
        { label: '1280x720', value: 2 }
      ],
      filterTypeOptions: [ // 过滤类型
        { label: '固定频率', value: 1 },
        { label: '姿态评估', value: 2 },
        { label: '清晰度评估', value: 4 },
        { label: '画面边缘人脸过滤', value: 8 },
        { label: '最大人脸过滤', value: 16 },
        { label: '活体检测过滤', value: 32 }
      ],
      defaultStreamParam: {
        'name': '',
        'type': 'ipc-h264',
        'clarity_switch': 1,
        'min_clarity': 0.35,
        'check_idcard': 2,
        'detect_box': 1,
        'recognition_mode': 1,
        'min_face': 120,
        'max_angle': 20,
        'crop_ratio': 0.4,
        'report_11_url': '',
        'report_1n_url': '',
        'auth_url': '',
        'capture_max_interval': 10,
        'is_working': 1,
        // 新增
        'frameSize': 1, // 分辨率
        'frame_rate': 200,
        'sampling_frame': 600,
        'threshold_living': 0.85,
        'bio_detection_open': 1,
        'recognize_expire': 3,
        'unrecognized_rate': 6,
        'interval_frame_count': 2,
        // PC智能网关 特有参数
        'filter_type_web': [1, 2], // TODO 默认值
        'capture_frequency': 200,
        'filter_boundary': 50,
        'filter_max_face': 500,
        'filter_live': 2,
        'smartipc_redetect': 1, // 视拓人脸重检
        // End
        'not_pass_report': 2,
        'top_n': 1,
        'threshold_11': 0.8,
        'confidence': 0.7,
        'unsure': 0.6,
        'url': '',
        'control_signal_out': 0,
        'timeTemplateId': '',
        'time_slots': null
      }
    }
  },
  computed: {
    isRefreshDeviceList () {
      return this.$store.state.isRefreshDeviceList // 是否刷新设备状态列表
    },
    // 过滤 分类 所有样式
    filteredStyleList () {
      let finalStyleListObj = {
        screenSaverList: [],
        bgList: [],
        logoList: [],
        marqueeList: [],
        avatarList: []
      }
      for (let item of this.styleList) {
        switch (item.type) {
          case 1:
            finalStyleListObj.screenSaverList.push(item)
            break
          case 2:
            finalStyleListObj.bgList.push(item)
            break
          case 3:
            finalStyleListObj.logoList.push(item)
            break
          case 4:
            finalStyleListObj.marqueeList.push(item)
            break
          case 5:
            finalStyleListObj.avatarList.push(item)
            break
          default:
            break
        }
      }
      return finalStyleListObj
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
    QueryBar,
    CardMenuItem
  },
  mounted () {
    this.findGroupInfoList() // 查找所有设备组
    this.findTimeTemplateList() // 查找所有时间模板
    this.getData()
  },
  methods: {
    // 获取表格数据
    async getData () {
      this.tableData = []
      const res = await getDeviceList({
        group_id: this.queryForm.groupId,
        device_code: this.queryForm.deviceCode,
        ip: this.queryForm.ip,
        alive: this.queryForm.alive || 0,
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
      // 表单校验
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          let submitForm = {}
          // 根据表单提交类型进行相应处理
          switch (this.submitType) {
            case 'add':
            case 'edit':
              // 深拷贝，消除数据处理对当前显示表单的影响
              submitForm = JSON.parse(JSON.stringify(this.form))
              // 判断表单提交类型
              const submitMethod = this.submitType === 'add' ? addDeviceList : editDeviceList
              const res = await submitMethod({ ...submitForm })
              if (res.data.res === 0) {
                this.$handleSuccessMessage()
                this.dialogClose()
                this.getData()
              }
              break
            case 'addStream':
            case 'editStream':
              // 深拷贝，消除数据处理对当前显示表单的影响
              submitForm = JSON.parse(JSON.stringify(this.streamForm))
              // console.log(submitForm.camera_param.timeTemplateId)
              // 当时间模板发生变更时
              this.tempTimeTemplateId = this.tempTimeTemplateId === submitForm.camera_param.timeTemplateId ? '' : this.tempTimeTemplateId
              // 判断表单提交类型
              const submitMethod2 = this.submitType === 'addStream' ? addStream : editStream
              const res2 = await submitMethod2({
                ...submitForm,
                del_time_template_id: this.tempTimeTemplateId
              })
              if (res2.data.res === 0) {
                this.$handleSuccessMessage()
                this.dialogClose()
                this.getData()
              }
              break
            case 'updateDevice':
              this.handleDeviceUpdate()
              break
            case 'openDoor':
              this.deviceOpenByStreamId()
              break
            case 'resetStyle':
              this.resetStyleSubmit()
              break
            case 'testDevice':
              this.testDeviceSubmit()
              break
          }
        }
      })
    },
    // 提交样式表单
    styleFormSubmit (formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          // 深拷贝，消除数据处理对当前显示表单的影响
          let submitStyleForm = JSON.parse(JSON.stringify(this.styleForm))
          const res = await bindDeviceStyle({ ...submitStyleForm })
          if (res.data.res === 0) {
            this.$handleSuccessMessage()
            this.drawerClose()
            this.getData()
          }
        }
      })
    },
    // apk升级提交
    async handleDeviceUpdate () {
      // 是否选择设备
      let deviceCodes = []
      if (this.selectDeviceList.length === 0) {
        this.$handleWarningMessage('请先选择需要升级的设备', 2000)
        return
      } else {
        for (let item of this.selectDeviceList) {
          deviceCodes.push(item.device_code)
        }
      }
      // 是否上传apk文件
      if (this.uploadFile.length === 0) {
        this.$handleWarningMessage('请先上传apk文件', 2000)
        return
      }
      // 提交apk升级
      const res = await updateDevice({
        apk: this.uploadFile[0].raw,
        device_codes: JSON.stringify(deviceCodes)
      })
      if (res.data.res === 0) {
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
      this.dialogVisible = true
    },
    // 选择设备编码后显示对应的设备类型
    showDeviceType (val) {
      for (let item of this.deviceList) {
        if (val === item.device_code) {
          this.$set(this.form, 'type', item.type)
        }
      }
    },
    // 显示编辑表单
    editForm (row) {
      this.titleText = '编辑设备'
      this.submitType = 'edit'
      this.form = JSON.parse(JSON.stringify(row))
      this.dialogVisible = true
    },
    // 显示新增流媒体
    addStreamForm (code, type) {
      this.titleText = '添加流媒体'
      this.submitType = 'addStream'
      this.streamForm.device_code = code
      this.streamForm.type = type
      this.streamForm.camera_param = JSON.parse(JSON.stringify(this.defaultStreamParam))
      this.dialogVisible = true
    },
    // 显示编辑流媒体
    editStreamForm (code, type, streamParam) {
      this.titleText = '编辑流媒体'
      this.submitType = 'editStream'
      this.streamForm.device_code = code
      this.streamForm.type = type
      this.streamForm.camera_param = JSON.parse(JSON.stringify(streamParam))
      this.tempTimeTemplateId = streamParam.timeTemplateId || '' // 临时保存流媒体
      this.dialogVisible = true
    },
    // 删除流媒体
    delStreamForm (code, streamParam) {
      this.$confirm('是否删除该流媒体?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        beforeClose: async (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '删除中...'
            // 删除操作
            const res = await delStream({
              device_code: code,
              camera_id: streamParam.id,
              time_template_id: streamParam.timeTemplateId
            })
            if (res.data.res === 0) {
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
    // 显示样式编辑
    editStyleForm (row) {
      this.findStyleList()
      if (row.front_styles) { // 首次front_styles可能不存在
        this.styleForm = JSON.parse(JSON.stringify(row.front_styles))
      }
      // TODO 暂支持单设备更换皮肤
      this.styleForm.style_num = row.style_num // 已绑定样式总数
      this.styleForm.device_code = row.device_code
      this.styleForm.type = row.type // 设备类型
      this.drawerVisible = true
    },
    // 显示设备测试
    testDeviceForm (row) {
      this.titleText = '设备测试'
      this.submitType = 'testDevice'
      this.$set(this.form, 'types', []) // 新增types值
      this.form.device_code = row.device_code
      try {
        this.form.name = row.camera_params[0].name
        // TODO 暂支持门禁机、认证一体机 只有自身流 后续更新
        this.form.camera_id = row.camera_params[0].id
      } catch (e) {
        this.$handleErrorNotify('请检查设备默认流是否正常！')
        console.error(e)
        return
      }
      this.dialogVisible = true
    },
    // 设备测试
    async testDeviceSubmit () {
      const res = await testDevice({
        device_code: this.form.device_code,
        camera_id: this.form.camera_id,
        types: this.form.types,
        display: this.form.display
      })
      if (res.data.res === 0) {
        this.$handleSuccessMessage()
        if (res.data.capture_image) {
          this.testCaptureImg = ''
          this.$nextTick(() => {
            this.testCaptureImg = 'data:image/png;base64,' + res.data.capture_image
          })
        }
      }
    },
    // 显示设备开门
    openDoorForm (code, streamParam) {
      this.titleText = '设备开门'
      this.submitType = 'openDoor'
      this.form.device_code = code
      this.form.name = streamParam.name
      this.form.camera_id = streamParam.id
      this.dialogVisible = true
    },
    // 设备开门（设备code、流id）
    async deviceOpenByStreamId () {
      const res = await openDeviceDoor({
        device_code: this.form.device_code,
        camera_id: this.form.camera_id,
        lasting: this.form.lasting || 2
      })
      if (res.data.res === 0) {
        this.$handleSuccessMessage()
        this.dialogClose()
      }
    },
    // 设备关门（设备code、流id）
    deviceCloseByStreamId (code, streamParam) {
      this.$confirm(`是否关闭 ${streamParam.name} 对应的门?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const res = await closeDeviceDoor({
          device_code: code,
          camera_id: streamParam.id
        })
        if (res.data.res === 0) {
          this.$handleSuccessMessage()
        }
      }).catch((e) => { console.log(e) })
    },
    // 设备重载
    reloadForm (row) {
      this.$prompt('是否重新加载该设备数据? 请输入管理员密码!', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        inputType: 'password',
        inputPattern: /\S/,
        inputErrorMessage: '请输入管理员密码',
        beforeClose: async (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '数据重载中...'
            // 删除操作
            const res = await reloadDevice({
              device_code: row.device_code,
              password: md5(instance.inputValue)
            })
            if (res.data.res === 0) {
              this.$handleSuccessMessage()
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
    // 删除表单
    delForm (row) {
      this.$prompt('是否删除该设备? 请输入管理员密码!', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        inputType: 'password',
        inputPattern: /\S/,
        inputErrorMessage: '请输入管理员密码',
        beforeClose: async (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '删除中...'
            // 删除操作
            const res = await delDeviceList({
              device_code: row.device_code,
              password: md5(instance.inputValue)
            })
            if (res.data.res === 0) {
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
    // 关闭对话框
    dialogClose () {
      this.dialogVisible = false
      this.form = { device_params: {} }
      this.streamForm = { camera_param: {} }
      this.testCaptureImg = '' // 清空测试抓拍图片
      this.$refs.form.clearValidate()
      this.$refs.multipleTable.clearSelection() // 清空设备勾选
      // 清空上传残留文件
      this.uploadFile = []
      if (this.$refs['upload-apk']) {
        this.$refs['upload-apk'].clearFiles()
      }
    },
    // 关闭抽屉
    drawerClose () {
      this.drawerVisible = false
      this.styleForm = {}
      this.$refs.styleForm.clearValidate()
    },
    // 显示批量更新
    updateForm () {
      if (this.selectDeviceList.length === 0) {
        this.$handleWarningMessage('请先选择需要升级的设备', 2000)
        return
      }
      this.titleText = '批量升级Apk'
      this.submitType = 'updateDevice'
      this.dialogVisible = true
    },
    // 勾选变更
    handleSelectionChange (arry) {
      this.selectDeviceList = arry
    },
    // 显示重置样式
    resetStyleForm () {
      this.titleText = '重置皮肤'
      this.submitType = 'resetStyle'
      this.$set(this.form, 'reset_types', []) // 新增reset_types值
      this.form.device_code = this.styleForm.device_code
      this.form.type = this.styleForm.type
      this.dialogVisible = true
    },
    // 重置样式
    async resetStyleSubmit () {
      const res = await unbindDeviceStyle({
        device_code: this.form.device_code,
        reset_types: this.form.reset_types
      })
      if (res.data.res === 0) {
        this.$handleSuccessMessage()
        this.dialogClose()
        this.drawerClose()
        this.getData()
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
    // 发现未知设备
    async findUnknownDeviceList () {
      const res = await discoverDeviceList()
      if (res.data.res === 0) {
        this.deviceList = res.data.devices
      }
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
    // 查找所有时间模板
    async findTimeTemplateList () {
      const res = await getTimeTemplateList({
        skip: 0,
        limit: 10000
      })
      if (res.data.res === 0) {
        this.timeTemplateList = res.data.records
      }
    },
    // 查找所有样式
    async findStyleList () {
      const res = await getStyleList({
        skip: 0,
        limit: 10000
      })
      if (res.data.res === 0) {
        this.styleList = res.data.records
      }
    },
    // 显示测试抓拍图预览信息
    showCaptureImg () {
      this.srcList = []
      this.$nextTick(() => {
        this.srcList.push(this.testCaptureImg)
      })
    },
    // 识别类型选择时处理
    handleRecognizeTypeSelect (val) {
      if (val !== 1) { // 不是1:N时 清除备选识别类型
        if (this.form.device_params.recognize_type_backup) {
          delete this.form.device_params.recognize_type_backup
        }
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
@media screen and (max-width: 1770px) {
  // 媒体查询 宽度小于1950px时 queryBar展示为两行 优化展示效果
  .handle-line-one { // 显示分行box
    display block !important
  }
  .el-card .el-table--fit { // 减少 card 内容区 高度
    height calc(100% - 30px - 44px) !important
  }
}
.stream-tag
  cursor pointer
.drawer-footer
  padding 40px 20%
.capture-image
  height 160px
  width 160px
</style>
