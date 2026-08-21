import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { CanvasContext } from './CanvasContext';
import PageSelector, {
  getCanvasConfig,
  getCanvasPageContext,
} from './PageSelector';
import { isAuthorizedCanvasChild } from './canvasChild';
import { writeClipboardText } from './clipboard';
import { useResetCanvas } from './useResetCanvas';
import EdgeLayer from './EdgeLayer';
import {
  formatCanvasChanges,
  generateBlockId,
  getCanvasChanges,
} from './utils';
import { applyCanvasGeometry, materializeReactChildren } from './jsoncanvas';

const ZOOM_LEVELS = [0.1, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];
const DEFAULT_ZOOM_INDEX = ZOOM_LEVELS.indexOf(1);
const WHEEL_ZOOM_THRESHOLD = 40;
const DEFAULT_CANVAS_WIDTH = 10000;
const DEFAULT_CANVAS_HEIGHT = 10000;

function canvasDimension(value, propName) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new TypeError(`Canvas ${propName} must be a positive finite number.`);
  }

  return value;
}

const Canvas = forwardRef(function Canvas({
  children,
  title,
  canvasWidth = DEFAULT_CANVAS_WIDTH,
  canvasHeight = DEFAULT_CANVAS_HEIGHT,
  dotted = false,
  grid = false,
  gridSize = 36,
  colorMode = 'auto',
  resettable = false,
  resetLabel = 'Reset board',
  copyable = resettable,
  copyLabel = 'Copy changes',
  copiedLabel = 'Copied',
  onCopyChanges,
  className,
  style,
  onPointerDown,
  onWheel,
  onScroll,
  onSelectionChange,
  edges = [],
  graphNodes = [],
  viewport: controlledViewport,
  onViewportChange,
  viewportFromUrl = true,
  viewportToUrl = false,
  ...rest
}, ref) {
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [copyStatus, setCopyStatus] = useState('idle');
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX);
  const canvasRef = useRef(null);
  const zoomIndexRef = useRef(DEFAULT_ZOOM_INDEX);
  const wheelZoomDeltaRef = useRef(0);
  const pendingZoomAnchorRef = useRef(null);
  const pendingViewportRef = useRef(null);
  const didReadViewportUrlRef = useRef(false);
  const pendingViewportNodeRef = useRef(null);
  const copyStatusTimer = useRef(null);
  const resetCanvas = useResetCanvas({ reload: true });
  useEffect(
    () => () => clearTimeout(copyStatusTimer.current),
    []
  );
  const showDots = dotted || grid;
  const zoom = ZOOM_LEVELS[zoomIndex];
  const boardWidth = canvasDimension(canvasWidth, 'canvasWidth');
  const boardHeight = canvasDimension(canvasHeight, 'canvasHeight');
  const canvasConfig = getCanvasConfig();
  const pageContext = getCanvasPageContext(canvasConfig);
  const pageId = pageContext?.currentPage.id;
  const blockIds = new Set();
  const blocks = new Map();
  const zoomAt = useCallback((nextIndex, clientX, clientY) => {
    const canvas = canvasRef.current;
    const resolvedIndex = Math.max(
      0,
      Math.min(ZOOM_LEVELS.length - 1, nextIndex)
    );
    const currentIndex = zoomIndexRef.current;
    if (!canvas || resolvedIndex === currentIndex) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const viewportX = clientX - rect.left;
    const viewportY = clientY - rect.top;
    const currentZoom = ZOOM_LEVELS[currentIndex];
    pendingZoomAnchorRef.current = {
      canvas,
      contentX: (canvas.scrollLeft + viewportX) / currentZoom,
      contentY: (canvas.scrollTop + viewportY) / currentZoom,
      viewportX,
      viewportY,
    };
    zoomIndexRef.current = resolvedIndex;
    setZoomIndex(resolvedIndex);
  }, []);

  const readViewport = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, zoom, width: 0, height: 0 };
    return {
      x: canvas.scrollLeft / zoom,
      y: canvas.scrollTop / zoom,
      zoom,
      width: canvas.clientWidth / zoom,
      height: canvas.clientHeight / zoom,
    };
  }, [zoom]);

  const notifyViewport = useCallback(() => {
    const nextViewport = readViewport();
    onViewportChange?.(nextViewport);
    if (viewportToUrl && typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('canvasX', String(Math.round(nextViewport.x)));
      url.searchParams.set('canvasY', String(Math.round(nextViewport.y)));
      url.searchParams.set('canvasZoom', String(nextViewport.zoom));
      window.history.replaceState(window.history.state, '', url);
    }
  }, [onViewportChange, readViewport, viewportToUrl]);

  const zoomIndexFor = (value) => {
    let bestIndex = DEFAULT_ZOOM_INDEX;
    let bestDistance = Infinity;
    ZOOM_LEVELS.forEach((level, index) => {
      const distance = Math.abs(level - value);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });
    return bestIndex;
  };

  const setViewport = useCallback((nextViewport = {}) => {
    const canvas = canvasRef.current;
    const currentViewport = readViewport();
    const nextZoom = Number.isFinite(nextViewport.zoom) ? nextViewport.zoom : currentViewport.zoom;
    const nextIndex = zoomIndexFor(Math.max(ZOOM_LEVELS[0], Math.min(ZOOM_LEVELS.at(-1), nextZoom)));
    const target = {
      x: Math.max(0, Number.isFinite(nextViewport.x) ? nextViewport.x : currentViewport.x),
      y: Math.max(0, Number.isFinite(nextViewport.y) ? nextViewport.y : currentViewport.y),
    };
    const currentIndex = zoomIndexRef.current;
    pendingViewportRef.current = target;
    zoomIndexRef.current = nextIndex;
    setZoomIndex(nextIndex);
    if (canvas && nextIndex === currentIndex) {
      pendingViewportRef.current = null;
      canvas.scrollLeft = target.x * ZOOM_LEVELS[nextIndex];
      canvas.scrollTop = target.y * ZOOM_LEVELS[nextIndex];
      notifyViewport();
    }
  }, [notifyViewport, readViewport]);

  const centerOnNode = useCallback((nodeId, options = {}) => {
    const node = graphNodes.find((item) => item.id === nodeId);
    if (!node) return false;
    const current = readViewport();
    const zoomValue = options.zoom ?? current.zoom;
    setViewport({
      x: node.x + node.width / 2 - current.width / (2 * zoomValue / current.zoom),
      y: node.y + node.height / 2 - current.height / (2 * zoomValue / current.zoom),
      zoom: zoomValue,
    });
    return true;
  }, [graphNodes, readViewport, setViewport]);

  const fitToNodes = useCallback((nodeIds, options = {}) => {
    const selectedNodes = nodeIds?.length
      ? graphNodes.filter((node) => nodeIds.includes(node.id))
      : graphNodes;
    if (!selectedNodes.length) return false;
    const padding = options.padding ?? 48;
    const bounds = selectedNodes.reduce(
      (result, node) => ({
        left: Math.min(result.left, node.x),
        top: Math.min(result.top, node.y),
        right: Math.max(result.right, node.x + node.width),
        bottom: Math.max(result.bottom, node.y + node.height),
      }),
      { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity }
    );
    const current = readViewport();
    const availableWidth = Math.max(1, current.width - padding * 2);
    const availableHeight = Math.max(1, current.height - padding * 2);
    const zoomValue = Math.max(
      ZOOM_LEVELS[0],
      Math.min(ZOOM_LEVELS.at(-1), Math.min(availableWidth / (bounds.right - bounds.left), availableHeight / (bounds.bottom - bounds.top)))
    );
    setViewport({
      x: (bounds.left + bounds.right) / 2 - current.width / (2 * zoomValue / current.zoom),
      y: (bounds.top + bounds.bottom) / 2 - current.height / (2 * zoomValue / current.zoom),
      zoom: zoomValue,
    });
    return true;
  }, [graphNodes, readViewport, setViewport]);

  const zoomAtViewportCenter = (nextIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    zoomAt(
      nextIndex,
      rect.left + canvas.clientWidth / 2,
      rect.top + canvas.clientHeight / 2
    );
  };

  const zoomByWheel = useCallback(
    (deltaY, clientX, clientY) => {
      wheelZoomDeltaRef.current -= deltaY;
      if (Math.abs(wheelZoomDeltaRef.current) < WHEEL_ZOOM_THRESHOLD) {
        return;
      }

      const direction = Math.sign(wheelZoomDeltaRef.current);
      wheelZoomDeltaRef.current = 0;
      zoomAt(zoomIndexRef.current + direction, clientX, clientY);
    },
    [zoomAt]
  );

  useLayoutEffect(() => {
    const viewport = pendingViewportRef.current;
    if (viewport) {
      const currentZoom = ZOOM_LEVELS[zoomIndexRef.current];
      canvasRef.current.scrollLeft = viewport.x * currentZoom;
      canvasRef.current.scrollTop = viewport.y * currentZoom;
      pendingViewportRef.current = null;
      notifyViewport();
      return;
    }
    const anchor = pendingZoomAnchorRef.current;
    if (!anchor) {
      return;
    }

    anchor.canvas.scrollLeft = anchor.contentX * zoom - anchor.viewportX;
    anchor.canvas.scrollTop = anchor.contentY * zoom - anchor.viewportY;
    pendingZoomAnchorRef.current = null;
    notifyViewport();
  }, [notifyViewport, zoom]);

  useEffect(() => {
    if (controlledViewport) setViewport(controlledViewport);
  }, [controlledViewport?.x, controlledViewport?.y, controlledViewport?.zoom, setViewport]);

  useEffect(() => {
    if (!viewportFromUrl || typeof window === 'undefined') return;
    if (!didReadViewportUrlRef.current) {
      didReadViewportUrlRef.current = true;
      const params = new URLSearchParams(window.location.search);
      const rawX = params.get('canvasX');
      const rawY = params.get('canvasY');
      const rawZoom = params.get('canvasZoom');
      const x = rawX === null ? undefined : Number(rawX);
      const y = rawY === null ? undefined : Number(rawY);
      const urlZoom = rawZoom === null ? undefined : Number(rawZoom);
      const nodeId = params.get('canvasNode');
      pendingViewportNodeRef.current = nodeId;
      if (!nodeId && [x, y, urlZoom].some(Number.isFinite)) setViewport({ x, y, zoom: urlZoom });
    }
    const nodeId = pendingViewportNodeRef.current;
    if (nodeId && graphNodes.length && centerOnNode(nodeId)) {
      pendingViewportNodeRef.current = null;
    }
  }, [centerOnNode, graphNodes.length, setViewport, viewportFromUrl]);

  useEffect(() => {
    const handleMessage = (event) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;
      if (data.type === 'tiny-canvas:set-viewport') setViewport(data.viewport);
      if (data.type === 'tiny-canvas:center-on-node') centerOnNode(data.nodeId, data.options);
      if (data.type === 'tiny-canvas:fit-to-nodes') fitToNodes(data.nodeIds, data.options);
      if (data.type === 'tiny-canvas:get-viewport') {
        event.source?.postMessage({ type: 'tiny-canvas:viewport', requestId: data.requestId, viewport: readViewport() }, event.origin || '*');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [centerOnNode, fitToNodes, readViewport, setViewport]);

  const getCanvasDocument = useCallback(() => {
    const materialized = materializeReactChildren(children);
    return applyCanvasGeometry(materialized.document, getCanvasChanges(blocks));
  }, [blocks, children]);

  useImperativeHandle(ref, () => ({
    getViewport: readViewport,
    setViewport,
    panTo: ({ x = 0, y = 0 } = {}, options) => setViewport({ x, y, ...options }),
    centerOnNode,
    fitToNodes,
    zoomTo: (value) => setViewport({ zoom: value }),
    zoomBy: (delta) => setViewport({ zoom: zoom + delta }),
    getDocument: getCanvasDocument,
  }), [centerOnNode, fitToNodes, getCanvasDocument, readViewport, setViewport, zoom]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const handleWheelZoom = (event) => {
      if ((!event.ctrlKey && !event.metaKey) || event.deltaY === 0) {
        return;
      }

      event.preventDefault();
      zoomByWheel(event.deltaY, event.clientX, event.clientY);
    };
    canvas.addEventListener('wheel', handleWheelZoom, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheelZoom);
  }, [zoomByWheel]);

  const contextValue = useMemo(
    () => ({
      selectedBlockId,
      selectBlock: (nextBlockId) => {
        setSelectedBlockId(nextBlockId);
        onSelectionChange?.(nextBlockId);
      },
      zoom,
      zoomByWheel,
    }),
    [onSelectionChange, selectedBlockId, zoom, zoomByWheel]
  );
  const renderedChildren = Children.map(children, (child, index) => {
    if (child === null || child === undefined || child === false) {
      return null;
    }

    if (!isValidElement(child) || !isAuthorizedCanvasChild(child)) {
      throw new TypeError(
        'Canvas only accepts authorized canvas components such as <Block>, <Frame>, <Note>, <Mark>, <Link>, <Image>, and <Group>.'
      );
    }

    const component =
      child.type.displayName || child.type.name || 'Canvas component';
    const configuredProps = canvasConfig?.widgets?.[component];
    const widgetDefaults =
      configuredProps && typeof configuredProps === 'object'
        ? Object.fromEntries(
            Object.entries(configuredProps).filter(
              ([property]) =>
                !['id', 'blockId', 'children'].includes(property)
            )
          )
        : {};
    const sourceId = child.props.id || generateBlockId(child, index);
    const blockId = pageId
      ? `tc-page:${encodeURIComponent(pageId)}:${sourceId}`
      : sourceId;
    if (blockIds.has(blockId)) {
      throw new TypeError(`Canvas block IDs must be unique: "${blockId}".`);
    }
    blockIds.add(blockId);
    blocks.set(blockId, {
      component,
      index,
      sourceId,
      ...(pageId
        ? { pageId, pageTitle: title || pageContext.currentPage.title }
        : {}),
      ...(child.key === null ? {} : { key: String(child.key) }),
    });

    return cloneElement(child, {
      ...widgetDefaults,
      ...child.props,
      key: blockId,
      blockId,
    });
  });

  return (
    <CanvasContext.Provider value={contextValue}>
      <main
        {...rest}
        ref={canvasRef}
        className={['tc-canvas', className].filter(Boolean).join(' ')}
        data-dotted={showDots || undefined}
        data-color-mode={colorMode !== 'auto' ? colorMode : undefined}
        style={{
          '--tc-grid-size': `${gridSize}px`,
          ...style,
        }}
        onPointerDown={(event) => {
          if (event.target === event.currentTarget) {
            contextValue.selectBlock(null);
          }
          onPointerDown?.(event);
        }}
        onWheel={onWheel}
        onScroll={(event) => {
          onScroll?.(event);
          notifyViewport();
        }}
      >
        <PageSelector title={title} />
        <div
          className="tc-canvas-board"
          style={{
            '--tc-canvas-zoom': zoom,
            '--tc-canvas-width': `${boardWidth}px`,
            '--tc-canvas-height': `${boardHeight}px`,
          }}
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) {
              contextValue.selectBlock(null);
            }
          }}
        >
          <EdgeLayer
            edges={edges}
            nodes={graphNodes}
            width={boardWidth}
            height={boardHeight}
          />
          {renderedChildren}
        </div>
        <div className="tc-canvas-controls tc-no-drag">
          <div className="tc-canvas-zoom" role="group" aria-label="Canvas zoom">
            <button
              type="button"
              className="tc-canvas-control tc-canvas-zoom-button"
              aria-label="Zoom out"
              disabled={zoomIndex === 0}
              onClick={() =>
                zoomAtViewportCenter(zoomIndexRef.current - 1)
              }
            >
              −
            </button>
            <button
              type="button"
              className="tc-canvas-control tc-canvas-zoom-value"
              aria-label="Reset zoom"
              onClick={() => zoomAtViewportCenter(DEFAULT_ZOOM_INDEX)}
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              className="tc-canvas-control tc-canvas-zoom-button"
              aria-label="Zoom in"
              disabled={zoomIndex === ZOOM_LEVELS.length - 1}
              onClick={() =>
                zoomAtViewportCenter(zoomIndexRef.current + 1)
              }
            >
              +
            </button>
          </div>
          {resettable ? (
            <button
              type="button"
              className="tc-canvas-control"
              onClick={resetCanvas}
            >
              {resetLabel}
            </button>
          ) : null}
          {copyable ? (
            <button
              type="button"
              className="tc-canvas-control"
              onClick={async () => {
                const changes = getCanvasChanges(blocks);
                const text = formatCanvasChanges(changes);
                try {
                  await writeClipboardText(text);
                } catch (error) {
                  console.error('Error copying canvas changes:', error);
                  setCopyStatus('failed');
                  return;
                }

                setCopyStatus('copied');
                onCopyChanges?.(changes, text);
                clearTimeout(copyStatusTimer.current);
                copyStatusTimer.current = setTimeout(
                  () => setCopyStatus('idle'),
                  1600
                );
              }}
            >
              {copyStatus === 'copied'
                ? copiedLabel
                : copyStatus === 'failed'
                  ? 'Copy failed'
                  : copyLabel}
            </button>
          ) : null}
        </div>
      </main>
    </CanvasContext.Provider>
  );
});

export default Canvas;
