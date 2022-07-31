import { ToolsTypeEnum, CommonNodeType, HighNodeType, LaneNodesType } from '/@/type/enums';
import { IElement } from '/@/type/index';

export const tools: IElement[] = [
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

export const commonNodes: IElement[] = [
  {
    type: CommonNodeType.START,
    nodeName: '开始',
    icon: 'PlayCircleOutlined',
  },
  {
    type: CommonNodeType.COMMON,
    nodeName: '人工节点',
    icon: 'UserOutlined',
  },
  {
    type: CommonNodeType.FREEDOM,
    nodeName: '自动节点',
    icon: 'SyncOutlined',
  },
  {
    type: CommonNodeType.GATEWAY,
    nodeName: '网关',
    icon: 'GatewayOutlined',
  },
  {
    type: CommonNodeType.EVENT,
    nodeName: '事件',
    icon: 'SelectOutlined',
  },
  {
    type: CommonNodeType.END,
    nodeName: '结束',
    icon: 'StopOutlined',
  },
];

export const highNodes: IElement[] = [
  {
    type: HighNodeType.CHILD_FLOW,
    nodeName: '子流程',
    icon: 'ApartmentOutlined',
  },
];

export const laneNodes: IElement[] = [
  {
    type: LaneNodesType.X_LANE,
    nodeName: '横向泳道',
    icon: 'ColumnWidthOutlined',
  },
  {
    type: LaneNodesType.Y_LANE,
    nodeName: '纵向泳道',
    icon: 'ColumnHeightOutlined',
  },
];
