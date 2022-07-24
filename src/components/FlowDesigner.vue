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
          <!-- 操作区 -->
          <div class="header-option__tools">
            <span v-for="tool in field.tools" :key="tool.type">
              <a-tooltip :title="tool.nodeName" placement="right">
                <a-button
                  size="small"
                  :type="currentTool.type === tool.type ? 'primary' : 'default'"
                  @click="selectTool(tool.type)"
                >
                  <template #icon>
                    <component :is="tool.icon" />
                  </template>
                </a-button>
              </a-tooltip>
            </span>
          </div>
          <!-- 工具区 -->
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
            <a-popconfirm
              title="确认要重新绘制吗？"
              placement="bottom"
              okText="确认"
              cancelText="取消"
              @confirm="null"
            >
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
            <a-popconfirm
              title="请选择帮助项："
              placement="bottom"
              okType="default"
              okText="快捷键大全"
              cancelText="使用文档"
              @confirm="null"
              @cancel="null"
            >
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
        <a-layout-content class="content">
          <flow-area
            ref="flowCanvas"
            :dragInfo="dragInfo"
            :browserType="browserType"
            :flowData="flowData"
            v-model:select="currentSelect"
            v-model:selectGroup="currentSelectGroup"
            :plumb="plumb"
            :currentTool="currentTool"
            @findNodeConfig="findNodeConfig"
            @selectTool="selectTool"
            @getShortcut="null"
            @saveFlow="null"
          />
        </a-layout-content>
        <a-layout-footer class="foot">
          <span>Vue3-Flow-Design 1.0.0 , Powered by 前端爱码士</span>
        </a-layout-footer>
      </a-layout>
      <a-layout-sider width="250" theme="light" class="attr-area" @mousedown.stop="null" />
    </a-layout>
  </div>
</template>

