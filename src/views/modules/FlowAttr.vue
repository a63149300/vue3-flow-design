<template>
  <a-tabs size="small" defaultActiveKey="flow-attr" :activeKey="activeKey">
    <a-tab-pane key="flow-attr">
      <template #tab>
        <span>
          <component :is="'ClusterOutlined'" />
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
          <component :is="'ProfileOutlined'" />
          节点属性
        </span>
      </template>
      <template v-if="currentSelect.type === CommonNodeTypeEnum.START">
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
              :value="(currentSelect as INode)?.nodeName"
              @change="nodeNameChange"
            />
          </a-form-item>
        </a-form>
      </template>
      <template v-if="currentSelect.type === CommonNodeTypeEnum.END">
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
              :value="(currentSelect as INode)?.nodeName"
              @change="nodeNameChange"
            />
          </a-form-item>
        </a-form>
      </template>
      <template v-if="currentSelect.type === CommonNodeTypeEnum.COMMON">
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
              :value="(currentSelect as INode)?.nodeName"
              @change="nodeNameChange"
            />
          </a-form-item>
        </a-form>
      </template>
      <template v-else-if="currentSelect.type === CommonNodeTypeEnum.FREEDOM">
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
              :value="(currentSelect as INode)?.nodeName"
              @change="nodeNameChange"
            />
          </a-form-item>
        </a-form>
      </template>
      <template v-else-if="currentSelect.type === CommonNodeTypeEnum.EVENT">
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
              :value="(currentSelect as INode)?.nodeName"
              @change="nodeNameChange"
            />
          </a-form-item>
        </a-form>
      </template>
      <template v-else-if="currentSelect.type === CommonNodeTypeEnum.GATEWAY">
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
              :value="(currentSelect as INode)?.nodeName"
              @change="nodeNameChange"
            />
          </a-form-item>
        </a-form>
      </template>
      <template v-else-if="currentSelect.type === HighNodeTypeEnum.CHILD_FLOW">
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
              :value="(currentSelect as INode)?.nodeName"
              @change="nodeNameChange"
            />
          </a-form-item>
        </a-form>
      </template>
      <template
        v-else-if="
          currentSelect.type === LaneNodeTypeEnum.X_LANE ||
          currentSelect.type === LaneNodeTypeEnum.Y_LANE
        "
      >
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
              :value="(currentSelect as INode)?.nodeName"
              @change="nodeNameChange"
            />
          </a-form-item>
        </a-form>
      </template>
    </a-tab-pane>
    <a-tab-pane key="link-attr">
      <template #tab>
        <span>
          <component :is="'BranchesOutlined'" />
          连线属性
        </span>
      </template>
      <a-form layout="vertical">
        <a-form-item label="id">
          <a-input :value="currentSelect.id" disabled />
        </a-form-item>
        <a-form-item label="源节点">
          <a-input :value="(currentSelect as ILink)?.sourceId" disabled />
        </a-form-item>
        <a-form-item label="目标节点">
          <a-input :value="(currentSelect as ILink)?.targetId" disabled />
        </a-form-item>
        <a-form-item label="文本">
          <a-input :value="(currentSelect as ILink)?.label" @change="linkLabelChange" />
        </a-form-item>
      </a-form>
    </a-tab-pane>
  </a-tabs>
</template>

<script lang="ts" setup>
  import { ref, watch, unref, PropType } from 'vue';
  import { CommonNodeTypeEnum, HighNodeTypeEnum, LaneNodeTypeEnum } from '/@/type/enums';
  import { INode, ILink } from '/@/type/index';

  const props = defineProps({
    plumb: {
      type: Object,
      default: () => ({}),
    },
    flowData: {
      type: Object,
      default: () => ({}),
    },
    select: {
      type: Object as PropType<INode | ILink>,
      default: () => ({}),
    },
  });

  const emits = defineEmits(['update:select']);

  const currentSelect = ref<INode | ILink>(props.select);

  const activeKey = ref<string>('flow-attr');

  function nodeNameChange(e) {
    (currentSelect.value as INode).nodeName = e.target.value;
  }

  function linkLabelChange(e) {
    let label = e.target.value;
    (currentSelect.value as ILink).label = label;
    let conn = props.plumb.getConnections({
      source: (unref(currentSelect) as ILink).sourceId,
      target: (unref(currentSelect) as ILink).targetId,
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
