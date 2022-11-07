<template>
  <div class="flow-area" @dragover="handleDragover" @drop="handleDrop">
    <!--辅助线X-->
    <div
      v-if="container.auxiliaryLine.isOpen && container.auxiliaryLine.isShowXLine"
      class="flow-area__lineX"
      :style="{ top: auxiliaryLinePos.y + 'px' }"
    ></div>

    <!--辅助线Y-->
    <div
      v-if="container.auxiliaryLine.isOpen && container.auxiliaryLine.isShowYLine"
      class="flow-area__lineY"
      :style="{ left: auxiliaryLinePos.x + 'px' }"
    ></div>

    <div
      id="flowContainer"
      class="flow-area__container"
      :class="{
        grid: flowData.config.showGrid,
        canDrag: container.dragFlag,
        canMultiple: rectangleMultiple.flag,
      }"
      :style="gridStyle"
      @click="containerHandler"
      @mousedown="mousedownHandler"
      @mousemove="mousemoveHandler"
      @mouseup="mouseupHandler"
      @mousewheel="scaleContainer"
      @DOMMouseScroll="scaleContainer"
      @contextmenu="showContainerContextMenu"
    >
      <flow-node
        v-for="node in flowData.nodeList"
        :key="node.id"
        :node="node"
        :plumb="plumb"
        :config="config"
        v-model:select="currentSelect"
        v-model:selectGroup="currentSelectGroup"
        :currentTool="currentTool"
        @showNodeContextMenu="showNodeContextMenu"
        @isMultiple="isMultiple"
        @updateNodePos="updateNodePos"
        @alignForLine="alignForLine"
        @hideAlignLine="hideAlignLine"
      />
      <div
        class="flow-area__multiple"
        v-if="rectangleMultiple.flag && rectangleMultiple.multipling"
        :style="{
          top: rectangleMultiple.position.top + 'px',
          left: rectangleMultiple.position.left + 'px',
          width: rectangleMultiple.width + 'px',
          height: rectangleMultiple.height + 'px',
        }"
      ></div>
    </div>
    <div class="flow-area__scale">
      <a-button size="small" type="default" @click="narrowContainer">
        <template #icon>
          <component :is="'ZoomOutOutlined'" />
        </template>
      </a-button>
      <span>{{ container.scaleShow }}% </span>
      <a-button size="small" type="default" @click="enlargeContainer">
        <template #icon>
          <component :is="'ZoomInOutlined'" />
        </template>
      </a-button>
    </div>
    <div class="flow-area__position"> x: {{ mouse.position.x }}, y: {{ mouse.position.y }} </div>
  </div>
</template>

