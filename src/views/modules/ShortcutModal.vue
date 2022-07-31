<template>
  <a-modal
    title="快捷键大全"
    width="60%"
    :visible="modalVisible"
    okText="确认"
    cancelText="取消"
    wrapClassName="shortcutModal"
    @ok="saveSetting"
    @cancel="cancel"
  >
    <a-table size="small" rowKey="code" :columns="columns" :dataSource="dataSource" />
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
    let obj = Object.assign({}, flowConfig.shortcut);
    for (let k in obj) {
      dataSource.value.push(obj[k]);
    }
  }

  function close() {
    dataSource.value = [];
    modalVisible.value = false;
  }

  function saveSetting() {
    close();
  }

  function cancel() {
    close();
  }

  defineExpose({
    open,
  });
</script>
