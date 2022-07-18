<template>
  <div style="height: 100%">
    <a-layout class="container">
      <a-layout-sider width="44" class="select-area">
        <a-row>
          <div class="tab">基础</div>
          <node-list :nodeList="field.commonNodes" type="commonNodes" @setDragInfo="setDragInfo" />
        </a-row>
        <a-row>
          <div class="tab">高级</div>
          <node-list :nodeList="field.highNodes" type="highNodes" @setDragInfo="setDragInfo" />
        </a-row>
        <a-row>
          <div class="tab">泳道</div>
          <node-list :nodeList="field.laneNodes" type="laneNodes" @setDragInfo="setDragInfo" />
        </a-row>
      </a-layout-sider>
      <a-layout>
        <a-layout-header class="header-option">
          <div class="header-option__tools">
            <span v-for="tool in field.tools" :key="tool.type">
              <a-tooltip :title="tool.name" placement="right">
                <a-button size="small" :type="currentTool.type === tool.type ? 'primary' : 'default'" @click="null">
                  <template #icon>
                    <component :is="tool.icon" />
                  </template>
                </a-button>
              </a-tooltip>
            </span>
          </div>
          <div class="header-option__buttons">
            <a-tooltip title="保存流程" placement="bottom">
              <a-button @click="null" class="header-option-button" size="small">
                <template #icon>
                  <SaveOutlined />
                </template>
              </a-button>
            </a-tooltip>
            <a-tooltip title="生成流程图片" placement="bottom">
              <a-button @click="null" class="header-option-button" size="small">
                <template #icon>
                  <PictureOutlined />
                </template>
              </a-button>
            </a-tooltip>
            <a-popconfirm title="确认要重新绘制吗？" placement="bottom" okText="确认" cancelText="取消" @confirm="null">
              <a-tooltip title="重新绘制" placement="bottom">
                <a-button class="header-option-button" size="small">
                  <template #icon>
                    <DeleteOutlined />
                  </template>
                </a-button>
              </a-tooltip>
            </a-popconfirm>
            <a-tooltip :title="flowData.config.showGridText" placement="bottom">
              <a-button @click="null" class="header-option-button" size="small">
                <component :is="flowData.config.showGridIcon" />
              </a-button>
            </a-tooltip>
            <a-tooltip title="设置" placement="bottom">
              <a-button @click="null" class="header-option-button" size="small">
                <template #icon>
                  <SettingOutlined />
                </template>
              </a-button>
            </a-tooltip>
            <a-tooltip title="测试" placement="bottom">
              <a-button @click="null" class="header-option-button" size="small">
                <template #icon>
                  <ToolOutlined />
                </template>
              </a-button>
            </a-tooltip>
            <a-popconfirm title="请选择帮助项：" placement="bottom" okType="default" okText="快捷键大全" cancelText="使用文档"
              @confirm="null" @cancel="null">
              <a-tooltip title="帮助" placement="bottom">
                <a-button class="header-option-button" size="small">
                  <template #icon>
                    <BookOutlined />
                  </template>
                </a-button>
              </a-tooltip>
            </a-popconfirm>
            <a-tooltip title="退出" placement="bottom">
              <a-button @click="null" class="header-option-button" size="small">
                <template #icon>
                  <LogoutOutlined />
                </template>
              </a-button>
            </a-tooltip>
          </div>
        </a-layout-header>
        <a-layout-content class="content"></a-layout-content>
        <a-layout-footer class="foot">
          <span>Vue3-Flow-Design 1.0.0 , Powered by 前端爱码士</span>
        </a-layout-footer>
      </a-layout>
      <a-layout-sider width="250" theme="light" class="attr-area" @mousedown.stop="null">
      </a-layout-sider>
    </a-layout>
  </div>
</template>

<script lang="ts"
        setup>
        import jsplumb from 'jsplumb'
        import NodeList from './modules/NodeList.vue'
        import { tools, commonNodes, highNodes, laneNodes } from './config/basic-node-config'
        import { flowConfig } from "./config/args-config";
        import { reactive, ref } from 'vue'
        
        const field = reactive({
          tools: tools,
          commonNodes: commonNodes,
          highNodes: highNodes,
          laneNodes: laneNodes,
        })
        
        const currentTool = reactive({
          type: "drag",
          icon: "drag",
          name: "拖拽"
        })
        
        const flowData = reactive({
          nodeList: [],
          linkList: [],
          attr: {
            id: ""
          },
          config: {
            showGrid: true,
            showGridText: "隐藏网格",
            showGridIcon: "EyeOutlined"
          },
          status: flowConfig.flowStatus.CREATE,
          remarks: []
        })
        
        const dragInfo = ref()
        
        // 设置dragInfo
        function setDragInfo(info) {
          dragInfo.value = info
        }
        </script>
