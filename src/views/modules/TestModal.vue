<template>
  <div>
    <a-drawer title="测试" placement="right" :width="600" :visible="testVisible" @close="onClose">
      <div>当前的flowData:</div>
      <json-viewer :value="flowData" :expand-depth="3" boxed copyable />

      <div style="margin-top: 12px">暂存:</div>
      <a-textarea
        :autoSize="{ minRows: 10, maxRows: 100 }"
        :value="flowDataJson"
        @change="editFlowDataJson"
      />

      <a-divider />
      <a-button @click="tempSave" :style="{ marginRight: '8px' }">暂存</a-button>
      <a-button @click="onLoad" type="primary">加载(暂存中的json数据)</a-button>
    </a-drawer>
  </div>
</template>

<script lang="ts" setup>
  import { ref, unref } from 'vue';
  import { JsonViewer } from 'vue3-json-viewer';
  import { flowConfig } from '/@/config/args-config';
  import 'vue3-json-viewer/dist/index.css';

  const emits = defineEmits(['loadFlow']);

  const testVisible = ref<boolean>(false);
  const flowData = ref({});
  const flowDataJson = ref<string>('');

  function onClose() {
    testVisible.value = false;
  }

  // 编辑框
  function editFlowDataJson(e) {
    flowDataJson.value = e.target.value;
  }

  // 暂存
  function tempSave() {
    let tempObj = Object.assign({}, unref(flowData));
    tempObj.status = flowConfig.flowStatus.SAVE;
    flowDataJson.value = JSON.stringify(tempObj);
  }

  // 加载(暂存中的json数据)
  function onLoad() {
    emits('loadFlow', unref(flowDataJson));
    onClose();
  }

  defineExpose({
    flowData,
    testVisible,
  });
</script>

<style></style>
