import { useRef, useEffect, useState } from 'react';
import { useDraggable } from '@neodrag/react';
import { refreshStorage, getSavedPosition, saveDrag } from './utils';

const TRANSLATION_MS = 250;
const ORIGIN = { x: 0, y: 0 };

function Draggable({ children, gridSize, dragId, defaultPosition = ORIGIN }) {
  const draggableRef = useRef(null);
  const savedPosition = useRef(getSavedPosition(dragId)).current;
  const initialPosition = defaultPosition ?? ORIGIN;

  const [onTranslation, setOnTranslation] = useState(false);
  const [position, setPosition] = useState(initialPosition);
  const [rotationVariation, setRotationVariation] = useState(
    Math.random() < 0.5 ? -0.5 : 0.5
  );

  // Animate elements with saved positions on mount
  useEffect(() => {
    const el = draggableRef.current;
    if (
      el &&
      dragId &&
      savedPosition &&
      (savedPosition.x !== 0 || savedPosition.y !== 0)
    ) {
      el.classList.add('tc-on-translation');
      setOnTranslation(true);

      const timer = setTimeout(() => {
        el.classList.remove('tc-on-translation');
        setOnTranslation(false);
      }, TRANSLATION_MS * 4);

      return () => clearTimeout(timer);
    }
  }, [dragId, savedPosition]);

  // Restore saved positions from localStorage
  useEffect(() => {
    refreshStorage();
    if (draggableRef.current && savedPosition) {
      setPosition({ x: savedPosition.x, y: savedPosition.y });
    }
  }, [savedPosition]);

  // Free-drag during drag, snap to grid on drop
  const { isDragging } = useDraggable(draggableRef, {
    axis: 'both',
    bounds: 'body',
    threshold: { delay: 50, distance: 30 },
    defaultClass: 'tc-drag',
    defaultClassDragging: 'tc-on',
    defaultClassDragged: 'tc-off',
    applyUserSelectHack: true,
    position: { x: position.x, y: position.y },
    onDrag: ({ offsetX, offsetY }) => setPosition({ x: offsetX, y: offsetY }),
    onDragEnd: (data) => {
      setPosition({ x: data.offsetX, y: data.offsetY });
      if (dragId !== null) {
        saveDrag(dragId, data.offsetX, data.offsetY);
      }
    },
  });

  const rotation =
    isDragging || onTranslation ? `${rotationVariation}deg` : '0deg';

  useEffect(() => {
    setRotationVariation(Math.random() < 0.5 ? -0.5 : 0.5);
  }, [isDragging]);

  return (
    <article
      ref={draggableRef}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <div
        className="tc-draggable-inner"
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

export default Draggable;
