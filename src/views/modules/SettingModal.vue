<template>
  <a-drawer
    title="设置"
    placement="right"
    :zIndex="10001"
    :width="600"
    :visible="settingVisible"
    @close="close"
  >
    <a-form :form="settingForm" layout="horizontal">
      <a-divider orientation="left">画布</a-divider>
      <a-form-item
        label="缩小比例"
        :label-col="formItemLayout.labelCol"
        :wrapper-col="formItemLayout.wrapperCol"
      >
        <a-slider
          :min="0.05"
          :max="0.5"
          :step="0.05"
          :tipFormatter="formatterContainerOnceNarrow"
          v-model:value="flowConfig.defaultStyle.containerScale.onceNarrow"
        />
      </a-form-item>
      <a-form-item
        label="放大比例"
        :label-col="formItemLayout.labelCol"
        :wrapper-col="formItemLayout.wrapperCol"
      >
        <a-slider
          :min="0.05"
          :max="0.5"
          :step="0.05"
          :tipFormatter="formatterContainerOnceEnlarge"
          v-model:value="flowConfig.defaultStyle.containerScale.onceEnlarge"
        />
      </a-form-item>

      <a-divider orientation="left">连线</a-divider>
      <a-form-item
        label="类型"
        :label-col="formItemLayout.labelCol"
        :wrapper-col="formItemLayout.wrapperCol"
      >
        <a-select v-model:value="flowConfig.jsPlumbInsConfig.Connector[0]">
          <a-select-option value="Bezier">贝塞尔曲线</a-select-option>
          <a-select-option value="Straight">直线</a-select-option>
          <a-select-option value="Flowchart">流程图线</a-select-option>
          <a-select-option value="StateMachine">状态线</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item
        label="颜色"
        :label-col="formItemLayout.labelCol"
        :wrapper-col="formItemLayout.wrapperCol"
      >
        <!-- <colorPicker
          v-model:value="flowConfig.jsPlumbInsConfig.PaintStyle.stroke"
          @change="setLinkColor"
        /> -->
      </a-form-item>
      <a-form-item
        label="粗细"
        :label-col="formItemLayout.labelCol"
        :wrapper-col="formItemLayout.wrapperCol"
      >
        <a-slider
          :min="1"
          :max="10"
          v-model:value="flowConfig.jsPlumbInsConfig.PaintStyle.strokeWidth"
        />
      </a-form-item>

      <a-divider orientation="left">默认样式</a-divider>

      <a-form-item
        label="辅助线"
        :label-col="formItemLayout.labelCol"
        :wrapper-col="formItemLayout.wrapperCol"
      >
        <a-switch
          checkedChildren="开"
          unCheckedChildren="关"
          v-model:value="flowConfig.defaultStyle.isOpenAuxiliaryLine"
        />
      </a-form-item>
      <a-form-item
        label="自动对齐水平间距"
        :label-col="formItemLayout.labelCol"
        :wrapper-col="formItemLayout.wrapperCol"
      >
        <a-slider
          :min="10"
          :max="800"
          :step="5"
          v-model:value="flowConfig.defaultStyle.alignSpacing.level"
        />
      </a-form-item>
      <a-form-item
        label="自动对齐垂直间距"
        :label-col="formItemLayout.labelCol"
        :wrapper-col="formItemLayout.wrapperCol"
      >
        <a-slider
          :min="10"
          :max="800"
          :step="5"
          v-model:value="flowConfig.defaultStyle.alignSpacing.vertical"
        />
      </a-form-item>
      <a-form-item
        label="微移距离"
        :label-col="formItemLayout.labelCol"
        :wrapper-col="formItemLayout.wrapperCol"
      >
        <a-slider :min="1" v-model:value="flowConfig.defaultStyle.movePx" />
      </a-form-item>
    </a-form>
  </a-drawer>
</template>

<script lang="ts" setup>
  import { reactive, ref } from 'vue';
  import { flowConfig } from '/@/config/args-config';

  const settingVisible = ref<boolean>(false);
  const formItemLayout = reactive({
    labelCol: { span: 6 },
    wrapperCol: { span: 15 },
  });
  let initFlag = false;
  const settingForm = ref(null);

  async function init() {}

  function open() {
    settingVisible.value = true;
    if (!initFlag) {
      init();
      initFlag = true;
    }
  }
  function close() {
    settingVisible.value = false;
  }

  function formatterContainerOnceNarrow(v) {
    return `${v * 100}%`;
  }

  function formatterContainerOnceEnlarge(v) {
    return `${v * 100}%`;
  }

  defineExpose({ open });
</script>

<style>
  .m-colorPicker .box {
    z-index: 10002 !important;
    width: 220px !important;
  }

  .ant-divider-horizontal.ant-divider-with-text,
  .ant-divider-horizontal.ant-divider-with-text-left,
  .ant-divider-horizontal.ant-divider-with-text-right {
    font-weight: 800;
    margin: 24px 0 4px;
  }
</style>
