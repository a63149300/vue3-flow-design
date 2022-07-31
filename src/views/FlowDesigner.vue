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
            <!-- <a-tooltip title="生成流程图片" placement="bottom">
              <a-button @click="exportFlowPicture" class="header-option-button" size="small">
                <template #icon>
                  <component :is="'PictureOutlined'" />
                </template>
              </a-button>
            </a-tooltip> -->
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
                    <component :is="'DeleteOutlined'" />
                  </template>
                </a-button>
              </a-tooltip>
            </a-popconfirm>
            <a-tooltip :title="flowData.config.showGridText" placement="bottom">
              <a-button @click="toggleShowGrid" class="header-option-button" size="small">
                <component :is="flowData.config.showGridIcon" />
              </a-button>
            </a-tooltip>
            <!-- <a-tooltip title="设置" placement="bottom">
              <a-button @click="setting" class="header-option-button" size="small">
                <template #icon>
                  <component :is="'SettingOutlined'" />
                </template>
              </a-button>
            </a-tooltip> -->
            <a-tooltip title="测试" placement="bottom">
              <a-button @click="openTest" class="header-option-button" size="small">
                <template #icon>
                  <component :is="'ToolOutlined'" />
                </template>
              </a-button>
            </a-tooltip>
            <a-popconfirm
              title="请选择帮助项："
              placement="bottom"
              okType="default"
              okText="快捷键大全"
              cancelText="使用文档"
              @confirm="shortcutHelper"
              @cancel="usingDoc"
            >
              <a-tooltip title="帮助" placement="bottom">
                <a-button class="header-option-button" size="small">
                  <template #icon>
                    <component :is="'BookOutlined'" />
                  </template>
                </a-button>
              </a-tooltip>
            </a-popconfirm>
            <a-tooltip title="保存流程" placement="bottom">
              <a-button @click="saveFlow" class="header-option-button" size="small">
                <template #icon>
                  <component :is="'SaveOutlined'" />
                </template>
              </a-button>
            </a-tooltip>
          </div>
        </a-layout-header>
        <a-layout-content class="content">
          <flow-area
            ref="flowAreaRef"
            :dragInfo="dragInfo"
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
    <!-- 生成流程图片 -->
    <!-- <a-modal
      :title="'流程设计图_' + flowData.attr.id + '.png'"
      centered
      width="90%"
      :closable="flowPicture.closable"
      :maskClosable="flowPicture.maskClosable"
      :visible="flowPicture.modalVisible"
      okText="下载到本地"
      cancelText="取消"
      @ok="downLoadFlowPicture"
      @cancel="cancelDownLoadFlowPicture"
    >
      <img :src="flowPicture.url" style="width: 100%" />
    </a-modal> -->
    <!-- 设置 -->
    <!-- <setting-modal ref="settingModalRef" /> -->
    <!-- 快捷键大全 -->
    <ShortcutModal ref="shortcutModalRef" />
    <!-- 测试 -->
    <TestModal ref="testModalRef" @loadFlow="loadFlow" />
  </div>
</template>

