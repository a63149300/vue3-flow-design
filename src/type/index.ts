import { ToolsTypeEnum, CommonNodeType, HighNodeType, LaneNodesType } from './enums';
export interface IDragInfo {
  type: string;
  belongTo: string;
}

export interface ITool {
  type: ToolsTypeEnum;
  nodeName: string;
  icon: string;
}

export interface IElement {
  type: CommonNodeType | HighNodeType | LaneNodesType;
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

export interface IShortcut {
  code: string;
  codeName: string;
  shortcutName: string;
}
