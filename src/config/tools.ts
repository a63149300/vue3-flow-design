import { ActionsTypeEnum } from '/@/type/enums';
import { ITool } from '/@/type/index';

export const tools: ITool[] = [
  {
    type: ActionsTypeEnum.DRAG,
    nodeName: '拖拽',
    icon: 'DragOutlined',
  },
  {
    type: ActionsTypeEnum.CONNECTION,
    nodeName: '连线',
    icon: 'ForkOutlined',
  },
];
