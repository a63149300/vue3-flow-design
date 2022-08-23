<template>
  <a-list :grid="{ gutter: 0, column: 1 }">
    <a-list-item v-for="node in nodeList" :key="node.type">
      <a-tooltip :title="node.nodeName" placement="right">
        <div class="node-item" draggable="true" @dragstart="dragNode(node.type, belongTo)">
          <component :is="node.icon" />
        </div>
      </a-tooltip>
    </a-list-item>
  </a-list>
</template>
<script lang="ts" setup>
  import { PropType } from 'vue';
  import { IElement } from '/@/type/index';
  import { NodeTypeEnum } from '/@/type/enums';

  defineProps({
    nodeList: {
      type: Array as PropType<IElement[]>,
      default: () => [],
    },
    belongTo: {
      type: String as PropType<NodeTypeEnum>,
      default: '',
    },
  });

  const emits = defineEmits(['setDragInfo']);

  // 开始拖拽
  function dragNode(type: string, belongTo: string) {
    emits('setDragInfo', {
      type,
      belongTo,
    });
  }
</script>
