import type { Plugin } from 'vite';
import type { TinyCanvasWidgetConfig } from './index';

export interface TinyCanvasViteOptions {
  /** Route directory under src/pages. Default: '/canvas' */
  pagesDir?: `/${string}`;
  /** Optional route-to-title overrides. */
  titles?: Readonly<Record<string, string>>;
  /** Optional default props keyed by exported widget type. */
  widgets?: Readonly<TinyCanvasWidgetConfig>;
}

export default function tinyCanvas(options?: TinyCanvasViteOptions): Plugin;
