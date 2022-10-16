import {
  ToolsTypeEnum,
  NodeTypeEnum,
  CommonNodeTypeEnum,
  HighNodeTypeEnum,
  LaneNodeTypeEnum,
} from './enums';

import { settingConfig } from '../config/args-config';

export type NodesType = CommonNodeTypeEnum | HighNodeTypeEnum | LaneNodeTypeEnum;

export interface IDragInfo {
  type: Nullable<NodesType>;
  belongTo: Nullable<NodeTypeEnum>;
}

export interface ITool {
  type: ToolsTypeEnum;
  nodeName: string;
  icon: string;
}

export interface IElement {
  type: NodesType;
  nodeName: string;
  icon: string;
}

export interface INode {
  height: number;
  icon?: string;
  id: string;
  nodeName: string;
  type: string;
  width: number;
  x: number;
  y: number;
}

export interface ILink {
  type: string;
  id: string;
  sourceId?: string;
  targetId?: string;
  label: string;
  cls: {
    linkType: string;
    linkColor: string;
    linkThickness: number;
  };
}

export interface IShortcutKey {
  code: string;
  codeName: string;
  shortcutName: string;
}

export type ISettingConfig = typeof settingConfig;
