<template>
  <a-drawer
    title="设置"
    :zIndex="1001"
    placement="right"
    :width="500"
    :visible="settingVisible"
    @close="close"
  >
    <a-form layout="horizontal">
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
        <div @click="handleColorPicker">
          <color-picker v-model:pureColor="flowConfig.jsPlumbInsConfig.PaintStyle.stroke" />
        </div>
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
          v-model:checked="flowConfig.defaultStyle.isOpenAuxiliaryLine"
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
  import { reactive, watch } from 'vue';
  import { ColorPicker } from 'vue3-colorpicker';
  import 'vue3-colorpicker/style.css';

  const props = defineProps({
    config: {
      type: Object,
      default: () => ({}),
    },
    settingVisible: {
      type: Boolean,
      default: false,
    },
  });

  const emits = defineEmits(['update:config', 'update:settingVisible']);

  const flowConfig = reactive(props.config);

  const formItemLayout = reactive({
    labelCol: { span: 7 },
    wrapperCol: { span: 16 },
  });

  function close() {
    emits('update:settingVisible', false);
  }

  // 手动触发resize，修复ColorPicker位置
  function handleColorPicker() {
    const myEvent = new Event('resize');
    window.dispatchEvent(myEvent);
  }

  function formatterContainerOnceNarrow(v: number) {
    return `${v * 100}%`;
  }

  function formatterContainerOnceEnlarge(v: number) {
    return `${v * 100}%`;
  }

  watch(
    () => flowConfig,
    (val) => {
      emits('update:config', val);
    },
  );
</script>
