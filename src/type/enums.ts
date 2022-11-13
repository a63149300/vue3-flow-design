export enum ToolsTypeEnum {
  DRAG = 'drag',
  CONNECTION = 'connection',
}

export enum NodeTypeEnum {
  Common_Node_Type = 'CommonNodeType',
  High_Node_Type = 'HighNodeType',
  Lane_Node_Type = 'LaneNodeType',
}

export enum CommonNodeTypeEnum {
  START = 'start',
  COMMON = 'common',
  FREEDOM = 'freedom',
  GATEWAY = 'gateway',
  EVENT = 'event',
  END = 'end',
}

export enum HighNodeTypeEnum {
  CHILD_FLOW = 'child_flow',
}

export enum LaneNodeTypeEnum {
  X_LANE = 'x_lane',
  Y_LANE = 'y_lane',
}

export enum FlowStatusEnum {
  CREATE = '0',
  SAVE = '1',
  MODIFY = '2',
  LOADING = '3',
}