<script lang="ts" setup>
  import { jsPlumb, Defaults } from 'jsplumb';
  import { reactive, ref, onMounted } from 'vue';
  import { message } from 'ant-design-vue';
  import NodeList from './modules/NodeList.vue';
  import FlowArea from './modules/FlowArea.vue';
  import { tools, commonNodes, highNodes, laneNodes, IElement } from './config/basic-node-config';
  import { flowConfig } from './config/args-config';
  import { IDragInfo } from './type';
  import { ToolsTypeEnum } from './config/enums';
  import { utils } from './utils/common';

  const browserType = 3;
  const plumb = ref<any>({});
  const field = reactive({
    tools: tools,
    commonNodes: commonNodes,
    highNodes: highNodes,
    laneNodes: laneNodes,
  });

  const currentTool = ref<IElement>(tools[0]);

  const flowCanvas = ref<Nullable<HTMLElement>>(null);

  const flowData = reactive<Recordable>({
    nodeList: [],
    linkList: [],
    attr: {
      id: '',
    },
    config: {
      showGrid: true,
      showGridText: '隐藏网格',
      showGridIcon: 'EyeOutlined',
    },
    status: flowConfig.flowStatus.CREATE,
    remarks: [],
  });

  const currentSelect = ref({});
  const currentSelectGroup = ref([]);
  let activeShortcut = true; // 画布聚焦开启快捷键
  const linkContextMenuData = flowConfig.contextMenu.link;
  const flowPicture = {
    url: '',
    modalVisible: false,
    closable: false,
    maskClosable: false,
  };

  const dragInfo = reactive<IDragInfo>({
    type: '',
    belongTo: '',
  });

  // 实例化JsPlumb
  function initJsPlumb() {
    plumb.value = jsPlumb.getInstance(flowConfig.jsPlumbInsConfig as unknown as Defaults);

    plumb.value.bind('beforeDrop', (info) => {
      let sourceId = info.sourceId;
      let targetId = info.targetId;

      if (sourceId === targetId) return false;
      let filter = flowData.linkList.filter(
        (link: Recordable) => link.sourceId === sourceId && link.targetId === targetId,
      );
      if (filter.length > 0) {
        message.error('同方向的两节点连线只能有一条！');
        return false;
      }
      return true;
    });

    plumb.value.bind('connection', (conn: Recordable) => {
      let connObj = conn.connection.canvas;
      let o: Recordable = {};
      let id = '';
      let label = '';
      if (
        flowData.status === flowConfig.flowStatus.CREATE ||
        flowData.status === flowConfig.flowStatus.MODIFY
      ) {
        id = 'link-' + utils.getId();
        label = '';
      } else if (flowData.status === flowConfig.flowStatus.LOADING) {
        let l = flowData.linkList[flowData.linkList.length - 1];
        id = l.id;
        label = l.label;
      }
      connObj.id = id;
      o.type = 'link';
      o.id = id;
      o.sourceId = conn.sourceId;
      o.targetId = conn.targetId;
      o.label = label;
      o.cls = {
        linkType: flowConfig.jsPlumbInsConfig.Connector[0],
        linkColor: flowConfig.jsPlumbInsConfig.PaintStyle.stroke,
        linkThickness: flowConfig.jsPlumbInsConfig.PaintStyle.strokeWidth,
      };
      document.querySelector('#' + id)!.addEventListener('contextmenu', (e) => {
        showLinkContextMenu(e);
        currentSelect.value = flowData.linkList.find((l: Recordable) => l.id === id);
      });

      document.querySelector('#' + id)!.addEventListener('click', (e) => {
        let event = window.event || e;
        event.stopPropagation();
        currentSelect.value = flowData.linkList.find((l: Recordable) => l.id === id);
      });

      if (flowData.status !== flowConfig.flowStatus.LOADING) flowData.linkList.push(o);
    });

    plumb.value.importDefaults({
      ConnectionsDetachable: flowConfig.jsPlumbConfig.conn.isDetachable,
    });
  }

  // 连接线右键
  function showLinkContextMenu(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    let flowMenu = document.querySelector('.vue-contextmenuName-flow-menu') as HTMLElement;
    flowMenu.style.display = 'none';
    let nodeMenu = document.querySelector('.vue-contextmenuName-node-menu') as HTMLElement;
    nodeMenu.style.display = 'none';
    let x = event.clientX;
    let y = event.clientY;
    linkContextMenuData.axis = { x, y };
  }

  // 设置工具
  function selectTool(type: string) {
    let tool = tools.find((t) => t.type === type);
    if (tool) currentTool.value = tool;

    switch (type) {
      case ToolsTypeEnum.DRAG:
        changeToDrag();
        break;
      case ToolsTypeEnum.CONNECTION:
        changeToConnection();
        break;
    }
  }

  // 切换为拖拽
  function changeToDrag() {
    flowData.nodeList.forEach((node) => {
      let f = plumb.value.toggleDraggable(node.id);
      if (!f) {
        plumb.value.toggleDraggable(node.id);
      }
      if (node.type !== 'x-lane' && node.type !== 'y-lane') {
        plumb.value.unmakeSource(node.id);
        plumb.value.unmakeTarget(node.id);
      }
    });
  }

  // 切换为连线
  function changeToConnection() {
    flowData.nodeList.forEach((node) => {
      let f = plumb.value.toggleDraggable(node.id);
      if (f) {
        plumb.value.toggleDraggable(node.id);
      }
      if (node.type !== 'x-lane' && node.type !== 'y-lane') {
        plumb.value.makeSource(node.id, flowConfig.jsPlumbConfig.makeSourceConfig);
        plumb.value.makeTarget(node.id, flowConfig.jsPlumbConfig.makeTargetConfig);
      }
    });

    currentSelect.value = {};
    currentSelectGroup.value = [];
  }

  // 设置dragInfo
  function setDragInfo(info: IDragInfo) {
    dragInfo.type = info.type;
    dragInfo.belongTo = info.belongTo;
  }

  // 键盘移动节点
  function moveNode(type: string) {
    let m = flowConfig.defaultStyle.movePx,
      isX = true;
    switch (type) {
      case 'left':
        m = -m;
        break;
      case 'up':
        m = -m;
        isX = false;
        break;
      case 'right':
        break;
      case 'down':
        isX = false;
    }

    if (currentSelectGroup.value.length > 0) {
      currentSelectGroup.value.forEach((node) => {
        if (isX) {
          node.x += m;
        } else {
          node.y += m;
        }
      });
      plumb.value.repaintEverything();
    } else if (currentSelect.value.id) {
      if (isX) {
        currentSelect.value.x += m;
      } else {
        currentSelect.value.y += m;
      }
      plumb.value.repaintEverything();
    }
  }

  // 初始化快捷键
  function listenShortcut() {
    document.onkeydown = (e) => {
      let event = window.event || e;

      // 画布聚焦开启快捷键
      if (!activeShortcut) return;
      let key = event.keyCode;

      switch (key) {
        case flowConfig.shortcut.multiple.code:
          flowCanvas.value.rectangleMultiple.flag = true;
          break;
        case flowConfig.shortcut.dragContainer.code:
          flowCanvas.value.container.dragFlag = true;
          break;
        case flowConfig.shortcut.scaleContainer.code:
          flowCanvas.value.container.scaleFlag = true;
          break;
        case flowConfig.shortcut.dragTool.code:
          selectTool('drag');
          break;
        case flowConfig.shortcut.connTool.code:
          selectTool('connection');
          break;
        case flowConfig.shortcut.leftMove.code:
          moveNode('left');
          break;
        case flowConfig.shortcut.upMove.code:
          moveNode('up');
          break;
        case flowConfig.shortcut.rightMove.code:
          moveNode('right');
          break;
        case flowConfig.shortcut.downMove.code:
          moveNode('down');
          break;
      }

      if (event.ctrlKey) {
        if (event.altKey) {
          switch (key) {
            case flowConfig.shortcut.settingModal.code:
              setting();
              break;
            case flowConfig.shortcut.testModal.code:
              openTest();
              break;
          }
        }
      }
    };
    // 拖拽、缩放、多选快捷键复位
    document.onkeyup = (e) => {
      let event = window.event || e;

      let key = event.keyCode;
      if (key === flowConfig.shortcut.dragContainer.code) {
        flowCanvas.value.container.dragFlag = false;
      } else if (key === flowConfig.shortcut.scaleContainer.code) {
        event.preventDefault();
        flowCanvas.value.container.scaleFlag = false;
      } else if (key === flowConfig.shortcut.multiple.code) {
        flowCanvas.value.rectangleMultiple.flag = false;
      }
    };
  }

  // 查找相关节点
  function findNodeConfig(belongTo, type, callback) {
    let node: IElement | undefined;
    switch (belongTo) {
      case 'commonNodes':
        node = commonNodes.find((n) => n.type === type);
        break;
      case 'highNodes':
        node = highNodes.find((n) => n.type === type);
        break;
      case 'laneNodes':
        node = laneNodes.find((n) => n.type === type);
        break;
      default:
        node = undefined;
    }
    callback(node);
    console.log(flowData);
  }

  onMounted(() => {
    // 实例化JsPlumb
    initJsPlumb();
    // 初始化快捷键
    listenShortcut();
  });
</script>
