import { useRef, useEffect, useState } from 'react';
import { useDraggable } from '@neodrag/react';
import styles from "./draggable.module.css";
import "../css/globals.css";
import { findDragId, refreshStorage, getQueue, saveDrag } from '../templates/utils';

// Pull value from --golden-number in globals.css, trim `px` from the end, and save it as a int in a const
const golden = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--golden-number')) / 2;



function Draggable({ children }) {
  const draggableRef = useRef(null);
  const dragId = useRef(findDragId(children)).current;
  const queue = useRef(getQueue(dragId)).current;
  
  useEffect(() => {
    // On page load, apply class .on-transition to all draggables and remove it after 150ms (coming from a variable)
    refreshStorage();
    if (draggableRef.current && queue) {
      setPosition({ x: queue.x, y: queue.y }); 
    }
    console.log("position", position);

  }, [queue]);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const { isDragging } = useDraggable(draggableRef, {
    axis: 'both',
    grid: [golden, golden],
    bounds: 'body',
    threshold: { delay: 30, distance: 4 },
    defaultClass: 'drag',
    defaultClassDragging: 'on',
    defaultClassDragged: 'off',
    // applyUserSelectHack: true,
    position: {  x: position.x, y: position.y },
    // onDragStart: () => setPosition({ x: 0, y: 0 }),
    onDrag: ({ offsetX, offsetY }) => setPosition({ x: offsetX, y: offsetY }),
    onDragEnd: (data) => {
      setPosition({ x: data.offsetX, y: data.offsetY }); 
      saveDrag(dragId, data.offsetX, data.offsetY); 
      console.log('DragEnd to:', position);
    }
  });

  const rotationVariations = useRef(Math.random() * 4 - 2).current;
  const rotation = isDragging ? `${rotationVariations}deg` : '0deg';
  
  return (
    <article 
      ref={draggableRef} 
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <div className={styles.draggable} style={{ transform: isDragging && `rotate(${rotation})`, transition: 'transform ease-in-out 150ms' }}>
        {children}
      </div>
    </article>
  );
}

export default Draggable;
