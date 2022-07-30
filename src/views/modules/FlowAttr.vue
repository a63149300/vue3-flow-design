<template>
  <a-tabs size="small" defaultActiveKey="flow-attr" v-model:activeKey="activeKey">
    <a-tab-pane key="flow-attr">
      <template #tab>
        <span>
          <ClusterOutlined />
          流程属性
        </span>
      </template>
      <a-form layout="vertical">
        <a-form-item label="流程id">
          <a-input :value="flowData.attr.id" disabled />
        </a-form-item>
      </a-form>
    </a-tab-pane>
    <a-tab-pane key="node-attr">
      <template #tab>
        <span>
          <ProfileOutlined />
          节点属性
        </span>
      </template>
      <template v-if="currentSelect.type === 'start'">
        <a-form layout="vertical">
          <a-form-item label="类型">
            <a-tag color="purple">{{ currentSelect.type }}</a-tag>
          </a-form-item>
          <a-form-item label="id">
            <a-input :value="currentSelect.id" disabled />
          </a-form-item>
          <a-form-item label="名称">
            <a-input
              placeholder="请输入节点名称"
              :value="currentSelect.nodeName"
              @change="nodeNameChange"
            />
          </a-form-item>
        </a-form>
      </template>
      <template v-if="currentSelect.type === 'end'">
        <a-form layout="vertical">
          <a-form-item label="类型">
            <a-tag color="purple">{{ currentSelect.type }}</a-tag>
          </a-form-item>
          <a-form-item label="id">
            <a-input :value="currentSelect.id" disabled />
          </a-form-item>
          <a-form-item label="名称">
            <a-input
              placeholder="请输入节点名称"
              :value="currentSelect.nodeName"
              @change="nodeNameChange"
            />
          </a-form-item>
        </a-form>
      </template>
      <template v-if="currentSelect.type === 'common'">
        <a-form layout="vertical">
          <a-form-item label="类型">
            <a-tag color="purple">{{ currentSelect.type }}</a-tag>
          </a-form-item>
          <a-form-item label="id">
            <a-input :value="currentSelect.id" disabled />
          </a-form-item>
          <a-form-item label="名称">
            <a-input
              placeholder="请输入节点名称"
              :value="currentSelect.nodeName"
              @change="nodeNameChange"
            />
          </a-form-item>
        </a-form>
      </template>
      <template v-else-if="currentSelect.type === 'freedom'">
        <a-form layout="vertical">
          <a-form-item label="类型">
            <a-tag color="purple">{{ currentSelect.type }}</a-tag>
          </a-form-item>
          <a-form-item label="id">
            <a-input :value="currentSelect.id" disabled />
          </a-form-item>
          <a-form-item label="名称">
            <a-input
              placeholder="请输入节点名称"
              :value="currentSelect.nodeName"
              @change="nodeNameChange"
            />
          </a-form-item>
        </a-form>
      </template>
      <template v-else-if="currentSelect.type === 'event'">
        <a-form layout="vertical">
          <a-form-item label="类型">
            <a-tag color="purple">{{ currentSelect.type }}</a-tag>
          </a-form-item>
          <a-form-item label="id">
            <a-input :value="currentSelect.id" disabled />
          </a-form-item>
          <a-form-item label="名称">
            <a-input
              placeholder="请输入节点名称"
              :value="currentSelect.nodeName"
              @change="nodeNameChange"
            />
          </a-form-item>
        </a-form>
      </template>
      <template v-else-if="currentSelect.type === 'gateway'">
        <a-form layout="vertical">
          <a-form-item label="类型">
            <a-tag color="purple">{{ currentSelect.type }}</a-tag>
          </a-form-item>
          <a-form-item label="id">
            <a-input :value="currentSelect.id" disabled />
          </a-form-item>
          <a-form-item label="名称">
            <a-input
              placeholder="请输入节点名称"
              :value="currentSelect.nodeName"
              @change="nodeNameChange"
            />
          </a-form-item>
        </a-form>
      </template>
      <template v-else-if="currentSelect.type === 'child-flow'">
        <a-form layout="vertical">
          <a-form-item label="类型">
            <a-tag color="purple">{{ currentSelect.type }}</a-tag>
          </a-form-item>
          <a-form-item label="id">
            <a-input :value="currentSelect.id" disabled />
          </a-form-item>
          <a-form-item label="名称">
            <a-input
              placeholder="请输入节点名称"
              :value="currentSelect.nodeName"
              @change="nodeNameChange"
            />
          </a-form-item>
        </a-form>
      </template>
      <template v-else-if="currentSelect.type === 'x-lane' || currentSelect.type === 'y-lane'">
        <a-form layout="vertical">
          <a-form-item label="类型">
            <a-tag color="purple">{{ currentSelect.type }}</a-tag>
          </a-form-item>
          <a-form-item label="id">
            <a-input :value="currentSelect.id" disabled />
          </a-form-item>
          <a-form-item label="名称">
            <a-input
              placeholder="请输入节点名称"
              :value="currentSelect.nodeName"
              @change="nodeNameChange"
            />
          </a-form-item>
        </a-form>
      </template>
    </a-tab-pane>
    <a-tab-pane key="link-attr">
      <template #tab>
        <span>
          <BranchesOutlined />
          连线属性
        </span>
      </template>
      <a-form layout="vertical">
        <a-form-item label="id">
          <a-input :value="currentSelect.id" disabled />
        </a-form-item>
        <a-form-item label="源节点">
          <a-input :value="currentSelect.sourceId" disabled />
        </a-form-item>
        <a-form-item label="目标节点">
          <a-input :value="currentSelect.targetId" disabled />
        </a-form-item>
        <a-form-item label="文本">
          <a-input :value="currentSelect.label" @change="linkLabelChange" />
        </a-form-item>
      </a-form>
    </a-tab-pane>
  </a-tabs>
