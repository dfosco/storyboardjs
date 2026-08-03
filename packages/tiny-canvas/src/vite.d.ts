import type { Plugin } from 'vite';

export interface TinyCanvasViteOptions {
  /** Route directory under src/pages. Default: '/canvas' */
  pagesDir?: `/${string}`;
  /** Optional route-to-title overrides. */
  titles?: Readonly<Record<string, string>>;
}

export default function tinyCanvas(options?: TinyCanvasViteOptions): Plugin;