<script lang="ts" setup>
  import { reactive, ref, computed, watch, unref, PropType } from 'vue';
  import { message } from 'ant-design-vue';
  import { utils } from '/@/utils/common';
  import FlowNode from './FlowNode.vue';
  import { useContextMenu } from '/@/hooks/useContextMenu';
  import { CommonNodeTypeEnum, LaneNodeTypeEnum, ToolsTypeEnum, NodeTypeEnum } from '/@/type/enums';
  import { INode, ILink, ITool, IDragInfo, IElement } from '/@/type/index';
  import { commonNodes, highNodes, laneNodes } from '/@/config/nodes';
  import { useAlign } from '/@/hooks/useAlign';

  const props = defineProps({
    data: {
      type: Object,
      default: () => ({}),
    },
    config: {
      type: Object,
      default: () => ({}),
    },
    plumb: {
      type: Object,
      default: () => ({}),
    },
    select: {
      type: Object as PropType<INode | ILink>,
      default: () => ({}),
    },
    selectGroup: {
      type: Array as PropType<INode[]>,
      default: () => [],
    },
    currentTool: {
      type: Object as PropType<ITool>,
      default: () => ({}),
    },
    dragInfo: {
      type: Object as PropType<IDragInfo>,
      default: () => ({}),
    },
  });

  const emits = defineEmits([
    'selectTool',
    'onShortcutKey',
    'saveFlow',
    'update:select',
    'update:selectGroup',
    'update:data',
  ]);

  const {
    verticaLeft,
    verticalCenter,
    verticalRight,
    horizontalUp,
    horizontalCenter,
    horizontalDown,
  } = useAlign();

  const [createContextMenu] = useContextMenu();

  // 流程配置
  const flowConfig = reactive(props.config);

  // 流程DSL数据
  const flowData = ref(props.data);

  // 当前选择的节点
  const currentSelect = ref(props.select);

  // 当前选择的节点组
  const currentSelectGroup = ref(props.selectGroup);

  const container = reactive({
    pos: {
      top: 0,
      left: 0,
    },
    dragFlag: false,
    draging: false,
    scale: flowConfig.defaultStyle.containerScale.init,
    scaleFlag: false,
    scaleOrigin: {
      x: 0,
      y: 0,
    },
    scaleShow: utils.mul(flowConfig.defaultStyle.containerScale.init, 100),
    // 辅助线
    auxiliaryLine: {
      isOpen: flowConfig.defaultStyle.isOpenAuxiliaryLine,
      isShowXLine: false,
      isShowYLine: false,
      controlFnTimesFlag: true,
    },
  });

  // 辅助线位置
  const auxiliaryLinePos = reactive({
    x: 0,
    y: 0,
  });

  const mouse = reactive({
    position: {
      x: 0,
      y: 0,
    },
    // 鼠标点击起始位置
    tempPos: {
      x: 0,
      y: 0,
    },
  });

  // 鼠标划框多选
  const rectangleMultiple = reactive({
    flag: false, // 是否按了shift键
    multipling: false,
    position: {
      top: 0,
      left: 0,
    },
    height: 0,
    width: 0,
  });

  // 当前聚焦的连接线ID
  let tempLinkId = '';

  // 剪切板内容
  let clipboard: INode[] = [];

  const gridStyle = computed(() => {
    return {
      top: `${container.pos.top}px`,
      left: `${container.pos.left}px`,
      transform: `scale(${container.scale})`,
      transformOrigin: `${container.scaleOrigin.x}px ${container.scaleOrigin.y}px`,
    };
  });

  function handleDragover(e: MouseEvent) {
    e.preventDefault();
    mousemoveHandler(e);
  }

  // 查找相关节点
  function findNodeConfig(dragInfo: IDragInfo) {
    let node: IElement | undefined;
    const { belongTo, type } = dragInfo;

    switch (belongTo) {
      case NodeTypeEnum.Common_Node_Type:
        node = commonNodes.find((n) => n.type === type);
        break;
      case NodeTypeEnum.High_Node_Type:
        node = highNodes.find((n) => n.type === type);
        break;
      case NodeTypeEnum.Lane_Node_Type:
        node = laneNodes.find((n) => n.type === type);
        break;
      default:
        node = undefined;
    }

    if (!node) {
      message.error('未知的节点类型！');
      return;
    }

    // 增加节点
    addNewNode(node);
  }

  // 组件拖拽入画布
  function handleDrop() {
    // 复位拖拽工具
    emits('selectTool', ToolsTypeEnum.DRAG);

    findNodeConfig(props.dragInfo);
  }

  // 画布鼠标移动
  function mousemoveHandler(e: MouseEvent) {
    const target = e?.target as HTMLElement;

    if (target.id === 'flowContainer') {
      mouse.position = {
        x: e.offsetX,
        y: e.offsetY,
      };
    } else {
      let cn = target.className;
      let tn = target.tagName;
      if (
        cn !== 'lane-text' &&
        cn !== 'lane-text-div' &&
        tn !== 'svg' &&
        tn !== 'path' &&
        tn !== 'I'
      ) {
        mouse.position.x = target.offsetLeft + e.offsetX;
        mouse.position.y = target.offsetTop + e.offsetY;
      }
    }
    if (container.draging) {
      let nTop = container.pos.top + (mouse.position.y - mouse.tempPos.y);
      let nLeft = container.pos.left + (mouse.position.x - mouse.tempPos.x);
      if (nTop >= 0) nTop = 0;
      if (nLeft >= 0) nLeft = 0;
      container.pos = {
        top: nTop,
        left: nLeft,
      };
    }
    if (rectangleMultiple.multipling) {
      let h = mouse.position.y - mouse.tempPos.y;
      let w = mouse.position.x - mouse.tempPos.x;
      let t = mouse.tempPos.y;
      let l = mouse.tempPos.x;
      if (h >= 0 && w < 0) {
        w = -w;
        l -= w;
      } else if (h < 0 && w >= 0) {
        h = -h;
        t -= h;
      } else if (h < 0 && w < 0) {
        h = -h;
        w = -w;
        t -= h;
        l -= w;
      }
      rectangleMultiple.height = h;
      rectangleMultiple.width = w;
      rectangleMultiple.position.top = t;
      rectangleMultiple.position.left = l;
    }
  }

  // x, y取整计算
  function computeNodePos(x: number, y: number) {
    const pxx = flowConfig.defaultStyle.alignGridPX[0];
    const pxy = flowConfig.defaultStyle.alignGridPX[1];
    if (x % pxx) x = pxx - (x % pxx) + x;
    if (y % pxy) y = pxy - (y % pxy) + y;
    return {
      x: x,
      y: y,
    };
  }

  // 增加画布节点
  function addNewNode(node: IElement) {
    let x = mouse.position.x;
    let y = mouse.position.y;
    let nodePos = computeNodePos(x, y);
    x = nodePos.x;
    y = nodePos.y;

    let newNode = Object.assign({}, node) as INode;
    newNode.id = newNode.type + '-' + utils.getId();
    newNode.height = 50;
    if (
      newNode.type === CommonNodeTypeEnum.START ||
      newNode.type === CommonNodeTypeEnum.END ||
      newNode.type === CommonNodeTypeEnum.EVENT ||
      newNode.type === CommonNodeTypeEnum.GATEWAY
    ) {
      newNode.x = x - 25;
      newNode.width = 50;
    } else {
      newNode.x = x - 60;
      newNode.width = 120;
    }
    newNode.y = y - 25;
    if (newNode.type === LaneNodeTypeEnum.X_LANE) {
      newNode.height = 200;
      newNode.width = 500;
    } else if (newNode.type === LaneNodeTypeEnum.Y_LANE) {
      newNode.height = 500;
      newNode.width = 200;
    }
    unref(flowData).nodeList.push(newNode);
    emits('update:data', unref(flowData));
  }

  // 画布鼠标按下
  function mousedownHandler(e: MouseEvent) {
    if (e.button === 0) {
      if (container.dragFlag) {
        mouse.tempPos = mouse.position;
        container.draging = true;
      }

      currentSelectGroup.value = [];
      if (rectangleMultiple.flag) {
        mouse.tempPos = mouse.position;
        rectangleMultiple.multipling = true;
      }
    }
  }

  // 画布鼠标点击松开
  function mouseupHandler() {
    if (container.draging) container.draging = false;
    if (rectangleMultiple.multipling) {
      // 鼠标划框内的节点
      judgeSelectedNode();
      rectangleMultiple.multipling = false;
      rectangleMultiple.width = 0;
      rectangleMultiple.height = 0;
    }
  }

  // 鼠标划框内的节点
  function judgeSelectedNode() {
    let ay = rectangleMultiple.position.top;
    let ax = rectangleMultiple.position.left;
    let by = ay + rectangleMultiple.height;
    let bx = ax + rectangleMultiple.width;

    let nodeList = unref(flowData).nodeList;
    nodeList.forEach((node: INode) => {
      if (node.y >= ay && node.x >= ax && node.y <= by && node.x <= bx) {
        props.plumb.addToDragSelection(node.id);
        currentSelectGroup.value.push(node);
      }
    });
  }

  // 画布鼠标滚轴
  function scaleContainer(e: WheelEvent) {
    if (container.scaleFlag) {
      if (e.deltaY < 0) {
        enlargeContainer();
      } else if (container.scale) {
        narrowContainer();
      }
    }
  }

  // 画布放大
  function enlargeContainer() {
    container.scaleOrigin.x = mouse.position.x;
    container.scaleOrigin.y = mouse.position.y;
    let newScale = utils.add(container.scale, flowConfig.defaultStyle.containerScale.onceEnlarge);
    if (newScale <= flowConfig.defaultStyle.containerScale.max) {
      container.scale = newScale;
      container.scaleShow = utils.mul(container.scale, 100);
      props.plumb.setZoom(container.scale);
    }
  }

  // 画布缩小
  function narrowContainer() {
    container.scaleOrigin.x = mouse.position.x;
    container.scaleOrigin.y = mouse.position.y;
    let newScale = utils.sub(container.scale, flowConfig.defaultStyle.containerScale.onceNarrow);
    if (newScale >= flowConfig.defaultStyle.containerScale.min) {
      container.scale = newScale;
      container.scaleShow = utils.mul(container.scale, 100);
      props.plumb.setZoom(container.scale);
    }
  }

  // 画布右健
  function showContainerContextMenu(e: MouseEvent) {
    createContextMenu({
      event: e,
      items: [
        {
          handler: () => {
            flowInfo();
          },
          label: '流程图信息',
        },
        {
          handler: () => {
            paste();
          },
          label: '粘贴',
        },
        {
          handler: () => {
            selectAll();
          },
          label: '全选',
        },
        {
          handler: () => {
            saveFlow();
          },
          label: '保存流程',
        },
        {
          label: '对齐方式',
          children: [
            {
              handler: () => {
                verticaLeft({
                  currentSelectGroup: props.selectGroup,
                  flowData: props.data,
                  flowConfig: props.config,
                  plumb: props.plumb,
                });
              },
              label: '垂直左对齐',
            },
            {
              handler: () => {
                verticalCenter({
                  currentSelectGroup: props.selectGroup,
                  flowData: props.data,
                  flowConfig: props.config,
                  plumb: props.plumb,
                });
              },
              label: '垂直居中',
            },
            {
              handler: () => {
                verticalRight({
                  currentSelectGroup: props.selectGroup,
                  flowData: props.data,
                  flowConfig: props.config,
                  plumb: props.plumb,
                });
              },
              label: '垂直右对齐',
            },
            {
              handler: () => {
                horizontalUp({
                  currentSelectGroup: props.selectGroup,
                  flowData: props.data,
                  flowConfig: props.config,
                  plumb: props.plumb,
                });
              },
              label: '水平上对齐',
            },
            {
              handler: () => {
                horizontalCenter({
                  currentSelectGroup: props.selectGroup,
                  flowData: props.data,
                  flowConfig: props.config,
                  plumb: props.plumb,
                });
              },
              label: '水平居中',
            },
            {
              handler: () => {
                horizontalDown({
                  currentSelectGroup: props.selectGroup,
                  flowData: props.data,
                  flowConfig: props.config,
                  plumb: props.plumb,
                });
              },
              label: '水平下对齐',
            },
          ],
        },
      ],
    });
  }

  // 节点右键
  function showNodeContextMenu(e: MouseEvent) {
    createContextMenu({
      event: e,
      items: [
        {
          handler: () => {
            copyNode();
          },
          label: '复制节点',
        },
        {
          handler: () => {
            deleteNode();
          },
          label: '删除节点',
        },
      ],
    });
  }

  // 流程图信息
  function flowInfo() {
    let nodeList = unref(flowData).nodeList;
    let linkList = unref(flowData).linkList;
    message.info(
      '当前流程图中有 ' + nodeList.length + ' 个节点，有 ' + linkList.length + ' 条连线。',
    );
  }

  // 粘贴
  function paste() {
    let dis = 0;
    clipboard.forEach((node: INode) => {
      let newNode = Object.assign({}, node);
      newNode.id = newNode.type + '-' + utils.getId();
      let nodePos = computeNodePos(mouse.position.x + dis, mouse.position.y + dis);
      newNode.x = nodePos.x;
      newNode.y = nodePos.y;
      dis += 20;
      flowData.value.nodeList.push(newNode);
      emits('update:data', unref(flowData));
    });
  }

  // 全选
  function selectAll() {
    unref(flowData).nodeList.forEach((node: INode) => {
      props.plumb.addToDragSelection(node.id);
      currentSelectGroup.value.push(node);
    });
  }

  // 保存流程
  function saveFlow() {
    emits('saveFlow');
  }

  // 复制节点
  function copyNode() {
    clipboard = [];
    if (currentSelectGroup.value.length > 0) {
      clipboard = Object.assign([], currentSelectGroup.value);
    } else if (currentSelect.value.id) {
      clipboard.push(unref(currentSelect) as INode);
    }
  }

  // 查询删除节点关联的连接线
  function getConnectionsByNodeId(nodeId: string) {
    let conns1 = props.plumb.getConnections({
      source: nodeId,
    });
    let conns2 = props.plumb.getConnections({
      target: nodeId,
    });
    return conns1.concat(conns2);
  }

  // 删除节点
  function deleteNode() {
    let nodeList = unref(flowData).nodeList;
    let linkList = unref(flowData).linkList;
    let arr: INode[] = [];

    arr.push(Object.assign({}, unref(currentSelect) as INode));

    flowData.value.status = flowConfig.flowStatus.LOADING;

    arr.forEach((c) => {
      let conns = getConnectionsByNodeId(c.id);
      conns.forEach((conn: Recordable) => {
        linkList.splice(
          linkList.findIndex(
            (link: ILink) => link.sourceId === conn.sourceId && link.targetId === conn.targetId,
          ),
          1,
        );
        props.plumb.deleteConnection(
          props.plumb.getConnections({
            source: conn.sourceId,
            target: conn.targetId,
          })[0],
        );
      });
      let inx = nodeList.findIndex((node: INode) => node.id === c.id);
      nodeList.splice(inx, 1);
    });
    flowData.value.status = flowConfig.flowStatus.CREATE;
    emits('update:data', unref(flowData));
    selectContainer();
  }

  // 点击画布
  function containerHandler() {
    selectContainer();
  }
  // 清除画布已选内容
  function selectContainer() {
    currentSelect.value = {} as INode | ILink;
    // 开启快捷键
    emits('onShortcutKey');
  }
  // 是否为多选行为
  function isMultiple(callback: Fn) {
    callback(rectangleMultiple.flag);
  }
  // 更新组节点信息
  function updateNodePos() {
    let nodeList = unref(flowData).nodeList;
    currentSelectGroup.value.forEach((node) => {
      let dom = document.querySelector('#' + node.id) as HTMLElement;
      let l = parseInt(dom?.style?.left);
      let t = parseInt(dom?.style?.top);
      let f = nodeList.find((n: INode) => n.id === node.id);
      f.x = l;
      f.y = t;
    });
  }

  // 计算辅助线
  function alignForLine(e: Recordable) {
    if (props.selectGroup.length > 1) return;
    if (container.auxiliaryLine.controlFnTimesFlag) {
      let elId = e.el.id;
      let nodeList = unref(flowData).nodeList;
      nodeList.forEach((node: INode) => {
        if (elId !== node.id) {
          let dis = flowConfig.defaultStyle.showAuxiliaryLineDistance,
            elPos = e.pos,
            elH = e.el.offsetHeight,
            elW = e.el.offsetWidth,
            disX = elPos[0] - node.x,
            disY = elPos[1] - node.y;
          if ((disX >= -dis && disX <= dis) || (disX + elW >= -dis && disX + elW <= dis)) {
            container.auxiliaryLine.isShowYLine = true;
            auxiliaryLinePos.x = node.x + container.pos.left;
            let nodeMidPointX = node.x + node.width / 2;
            if (nodeMidPointX === elPos[0] + elW / 2) {
              auxiliaryLinePos.x = nodeMidPointX + container.pos.left;
            }
          }
          if ((disY >= -dis && disY <= dis) || (disY + elH >= -dis && disY + elH <= dis)) {
            container.auxiliaryLine.isShowXLine = true;
            auxiliaryLinePos.y = node.y + container.pos.top;
            let nodeMidPointY = node.y + node.height / 2;
            if (nodeMidPointY === elPos[1] + elH / 2) {
              auxiliaryLinePos.y = nodeMidPointY + container.pos.left;
            }
          }
        }
      });
      container.auxiliaryLine.controlFnTimesFlag = false;
      setTimeout(() => {
        container.auxiliaryLine.controlFnTimesFlag = true;
      }, 200);
    }
  }
  // 隐藏辅助线
  function hideAlignLine() {
    if (container.auxiliaryLine.isOpen) {
      container.auxiliaryLine.isShowXLine = false;
      container.auxiliaryLine.isShowYLine = false;
    }
  }

  defineExpose({
    container,
    rectangleMultiple,
  });

  watch(
    () => props.select,
    (val) => {
      currentSelect.value = val;
      // 清除连接线焦点
      if (tempLinkId !== '') {
        document.querySelector('#' + tempLinkId)?.classList.remove('link-active');
        tempLinkId = '';
      }
      // 设置连接线焦点
      if (unref(currentSelect).type === 'link') {
        tempLinkId = unref(currentSelect).id;
        document.querySelector('#' + unref(currentSelect).id)?.classList.add('link-active');
      }
    },
    { deep: true },
  );

  watch(
    () => currentSelect,
    (currentSelect) => {
      emits('update:select', currentSelect.value);
    },
    { deep: true },
  );

  watch(
    () => props.selectGroup,
    (val) => {
      currentSelectGroup.value = val;
      if (unref(currentSelectGroup).length <= 0) props.plumb.clearDragSelection();
    },
  );

  watch(
    () => currentSelectGroup,
    (currentSelectGroup) => {
      emits('update:selectGroup', currentSelectGroup.value);
    },
    { deep: true },
  );
</script>
