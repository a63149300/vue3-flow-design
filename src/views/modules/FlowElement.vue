<template>
  <a-layout-sider width="44" class="flow-element">
    <a-row>
      <div class="tab">基础</div>
      <element-list
        :nodeList="commonNodes"
        :belongTo="NodeTypeEnum.Common_Node_Type"
        @setDragInfo="setDragInfo"
      />
    </a-row>
    <a-row>
      <div class="tab">高级</div>
      <element-list
        :nodeList="highNodes"
        :belongTo="NodeTypeEnum.High_Node_Type"
        @setDragInfo="setDragInfo"
      />
    </a-row>
    <a-row>
      <div class="tab">泳道</div>
      <element-list
        :nodeList="laneNodes"
        :belongTo="NodeTypeEnum.Lane_Node_Type"
        @setDragInfo="setDragInfo"
      />
    </a-row>
  </a-layout-sider>
</template>

<script lang="ts" setup>
  import ElementList from './ElementList.vue';
  import { commonNodes, highNodes, laneNodes } from '/@/config/basic-node-config';
  import { IDragInfo } from '/@/type/index';
  import { NodeTypeEnum } from '/@/type/enums';

  const emits = defineEmits(['setDragInfo']);

  // 设置dragInfo
  function setDragInfo(info: IDragInfo) {
    emits('setDragInfo', info);
  }
</script>