<script lang="ts" setup>
  import { jsPlumb, Defaults } from 'jsplumb';
  import { reactive, ref, onMounted, nextTick, unref } from 'vue';
  import { message } from 'ant-design-vue';
  // import canvg from 'canvg';
  // import html2canvas from 'html2canvas';
  import NodeList from './modules/NodeList.vue';
  import FlowArea from './modules/FlowArea.vue';
  import FlowAttr from './modules/FlowAttr.vue';
  // import SettingModal from './modules/SettingModal.vue';
  import ShortcutModal from './modules/ShortcutModal.vue';
  import TestModal from './modules/TestModal.vue';
  import { tools, commonNodes, highNodes, laneNodes } from '/@/config/basic-node-config';
  import { flowConfig } from '/@/config/args-config';
  import { IDragInfo, IElement, INode, ILink } from '/@/type/index';
  import { ToolsTypeEnum, LaneNodesType } from '/@/type/enums';
  import { utils } from '/@/utils/common';
  import { useContextMenu } from '/@/hooks/useContextMenu';

  const [createContextMenu] = useContextMenu();

  const plumb = ref<any>({});
  const field = reactive({
    tools: tools,
    commonNodes: commonNodes,
    highNodes: highNodes,
    laneNodes: laneNodes,
  });

  const currentTool = ref<IElement>(tools[0]);

  const flowAreaRef = ref();

  // const settingModalRef = ref();

  const shortcutModalRef = ref();

  // 测试Ref
  const testModalRef = ref();

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
  });
  // 当前选择节点
  const currentSelect = ref<INode | ILink>();
  // 当前选择组
  const currentSelectGroup = ref<INode[]>([]);
  // 画布聚焦开启快捷键
  let activeShortcut = true;

  // const flowPicture = reactive({
  //   url: '',
  //   modalVisible: false,
  //   closable: false,
  //   maskClosable: false,
  // });

  const dragInfo = reactive<IDragInfo>({
    type: '',
    belongTo: '',
  });

  // 初始化流程图
  function initFlow() {
    if (flowData.status === flowConfig.flowStatus.CREATE) {
      flowData.attr.id = 'flow-' + utils.getId();
    } else {
      loadFlow();
    }
  }

  // 渲染流程
  async function loadFlow(str = '') {
    clear();
    await nextTick();
    let loadData = JSON.parse(str);
    flowData.attr = loadData.attr;
    flowData.config = loadData.config;
    flowData.status = flowConfig.flowStatus.LOADING;
    plumb.value.batch(async () => {
      let nodeList = loadData.nodeList;
      nodeList.forEach((node: Recordable) => {
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
          currentSelect.value = flowData.linkList.filter((l: Recordable) => l.id === link_id)[0];
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
      currentSelect.value = undefined;
      currentSelectGroup.value = [];
      flowData.status = flowConfig.flowStatus.MODIFY;
    }, true);
    let canvasSize = computeCanvasSize();
    flowAreaRef.value.container.pos = {
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
      document.querySelector('#' + id)?.addEventListener('contextmenu', (e) => {
        showLinkContextMenu(e);
        currentSelect.value = flowData.linkList.find((l: Recordable) => l.id === id);
      });

      document.querySelector('#' + id)?.addEventListener('click', (e) => {
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
  function showLinkContextMenu(e) {
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
    flowData.nodeList.forEach((node: Recordable) => {
      let f = plumb.value.toggleDraggable(node.id);
      if (!f) {
        plumb.value.toggleDraggable(node.id);
      }
      if (node.type !== LaneNodesType.X_LANE && node.type !== LaneNodesType.Y_LANE) {
        plumb.value.unmakeSource(node.id);
        plumb.value.unmakeTarget(node.id);
      }
    });
  }

  // 切换为连线
  function changeToConnection() {
    flowData.nodeList.forEach((node: Recordable) => {
      let f = plumb.value.toggleDraggable(node.id);
      if (f) {
        plumb.value.toggleDraggable(node.id);
      }
      if (node.type !== LaneNodesType.X_LANE && node.type !== LaneNodesType.Y_LANE) {
        plumb.value.makeSource(node.id, flowConfig.jsPlumbConfig.makeSourceConfig);
        plumb.value.makeTarget(node.id, flowConfig.jsPlumbConfig.makeTargetConfig);
      }
    });

    currentSelect.value = undefined;
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
    message.success('保存流程成功！请查看控制台。');
    console.log(flowObj);
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
    let sourceId = (unref(currentSelect) as ILink)?.sourceId;
    let targetId = (unref(currentSelect) as ILink)?.targetId;
    plumb.value.deleteConnection(
      plumb.value.getConnections({
        source: sourceId,
        target: targetId,
      })[0],
    );
    let linkList = flowData.linkList;
    linkList.splice(
      linkList.findIndex(
        (link: Recordable) => link.sourceId === sourceId && link.targetId === targetId,
      ),
      1,
    );
    currentSelect.value = undefined;
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
    } else if (unref(currentSelect)?.id) {
      if (isX) {
        (currentSelect.value as INode)!.x += m;
      } else {
        (currentSelect.value as INode)!.y += m;
      }
      plumb.value.repaintEverything();
    }
  }

  // 初始化快捷键
  function listenShortcut() {
    document.onkeydown = (e: KeyboardEvent) => {
      // 画布聚焦开启快捷键
      if (!activeShortcut) return;
      let key = e.code;

      switch (key) {
        case flowConfig.shortcut.multiple.code:
          flowAreaRef.value.rectangleMultiple.flag = true;
          break;
        case flowConfig.shortcut.dragContainer.code:
          flowAreaRef.value.container.dragFlag = true;
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

      if (e.ctrlKey) {
        switch (key) {
          case flowConfig.shortcut.settingModal.code:
            // setting();
            break;
          case flowConfig.shortcut.testModal.code:
            openTest();
            break;
        }
      }
    };
    // 拖拽、缩放、多选快捷键复位
    document.onkeyup = (event: KeyboardEvent) => {
      let key = event.code;
      if (key === flowConfig.shortcut.dragContainer.code) {
        flowAreaRef.value.container.dragFlag = false;
      } else if (key === flowConfig.shortcut.multiple.code) {
        flowAreaRef.value.rectangleMultiple.flag = false;
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
    currentSelect.value = undefined;
    currentSelectGroup.value = [];
    flowData.nodeList = [];
    flowData.linkList = [];
  }

  // 显示隐藏网格
  function toggleShowGrid() {
    let flag = flowData.config.showGrid;
    if (flag) {
      flowData.config.showGrid = false;
      flowData.config.showGridText = '显示网格';
      flowData.config.showGridIcon = 'EyeInvisibleOutlined';
    } else {
      flowData.config.showGrid = true;
      flowData.config.showGridText = '隐藏网格';
      flowData.config.showGridIcon = 'EyeOutlined';
    }
  }

  // 测试
  function openTest() {
    let flowObj = Object.assign({}, flowData);
    testModalRef.value.flowData = flowObj;
    testModalRef.value.testVisible = true;
  }

  // 设置
  // function setting() {
  //   settingModalRef.value.open();
  // }

  // 快捷键大全
  function shortcutHelper() {
    shortcutModalRef.value.open();
  }

  // 使用文档
  function usingDoc() {
    window.open('https://gitee.com/zhangyeping/vue-flow-design-plus');
  }

  // 生成流程图片
  // function exportFlowPicture() {
  //   if (!checkFlow()) return;

  //   let $Container = flowAreaRef.value.$el.children[0],
  //     svgElems = $Container.querySelectorAll('svg[id^="link-"]'),
  //     removeArr = [];

  //   console.log(flowAreaRef.value);

  //   svgElems.forEach((svgElem) => {
  //     let linkCanvas = document.createElement('canvas');
  //     let canvasId = 'linkCanvas-' + utils.getId();
  //     linkCanvas.id = canvasId;
  //     removeArr.push(canvasId);

  //     let svgContent = svgElem.outerHTML.trim();
  //     canvg(linkCanvas, svgContent);
  //     if (svgElem.style.position) {
  //       linkCanvas.style.position += svgElem.style.position;
  //       linkCanvas.style.left += svgElem.style.left;
  //       linkCanvas.style.top += svgElem.style.top;
  //     }
  //     $Container.appendChild(linkCanvas);
  //   });

  //   let canvasSize = computeCanvasSize();

  //   let pbd = flowConfig.defaultStyle.photoBlankDistance;
  //   let offsetPbd = utils.div(pbd, 2);

  //   html2canvas($Container, {
  //     width: canvasSize.width + pbd,
  //     height: canvasSize.height + pbd,
  //     scrollX: -canvasSize.minX + offsetPbd,
  //     scrollY: -canvasSize.minY + offsetPbd,
  //     logging: false,
  //     onclone: () => {
  //       removeArr.forEach((id) => {
  //         let currentNode = document.querySelector('#' + id);
  //         currentNode.parentNode.removeChild(currentNode);
  //       });
  //     },
  //   }).then((canvas) => {
  //     let dataURL = canvas.toDataURL('image/png');
  //     flowPicture.url = dataURL;
  //     flowPicture.modalVisible = true;
  //   });
  // }

  // 下载图片
  // function downLoadFlowPicture() {
  //   let alink = document.createElement('a');
  //   let alinkId = 'alink-' + utils.getId();
  //   alink.id = alinkId;
  //   alink.href = flowPicture.url;
  //   alink.download = '流程设计图_' + flowData.attr.id + '.png';
  //   alink.click();
  // }

  // 取消下载
  // function cancelDownLoadFlowPicture() {
  //   flowPicture.url = '';
  //   flowPicture.modalVisible = false;
  // }

  onMounted(() => {
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
