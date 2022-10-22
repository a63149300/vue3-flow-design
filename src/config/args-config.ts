export const settingConfig = {
  containerScale: {
    onceNarrow: 0.1,
    onceEnlarge: 0.1,
  },
  cls: {
    linkType: 'Flowchart',
    linkColor: '#2a2929',
    linkThickness: 2,
  },
  other: {
    isOpenAuxiliaryLine: true,
    horizontal: 100,
    vertical: 100,
    movePx: 5,
  },
};

export const flowConfig = {
  jsPlumbInsConfig: {
    Connector: [
      settingConfig.cls.linkType,
      {
        gap: 5,
        cornerRadius: 8,
        alwaysRespectStubs: true,
      },
    ],
    ConnectionOverlays: [
      [
        'Arrow',
        {
          width: 10,
          length: 10,
          location: 1,
        },
      ],
    ],
    PaintStyle: {
      stroke: settingConfig.cls.linkColor,
      strokeWidth: settingConfig.cls.linkThickness,
    },
    HoverPaintStyle: {
      stroke: '#409EFF',
      strokeWidth: 3,
    },
    EndpointStyle: {
      fill: '#456',
      stroke: '#2a2929',
      strokeWidth: 1,
      radius: 3,
    },
    EndpointHoverStyle: {
      fill: 'pink',
    },
  },
  jsPlumbConfig: {
    anchor: {
      default: ['Bottom', 'Right', 'Top', 'Left'],
    },
    conn: {
      isDetachable: false,
    },
    makeSourceConfig: {
      filter: 'a',
      filterExclude: true,
      maxConnections: -1,
      endpoint: ['Dot', { radius: 7 }],
      anchor: ['Bottom', 'Right', 'Top', 'Left'],
    },
    makeTargetConfig: {
      filter: 'a',
      filterExclude: true,
      maxConnections: -1,
      endpoint: ['Dot', { radius: 7 }],
      anchor: ['Bottom', 'Right', 'Top', 'Left'],
    },
  },
  defaultStyle: {
    dragOpacity: 0.7,
    alignGridPX: [5, 5],
    alignSpacing: {
      horizontal: settingConfig.other.horizontal,
      vertical: settingConfig.other.vertical,
    },
    alignDuration: 300,
    containerScale: {
      init: 1,
      min: 0.5,
      max: 3,
      onceNarrow: settingConfig.containerScale.onceNarrow,
      onceEnlarge: settingConfig.containerScale.onceEnlarge,
    },
    isOpenAuxiliaryLine: settingConfig.other.isOpenAuxiliaryLine,
    showAuxiliaryLineDistance: 20,
    movePx: settingConfig.other.movePx,
    photoBlankDistance: 200,
  },
  // ID的生成类型。1.uuid uuid 2.time_stamp 时间戳 3.sequence 序列 4.time_stamp_and_sequence 时间戳加序列 5.custom 自定义
  idType: 'uuid',
  flowStatus: {
    CREATE: '0',
    SAVE: '1',
    MODIFY: '2',
    LOADING: '3',
  },
};

// 快捷键
export const shortcutKeys = {
  multiple: {
    code: 'ShiftLeft,ShiftRight',
    codeName: 'SHIFT',
    shortcutName: '多选',
  },
  dragContainer: {
    code: 'Space',
    codeName: 'SPACE',
    shortcutName: '画布拖拽',
  },
  dragTool: {
    code: 'KeyD',
    codeName: 'D',
    shortcutName: '拖拽工具',
  },
  connTool: {
    code: 'KeyL',
    codeName: 'L',
    shortcutName: '连线工具',
  },
  leftMove: {
    code: 'ArrowLeft',
    codeName: '←',
    shortcutName: '左移',
  },
  upMove: {
    code: 'ArrowUp',
    codeName: '↑',
    shortcutName: '上移',
  },
  rightMove: {
    code: 'ArrowRight',
    codeName: '→',
    shortcutName: '右移',
  },
  downMove: {
    code: 'ArrowDown',
    codeName: '↓',
    shortcutName: '下移',
  },
  settingModal: {
    code: 'KeyS',
    codeName: 'CTRL + S',
    shortcutName: '保存页面',
  },
  testModal: {
    code: 'KeyT',
    codeName: 'CTRL + T',
    shortcutName: '测试页面',
  },
};
