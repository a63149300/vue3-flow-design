import { message } from 'ant-design-vue';
import { utils } from '/@/utils/common';

export function useAlign() {
  // 节点排列前校验节点数量
  function checkAlign(currentSelectGroup) {
    if (currentSelectGroup.length < 2) {
      message.error('请选择至少两个节点！');
      return false;
    }
    return true;
  }

  // 垂直左对齐
  function verticaLeft({ currentSelectGroup, flowData, flowConfig, plumb }) {
    if (!checkAlign(currentSelectGroup)) return;
    const nodeList = flowData.nodeList;
    const selectGroup = currentSelectGroup;
    const baseX = selectGroup[0].x;
    let baseY = selectGroup[0].y;
    for (let i = 1; i < selectGroup.length; i++) {
      baseY = baseY + selectGroup[i - 1].height + flowConfig.defaultStyle.alignSpacing.vertical;
      const f = nodeList.find((n: INode) => n.id === selectGroup[i].id);
      f.tx = baseX;
      f.ty = baseY;
      plumb.animate(
        selectGroup[i].id,
        { top: baseY, left: baseX },
        {
          duration: flowConfig.defaultStyle.alignDuration,
          complete: function () {
            f.x = f.tx;
            f.y = f.ty;
          },
        },
      );
    }
  }

  // 垂直居中
  function verticalCenter({ currentSelectGroup, flowData, flowConfig, plumb }) {
    if (!checkAlign(currentSelectGroup)) return;
    const nodeList = flowData.nodeList;
    const selectGroup = currentSelectGroup;
    let baseX = selectGroup[0].x;
    let baseY = selectGroup[0].y;
    const firstX = baseX;
    for (let i = 1; i < selectGroup.length; i++) {
      baseY = baseY + selectGroup[i - 1].height + flowConfig.defaultStyle.alignSpacing.vertical;
      baseX = firstX + utils.div(selectGroup[0].width, 2) - utils.div(selectGroup[i].width, 2);
      const f = nodeList.find((n: INode) => n.id === selectGroup[i].id);
      f.tx = baseX;
      f.ty = baseY;
      plumb.animate(
        selectGroup[i].id,
        { top: baseY, left: baseX },
        {
          duration: flowConfig.defaultStyle.alignDuration,
          complete: function () {
            f.x = f.tx;
            f.y = f.ty;
          },
        },
      );
    }
  }

  // 垂直右对齐
  function verticalRight({ currentSelectGroup, flowData, flowConfig, plumb }) {
    if (!checkAlign(currentSelectGroup)) return;
    const nodeList = flowData.nodeList;
    const selectGroup = currentSelectGroup;
    let baseX = selectGroup[0].x;
    let baseY = selectGroup[0].y;
    const firstX = baseX;
    for (let i = 1; i < selectGroup.length; i++) {
      baseY = baseY + selectGroup[i - 1].height + flowConfig.defaultStyle.alignSpacing.vertical;
      baseX = firstX + selectGroup[0].width - selectGroup[i].width;
      const f = nodeList.find((n: INode) => n.id === selectGroup[i].id);
      f.tx = baseX;
      f.ty = baseY;
      plumb.animate(
        selectGroup[i].id,
        { top: baseY, left: baseX },
        {
          duration: flowConfig.defaultStyle.alignDuration,
          complete: function () {
            f.x = f.tx;
            f.y = f.ty;
          },
        },
      );
    }
  }

  // 水平上对齐
  function horizontalUp({ currentSelectGroup, flowData, flowConfig, plumb }) {
    if (!checkAlign(currentSelectGroup)) return;
    const nodeList = flowData.nodeList;
    const selectGroup = currentSelectGroup;
    let baseX = selectGroup[0].x;
    const baseY = selectGroup[0].y;
    for (let i = 1; i < selectGroup.length; i++) {
      baseX = baseX + selectGroup[i - 1].width + flowConfig.defaultStyle.alignSpacing.horizontal;
      const f = nodeList.find((n: INode) => n.id === selectGroup[i].id);
      f.tx = baseX;
      f.ty = baseY;
      plumb.animate(
        selectGroup[i].id,
        { top: baseY, left: baseX },
        {
          duration: flowConfig.defaultStyle.alignDuration,
          complete: function () {
            f.x = f.tx;
            f.y = f.ty;
          },
        },
      );
    }
  }

  // 水平居中
  function horizontalCenter({ currentSelectGroup, flowData, flowConfig, plumb }) {
    if (!checkAlign(currentSelectGroup)) return;
    const nodeList = flowData.nodeList;
    const selectGroup = currentSelectGroup;
    let baseX = selectGroup[0].x;
    let baseY = selectGroup[0].y;
    const firstY = baseY;
    for (let i = 1; i < selectGroup.length; i++) {
      baseY = firstY + utils.div(selectGroup[0].height, 2) - utils.div(selectGroup[i].height, 2);
      baseX = baseX + selectGroup[i - 1].width + flowConfig.defaultStyle.alignSpacing.horizontal;
      const f = nodeList.find((n: INode) => n.id === selectGroup[i].id);
      f.tx = baseX;
      f.ty = baseY;
      plumb.animate(
        selectGroup[i].id,
        { top: baseY, left: baseX },
        {
          duration: flowConfig.defaultStyle.alignDuration,
          complete: function () {
            f.x = f.tx;
            f.y = f.ty;
          },
        },
      );
    }
  }

  // 水平下对齐
  function horizontalDown({ currentSelectGroup, flowData, flowConfig, plumb }) {
    if (!checkAlign(currentSelectGroup)) return;
    const nodeList = flowData.nodeList;
    const selectGroup = currentSelectGroup;
    let baseX = selectGroup[0].x;
    let baseY = selectGroup[0].y;
    const firstY = baseY;
    for (let i = 1; i < selectGroup.length; i++) {
      baseY = firstY + selectGroup[0].height - selectGroup[i].height;
      baseX = baseX + selectGroup[i - 1].width + flowConfig.defaultStyle.alignSpacing.horizontal;
      const f = nodeList.find((n: INode) => n.id === selectGroup[i].id);
      f.tx = baseX;
      f.ty = baseY;
      plumb.animate(
        selectGroup[i].id,
        { top: baseY, left: baseX },
        {
          duration: flowConfig.defaultStyle.alignDuration,
          complete: function () {
            f.x = f.tx;
            f.y = f.ty;
          },
        },
      );
    }
  }

  return {
    verticaLeft,
    verticalCenter,
    verticalRight,
    horizontalUp,
    horizontalCenter,
    horizontalDown,
  };
}
