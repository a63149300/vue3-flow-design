import { ToolsTypeEnum } from '/@/type/enums';
import { ITool } from '/@/type/index';

export const tools: ITool[] = [
  {
    type: ToolsTypeEnum.DRAG,
    nodeName: '拖拽',
    icon: 'DragOutlined',
  },
  {
    type: ToolsTypeEnum.CONNECTION,
    nodeName: '连线',
    icon: 'ForkOutlined',
  },
];
