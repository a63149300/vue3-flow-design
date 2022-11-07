import { CommonNodeTypeEnum, HighNodeTypeEnum, LaneNodeTypeEnum } from '/@/type/enums';
import { IElement } from '/@/type/index';

export const commonNodes: IElement[] = [
  {
    type: CommonNodeTypeEnum.START,
    nodeName: '开始',
    icon: 'PlayCircleOutlined',
  },
  {
    type: CommonNodeTypeEnum.COMMON,
    nodeName: '人工节点',
    icon: 'UserOutlined',
  },
  {
    type: CommonNodeTypeEnum.FREEDOM,
    nodeName: '自动节点',
    icon: 'SyncOutlined',
  },
  {
    type: CommonNodeTypeEnum.GATEWAY,
    nodeName: '网关',
    icon: 'GatewayOutlined',
  },
  {
    type: CommonNodeTypeEnum.EVENT,
    nodeName: '事件',
    icon: 'SelectOutlined',
  },
  {
    type: CommonNodeTypeEnum.END,
    nodeName: '结束',
    icon: 'StopOutlined',
  },
];

export const highNodes: IElement[] = [
  {
    type: HighNodeTypeEnum.CHILD_FLOW,
    nodeName: '子流程',
    icon: 'ApartmentOutlined',
  },
];

export const laneNodes: IElement[] = [
  {
    type: LaneNodeTypeEnum.X_LANE,
    nodeName: '横向泳道',
    icon: 'ColumnWidthOutlined',
  },
  {
    type: LaneNodeTypeEnum.Y_LANE,
    nodeName: '纵向泳道',
    icon: 'ColumnHeightOutlined',
  },
];
