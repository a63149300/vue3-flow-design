export interface Axis {
  x: number;
  y: number;
}

export interface ContextMenuItem {
  label: string;
  hidden?: boolean;
  disabled?: boolean;
  handler?: Fn;
  divider?: boolean;
  children?: ContextMenuItem[];
}
export interface CreateContextOptions {
  event: MouseEvent;
  styles?: any;
  items?: ContextMenuItem[];
}

export interface ContextMenuProps {
  event?: MouseEvent;
  styles?: any;
  items: ContextMenuItem[];
  customEvent?: MouseEvent;
  axis?: Axis;
  width?: number;
}

export interface ItemContentProps {
  item: ContextMenuItem;
  handler: Fn;
}
