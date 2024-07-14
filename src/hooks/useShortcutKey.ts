import { ActionsTypeEnum } from '/@/type/enums';
import { shortcutKeys } from '/@/config/shortcutKeys';

export function useShortcutKey() {
  // 画布聚焦开启快捷键
  let activeShortcutKey = true;

  // 初始化快捷键
  function listenShortcutKey(flowAreaRef, handler) {
    document.onkeydown = (e: KeyboardEvent) => {
      // 画布聚焦开启快捷键
      if (!activeShortcutKey) return;
      const key = e.code;

      switch (key) {
        case shortcutKeys.multiple.code.split(',')[0]:
        case shortcutKeys.multiple.code.split(',')[1]:
          flowAreaRef.rectangleMultiple.flag = true;
          break;
        case shortcutKeys.dragContainer.code:
          flowAreaRef.container.dragFlag = true;
          break;
        case shortcutKeys.dragTool.code:
          handler.selectTool(ActionsTypeEnum.DRAG);
          break;
        case shortcutKeys.connTool.code:
          handler.selectTool(ActionsTypeEnum.CONNECTION);
          break;
        case shortcutKeys.leftMove.code:
          handler.moveNode('left');
          break;
        case shortcutKeys.upMove.code:
          handler.moveNode('up');
          break;
        case shortcutKeys.rightMove.code:
          handler.moveNode('right');
          break;
        case shortcutKeys.downMove.code:
          handler.moveNode('down');
          break;
      }

      if (e.ctrlKey) {
        switch (key) {
          case shortcutKeys.settingModal.code:
            handler.saveFlow();
            break;
          case shortcutKeys.testModal.code:
            handler.openTest();
            break;
        }
      }
    };
    // 拖拽、多选快捷键复位
    document.onkeyup = (event: KeyboardEvent) => {
      const key = event.code;
      if (key === shortcutKeys.dragContainer.code) {
        flowAreaRef.container.dragFlag = false;
      } else if (shortcutKeys.multiple.code.includes(key)) {
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
