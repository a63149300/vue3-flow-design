// 操作类型
export enum ActionsTypeEnum {
  DRAG = 'drag',
  CONNECTION = 'connection',
}

// 元素类型
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

// ID的生成类型。1.uuid uuid 2.time_stamp 时间戳 3.sequence 序列 4.time_stamp_and_sequence 时间戳加序列 5.custom 自定义
export enum IdTypeEnum {
  UUID = 'uuid',
  TIME_STAMP = 'time_stamp',
  SEQUENCE = 'sequence',
  TIME_STAMP_AND_SEQUENCE = 'time_stamp_and_sequence',
  CUSTOM = 'custom',
}

export enum ActiveTypeEnum {
  CANVAS = 'canvas',
  CONNECTION = 'connection',
  NODE = 'node',
}
