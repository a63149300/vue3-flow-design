import * as icons from '@ant-design/icons-vue';

const ICON_LIST = [
  'DragOutlined',
  'ForkOutlined',
  'PlayCircleOutlined',
  'UserOutlined',
  'SyncOutlined',
  'GatewayOutlined',
  'SelectOutlined',
  'StopOutlined',
  'ApartmentOutlined',
  'ColumnWidthOutlined',
  'ColumnHeightOutlined',
  'PictureOutlined',
  'DeleteOutlined',
  'SettingOutlined',
  'ToolOutlined',
  'BookOutlined',
  'SaveOutlined',
  'ZoomInOutlined',
  'ZoomOutOutlined',
  'ClusterOutlined',
  'ProfileOutlined',
  'BranchesOutlined',
  'EyeOutlined',
  'EyeInvisibleOutlined',
  'GithubOutlined',
];

export function registerIconsComp(app: App) {
  ICON_LIST.forEach((icon) => {
    app.component(icon, icons[icon]);
  });
}
