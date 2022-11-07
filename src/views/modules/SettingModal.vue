<template>
  <a-drawer
    title="设置"
    :zIndex="1001"
    placement="right"
    :width="500"
    :visible="settingVisible"
    @close="close"
  >
    <template #footer>
      <div class="setting-btn">
        <div>
          <a-button @click="close">取消</a-button>
        </div>
        <div>
          <a-button @click="setDefault" class="default-btn">恢复默认</a-button>
          <a-button type="primary" @click="handleSubmit">确定</a-button>
        </div>
      </div>
    </template>

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
          :tipFormatter="formatOnceNarrow"
          v-model:value="settingConfig.containerScale.onceNarrow"
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
          :tipFormatter="formatOnceEnlarge"
          v-model:value="settingConfig.containerScale.onceEnlarge"
        />
      </a-form-item>

      <a-divider orientation="left">连线</a-divider>
      <a-form-item
        label="类型"
        :label-col="formItemLayout.labelCol"
        :wrapper-col="formItemLayout.wrapperCol"
      >
        <a-select v-model:value="settingConfig.cls.linkType">
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
          <color-picker v-model:pureColor="settingConfig.cls.linkColor" />
        </div>
      </a-form-item>
      <a-form-item
        label="粗细"
        :label-col="formItemLayout.labelCol"
        :wrapper-col="formItemLayout.wrapperCol"
      >
        <a-slider :min="1" :max="10" v-model:value="settingConfig.cls.linkThickness" />
      </a-form-item>

      <a-divider orientation="left">其它设置</a-divider>

      <a-form-item
        label="辅助线"
        :label-col="formItemLayout.labelCol"
        :wrapper-col="formItemLayout.wrapperCol"
      >
        <a-switch
          checkedChildren="开"
          unCheckedChildren="关"
          v-model:checked="settingConfig.other.isOpenAuxiliaryLine"
        />
      </a-form-item>
      <a-form-item
        label="自动对齐水平间距"
        :label-col="formItemLayout.labelCol"
        :wrapper-col="formItemLayout.wrapperCol"
      >
        <a-slider :min="10" :max="800" :step="5" v-model:value="settingConfig.other.horizontal" />
      </a-form-item>
      <a-form-item
        label="自动对齐垂直间距"
        :label-col="formItemLayout.labelCol"
        :wrapper-col="formItemLayout.wrapperCol"
      >
        <a-slider :min="10" :max="800" :step="5" v-model:value="settingConfig.other.vertical" />
      </a-form-item>
      <a-form-item
        label="微移距离"
        :label-col="formItemLayout.labelCol"
        :wrapper-col="formItemLayout.wrapperCol"
      >
        <a-slider :min="1" v-model:value="settingConfig.other.movePx" />
      </a-form-item>
    </a-form>
  </a-drawer>
</template>

<script lang="ts" setup>
  import { reactive, watch, ref, unref } from 'vue';
  import { ls } from 'vue-lsp';
  import { message } from 'ant-design-vue';
  import { ColorPicker } from 'vue3-colorpicker';
  import 'vue3-colorpicker/style.css';
  import { cloneDeep } from 'lodash-es';
  import { ISettingConfig } from '/@/type/index';
  import { settingConfig as defaultSettingConfig } from '/@/config/flow';
  import { setFlowConfig } from '/@/utils/common';

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

  const settingConfig = ref<ISettingConfig>(cloneDeep(defaultSettingConfig));

  const flowConfig = ref(props.config);

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

  function formatOnceNarrow(v: number) {
    return `${v * 100}%`;
  }

  function formatOnceEnlarge(v: number) {
    return `${v * 100}%`;
  }

  function handleSubmit() {
    ls.set('settingConfig', unref(settingConfig));
    flowConfig.value = setFlowConfig(unref(flowConfig), unref(settingConfig));
    close();
    message.success('设置成功');
  }

  // 恢复默认
  function setDefault() {
    settingConfig.value = defaultSettingConfig;
  }

  watch(
    () => props.config,
    (config) => {
      flowConfig.value = config;
    },
  );

  watch(
    () => flowConfig.value,
    (config) => {
      emits('update:config', config);
    },
    { deep: true },
  );

  watch(
    () => props.settingVisible,
    (visible) => {
      if (visible) {
        settingConfig.value = ls.get('settingConfig');
      }
    },
  );
</script>

<style scoped lang="less">
  .setting-btn {
    display: flex;
    justify-content: space-between;

    .default-btn {
      margin-right: 10px;
    }
  }
</style>
