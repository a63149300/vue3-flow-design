<template>
  <a-layout class="flow-wrapper">
    <!-- 左侧边组件元素 -->
    <flow-element @setDragInfo="setDragInfo" />
    <a-layout>
      <!-- 工具区 -->
      <Toolbar
        :currentTool="currentTool"
        :flowData="flowData"
        @generateFlowImage="
          generateFlowImage(
            flowAreaRef,
            flowData.nodeList,
            flowConfig.defaultStyle.photoBlankDistance,
            checkFlow,
          )
        "
        @selectTool="selectTool"
        @clear="clear"
        @toggleShowGrid="toggleShowGrid"
        @setting="setting"
        @openTest="openTest"
        @shortcutHelper="shortcutHelper"
        @saveFlow="saveFlow"
      />
      <!-- 画布区 -->
      <a-layout-content class="flow-content">
        <flow-area
          ref="flowAreaRef"
          :dragInfo="dragInfo"
          v-model:data="flowData"
          :config="flowConfig"
          v-model:select="currentSelect"
          v-model:selectGroup="currentSelectGroup"
          :plumb="plumb"
          :currentTool="currentTool"
          @selectTool="selectTool"
          @onShortcutKey="onShortcutKey"
          @saveFlow="saveFlow"
        />
      </a-layout-content>
      <!-- 底部 -->
      <flow-footer />
    </a-layout>
    <a-layout-sider width="250" theme="light" class="attr-area" @mousedown.stop="offShortcutKey">
      <!-- 组件属性区 -->
      <flow-attr :plumb="plumb" :flowData="flowData" v-model:select="currentSelect" />
    </a-layout-sider>
  </a-layout>

  <!-- 生成流程图片 -->
  <a-modal
    :title="'流程设计图_' + flowData.attr.id + '.png'"
    centered
    width="90%"
    :closable="flowImage.closable"
    :maskClosable="flowImage.maskClosable"
    :visible="flowImage.modalVisible"
    okText="下载到本地"
    cancelText="取消"
    @ok="downLoadFlowImage(flowData.attr.id)"
    @cancel="cancelDownLoadFlowImage"
  >
    <img :src="flowImage.url" style="width: 100%" />
  </a-modal>

  <!-- 设置 -->
  <setting-modal ref="settingModalRef" v-model:config="flowConfig" />

  <!-- 快捷键大全 -->
  <ShortcutKeyModal ref="shortcutModalRef" />

  <!-- 测试 -->
  <TestModal v-model:testVisible="testVisible" :flowData="flowData" @loadFlow="loadFlow" />
</template>

