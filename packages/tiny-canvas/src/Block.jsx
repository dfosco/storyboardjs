import {
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { useDraggable } from '@neodrag/react';
import { CanvasContext } from './CanvasContext';
import { authorizeCanvasChild } from './canvasChild';
import { getSavedPosition, savePosition } from './utils';

const TRANSLATION_MS = 250;

function coordinate(value, propName) {
  if (!Number.isFinite(value)) {
    throw new TypeError(`Block ${propName} must be a finite number.`);
  }

  return value;
}

function Block({
  children,
  id,
  blockId,
  x = 0,
  y = 0,
  selected,
  onPositionChange,
  onSelectionChange,
  className,
  style,
  onFocus,
  onKeyDown,
  onPointerDown,
  ...rest
}) {
  const initialX = coordinate(x, 'x');
  const initialY = coordinate(y, 'y');
  const generatedId = useId().replaceAll(':', '');
  const resolvedId = blockId ?? id ?? `tc-block-${generatedId}`;
  const blockRef = useRef(null);
  const [savedPosition] = useState(() => getSavedPosition(resolvedId));
  const canvas = useContext(CanvasContext);
  const [standaloneSelected, setStandaloneSelected] = useState(false);
  const [onTranslation, setOnTranslation] = useState(false);
  const [position, setPosition] = useState(
    () =>
      savedPosition ?? {
        x: initialX,
        y: initialY,
      }
  );
  const [rotationVariation, setRotationVariation] = useState(
    Math.random() < 0.5 ? -0.5 : 0.5
  );

  const isSelected =
    selected ??
    (canvas
      ? canvas.selectedBlockId === resolvedId
      : standaloneSelected);

  const updateSelection = (nextSelected) => {
    if (selected === undefined) {
      if (canvas) {
        canvas.selectBlock(nextSelected ? resolvedId : null);
      } else {
        setStandaloneSelected(nextSelected);
      }
    }

    if (nextSelected !== isSelected) {
      onSelectionChange?.(nextSelected);
    }
  };

  useEffect(() => {
    const element = blockRef.current;
    if (
      !element ||
      !savedPosition ||
      (savedPosition.x === x && savedPosition.y === y)
    ) {
      return undefined;
    }

    element.classList.add('tc-block-translating');
    setOnTranslation(true);

    const timer = setTimeout(() => {
      element.classList.remove('tc-block-translating');
      setOnTranslation(false);
    }, TRANSLATION_MS * 4);

    return () => clearTimeout(timer);
  }, [savedPosition, x, y]);

  const { isDragging } = useDraggable(blockRef, {
    axis: 'both',
    bounds: 'body',
    threshold: { delay: 50, distance: 30 },
    defaultClass: 'tc-block-draggable',
    defaultClassDragging: 'tc-block-dragging',
    defaultClassDragged: 'tc-block-dragged',
    applyUserSelectHack: true,
    position,
    onDrag: ({ offsetX, offsetY }) => {
      const nextPosition = { x: offsetX, y: offsetY };
      setPosition(nextPosition);
      onPositionChange?.(nextPosition);
    },
    onDragEnd: ({ offsetX, offsetY }) => {
      const nextPosition = { x: offsetX, y: offsetY };
      setPosition(nextPosition);
      savePosition(resolvedId, nextPosition);
      onPositionChange?.(nextPosition);
    },
  });

  useEffect(() => {
    setRotationVariation(Math.random() < 0.5 ? -0.5 : 0.5);
  }, [isDragging]);

  const rotation =
    isDragging || onTranslation ? `${rotationVariation}deg` : '0deg';

  return (
    <article
      {...rest}
      ref={blockRef}
      id={id ?? resolvedId}
      className={['tc-block', className].filter(Boolean).join(' ')}
      data-block-id={resolvedId}
      data-selected={isSelected || undefined}
      tabIndex={0}
      style={{
        ...style,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onFocus={(event) => {
        updateSelection(true);
        onFocus?.(event);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          updateSelection(false);
          event.currentTarget.blur();
        }
        onKeyDown?.(event);
      }}
      onPointerDown={(event) => {
        updateSelection(true);
        onPointerDown?.(event);
      }}
    >
      <div
        className="tc-block-content"
        style={{
          transform:
            isDragging || onTranslation ? `rotate(${rotation})` : undefined,
          transition: 'transform ease-in-out 150ms',
        }}
      >
        {children}
      </div>
    </article>
  );
}

Block.displayName = 'Block';

export default authorizeCanvasChild(Block);
