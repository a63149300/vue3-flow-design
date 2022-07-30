const DEFAULT_HANDLES = ['e', 'w', 'n', 's', 'nw', 'ne', 'sw', 'se'];
const MAX_WIDTH = 1000;
const MAX_HEIGHT = 1000;
const MIN_WIDTH = 200;
const MIN_HEIGHT = 200;

export class Resizable {
  private element: HTMLElement;
  private options: OptionsType;
  private document: Document;
  private callback: Function;
  private w: number;
  private h: number;

  public constructor(el: HTMLElement, options?: OptionsType, callback?: Function) {
    this.element = el;
    this.document = el.ownerDocument;
    this.options = options || {};
    this.callback = callback;
    this.createHandles();
  }

  public setPosition(top: number, left: number) {
    this.element.style.top = `${top}px`;
    this.element.style.left = `${left}px`;
  }

  private createHandles() {
    const { handles = DEFAULT_HANDLES } = this.options;
    handles
      .filter((item) => DEFAULT_HANDLES.includes(item))
      .forEach((direction) => {
        this.createHandle(direction);
      });
  }

  private createHandle(direction: string) {
    const { threshold = 10 } = this.options;
    console.log(this.element);
    this.element.style.position = 'absolute';
    const handle = this.document.createElement('div');
    handle.className += `resizable-handle-${direction}`;
    handle.style.position = 'absolute';
    const { left, right, width, height, top, bottom, cursor } = this.getStyleByDirection(
      direction,
      threshold,
    );
    handle.style.left = left;
    handle.style.right = right;
    handle.style.width = width;
    handle.style.height = height;
    handle.style.top = top;
    handle.style.bottom = bottom;
    handle.style.cursor = cursor;
    this.element.appendChild(handle);
    handle.onmousedown = (handleEvent) => {
      const { x: baseX, y: baseY } = handleEvent;
      const { width, height } = this.element.style;
      const { offsetTop, offsetLeft } = this.element;
      this.getChilds().forEach((item) => {
        item.style.pointerEvents = 'none';
      });
      this.document.onmousemove = (docEvent) => {
        const { x, y } = docEvent;
        this.resize(direction, {
          baseX,
          baseY,
          width,
          height,
          offsetTop,
          offsetLeft,
          x,
          y,
        });
      };
      this.document.onmouseup = () => {
        this.document.onmousemove = null;
        this.document.onmouseup = null;
        this.callback();
        this.getChilds().forEach((item) => {
          item.style.pointerEvents = 'auto';
        });
      };
    };
  }

  private getChilds() {
    return ([].slice.call(this.element.children) as HTMLElement[]).filter(
      (item) => !item.className.includes('resizable-handle'),
    );
  }

  private resize(direction: string, config: ConfigType) {
    const { baseX, baseY, width, height, x, y, offsetTop, offsetLeft } = config;
    const direc = direction.split('');
    const maxW = this.options?.initSize?.maxWidth || MAX_WIDTH;
    const minW = this.options?.initSize?.minWidth || MIN_WIDTH;
    const maxH = this.options?.initSize?.maxHeight || MAX_HEIGHT;
    const minH = this.options?.initSize?.minHeight || MIN_HEIGHT;

    direc.forEach((item) => {
      switch (item) {
        case 'e':
          this.w = parseFloat(width) + (x - baseX);

          if (this.w > maxW) {
            this.w = maxW;
          } else if (this.w < minW) {
            this.w = minW;
          }

          this.element.style.width = `${this.w}px`;
          break;
        case 'w':
          this.w = parseFloat(width) + (baseX - x);

          if (this.w > maxW) {
            this.w = maxW;
          } else if (this.w < minW) {
            this.w = minW;
          }

          this.element.style.width = `${this.w}px`;
          this.element.style.left = `${offsetLeft - (baseX - x)}px`;
          break;
        case 'n':
          this.h = parseFloat(height) + (baseY - y);

          if (this.h > maxH) {
            this.h = maxH;
          } else if (this.h < minH) {
            this.h = minH;
          }

          this.element.style.height = `${this.h}px`;
          this.element.style.top = `${offsetTop - (baseY - y)}px`;
          break;
        case 's':
          this.h = parseFloat(height) + (y - baseY);

          if (this.h > maxH) {
            this.h = maxH;
          } else if (this.h < minH) {
            this.h = minH;
          }

          this.element.style.height = `${this.h}px`;
          break;
        default:
          break;
      }
    });
  }

  private getStyleByDirection(direction: string, threshold: number) {
    switch (direction) {
      case 'e':
        return {
          left: 'auto',
          right: `-${threshold / 2}px`,
          width: `${threshold}px`,
          height: 'auto',
          top: '0px',
          bottom: '0px',
          cursor: 'e-resize',
        };
      case 'w':
        return {
          left: `-${threshold / 2}px`,
          right: 'auto',
          width: `${threshold}px`,
          height: 'auto',
          top: '0px',
          bottom: '0px',
          cursor: 'w-resize',
        };
      case 'n':
        return {
          left: '0px',
          right: '0px',
          width: 'auto',
          height: `${threshold}px`,
          top: `-${threshold / 2}px`,
          bottom: 'auto',
          cursor: 'n-resize',
        };
      case 's':
        return {
          left: '0px',
          right: '0px',
          width: 'auto',
          height: `${threshold}px`,
          top: 'auto',
          bottom: `-${threshold / 2}px`,
          cursor: 's-resize',
        };
      case 'nw':
        return {
          left: `-${threshold / 2}px`,
          right: 'auto',
          width: `${threshold}px`,
          height: `${threshold}px`,
          top: `-${threshold / 2}px`,
          bottom: 'auto',
          cursor: 'nw-resize',
        };
      case 'ne':
        return {
          left: 'auto',
          right: `-${threshold / 2}px`,
          width: `${threshold}px`,
          height: `${threshold}px`,
          top: `-${threshold / 2}px`,
          bottom: 'auto',
          cursor: 'ne-resize',
        };
      case 'sw':
        return {
          left: `-${threshold / 2}px`,
          right: 'auto',
          width: `${threshold}px`,
          height: `${threshold}px`,
          top: 'auto',
          bottom: `-${threshold / 2}px`,
          cursor: 'sw-resize',
        };
      case 'se':
        return {
          left: 'auto',
          right: `-${threshold / 2}px`,
          width: `${threshold}px`,
          height: `${threshold}px`,
          top: 'auto',
          bottom: `-${threshold / 2}px`,
          cursor: 'se-resize',
        };
      default:
        return {};
    }
  }
}

export interface OptionsType {
  handles?: string[];
  threshold?: number;
  initSize?: DomSize;
}

export interface DomSize {
  maxWidth: number;
  maxHeight: number;
  minWidth: number;
  minHeight: number;
}

export interface ConfigType {
  baseX: number;
  baseY: number;
  width: string;
  height: string;
  x: number;
  y: number;
  offsetTop: number;
  offsetLeft: number;
}
