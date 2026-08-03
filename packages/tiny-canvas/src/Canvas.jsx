import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CanvasContext } from './CanvasContext';
import { isAuthorizedCanvasChild } from './canvasChild';
import { writeClipboardText } from './clipboard';
import { useResetCanvas } from './useResetCanvas';
import {
  formatCanvasChanges,
  generateBlockId,
  getCanvasChanges,
} from './utils';

function Canvas({
  children,
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
  onSelectionChange,
  ...rest
}) {
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [copyStatus, setCopyStatus] = useState('idle');
  const copyStatusTimer = useRef(null);
  const resetCanvas = useResetCanvas({ reload: true });
  useEffect(
    () => () => clearTimeout(copyStatusTimer.current),
    []
  );
  const showDots = dotted || grid;
  const blockIds = new Set();
  const blocks = new Map();
  const contextValue = useMemo(
    () => ({
      selectedBlockId,
      selectBlock: (nextBlockId) => {
        setSelectedBlockId(nextBlockId);
        onSelectionChange?.(nextBlockId);
      },
    }),
    [onSelectionChange, selectedBlockId]
  );
  const renderedChildren = Children.map(children, (child, index) => {
    if (child === null || child === undefined || child === false) {
      return null;
    }

    if (!isValidElement(child) || !isAuthorizedCanvasChild(child)) {
      throw new TypeError(
        'Canvas only accepts authorized canvas components such as <Block> and <Frame>.'
      );
    }

    const blockId = child.props.id || generateBlockId(child, index);
    if (blockIds.has(blockId)) {
      throw new TypeError(`Canvas block IDs must be unique: "${blockId}".`);
    }
    blockIds.add(blockId);
    blocks.set(blockId, {
      component:
        child.type.displayName || child.type.name || 'Canvas component',
      index,
      ...(child.key === null ? {} : { key: String(child.key) }),
    });

    return cloneElement(child, {
      key: blockId,
      blockId,
    });
  });

  return (
    <CanvasContext.Provider value={contextValue}>
      <main
        {...rest}
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
      >
        {renderedChildren}
        {resettable || copyable ? (
          <div className="tc-canvas-controls tc-no-drag">
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
        ) : null}
      </main>
    </CanvasContext.Provider>
  );
}

export default Canvas;
