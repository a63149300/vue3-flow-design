export interface IElement {
  type: string;
  nodeName: string;
  icon: string;
}

export const tools: IElement[] = [
	{
		type: 'drag',
		nodeName: '拖拽',
    icon: 'DragOutlined',
	},
	{
		type: 'connection',
		nodeName: '连线',
    icon: 'ForkOutlined',
	},
];

export const commonNodes: IElement[] = [
	{
		type: 'start',
		nodeName: '开始',
		icon: 'PlayCircleOutlined'
	},
	{
		type: 'common',
		nodeName: '人工节点',
		icon: 'UserOutlined'
	},
	{
		type: 'freedom',
		nodeName: '自动节点',
		icon: 'SyncOutlined'
	},
	{
		type: 'gateway',
		nodeName: '网关',
		icon: 'GatewayOutlined'
	},
	{
		type: 'event',
		nodeName: '事件',
		icon: 'SelectOutlined'
	},
  {
		type: 'end',
		nodeName: '结束',
		icon: 'StopOutlined'
	},
];

export const highNodes: IElement[] = [
	{
		type: 'child-flow',
		nodeName: '子流程',
		icon: 'ApartmentOutlined'
	}
];

export const laneNodes: IElement[] = [
	{
		type: 'x-lane',
		nodeName: '横向泳道',
		icon: 'ColumnWidthOutlined'
	},
	{
		type: 'y-lane',
		nodeName: '纵向泳道',
		icon: 'ColumnHeightOutlined'
	}
];
