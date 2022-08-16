<template>
  <a-modal
    title="快捷键大全"
    width="600px"
    :visible="modalVisible"
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
  import { ref } from 'vue';
  import { flowConfig } from '/@/config/args-config';
  import { IShortcut } from '/@/type/index';

  const modalVisible = ref<boolean>(false);

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

  const dataSource = ref<IShortcut[]>([]);

  function open() {
    modalVisible.value = true;
    dataSource.value = Object.values(flowConfig.shortcut);
  }

  function close() {
    modalVisible.value = false;
    dataSource.value = [];
  }

  defineExpose({
    open,
  });
</script>
