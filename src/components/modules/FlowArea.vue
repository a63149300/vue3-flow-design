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
      @click.stop="null"
      @mousedown="null"
      @mousemove="null"
      @mouseup="null"
      @mousewheel="null"
      @DOMMouseScroll="null"
      @contextmenu="null"
    >
      <flow-node
        v-for="node in flowData.nodeList"
        :key="node.id"
        :node="node"
        :plumb="plumb"
        v-model:select="currentSelect"
        v-model:selectGroup="currentSelectGroup"
        :currentTool="currentTool"
        @showNodeContextMenu="null"
        @isMultiple="null"
        @updateNodePos="null"
        @alignForLine="null"
        @hideAlignLine="null"
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
      <a-button icon="zoom-in" size="small" type="default" @click="null" />
      <span>{{ container.scaleShow }}% </span>
      <a-button icon="zoom-out" size="small" type="default" @click="null" />
    </div>
    <div class="mouse-position"> x: {{ mouse.position.x }}, y: {{ mouse.position.y }} </div>
  </div>
</template>

<script lang="ts" setup>
  import { reactive, ref, computed } from 'vue';
  import { message } from 'ant-design-vue';
  import { flowConfig } from '../config/args-config';
  import { utils } from '../utils/common';
  import FlowNode from './FlowNode.vue';

  const props = defineProps([
    'browserType',
    'flowData',
    'plumb',
    'select',
    'selectGroup',
    'currentTool',
    'dragInfo',
  ]);

  const emits = defineEmits(['findNodeConfig', 'selectTool', 'getShortcut', 'saveFlow']);

  const ctx = ref(null);

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

  const containerContextMenuData = flowConfig.contextMenu.container;
  const nodeContextMenuData = flowConfig.contextMenu.node;
  // 当前聚焦的连接线ID
  const tempLinkId = ref('');
  // 剪切板内容
  const clipboard = [];

  const gridStyle = computed(() => {
    return {
      top: `${container.pos.top}px`,
      left: `${container.pos.left}px`,
      transform: `scale(${container.scale})`,
      transformOrigin: `${container.scaleOrigin.x}px ${container.scaleOrigin.y}px`,
    };
  });

  // 画布鼠标移动
  function mousemoveHandler(event) {
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

  function allowDrop(e: Event) {
    e.preventDefault();
    mousemoveHandler(e);
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
      newNode.type === 'start' ||
      newNode.type === 'end' ||
      newNode.type === 'event' ||
      newNode.type === 'gateway'
    ) {
      newNode.x = x - 25;
      newNode.width = 50;
    } else {
      newNode.x = x - 60;
      newNode.width = 120;
    }
    newNode.y = y - 25;
    if (newNode.type === 'x-lane') {
      newNode.height = 200;
      newNode.width = 500;
    } else if (newNode.type === 'y-lane') {
      newNode.height = 500;
      newNode.width = 200;
    }
    props.flowData.nodeList.push(newNode);
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
</script>