<script lang="ts" setup>
  import { jsPlumb, Defaults } from 'jsplumb';
  import { reactive, ref, onMounted, nextTick, unref } from 'vue';
  import { message } from 'ant-design-vue';
  import FlowArea from './modules/FlowArea.vue';
  import FlowAttr from './modules/FlowAttr.vue';
  import SettingModal from './modules/SettingModal.vue';
  import ShortcutKeyModal from './modules/ShortcutKeyModal.vue';
  import TestModal from './modules/TestModal.vue';
  import FlowElement from './modules/FlowElement.vue';
  import Toolbar from './modules/Toolbar.vue';
  import FlowFooter from './modules/FlowFooter.vue';
  import { tools } from '/@/config/basic-node-config';
  import { IDragInfo, INode, ILink, ITool } from '/@/type/index';
  import { ToolsTypeEnum, LaneNodeTypeEnum } from '/@/type/enums';
  import { utils } from '/@/utils/common';
  import { useContextMenu } from '/@/hooks/useContextMenu';
  import { useGenerateFlowImage } from '/@/hooks/useGenerateFlowImage';
  import { useShortcutKey } from '/@/hooks/useShortcutKey';
  import { flowConfig as defaultFlowConfig } from '/@/config/args-config';

  const [createContextMenu] = useContextMenu();

  // 生成流程图片
  const { flowImage, downLoadFlowImage, cancelDownLoadFlowImage, generateFlowImage } =
    useGenerateFlowImage();

  // 快捷键
  const { listenShortcutKey, offShortcutKey, onShortcutKey } = useShortcutKey();

  // 流程配置
  const flowConfig = reactive(defaultFlowConfig);

  // 流程实例
  const plumb = ref();

  // 当前工具类型
  const currentTool = ref<ITool>(tools[0]);

  // 画布Ref
  const flowAreaRef = ref();

  // 设置Ref
  const settingModalRef = ref();

  // 快捷键大全Ref
  const shortcutModalRef = ref();

  // 测试弹窗显隐
  const testVisible = ref<boolean>(false);

  // 流程DSL
  const flowData = reactive<Recordable>({
    nodeList: [],
    linkList: [],
    attr: {
      id: '',
    },
    config: {
      showGrid: true,
      showGridText: '隐藏网格',
      showGridIcon: 'EyeOutlined',
    },
    status: flowConfig.flowStatus.CREATE,
  });

  // 当前选择节点
  const currentSelect = ref<INode | ILink>();

  // 当前选择组
  const currentSelectGroup = ref<INode[]>([]);

  // 拖拽组件元素信息
  const dragInfo = reactive<IDragInfo>({
    type: null,
    belongTo: null,
  });

  // 初始化流程图
  function initFlow() {
    if (flowData.status === flowConfig.flowStatus.CREATE) {
      flowData.attr.id = 'flow-' + utils.getId();
    } else {
      loadFlow();
    }
  }

  // 渲染流程
  async function loadFlow(str = '') {
    clear();
    await nextTick();
    const loadData = JSON.parse(str);
    flowData.attr = loadData.attr;
    flowData.config = loadData.config;
    flowData.status = flowConfig.flowStatus.LOADING;
    unref(plumb).batch(async () => {
      flowData.nodeList = loadData.nodeList;
      await nextTick();
      let linkList = loadData.linkList;
      flowData.linkList = linkList;
      linkList.forEach((link: ILink) => {
        let conn = unref(plumb).connect({
          source: link.sourceId,
          target: link.targetId,
          anchor: flowConfig.jsPlumbConfig.anchor.default,
          connector: [
            link.cls.linkType,
            {
              gap: 5,
              cornerRadius: 8,
              alwaysRespectStubs: true,
            },
          ],
          paintStyle: {
            stroke: link.cls.linkColor,
            strokeWidth: link.cls.linkThickness,
          },
        });
        let link_id = conn.canvas.id;
        let link_dom = document.querySelector('.' + link_id);
        let labelHandle = (e: Event) => {
          e.stopPropagation();
          currentSelect.value = flowData.linkList.find((l: ILink) => l.id === link_id);
        };

        if (link.label !== '') {
          conn.setLabel({
            label: link.label,
            cssClass: `linkLabel ${link_id}`,
          });

          // 添加label点击事件
          link_dom?.addEventListener('click', labelHandle);
        } else {
          // 移除label点击事件
          link_dom?.removeEventListener('click', labelHandle);
        }
      });
      currentSelect.value = undefined;
      currentSelectGroup.value = [];
      flowData.status = flowConfig.flowStatus.MODIFY;
    }, true);

    flowAreaRef.value.container.pos = {
      top: 0,
      left: 0,
    };
  }

  // 实例化JsPlumb
  function initJsPlumb() {
    plumb.value = jsPlumb.getInstance(flowConfig.jsPlumbInsConfig as unknown as Defaults);

    unref(plumb).bind('beforeDrop', (info: Recordable) => {
      let sourceId = info.sourceId;
      let targetId = info.targetId;

      if (sourceId === targetId) return false;
      let notOnlyLink = flowData.linkList.find(
        (link: ILink) => link.sourceId === sourceId && link.targetId === targetId,
      );
      if (notOnlyLink) {
        message.error('同方向的两节点连线只能有一条！');
        return false;
      }
      return true;
    });

    unref(plumb).bind('connection', (conn: Recordable) => {
      let connObj = conn.connection.canvas;
      let o: Recordable = {};
      let id = '';
      let label = '';
      if (
        flowData.status === flowConfig.flowStatus.CREATE ||
        flowData.status === flowConfig.flowStatus.MODIFY
      ) {
        id = 'link-' + utils.getId();
        label = '';
      } else if (flowData.status === flowConfig.flowStatus.LOADING) {
        let l = flowData.linkList[flowData.linkList.length - 1];
        id = l.id;
        label = l.label;
      }
      connObj.id = id;
      o.type = 'link';
      o.id = id;
      o.sourceId = conn.sourceId;
      o.targetId = conn.targetId;
      o.label = label;
      o.cls = {
        linkType: flowConfig.jsPlumbInsConfig.Connector[0],
        linkColor: flowConfig.jsPlumbInsConfig.PaintStyle.stroke,
        linkThickness: flowConfig.jsPlumbInsConfig.PaintStyle.strokeWidth,
      };
      document.querySelector('#' + id)?.addEventListener('contextmenu', (e: Event) => {
        showLinkContextMenu(e);
        currentSelect.value = flowData.linkList.find((l: ILink) => l.id === id);
      });

      document.querySelector('#' + id)?.addEventListener('click', (e: Event) => {
        e.stopPropagation();
        currentSelect.value = flowData.linkList.find((l: Recordable) => l.id === id);
      });

      if (flowData.status !== flowConfig.flowStatus.LOADING) flowData.linkList.push(o);
    });

    unref(plumb).importDefaults({
      ConnectionsDetachable: flowConfig.jsPlumbConfig.conn.isDetachable,
    });
  }

  // 连接线右键
  function showLinkContextMenu(e) {
    e.stopPropagation();
    createContextMenu({
      event: e,
      items: [
        {
          handler: () => {
            deleteLink();
          },
          label: '删除连线',
        },
      ],
    });
  }

  // 设置工具
  function selectTool(type: ToolsTypeEnum) {
    let tool = tools.find((t) => t.type === type);
    if (tool) currentTool.value = tool;

    switch (type) {
      case ToolsTypeEnum.DRAG:
        changeToDrag();
        break;
      case ToolsTypeEnum.CONNECTION:
        changeToConnection();
        break;
    }
  }

  // 切换为拖拽
  function changeToDrag() {
    flowData.nodeList.forEach((node: INode) => {
      let f = unref(plumb).toggleDraggable(node.id);
      if (!f) {
        unref(plumb).toggleDraggable(node.id);
      }
      if (node.type !== LaneNodeTypeEnum.X_LANE && node.type !== LaneNodeTypeEnum.Y_LANE) {
        unref(plumb).unmakeSource(node.id);
        unref(plumb).unmakeTarget(node.id);
      }
    });
  }

  // 切换为连线
  function changeToConnection() {
    flowData.nodeList.forEach((node: INode) => {
      let f = unref(plumb).toggleDraggable(node.id);
      if (f) {
        unref(plumb).toggleDraggable(node.id);
      }
      if (node.type !== LaneNodeTypeEnum.X_LANE && node.type !== LaneNodeTypeEnum.Y_LANE) {
        unref(plumb).makeSource(node.id, flowConfig.jsPlumbConfig.makeSourceConfig);
        unref(plumb).makeTarget(node.id, flowConfig.jsPlumbConfig.makeTargetConfig);
      }
    });

    currentSelect.value = undefined;
    currentSelectGroup.value = [];
  }

  // 检测流程数据有效性
  function checkFlow() {
    let nodeList = flowData.nodeList;

    if (nodeList.length <= 0) {
      message.error('流程图中无任何节点！');
      return false;
    }
    return true;
  }

  // 保存流程
  function saveFlow() {
    let flowObj = Object.assign({}, flowData);

    if (!checkFlow()) return;
    flowObj.status = flowConfig.flowStatus.SAVE;
    message.success('保存流程成功！请查看控制台。');
    console.log(flowObj);
  }

  // 设置dragInfo
  function setDragInfo(info: IDragInfo) {
    dragInfo.type = info.type;
    dragInfo.belongTo = info.belongTo;
  }

  // 关闭提示
  function listenPage() {
    window.onbeforeunload = function (e: BeforeUnloadEvent) {
      if (e) {
        e.returnValue = '关闭提示';
      }
      return '关闭提示';
    };
  }

  // 删除线
  function deleteLink() {
    let sourceId = (unref(currentSelect) as ILink)?.sourceId;
    let targetId = (unref(currentSelect) as ILink)?.targetId;
    unref(plumb).deleteConnection(
      unref(plumb).getConnections({
        source: sourceId,
        target: targetId,
      })[0],
    );
    let linkList = flowData.linkList;
    linkList.splice(
      linkList.findIndex((link: ILink) => link.sourceId === sourceId && link.targetId === targetId),
      1,
    );
    currentSelect.value = undefined;
  }

  // 键盘移动节点
  function moveNode(type: string) {
    let m = flowConfig.defaultStyle.movePx,
      isX = true;
    switch (type) {
      case 'left':
        m = -m;
        break;
      case 'up':
        m = -m;
        isX = false;
        break;
      case 'right':
        break;
      case 'down':
        isX = false;
    }

    if (currentSelectGroup.value.length > 0) {
      currentSelectGroup.value.forEach((node) => {
        if (isX) {
          node.x += m;
        } else {
          node.y += m;
        }
      });
      unref(plumb).repaintEverything();
    } else if (unref(currentSelect)?.id) {
      if (isX) {
        (currentSelect.value as INode)!.x += m;
      } else {
        (currentSelect.value as INode)!.y += m;
      }
      unref(plumb).repaintEverything();
    }
  }

  // 清除画布
  function clear() {
    flowData.nodeList.forEach((node: INode) => {
      unref(plumb).remove(node.id);
    });
    currentSelect.value = undefined;
    currentSelectGroup.value = [];
    flowData.nodeList = [];
    flowData.linkList = [];
  }

  // 显示隐藏网格
  function toggleShowGrid() {
    let flag = flowData.config.showGrid;
    flowData.config.showGrid = !flag;
    flowData.config.showGridText = flag ? '显示网格' : '隐藏网格';
    flowData.config.showGridIcon = flag ? 'EyeInvisibleOutlined' : 'EyeOutlined';
  }

  // 测试
  function openTest() {
    testVisible.value = true;
  }

  // 设置
  function setting() {
    settingModalRef.value.open();
  }

  // 快捷键大全
  function shortcutHelper() {
    shortcutModalRef.value.open();
  }

  onMounted(() => {
    // 实例化JsPlumb
    initJsPlumb();

    // 初始化快捷键
    listenShortcutKey(flowConfig, unref(flowAreaRef), {
      selectTool,
      moveNode,
      saveFlow,
      openTest,
    });

    // 初始化流程图
    initFlow();

    // 关闭提示
    listenPage();
  });
</script>