</template>

<script lang="ts" setup>
  import { ref, watch, unref } from 'vue';
  import { ClusterOutlined, ProfileOutlined, BranchesOutlined } from '@ant-design/icons-vue';

  const props = defineProps({
    plumb: {
      type: Object,
    },
    flowData: {
      type: Object,
    },
    select: {
      type: Object,
    },
  });

  const emits = defineEmits(['update:select']);

  const currentSelect = ref(props.select);

  const activeKey = ref<string>('flow-attr');

  function nodeNameChange(e) {
    currentSelect.value.nodeName = e.target.value;
  }

  function linkLabelChange(e) {
    let label = e.target.value;
    currentSelect.value.label = label;
    let conn = props.plumb.getConnections({
      source: unref(currentSelect).sourceId,
      target: unref(currentSelect).targetId,
    })[0];
    let link_id = conn.canvas.id;
    let labelHandle = (e) => {
      let event = window.event || e;
      event.stopPropagation();
      currentSelect.value = props.flowData.linkList.filter((l) => l.id === link_id)[0];
    };

    if (label !== '') {
      conn.setLabel({
        label: label,
        cssClass: `linkLabel ${link_id}`,
      });
      // 添加label点击事件
      document.querySelector('.' + link_id)?.addEventListener('click', labelHandle);
    } else {
      // 移除label点击事件
      document.querySelector('.' + link_id)?.removeEventListener('click', labelHandle);

      let labelOverlay = conn.getLabelOverlay();
      if (labelOverlay) conn.removeOverlay(labelOverlay.id);
    }
  }

  watch(
    () => props.select,
    (val) => {
      currentSelect.value = val;
      if (unref(currentSelect)?.type === 'link') {
        activeKey.value = 'link-attr';
      } else if (!unref(currentSelect)?.type) {
        activeKey.value = 'flow-attr';
      } else {
        activeKey.value = 'node-attr';
      }
    },
    { deep: true },
  );

  watch(
    () => currentSelect,
    (currentSelect) => {
      emits('update:select', currentSelect.value);
    },
    { deep: true },
  );
</script>
