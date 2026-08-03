import { useId, useRef, useState } from 'react';
import Block from './Block';
import { authorizeCanvasChild } from './canvasChild';
import { buildFrameHref } from './frameUrl';
import { getSavedSize, saveSize } from './utils';

function dimension(value, propName) {
  if (value === undefined) {
    return undefined;
  }

  if (!Number.isFinite(value) || value <= 0) {
    throw new TypeError(`Frame ${propName} must be a positive finite number.`);
  }

  return value;
}

function Frame({
  route,
  title,
  width,
  height,
  minWidth = DEFAULT_MIN_WIDTH,
  minHeight = DEFAULT_MIN_HEIGHT,
  onSizeChange,
  id,
  blockId,
  className,
  style,
  ...blockProps
}) {
  const initialWidth = dimension(width, 'width');
  const initialHeight = dimension(height, 'height');
  const minimumWidth = dimension(minWidth, 'minWidth');
  const minimumHeight = dimension(minHeight, 'minHeight');
  const generatedId = useId().replaceAll(':', '');
  const resolvedId = blockId ?? id ?? `tc-frame-${generatedId}`;
  const frameRef = useRef(null);
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
      className={['tc-frame-block', className].filter(Boolean).join(' ')}
      style={{
        ...style,
        ...(size.width === undefined ? {} : { width: size.width }),
        ...(size.height === undefined ? {} : { height: size.height }),
      }}
    >
      <section ref={frameRef} className="tc-frame">
        <div className="tc-frame-title-bar">
          <span className="tc-frame-title">{title}</span>
          <span className="tc-frame-route">{String(route)}</span>
        </div>
        <iframe
          className="tc-frame-viewport"
          src={buildFrameHref(route)}
          title={title}
        />
        <button
          type="button"
          className="tc-frame-resize-handle tc-no-drag"
          aria-label={`Resize ${title}`}
          title="Drag to resize. Use arrow keys for precise resizing."
          onPointerDown={(event) => {
            if (!frameRef.current) {
              return;
            }

            event.preventDefault();
            event.stopPropagation();
            const rect = frameRef.current.getBoundingClientRect();
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
            if (!delta || !frameRef.current) {
              return;
            }

            event.preventDefault();
            event.stopPropagation();
            const rect = frameRef.current.getBoundingClientRect();
            updateSize(
              {
                width: Math.max(minimumWidth, rect.width + delta[0]),
                height: Math.max(minimumHeight, rect.height + delta[1]),
              },
              true
            );
          }}
        />
      </section>
    </Block>
  );
}

Frame.displayName = 'Frame';

export default authorizeCanvasChild(Frame);
