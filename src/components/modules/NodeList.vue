<template>
  <a-list :grid="{ gutter: 0, column: 1 }">
    <a-list-item v-for="node in nodeList" :key="node.type">
      <a-tooltip :title="node.nodeName" placement="right">
        <div class="node-item" draggable="true" @dragstart="dragNode(node.type, type)">
          <component :is="$antIcons[node.icon]"></component>
        </div>
      </a-tooltip>
    </a-list-item>
  </a-list>
</template>
<script lang="ts" setup>
const props = defineProps({
  nodeList: {
    type: Array,
    default: () => [],
  },
  type: {
    type: String,
    default: "",
  },
});

const emits = defineEmits(["setDragInfo"]);

// 开始拖拽
function dragNode(type, belongTo) {
  emits("setDragInfo", {
    type,
    belongTo,
  });
}
</script>
<style scoped lang="less"></style>
