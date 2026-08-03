import { useId, useRef, useState } from 'react';
import Block from './Block';
import { getSavedSize, saveSize } from './utils';

function dimension(value, propName, componentName) {
  if (value === undefined) {
    return undefined;
  }

  if (!Number.isFinite(value) || value <= 0) {
    throw new TypeError(
      `${componentName} ${propName} must be a positive finite number.`
    );
  }

  return value;
}

export default function ResizableBlock({
  children,
  componentName,
  resizeLabel,
  defaultWidth,
  defaultHeight,
  width = defaultWidth,
  height = defaultHeight,
  minWidth,
  minHeight,
  onSizeChange,
  id,
  blockId,
  className,
  style,
  surfaceClassName,
  ...blockProps
}) {
  const initialWidth = dimension(width, 'width', componentName);
  const initialHeight = dimension(height, 'height', componentName);
  const minimumWidth = dimension(minWidth, 'minWidth', componentName);
  const minimumHeight = dimension(minHeight, 'minHeight', componentName);
  const generatedId = useId().replaceAll(':', '');
  const resolvedId = blockId ?? id ?? `tc-${componentName.toLowerCase()}-${generatedId}`;
  const surfaceRef = useRef(null);
  const resizeStartRef = useRef(null);
  const currentSizeRef = useRef(null);
  const [size, setSize] = useState(() => {
    const savedSize = getSavedSize(resolvedId);
    return {
      width:
        savedSize?.width === undefined
          ? initialWidth
          : Math.max(minimumWidth, savedSize.width),
      height:
        savedSize?.height === undefined
          ? initialHeight
          : Math.max(minimumHeight, savedSize.height),
    };
  });

  const updateSize = (nextSize, persist = false) => {
    currentSizeRef.current = nextSize;
    setSize(nextSize);
    onSizeChange?.(nextSize);
    if (persist) {
      saveSize(resolvedId, nextSize);
    }
  };

  const finishResize = (event) => {
    const resizeStart = resizeStartRef.current;
    if (!resizeStart || resizeStart.pointerId !== event.pointerId) {
      return;
    }

    const nextSize = currentSizeRef.current;
    resizeStartRef.current = null;
    if (nextSize) {
      saveSize(resolvedId, nextSize);
    }
  };

  return (
    <Block
      {...blockProps}
      id={id}
      blockId={resolvedId}
      className={['tc-resizable-block', className].filter(Boolean).join(' ')}
      style={{
        ...style,
        ...(size.width === undefined ? {} : { width: size.width }),
        ...(size.height === undefined ? {} : { height: size.height }),
      }}
    >
      <div
        ref={surfaceRef}
        className={['tc-resizable-surface', surfaceClassName]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </div>
      <button
        type="button"
        className="tc-resize-handle tc-no-drag"
        aria-label={resizeLabel}
        title="Drag to resize. Use arrow keys for precise resizing."
        onPointerDown={(event) => {
          if (!surfaceRef.current) {
            return;
          }

          event.preventDefault();
          event.stopPropagation();
          const rect = surfaceRef.current.getBoundingClientRect();
          const startingSize = { width: rect.width, height: rect.height };
          resizeStartRef.current = {
            pointerId: event.pointerId,
            clientX: event.clientX,
            clientY: event.clientY,
            ...startingSize,
          };
          currentSizeRef.current = startingSize;
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const resizeStart = resizeStartRef.current;
          if (!resizeStart || resizeStart.pointerId !== event.pointerId) {
            return;
          }

          event.preventDefault();
          updateSize({
            width: Math.max(
              minimumWidth,
              resizeStart.width + event.clientX - resizeStart.clientX
            ),
            height: Math.max(
              minimumHeight,
              resizeStart.height + event.clientY - resizeStart.clientY
            ),
          });
        }}
        onPointerUp={finishResize}
        onPointerCancel={finishResize}
        onKeyDown={(event) => {
          const deltas = {
            ArrowLeft: [-10, 0],
            ArrowRight: [10, 0],
            ArrowUp: [0, -10],
            ArrowDown: [0, 10],
          };
          const delta = deltas[event.key];
          if (!delta || !surfaceRef.current) {
            return;
          }

          event.preventDefault();
          event.stopPropagation();
          const rect = surfaceRef.current.getBoundingClientRect();
          updateSize(
            {
              width: Math.max(minimumWidth, rect.width + delta[0]),
              height: Math.max(minimumHeight, rect.height + delta[1]),
            },
            true
          );
        }}
      />
    </Block>
  );
}
