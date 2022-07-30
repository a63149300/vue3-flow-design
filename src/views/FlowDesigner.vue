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
              <a-button @click="saveFlow" class="header-option-button" size="small">
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
              @confirm="clear"
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
              <a-button @click="toggleShowGrid" class="header-option-button" size="small">
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
            @getShortcut="getShortcut"
            @saveFlow="saveFlow"
          />
        </a-layout-content>
        <a-layout-footer class="foot">
          <span>Vue3-Flow-Design 1.0.0 , Powered by 前端爱码士</span>
        </a-layout-footer>
      </a-layout>
      <a-layout-sider width="250" theme="light" class="attr-area" @mousedown.stop="loseShortcut">
        <flow-attr :plumb="plumb" :flowData="flowData" v-model:select="currentSelect" />
      </a-layout-sider>
    </a-layout>
  </div>
</template>

<script lang="ts" setup>
  import { jsPlumb, Defaults } from 'jsplumb';
  import { reactive, ref, onMounted, nextTick } from 'vue';
  import { message } from 'ant-design-vue';
  import NodeList from './modules/NodeList.vue';
  import FlowArea from './modules/FlowArea.vue';
  import FlowAttr from './modules/FlowAttr.vue';
  import { tools, commonNodes, highNodes, laneNodes, IElement } from '/@/config/basic-node-config';
  import { flowConfig } from '/@/config/args-config';
  import { IDragInfo } from './type';
  import { ToolsTypeEnum } from '/@/config/enums';
  import { utils, getBrowserType } from '/@/utils/common';
  import { useContextMenu } from '/@/hooks/useContextMenu';

  const [createContextMenu] = useContextMenu();

  let browserType = 3;
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

  // 浏览器兼容性
  function dealCompatibility() {
    browserType = getBrowserType();
    if (browserType === 2) {
      flowConfig.shortcut.scaleContainer = {
        code: 16,
        codeName: 'SHIFT(chrome下为ALT)',
        shortcutName: '画布缩放',
      };
    }
  }

  // 初始化流程图
  function initFlow() {
    if (flowData.status === flowConfig.flowStatus.CREATE) {
      flowData.attr.id = 'flow-' + utils.getId();
    } else {
      loadFlow();
    }
  }

  // 渲染流程
  async function loadFlow(json) {
    clear();
    await nextTick();
    let loadData = JSON.parse(json);
    flowData.attr = loadData.attr;
    flowData.config = loadData.config;
    flowData.status = flowConfig.flowStatus.LOADING;
    plumb.value.batch(async () => {
      let nodeList = loadData.nodeList;
      nodeList.forEach((node) => {
        flowData.nodeList.push(node);
      });
      let linkList = loadData.linkList;
      await nextTick();
      linkList.forEach((link) => {
        flowData.linkList.push(link);
        let conn = plumb.value.connect({
          source: link.sourceId,
          target: link.targetId,
          anchor: flowConfig.jsPlumbConfig.anchor.default,
          connector: [
            link.cls.linkType,
            {
              gap: 5,
              cornerRadius: 8,
              alwaysRespectStubs: true,
            },
          ],
          paintStyle: {
            stroke: link.cls.linkColor,
            strokeWidth: link.cls.linkThickness,
          },
        });
        let link_id = conn.canvas.id;
        let labelHandle = (e) => {
          let event = window.event || e;
          event.stopPropagation();
          currentSelect.value = flowData.linkList.filter((l) => l.id === link_id)[0];
        };

        if (link.label !== '') {
          conn.setLabel({
            label: link.label,
            cssClass: `linkLabel ${link_id}`,
          });

          // 添加label点击事件
          document.querySelector('.' + link_id)?.addEventListener('click', labelHandle);
        } else {
          if (document.querySelector('.' + link_id)) {
            // 移除label点击事件
            document.querySelector('.' + link_id)?.removeEventListener('click', labelHandle);
          }
        }
      });
      currentSelect.value = {};
      currentSelectGroup.value = [];
      flowData.status = flowConfig.flowStatus.MODIFY;
    }, true);
    let canvasSize = computeCanvasSize();
    flowCanvas.value.container.pos = {
      top: -canvasSize.minY + 100,
      left: -canvasSize.minX + 100,
    };
  }

  // 计算流程图宽高
  function computeCanvasSize() {
    let nodeList = Object.assign([], flowData.nodeList),
      minX = nodeList[0].x,
      minY = nodeList[0].y,
      maxX = nodeList[0].x + nodeList[0].width,
      maxY = nodeList[0].y + nodeList[0].height;
    nodeList.forEach((node) => {
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x + node.width);
      maxY = Math.max(maxY, node.y + node.height);
    });
    let canvasWidth = maxX - minX;
    let canvasHeight = maxY - minY;
    return {
      width: canvasWidth,
      height: canvasHeight,
      minX: minX,
      minY: minY,
      maxX: maxX,
      maxY: maxY,
    };
  }

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
  function showLinkContextMenu(e: MouseEvent) {
    e.stopPropagation();
    createContextMenu({
      event: e,
      items: [
        {
          handler: () => {
            deleteLink();
          },
          label: '删除连线',
        },
      ],
    });
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

  // 检测流程数据有效性
  function checkFlow() {
    let nodeList = flowData.nodeList;

    if (nodeList.length <= 0) {
      message.error('流程图中无任何节点！');
      return false;
    }
    return true;
  }

  // 保存流程
  function saveFlow() {
    let flowObj = Object.assign({}, flowData);

    if (!checkFlow()) return;
    flowObj.status = flowConfig.flowStatus.SAVE;
    let d = JSON.stringify(flowObj);
    message.success('保存流程成功！请查看控制台。');
    return d;
  }

  // 设置快捷键失效
  function loseShortcut() {
    activeShortcut = false;
  }

  // 设置快捷键启用
  function getShortcut() {
    activeShortcut = true;
  }

  // 设置dragInfo
  function setDragInfo(info: IDragInfo) {
    dragInfo.type = info.type;
    dragInfo.belongTo = info.belongTo;
  }

  // 关闭提示
  function listenPage() {
    window.onbeforeunload = function (e) {
      e = e || window.event;
      if (e) {
        e.returnValue = '关闭提示';
      }
      return '关闭提示';
    };
  }

  // 删除线
  function deleteLink() {
    let sourceId = currentSelect.value.sourceId;
    let targetId = currentSelect.value.targetId;
    plumb.value.deleteConnection(
      plumb.value.getConnections({
        source: sourceId,
        target: targetId,
      })[0],
    );
    let linkList = flowData.linkList;
    linkList.splice(
      linkList.findIndex((link) => link.sourceId === sourceId && link.targetId === targetId),
      1,
    );
    currentSelect.value = {};
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
  }

  // 清除画布
  function clear() {
    flowData.nodeList.forEach((node) => {
      plumb.value.remove(node.id);
    });
    currentSelect.value = {};
    currentSelectGroup.value = [];
    flowData.nodeList = [];
    flowData.linkList = [];
    flowData.remarks = [];
  }

  // 显示隐藏网格
  function toggleShowGrid() {
    let flag = flowData.config.showGrid;
    if (flag) {
      flowData.config.showGrid = false;
      flowData.config.showGridText = '显示网格';
      flowData.config.showGridIcon = 'eye-invisible';
    } else {
      flowData.config.showGrid = true;
      flowData.config.showGridText = '隐藏网格';
      flowData.config.showGridIcon = 'eye';
    }
  }

  onMounted(() => {
    // 浏览器兼容性
    dealCompatibility();
    // 实例化JsPlumb
    initJsPlumb();
    // 初始化快捷键
    listenShortcut();
    // 初始化流程图
    initFlow();
    // 关闭提示
    listenPage();
  });
</script>
