<template>
  <div style="width: 100%; height: 100%; overflow: hidden; position: relative;" @dragover="null" @drop="null">
    <!--辅助线X-->
    <div v-if="
      container.auxiliaryLine.isOpen && container.auxiliaryLine.isShowXLine
    " class="auxiliary-line-x" :style="{ top: auxiliaryLinePos.y + 'px' }"></div>
    <!--辅助线Y-->
    <div v-if="
      container.auxiliaryLine.isOpen && container.auxiliaryLine.isShowYLine
    " class="auxiliary-line-y" :style="{ left: auxiliaryLinePos.x + 'px' }"></div>
    <div id="flowContainer" class="flow-container" :class="{
      grid: flowData.config.showGrid,
      zoomIn: currentTool.type === 'zoom-in',
      zoomOut: currentTool.type === 'zoom-out',
      canScale: container.scaleFlag,
      canDrag: container.dragFlag,
      canMultiple: rectangleMultiple.flag
    }" :style="gridStyle" @click.stop="null" @mousedown="null" @mousemove="null"
      @mouseup="null" @mousewheel="null" @DOMMouseScroll="null"
      @contextmenu="null">
      <div class="rectangle-multiple" v-if="rectangleMultiple.flag && rectangleMultiple.multipling" :style="{
        top: rectangleMultiple.position.top + 'px',
        left: rectangleMultiple.position.left + 'px',
        width: rectangleMultiple.width + 'px',
        height: rectangleMultiple.height + 'px'
      }"></div>
    </div>
    <div class="container-scale">
      <a-button icon="zoom-in" size="small" type="default" @click="null"></a-button>
      <span>{{ container.scaleShow }}% </span>
      <a-button icon="zoom-out" size="small" type="default" @click="null"></a-button>
    </div>
    <div class="mouse-position">
      x: {{ mouse.position.x }}, y: {{ mouse.position.y }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, computed } from 'vue'
import { flowConfig } from "../config/args-config";
import { utils } from "../utils/common";

const props = defineProps([
  "browserType",
  "flowData",
  "plumb",
  "select",
  "selectGroup",
  "currentTool",
  "dragInfo"
])

const ctx = ref(null);

const currentSelect = ref(props.select);

const currentSelectGroup = ref(props.selectGroup);

const container = reactive({
  pos: {
    top: -4000,
    left: -4000
  },
  dragFlag: false,
  draging: false,
  scale: flowConfig.defaultStyle.containerScale.init,
  scaleFlag: false,
  scaleOrigin: {
    x: 0,
    y: 0
  },
  scaleShow: utils.mul(flowConfig.defaultStyle.containerScale.init, 100),
  // 辅助线
  auxiliaryLine: {
    isOpen: flowConfig.defaultStyle.isOpenAuxiliaryLine,
    isShowXLine: false,
    isShowYLine: false,
    controlFnTimesFlag: true
  }
})

// 辅助线位置
const auxiliaryLinePos = reactive({
  x: 0,
  y: 0
})

const mouse = reactive({
  position: {
    x: 0,
    y: 0
  },
  // 鼠标点击起始位置
  tempPos: {
    x: 0,
    y: 0
  }
})

// 鼠标划框多选
const rectangleMultiple = reactive({
  flag: false, // 是否按了ctrl键
  multipling: false,
  position: {
    top: 0,
    left: 0
  },
  height: 0,
  width: 0
})

const containerContextMenuData = flowConfig.contextMenu.container;
const nodeContextMenuData = flowConfig.contextMenu.node;
// 当前聚焦的连接线ID
const tempLinkId = ref('')
// 剪切板内容
const clipboard = []

const gridStyle = computed(() => {
  return {
    top: `${container.pos.top}px`,
    left: `${container.pos.left}px`,
    transform: `scale(${container.scale})`,
    transformOrigin: `${container.scaleOrigin.x}px ${container.scaleOrigin.y}px`
  };
})

</script>
