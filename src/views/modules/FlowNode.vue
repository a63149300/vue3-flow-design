<template>
  <div
    v-if="
      node.type === CommonNodeType.START ||
      node.type === CommonNodeType.END ||
      node.type === CommonNodeType.EVENT
    "
    :id="node.id"
    class="common-circle-node"
    :class="{
      active: isActive(),
      isStart: node.type === CommonNodeType.START,
      isEnd: node.type === CommonNodeType.END,
    }"
    :style="{
      top: node.y + 'px',
      left: node.x + 'px',
      cursor: setCursor(currentTool.type),
    }"
    @click.stop="selectNode"
    @contextmenu.stop="showNodeContextMenu"
  >
    {{ node.nodeName }}
  </div>

  <div
    v-else-if="
      node.type === CommonNodeType.COMMON ||
      node.type === CommonNodeType.FREEDOM ||
      node.type === HighNodeType.CHILD_FLOW
    "
    :id="node.id"
    class="common-rectangle-node"
    :class="{ active: isActive() }"
    :style="{
      top: node.y + 'px',
      left: node.x + 'px',
      cursor: setCursor(currentTool.type),
    }"
    @click.stop="selectNode"
    @contextmenu.stop="showNodeContextMenu"
  >
    <component :is="setIcon(node.type)" class="node-icon" />
    {{ node.nodeName }}
  </div>

  <div
    v-else-if="node.type === CommonNodeType.GATEWAY"
    :id="node.id"
    class="common-diamond-node"
    :class="{ active: isActive() }"
    :style="{
      top: node.y + 'px',
      left: node.x + 'px',
      cursor: setCursor(currentTool.type),
    }"
    @click.stop="selectNode"
    @contextmenu.stop="showNodeContextMenu"
  >
  </div>

  <div
    v-else-if="node.type === LaneNodesType.X_LANE"
    :id="node.id"
    class="common-x_lane-node"
    :class="{ active: isActive() }"
    :style="{
      top: node.y + 'px',
      left: node.x + 'px',
      height: node.height + 'px',
      width: node.width + 'px',
    }"
  >
    <div
      class="lane-text-div"
      :style="{ cursor: setCursor(currentTool.type) }"
      @click.stop="selectNode"
      @contextmenu.stop="showNodeContextMenu"
    >
      <span class="lane-text">{{ node.nodeName }}</span>
    </div>
  </div>

  <div
    v-else-if="node.type === LaneNodesType.Y_LANE"
    :id="node.id"
    class="common-y_lane-node"
    :class="{ active: isActive() }"
    :style="{
      top: node.y + 'px',
      left: node.x + 'px',
      height: node.height + 'px',
      width: node.width + 'px',
    }"
  >
    <div
      class="lane-text-div"
      :style="{ cursor: setCursor(currentTool.type) }"
      @click.stop="selectNode"
      @contextmenu.stop="showNodeContextMenu"
    >
      <span class="lane-text">{{ node.nodeName }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, unref, watch, onMounted, PropType } from 'vue';
  import { Resizable } from 'resizable-dom';
  import { flowConfig } from '/@/config/args-config';
  import { CommonNodeType, HighNodeType, LaneNodesType } from '/@/type/enums';
  import { INode, ILink, IElement } from '/@/type/index';

  const props = defineProps({
    select: {
      type: Object as PropType<INode | ILink>,
      default: () => ({}),
    },
    selectGroup: {
      type: Array as PropType<INode[]>,
      default: () => [],
    },
    node: {
      type: Object as PropType<INode>,
      default: () => ({}),
    },
    plumb: {
      type: Object,
      default: () => ({}),
    },
    currentTool: {
      type: Object as PropType<IElement>,
      default: () => ({}),
    },
  });

  const emits = defineEmits([
    'update:select',
    'update:selectGroup',
    'alignForLine',
    'updateNodePos',
    'hideAlignLine',
    'isMultiple',
    'showNodeContextMenu',
  ]);

  let currentSelect = ref(props.select);

  let currentSelectGroup = ref(props.selectGroup);

  // 设置ICON
  function setIcon(type: string) {
    switch (type) {
      case CommonNodeType.COMMON:
        return 'UserOutlined';
      case CommonNodeType.FREEDOM:
        return 'SyncOutlined';
      case HighNodeType.CHILD_FLOW:
        return 'ApartmentOutlined';
      default:
        return 'ToolOutlined';
    }
  }
  // 设置鼠标样式
  function setCursor(type: string) {
    switch (type) {
      case 'drag':
        return 'move';
      case 'connection':
        return 'crosshair';
      default:
        return 'default';
    }
  }

  // 初始节点拖拽
  function registerNode() {
    props?.plumb?.draggable(props.node.id, {
      containment: 'parent',
      handle: (e, el) => {
        // 判断节点类型
        let possibles = el.parentNode.querySelectorAll(
          '.common-circle-node,.common-rectangle-node,.common-diamond-node,.lane-text-div',
        );
        for (let i = 0; i < possibles.length; i++) {
          if (possibles[i] === el || e.target.className === 'lane-text') return true;
        }
        return false;
      },
      grid: flowConfig.defaultStyle.alignGridPX,
      drag: (e) => {
        if (flowConfig.defaultStyle.isOpenAuxiliaryLine) {
          emits('alignForLine', e);
        }
      },
      stop: (e) => {
        props.node.x = e.pos[0];
        props.node.y = e.pos[1];
        // 是否为组
        if (currentSelectGroup.value.length > 1) {
          // 更新组节点信息
          emits('updateNodePos');
        }
        // 隐藏辅助线
        emits('hideAlignLine');
      },
    });

    if (props.node.type === LaneNodesType.X_LANE || props.node.type === LaneNodesType.Y_LANE) {
      let node = document.querySelector('#' + props.node.id) as HTMLElement;
      new Resizable(
        node,
        {
          handles: ['e', 'w', 'n', 's', 'nw', 'ne', 'sw', 'se'],
          initSize: {
            maxWidth: 1000,
            maxHeight: 1000,
            minWidth: 200,
            minHeight: 200,
          },
        },
        () => {
          props.node.height = Math.ceil(parseInt(node.style.height));
          props.node.width = Math.ceil(parseInt(node.style.width));
        },
      );
    }
    currentSelect.value = props.node;
    currentSelectGroup.value = [];
  }
  // 点击节点
  function selectNode() {
    currentSelect.value = props.node;
    emits('isMultiple', (flag) => {
      if (!flag) {
        currentSelectGroup.value = [];
      } else {
        let f = unref(currentSelectGroup).filter((s) => s.id === props.node.id);
        if (f.length <= 0) {
          props.plumb.addToDragSelection(props.node.id);
          currentSelectGroup.value.push(props.node);
        }
      }
    });
  }
  // 节点右键
  function showNodeContextMenu(e) {
    emits('showNodeContextMenu', e);
    selectNode();
  }
  // 节点是否激活
  function isActive() {
    if (!unref(currentSelect)) {
      return false;
    }
    if (unref(currentSelect).id === props.node.id) return true;
    let f = unref(currentSelectGroup).find((n) => n.id === props.node.id);
    return !!f;
  }

  watch(
    () => props.select,
    (val) => {
      currentSelect.value = val;
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
    },
  );

  watch(
    () => currentSelectGroup,
    (currentSelectGroup) => {
      emits('update:selectGroup', currentSelectGroup.value);
    },
  );

  onMounted(() => {
    registerNode();
  });
</script>
