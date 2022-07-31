<template>
  <div
    style="width: 100%; height: 100%; overflow: hidden; position: relative"
    @dragover="allowDrop"
    @drop="drop"
  >
    <!--辅助线X-->
    <div
      v-if="container.auxiliaryLine.isOpen && container.auxiliaryLine.isShowXLine"
      class="auxiliary-line-x"
      :style="{ top: auxiliaryLinePos.y + 'px' }"
    ></div>
    <!--辅助线Y-->
    <div
      v-if="container.auxiliaryLine.isOpen && container.auxiliaryLine.isShowYLine"
      class="auxiliary-line-y"
      :style="{ left: auxiliaryLinePos.x + 'px' }"
    ></div>
    <div
      id="flowContainer"
      class="flow-container"
      :class="{
        grid: flowData.config.showGrid,
        zoomIn: currentTool.type === 'zoom-in',
        zoomOut: currentTool.type === 'zoom-out',
        canScale: container.scaleFlag,
        canDrag: container.dragFlag,
        canMultiple: rectangleMultiple.flag,
      }"
      :style="gridStyle"
      @click.stop="containerHandler"
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
        class="rectangle-multiple"
        v-if="rectangleMultiple.flag && rectangleMultiple.multipling"
        :style="{
          top: rectangleMultiple.position.top + 'px',
          left: rectangleMultiple.position.left + 'px',
          width: rectangleMultiple.width + 'px',
          height: rectangleMultiple.height + 'px',
        }"
      ></div>
    </div>
    <div class="container-scale">
      <a-button size="small" type="default" @click="enlargeContainer">
        <template #icon>
          <component :is="'ZoomInOutlined'" />
        </template>
      </a-button>
      <span>{{ container.scaleShow }}% </span>
      <a-button size="small" type="default" @click="narrowContainer">
        <template #icon>
          <component :is="'ZoomOutOutlined'" />
        </template>
      </a-button>
    </div>
    <div class="mouse-position"> x: {{ mouse.position.x }}, y: {{ mouse.position.y }} </div>
  </div>
</template>

