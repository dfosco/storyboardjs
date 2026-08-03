import {
  HTMLAttributes,
  ReactElement,
  ReactNode,
} from 'react';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface CanvasChange {
  component: string;
  index?: number;
  key?: string;
  id: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

type CanvasChild =
  | ReactElement<BlockProps, typeof Block>
  | ReactElement<FrameProps, typeof Frame>
  | ReactElement<NoteProps, typeof Note>
  | ReactElement<MarkProps, typeof Mark>;

export interface CanvasProps
  extends Omit<HTMLAttributes<HTMLElement>, 'onSelectionChange'> {
  children?: CanvasChild | readonly CanvasChild[];
  /** Show dot background. Default: false */
  dotted?: boolean;
  /** Legacy alias for dotted. Default: false */
  grid?: boolean;
  /** Dot-grid spacing in pixels. Default: 36 */
  gridSize?: number;
  /** Color mode: 'auto' follows system preference, 'light' or 'dark' to override. Default: 'auto' */
  colorMode?: 'auto' | 'light' | 'dark';
  /** Show the built-in Reset board button. Default: false */
  resettable?: boolean;
  /** Reset button content. Default: 'Reset board' */
  resetLabel?: ReactNode;
  /** Show Copy changes. Defaults to the value of resettable. */
  copyable?: boolean;
  /** Copy button content. Default: 'Copy changes' */
  copyLabel?: ReactNode;
  /** Copy-success button content. Default: 'Copied' */
  copiedLabel?: ReactNode;
  /** Called after persisted layout changes are copied. */
  onCopyChanges?: (changes: CanvasChange[], text: string) => void;
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

export interface FrameProps extends Omit<BlockProps, 'children'> {
  /** Same-origin URL, path, query, or hash route rendered inside the frame. */
  route: string | URL;
  /** Accessible frame title shown in the title bar. */
  title: string;
  /** Initial frame width in pixels. A saved width takes precedence. Default: 640 */
  width?: number;
  /** Initial frame height in pixels. A saved height takes precedence. Default: 480 */
  height?: number;
  /** Minimum resizable width in pixels. Default: 320 */
  minWidth?: number;
  /** Minimum resizable height in pixels. Default: 240 */
  minHeight?: number;
  /** Called while the frame is resized. */
  onSizeChange?: (size: Size) => void;
}

export declare function Frame(props: FrameProps): ReactElement;

export type NoteColor =
  | 'yellow'
  | 'blue'
  | 'green'
  | 'pink'
  | 'purple'
  | 'orange';

export interface NoteProps extends Omit<BlockProps, 'children'> {
  /** Markdown text. May also be provided as string children. */
  text?: string;
  children?: string;
  /** Sticky-note palette color. Default: 'yellow' */
  color?: NoteColor;
  /** Initial width in pixels. Saved width takes precedence. Default: 270 */
  width?: number;
  /** Initial height in pixels. Saved height takes precedence. Default: 170 */
  height?: number;
  /** Minimum resizable width in pixels. Default: 180 */
  minWidth?: number;
  /** Minimum resizable height in pixels. Default: 60 */
  minHeight?: number;
  onSizeChange?: (size: Size) => void;
}

export declare function Note(props: NoteProps): ReactElement;

export interface MarkProps extends Omit<BlockProps, 'children'> {
  /** Markdown text. May also be provided as string children. */
  content?: string;
  children?: string;
  /** Initial width in pixels. Saved width takes precedence. Default: 530 */
  width?: number;
  /** Initial height in pixels. Saved height takes precedence. */
  height?: number;
  /** Minimum resizable width in pixels. Default: 200 */
  minWidth?: number;
  /** Minimum resizable height in pixels. Default: 60 */
  minHeight?: number;
  onSizeChange?: (size: Size) => void;
}

export declare function Mark(props: MarkProps): ReactElement;

export interface UseResetCanvasOptions {
  /** Reload the page after clearing state. Default: false */
  reload?: boolean;
}

/** Returns a function that clears all saved canvas layout state from localStorage. */
export declare function useResetCanvas(options?: UseResetCanvasOptions): () => void;
