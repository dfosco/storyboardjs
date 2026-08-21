import {
  HTMLAttributes,
  ImgHTMLAttributes,
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

export type JSONCanvasNodeType = 'text' | 'file' | 'link' | 'group';
export type JSONCanvasSide = 'top' | 'right' | 'bottom' | 'left';
export type JSONCanvasEnd = 'none' | 'arrow';
export type JSONCanvasColor = `#${string}` | '1' | '2' | '3' | '4' | '5' | '6';

export interface JSONCanvasNode {
  id: string;
  type: JSONCanvasNodeType;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: JSONCanvasColor;
  text?: string;
  file?: string;
  subpath?: `#${string}`;
  url?: string;
  label?: string;
  background?: string;
  backgroundStyle?: 'cover' | 'ratio' | 'repeat';
  [extension: string]: unknown;
}

export interface JSONCanvasEdge {
  id: string;
  fromNode: string;
  fromSide?: JSONCanvasSide;
  fromEnd?: JSONCanvasEnd;
  toNode: string;
  toSide?: JSONCanvasSide;
  toEnd?: JSONCanvasEnd;
  color?: JSONCanvasColor;
  label?: string;
  [extension: string]: unknown;
}

export interface CanvasDocument {
  nodes?: JSONCanvasNode[];
  edges?: JSONCanvasEdge[];
  [extension: string]: unknown;
}

export interface CanvasValidationIssue {
  path: string;
  message: string;
}

export interface CanvasValidationResult {
  valid: boolean;
  issues: CanvasValidationIssue[];
}

export interface CanvasViewport {
  /** Content-space horizontal scroll position. */
  x: number;
  /** Content-space vertical scroll position. */
  y: number;
  zoom: number;
  width: number;
  height: number;
}

export interface CanvasViewportOptions {
  zoom?: number;
  behavior?: ScrollBehavior;
}

export interface CanvasHandle {
  getViewport(): CanvasViewport;
  setViewport(viewport: Partial<CanvasViewport>): void;
  panTo(point?: { x?: number; y?: number }, options?: CanvasViewportOptions): void;
  centerOnNode(nodeId: string, options?: CanvasViewportOptions): boolean;
  fitToNodes(nodeIds?: readonly string[], options?: CanvasViewportOptions & { padding?: number }): boolean;
  zoomTo(zoom: number): void;
  zoomBy(delta: number): void;
  getDocument(): CanvasDocument;
}

export interface CanvasChange {
  component: string;
  index?: number;
  key?: string;
  pageId?: string;
  pageTitle?: string;
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
  | ReactElement<MarkProps, typeof Mark>
  | ReactElement<LinkProps, typeof Link>
  | ReactElement<ImageProps, typeof Image>
  | ReactElement<GroupProps, typeof Group>;

export interface CanvasProps
  extends Omit<HTMLAttributes<HTMLElement>, 'onSelectionChange'> {
  children?: CanvasChild | readonly CanvasChild[];
  /** Canvas page title. Overrides its filename in the page selector. */
  title?: string;
  /** Scrollable board width in pixels. Default: 10000 */
  canvasWidth?: number;
  /** Scrollable board height in pixels. Default: 10000 */
  canvasHeight?: number;
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
  edges?: readonly JSONCanvasEdge[];
  graphNodes?: readonly JSONCanvasNode[];
  viewport?: Partial<CanvasViewport>;
  onViewportChange?: (viewport: CanvasViewport) => void;
  /** Read canvasX/canvasY/canvasZoom/canvasNode query parameters on initial load. */
  viewportFromUrl?: boolean;
  /** Write viewport changes to the current URL using replaceState. */
  viewportToUrl?: boolean;
}

export declare const Canvas: React.ForwardRefExoticComponent<
  CanvasProps & React.RefAttributes<CanvasHandle>
>;

export declare function validateCanvasDocument(
  document: unknown
): CanvasValidationResult;
export declare function assertValidCanvasDocument(
  document: unknown
): CanvasDocument;
export declare function normalizeCanvasDocument(
  document: CanvasDocument
): Required<Pick<CanvasDocument, 'nodes' | 'edges'>> & Omit<CanvasDocument, 'nodes' | 'edges'>;
export declare function parseCanvasJSON(source: string | CanvasDocument): CanvasDocument;
export declare function parseCanvasJSONL(source: string): CanvasDocument;
export declare function materializeCanvasSource(
  source: string | CanvasDocument,
  options?: { format?: 'json' | 'jsonl' }
): CanvasDocument;
export declare function materializeReactChildren(
  children: ReactNode,
  options?: { widgets?: Readonly<Record<string, string>> }
): { document: CanvasDocument; warnings: CanvasValidationIssue[] };
export declare function materializeCanvasMDX(
  source: string,
  options: { compile: (source: string) => unknown | Promise<unknown> }
): Promise<{ document: CanvasDocument; warnings: CanvasValidationIssue[] }>;
export declare function serializeCanvasJSON(
  document: CanvasDocument,
  options?: { pretty?: boolean }
): string;
export declare function serializeCanvasJSONL(document: CanvasDocument): string;
export declare function serializeCanvasMDX(
  document: CanvasDocument,
  options?: { importPath?: string }
): string;
export declare function getStoredCanvasDocument(key: string): CanvasDocument | null;
export declare function saveStoredCanvasDocument(key: string, document: CanvasDocument): void;
export declare function clearStoredCanvasDocument(key: string): void;
export declare function canvasColorFromNoteColor(color: string): JSONCanvasColor | string;
export declare function applyCanvasGeometry(
  document: CanvasDocument,
  changes: readonly Partial<JSONCanvasNode>[]
): CanvasDocument;
export declare const JSON_CANVAS_NODE_TYPES: readonly JSONCanvasNodeType[];
export declare const JSON_CANVAS_SIDES: readonly JSONCanvasSide[];
export declare const JSON_CANVAS_ENDS: readonly JSONCanvasEnd[];
export declare const JSON_CANVAS_NOTE_COLORS: Readonly<Record<string, string>>;

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

export interface FramePathAffix {
  /** String added to the iframe URL. A leading ? adds query parameters. */
  value: string;
  /** Show this value in the Frame header route. */
  visible: boolean;
  /** Include this value when opening the Frame URL externally. Default: true */
  external?: boolean;
  /** Apply only during Vite development or production builds. Omit for both. */
  env?: 'dev' | 'prod';
}

export interface FrameProps extends Omit<BlockProps, 'children'> {
  /** Same-origin URL, path, query, or hash route rendered inside the frame. */
  route: string | URL;
  /** Accessible frame title shown in the title bar. */
  title: string;
  /** Optional state description shown beside the title in smaller type. */
  description?: string;
  /** Ordered entries added before the iframe URL pathname. */
  prepend?: readonly FramePathAffix[];
  /** Ordered entries added after the iframe URL pathname. */
  append?: readonly FramePathAffix[];
  /** @deprecated Use append. Legacy objects and arrays remain accepted at runtime. */
  apend?: FramePathAffix | readonly FramePathAffix[];
  /** Initial frame width in pixels. A saved width takes precedence. Default: 1270 */
  width?: number;
  /** Initial frame height in pixels. A saved height takes precedence. Default: 776 */
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

export interface LinkProps extends Omit<BlockProps, 'children'> {
  /** Absolute HTTP(S) destination. Its origin supplies /favicon.ico. */
  url: string | URL;
  /** Link title shown in the card. */
  title: string;
  /** URL text shown under the title. */
  displayUrl: string;
  /** Static card width in pixels. Default: 320 */
  width?: number;
  /** Optional static card height in pixels. */
  height?: number;
}

export declare function Link(props: LinkProps): ReactElement;

export interface ImageProps
  extends Omit<BlockProps, 'children' | 'onLoad' | 'onError'> {
  /** Browser-resolvable image URL or imported asset URL. */
  src: string;
  /** Accessible alternative text. Empty means decorative. Default: '' */
  alt?: string;
  /** Initial width in pixels. Saved width takes precedence. Default: 400 */
  width?: number;
  /** Initial height in pixels. Saved height takes precedence. Default: 300 */
  height?: number;
  /** Minimum resizable width in pixels. Default: 100 */
  minWidth?: number;
  /** Minimum resizable height in pixels. Default: 60 */
  minHeight?: number;
  /** Browser image loading behavior. Default: 'lazy' */
  loading?: ImgHTMLAttributes<HTMLImageElement>['loading'];
  /** Browser image decoding behavior. Default: 'async' */
  decoding?: ImgHTMLAttributes<HTMLImageElement>['decoding'];
  onLoad?: ImgHTMLAttributes<HTMLImageElement>['onLoad'];
  onError?: ImgHTMLAttributes<HTMLImageElement>['onError'];
  onSizeChange?: (size: Size) => void;
}

export declare function Image(props: ImageProps): ReactElement;

export interface GroupProps extends Omit<BlockProps, 'children'> {
  label?: string;
  background?: string;
  backgroundStyle?: 'cover' | 'ratio' | 'repeat';
  width?: number;
  height?: number;
  children?: ReactNode;
}

export declare function Group(props: GroupProps): ReactElement;

export interface JsonCanvasProps extends Omit<CanvasProps, 'children'> {
  document: CanvasDocument | string;
  renderers?: Readonly<Record<string, (props: Record<string, unknown>) => ReactElement>>;
  onDocumentChange?: (document: CanvasDocument, change: Record<string, number | string>) => void;
  format?: 'json' | 'jsonl' | 'mdx';
  compileMDX?: (source: string) => unknown | Promise<unknown>;
  onMaterializeWarning?: (warnings: CanvasValidationIssue[]) => void;
  storageKey?: string;
}

export declare const JsonCanvas: React.ForwardRefExoticComponent<
  JsonCanvasProps & React.RefAttributes<CanvasHandle>
>;

export type WidgetDefaults<Props> = Partial<
  Omit<Props, 'id' | 'children'>
>;

export interface TinyCanvasWidgetConfig {
  Block?: WidgetDefaults<BlockProps>;
  Frame?: WidgetDefaults<FrameProps>;
  Note?: WidgetDefaults<NoteProps>;
  Mark?: WidgetDefaults<MarkProps>;
  Link?: WidgetDefaults<LinkProps>;
  Image?: WidgetDefaults<ImageProps>;
}

export interface UseResetCanvasOptions {
  /** Reload the page after clearing state. Default: false */
  reload?: boolean;
}

/** Returns a function that clears all saved canvas layout state from localStorage. */
export declare function useResetCanvas(options?: UseResetCanvasOptions): () => void;
