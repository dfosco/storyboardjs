import {
  Children,
  cloneElement,
  isValidElement,
  useMemo,
  useState,
} from 'react';
import { CanvasContext } from './CanvasContext';
import { isAuthorizedCanvasChild } from './canvasChild';
import { generateBlockId } from './utils';

function Canvas({
  children,
  dotted = false,
  grid = false,
  gridSize = 36,
  colorMode = 'auto',
  className,
  style,
  onPointerDown,
  onSelectionChange,
  ...rest
}) {
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const showDots = dotted || grid;
  const blockIds = new Set();
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
      </main>
    </CanvasContext.Provider>
  );
}

export default Canvas;
