declare module 'virtual:tiny-canvas-pages' {
  export interface TinyCanvasPageModule {
    default?: import('react').ComponentType;
    [exportName: string]: unknown;
  }

  export interface TinyCanvasPage {
    id: `/${string}`;
    title: string;
    href: string;
    load: () => Promise<TinyCanvasPageModule>;
  }

  export const pages: readonly TinyCanvasPage[];
  export default pages;
}
