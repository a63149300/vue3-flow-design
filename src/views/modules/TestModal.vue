<template>
  <a-drawer title="测试" placement="right" :width="600" :visible="testVisible" @close="onClose">
    <div>当前的flowData:</div>
    <json-viewer :value="flowData" :expand-depth="3" boxed copyable v-if="testVisible" />

    <div style="margin-top: 16px">暂存:</div>
    <a-textarea
      :autoSize="{ minRows: 6, maxRows: 100 }"
      :value="flowDataJson"
      @change="editFlowDataJson"
    />

    <a-divider />
    <a-button @click="tempSave" style="margin-right: 8px">暂存</a-button>
    <a-button @click="onLoad" type="primary">加载(暂存中的json数据)</a-button>
  </a-drawer>
</template>

<script lang="ts" setup>
  import { ref, unref } from 'vue';
  import { JsonViewer } from 'vue3-json-viewer';
  import 'vue3-json-viewer/dist/index.css';
  import { ChangeEvent } from 'ant-design-vue/lib/_util/EventInterface';
  import { FlowStatusEnum } from '/@/type/enums';

  const props = defineProps({
    testVisible: {
      type: Boolean,
      default: false,
    },
    flowData: {
      type: Object,
      default: () => ({}),
    },
  });

  const emits = defineEmits(['loadFlow', 'update:testVisible']);

  const flowDataJson = ref<string>();

  function onClose() {
    emits('update:testVisible', false);
  }

  // 编辑框
  function editFlowDataJson(e: ChangeEvent) {
    flowDataJson.value = e.target.value;
  }

  // 暂存
  function tempSave() {
    let tempObj = Object.assign({}, props.flowData);
    tempObj.status = FlowStatusEnum.SAVE;
    flowDataJson.value = JSON.stringify(tempObj);
  }

  // 加载(暂存中的json数据)
  function onLoad() {
    emits('loadFlow', unref(flowDataJson));
    onClose();
  }
</script>
