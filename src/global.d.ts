import type { ComponentPublicInstance, FunctionalComponent } from 'vue';

declare global {
  declare type Nullable<T> = T | null;
  declare type Recordable<T = any> = Record<string, T>;
}

declare module 'vue' {
  export type JSXComponent<Props = any> =
    | { new (): ComponentPublicInstance<Props> }
    | FunctionalComponent<Props>;
}

declare interface Fn<T = any, R = T> {
  (...arg: T[]): R;
}