<script lang="ts" setup>
  import { reactive, ref, computed, watch, unref, PropType } from 'vue';
  import { message } from 'ant-design-vue';
  import { flowConfig } from '/@/config/args-config';
  import { utils } from '/@/utils/common';
  import FlowNode from './FlowNode.vue';
  import { useContextMenu } from '/@/hooks/useContextMenu';
  import { CommonNodeType, LaneNodesType } from '/@/type/enums';
  import { INode, ILink, IElement, IDragInfo } from '/@/type/index';

  const props = defineProps({
    flowData: {
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
      type: Object as PropType<IElement>,
      default: () => ({}),
    },
    dragInfo: {
      type: Object as PropType<IDragInfo>,
      default: () => ({}),
    },
  });

  const emits = defineEmits([
    'findNodeConfig',
    'selectTool',
    'getShortcut',
    'saveFlow',
    'update:select',
    'update:selectGroup',
  ]);

  const [createContextMenu] = useContextMenu();

  const currentSelect = ref(props.select);

  const currentSelectGroup = ref(props.selectGroup);

  const container = reactive({
    pos: {
      top: -4000,
      left: -4000,
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
    flag: false, // 是否按了ctrl键
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

  function allowDrop(e: Event) {
    e.preventDefault();
    mousemoveHandler(e);
  }

  function drop() {
    let belongTo = props.dragInfo.belongTo;
    let type = props.dragInfo.type;

    // 复位拖拽工具
    emits('selectTool', 'drag');

    emits('findNodeConfig', belongTo, type, (node) => {
      if (!node) {
        message.error('未知的节点类型！');
        return;
      }
      // 增加节点
      addNewNode(node);
    });
  }

  // 画布鼠标移动
  function mousemoveHandler(e) {
    let event = window.event || e;

    if (event.target.id === 'flowContainer') {
      mouse.position = {
        x: event.offsetX,
        y: event.offsetY,
      };
    } else {
      let cn = event.target.className;
      let tn = event.target.tagName;
      if (
        cn !== 'lane-text' &&
        cn !== 'lane-text-div' &&
        tn !== 'svg' &&
        tn !== 'path' &&
        tn !== 'I'
      ) {
        mouse.position.x = event.target.offsetLeft + event.offsetX;
        mouse.position.y = event.target.offsetTop + event.offsetY;
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
  function computeNodePos(x, y) {
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
  function addNewNode(node) {
    let x = mouse.position.x;
    let y = mouse.position.y;
    let nodePos = computeNodePos(x, y);
    x = nodePos.x;
    y = nodePos.y;

    let newNode = Object.assign({}, node);
    newNode.id = newNode.type + '-' + utils.getId();
    newNode.height = 50;
    if (
      newNode.type === CommonNodeType.START ||
      newNode.type === CommonNodeType.END ||
      newNode.type === CommonNodeType.EVENT ||
      newNode.type === CommonNodeType.GATEWAY
    ) {
      newNode.x = x - 25;
      newNode.width = 50;
    } else {
      newNode.x = x - 60;
      newNode.width = 120;
    }
    newNode.y = y - 25;
    if (newNode.type === LaneNodesType.X_LANE) {
      newNode.height = 200;
      newNode.width = 500;
    } else if (newNode.type === LaneNodesType.Y_LANE) {
      newNode.height = 500;
      newNode.width = 200;
    }
    props.flowData.nodeList.push(newNode);
  }

  // 画布鼠标按下
  function mousedownHandler(e) {
    let event = window.event || e;

    if (event.button === 0) {
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

    let nodeList = props.flowData.nodeList;
    nodeList.forEach((node) => {
      if (node.y >= ay && node.x >= ax && node.y <= by && node.x <= bx) {
        props.plumb.addToDragSelection(node.id);
        currentSelectGroup.value.push(node);
      }
    });
  }

  // 画布鼠标滚轴
  function scaleContainer(e) {
    let event = window.event || e;

    if (container.scaleFlag) {
      if (event.deltaY < 0) {
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
                verticaLeft();
              },
              label: '垂直左对齐',
            },
            {
              handler: () => {
                verticalCenter();
              },
              label: '垂直居中',
            },
            {
              handler: () => {
                verticalRight();
              },
              label: '垂直右对齐',
            },
            {
              handler: () => {
                levelUp();
              },
              label: '水平上对齐',
            },
            {
              handler: () => {
                levelCenter();
              },
              label: '水平居中',
            },
            {
              handler: () => {
                levelDown();
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
    let nodeList = props.flowData.nodeList;
    let linkList = props.flowData.linkList;
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
      props.flowData.nodeList.push(newNode);
    });
  }

  // 全选
  function selectAll() {
    props.flowData.nodeList.forEach((node) => {
      props.plumb.addToDragSelection(node.id);
      currentSelectGroup.value.push(node);
    });
  }

  // 保存流程
  function saveFlow() {
    emits('saveFlow');
  }

  // 节点排列前校验节点数量
  function checkAlign() {
    if (currentSelectGroup.value.length < 2) {
      message.error('请选择至少两个节点！');
      return false;
    }
    return true;
  }

  // 垂直左对齐
  function verticaLeft() {
    if (!checkAlign()) return;
    let nodeList = props.flowData.nodeList;
    let selectGroup = currentSelectGroup.value;
    let baseX = selectGroup[0].x;
    let baseY = selectGroup[0].y;
    for (let i = 1; i < selectGroup.length; i++) {
      baseY = baseY + selectGroup[i - 1].height + flowConfig.defaultStyle.alignSpacing.vertical;
      let f = nodeList.filter((n) => n.id === selectGroup[i].id)[0];
      f.tx = baseX;
      f.ty = baseY;
      props.plumb.animate(
        selectGroup[i].id,
        { top: baseY, left: baseX },
        {
          duration: flowConfig.defaultStyle.alignDuration,
          complete: function () {
            f.x = f.tx;
            f.y = f.ty;
          },
        },
      );
    }
  }

  // 垂直居中
  function verticalCenter() {
    if (!checkAlign()) return;
    let nodeList = props.flowData.nodeList;
    let selectGroup = currentSelectGroup.value;
    let baseX = selectGroup[0].x;
    let baseY = selectGroup[0].y;
    let firstX = baseX;
    for (let i = 1; i < selectGroup.length; i++) {
      baseY = baseY + selectGroup[i - 1].height + flowConfig.defaultStyle.alignSpacing.vertical;
      baseX = firstX + utils.div(selectGroup[0].width, 2) - utils.div(selectGroup[i].width, 2);
      let f = nodeList.filter((n) => n.id === selectGroup[i].id)[0];
      f.tx = baseX;
      f.ty = baseY;
      props.plumb.animate(
        selectGroup[i].id,
        { top: baseY, left: baseX },
        {
          duration: flowConfig.defaultStyle.alignDuration,
          complete: function () {
            f.x = f.tx;
            f.y = f.ty;
          },
        },
      );
    }
  }

  // 垂直右对齐
  function verticalRight() {
    if (!checkAlign()) return;
    let nodeList = props.flowData.nodeList;
    let selectGroup = currentSelectGroup.value;
    let baseX = selectGroup[0].x;
    let baseY = selectGroup[0].y;
    let firstX = baseX;
    for (let i = 1; i < selectGroup.length; i++) {
      baseY = baseY + selectGroup[i - 1].height + flowConfig.defaultStyle.alignSpacing.vertical;
      baseX = firstX + selectGroup[0].width - selectGroup[i].width;
      let f = nodeList.filter((n) => n.id === selectGroup[i].id)[0];
      f.tx = baseX;
      f.ty = baseY;
      props.plumb.animate(
        selectGroup[i].id,
        { top: baseY, left: baseX },
        {
          duration: flowConfig.defaultStyle.alignDuration,
          complete: function () {
            f.x = f.tx;
            f.y = f.ty;
          },
        },
      );
    }
  }

  // 水平上对齐
  function levelUp() {
    if (!checkAlign()) return;
    let nodeList = props.flowData.nodeList;
    let selectGroup = currentSelectGroup.value;
    let baseX = selectGroup[0].x;
    let baseY = selectGroup[0].y;
    for (let i = 1; i < selectGroup.length; i++) {
      baseX = baseX + selectGroup[i - 1].width + flowConfig.defaultStyle.alignSpacing.level;
      let f = nodeList.filter((n) => n.id === selectGroup[i].id)[0];
      f.tx = baseX;
      f.ty = baseY;
      props.plumb.animate(
        selectGroup[i].id,
        { top: baseY, left: baseX },
        {
          duration: flowConfig.defaultStyle.alignDuration,
          complete: function () {
            f.x = f.tx;
            f.y = f.ty;
          },
        },
      );
    }
  }

  // 水平居中
  function levelCenter() {
    if (!checkAlign()) return;
    let nodeList = props.flowData.nodeList;
    let selectGroup = currentSelectGroup.value;
    let baseX = selectGroup[0].x;
    let baseY = selectGroup[0].y;
    let firstY = baseY;
    for (let i = 1; i < selectGroup.length; i++) {
      baseY = firstY + utils.div(selectGroup[0].height, 2) - utils.div(selectGroup[i].height, 2);
      baseX = baseX + selectGroup[i - 1].width + flowConfig.defaultStyle.alignSpacing.level;
      let f = nodeList.filter((n) => n.id === selectGroup[i].id)[0];
      f.tx = baseX;
      f.ty = baseY;
      props.plumb.animate(
        selectGroup[i].id,
        { top: baseY, left: baseX },
        {
          duration: flowConfig.defaultStyle.alignDuration,
          complete: function () {
            f.x = f.tx;
            f.y = f.ty;
          },
        },
      );
    }
  }

  // 水平下对齐
  function levelDown() {
    if (!checkAlign()) return;
    let nodeList = props.flowData.nodeList;
    let selectGroup = currentSelectGroup.value;
    let baseX = selectGroup[0].x;
    let baseY = selectGroup[0].y;
    let firstY = baseY;
    for (let i = 1; i < selectGroup.length; i++) {
      baseY = firstY + selectGroup[0].height - selectGroup[i].height;
      baseX = baseX + selectGroup[i - 1].width + flowConfig.defaultStyle.alignSpacing.level;
      let f = nodeList.filter((n) => n.id === selectGroup[i].id)[0];
      f.tx = baseX;
      f.ty = baseY;
      props.plumb.animate(
        selectGroup[i].id,
        { top: baseY, left: baseX },
        {
          duration: flowConfig.defaultStyle.alignDuration,
          complete: function () {
            f.x = f.tx;
            f.y = f.ty;
          },
        },
      );
    }
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
  function getConnectionsByNodeId(nodeId) {
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
    let nodeList = props.flowData.nodeList;
    let linkList = props.flowData.linkList;
    let arr: INode[] = [];

    arr.push(Object.assign({}, unref(currentSelect) as INode));

    props.flowData.status = flowConfig.flowStatus.LOADING;

    arr.forEach((c) => {
      let conns = getConnectionsByNodeId(c.id);
      conns.forEach((conn) => {
        linkList.splice(
          linkList.findIndex(
            (link) => link.sourceId === conn.sourceId && link.targetId === conn.targetId,
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
      let inx = nodeList.findIndex((node) => node.id === c.id);
      nodeList.splice(inx, 1);
    });
    props.flowData.status = flowConfig.flowStatus.CREATE;
    selectContainer();
  }

  // 点击画布
  function containerHandler() {
    selectContainer();
  }
  // 清除面布已选内容
  function selectContainer() {
    currentSelect.value = {} as INode | ILink;
    // 开启快捷键
    emits('getShortcut');
  }
  // 是否为多选行为
  function isMultiple(callback) {
    callback(rectangleMultiple.flag);
  }
  // 更新组节点信息
  function updateNodePos() {
    let nodeList = props.flowData.nodeList;
    currentSelectGroup.value.forEach((node) => {
      let dom = document.querySelector('#' + node.id) as HTMLElement;
      let l = parseInt(dom?.style?.left);
      let t = parseInt(dom?.style?.top);
      let f = nodeList.filter((n) => n.id === node.id)[0];
      f.x = l;
      f.y = t;
    });
  }

  // 计算辅助线
  function alignForLine(e) {
    if (props.selectGroup.length > 1) return;
    if (container.auxiliaryLine.controlFnTimesFlag) {
      let elId = e.el.id;
      let nodeList = props.flowData.nodeList;
      nodeList.forEach((node) => {
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
