import { ReactNode } from 'react';

export interface CanvasProps {
  children?: ReactNode;
  /** Enable centered layout. Default: true */
  centered?: boolean;
  /** Show dot-grid background. Default: false */
  grid?: boolean;
  /** Grid snap size in pixels when grid is enabled. Default: 18 */
  gridSize?: number;
}

export declare function Canvas(props: CanvasProps): JSX.Element;

export interface DraggableProps {
  children?: ReactNode;
  /** Grid snap size in pixels. When undefined, no snapping is applied. */
  gridSize?: number;
}

export declare function Draggable(props: DraggableProps): JSX.Element;

export interface UseResetCanvasOptions {
  /** Reload the page after clearing state. Default: false */
  reload?: boolean;
}

/** Returns a function that clears all saved canvas positions from localStorage. */
export declare function useResetCanvas(options?: UseResetCanvasOptions): () => void;

export declare function findDragId(children: ReactNode): string | null;
export declare function getQueue(dragId: string): { x: number; y: number };
export declare function refreshStorage(): void;
export declare function saveDrag(dragId: string, x: number, y: number): void;
