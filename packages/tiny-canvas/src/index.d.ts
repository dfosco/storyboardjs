import {
  HTMLAttributes,
  ReactElement,
  ReactNode,
} from 'react';

export interface Position {
  x: number;
  y: number;
}

export interface CanvasProps
  extends Omit<HTMLAttributes<HTMLElement>, 'onSelectionChange'> {
  children?:
    | ReactElement<BlockProps, typeof Block>
    | readonly ReactElement<BlockProps, typeof Block>[];
  /** Show dot background. Default: false */
  dotted?: boolean;
  /** Legacy alias for dotted. Default: false */
  grid?: boolean;
  /** Dot-grid spacing in pixels. Default: 36 */
  gridSize?: number;
  /** Color mode: 'auto' follows system preference, 'light' or 'dark' to override. Default: 'auto' */
  colorMode?: 'auto' | 'light' | 'dark';
  /** Called when selection changes. Null means the canvas background is selected. */
  onSelectionChange?: (blockId: string | null) => void;
}

export declare function Canvas(props: CanvasProps): ReactElement;

export interface BlockProps
  extends Omit<HTMLAttributes<HTMLElement>, 'onSelectionChange'> {
  children?: ReactNode;
  /** Optional stable persistence and DOM identifier. Canvas generates one when omitted. */
  id?: string;
  /** Initial horizontal position in pixels. A saved position takes precedence. Default: 0 */
  x?: number;
  /** Initial vertical position in pixels. A saved position takes precedence. Default: 0 */
  y?: number;
  /** Controls selection when provided. */
  selected?: boolean;
  onPositionChange?: (position: Position) => void;
  onSelectionChange?: (selected: boolean) => void;
}

export declare function Block(props: BlockProps): ReactElement;

export interface UseResetCanvasOptions {
  /** Reload the page after clearing state. Default: false */
  reload?: boolean;
}

/** Returns a function that clears all saved canvas positions from localStorage. */
export declare function useResetCanvas(options?: UseResetCanvasOptions): () => void;
