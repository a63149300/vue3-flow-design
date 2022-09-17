import { ToolsTypeEnum } from '/@/type/enums';

export function useShortcutKey() {
  // 画布聚焦开启快捷键
  let activeShortcutKey = true;

  // 初始化快捷键
  function listenShortcutKey(flowConfig, flowAreaRef, handler) {
    document.onkeydown = (e: KeyboardEvent) => {
      // 画布聚焦开启快捷键
      if (!activeShortcutKey) return;
      const key = e.code;

      switch (key) {
        case flowConfig.shortcut.multiple.code.split(',')[0]:
        case flowConfig.shortcut.multiple.code.split(',')[1]:
          flowAreaRef.rectangleMultiple.flag = true;
          break;
        case flowConfig.shortcut.dragContainer.code:
          flowAreaRef.container.dragFlag = true;
          break;
        case flowConfig.shortcut.dragTool.code:
          handler.selectTool(ToolsTypeEnum.DRAG);
          break;
        case flowConfig.shortcut.connTool.code:
          handler.selectTool(ToolsTypeEnum.CONNECTION);
          break;
        case flowConfig.shortcut.leftMove.code:
          handler.moveNode('left');
          break;
        case flowConfig.shortcut.upMove.code:
          handler.moveNode('up');
          break;
        case flowConfig.shortcut.rightMove.code:
          handler.moveNode('right');
          break;
        case flowConfig.shortcut.downMove.code:
          handler.moveNode('down');
          break;
      }

      if (e.ctrlKey) {
        switch (key) {
          case flowConfig.shortcut.settingModal.code:
            handler.saveFlow();
            break;
          case flowConfig.shortcut.testModal.code:
            handler.openTest();
            break;
        }
      }
    };
    // 拖拽、多选快捷键复位
    document.onkeyup = (event: KeyboardEvent) => {
      const key = event.code;
      if (key === flowConfig.shortcut.dragContainer.code) {
        flowAreaRef.container.dragFlag = false;
      } else if (flowConfig.shortcut.multiple.code.includes(key)) {
        flowAreaRef.rectangleMultiple.flag = false;
      }
    };
  }

  // 设置快捷键失效
  function offShortcutKey() {
    activeShortcutKey = false;
  }

  // 设置快捷键启用
  function onShortcutKey() {
    activeShortcutKey = true;
  }

  return {
    listenShortcutKey,
    offShortcutKey,
    onShortcutKey,
  };
}
