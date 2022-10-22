<template>
  <a-modal
    title="快捷键大全"
    width="600px"
    :visible="shortcutVisible"
    wrapClassName="shortcutModal"
    :footer="null"
    @cancel="close"
  >
    <a-table
      size="small"
      rowKey="code"
      :columns="columns"
      :dataSource="dataSource"
      :pagination="false"
    />
  </a-modal>
</template>

<script lang="ts" setup>
  import { ref, watch } from 'vue';
  import { shortcutKeys } from '/@/config/args-config';
  import { IShortcutKey } from '/@/type/index';

  const props = defineProps({
    shortcutVisible: {
      type: Boolean,
      default: false,
    },
  });

  const emits = defineEmits(['update:shortcutVisible']);

  const columns = ref([
    {
      title: '功能',
      align: 'center',
      key: 'shortcutName',
      dataIndex: 'shortcutName',
      width: '50%',
    },
    {
      title: '快捷键',
      align: 'center',
      key: 'codeName',
      dataIndex: 'codeName',
      width: '50%',
    },
  ]);

  const dataSource = ref<IShortcutKey[]>([]);

  function close() {
    emits('update:shortcutVisible', false);
  }

  watch(
    () => props.shortcutVisible,
    (visible) => {
      if (visible) {
        dataSource.value = Object.values(shortcutKeys);
      } else {
        dataSource.value = [];
      }
    },
  );
</script>
