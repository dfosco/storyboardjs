import { useRef } from 'react';
import { useDraggable } from '@neodrag/react';
import styles from "./draggable.module.css";
import "../css/globals.css";

// Pull value from --golden-number in globals.css, trim `px` from the end, and save it as a int in a const
const golden = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--golden-number')) / 2;

function Draggable({ children }) {
  const draggableRef = useRef(null);
  const { isDragging } = useDraggable(draggableRef, {
    axis: 'both',
    // grid: [golden, golden],
    bounds: 'body',
    threshold: { delay: 30, distance: 4 },
    defaultClass: 'drag',
    defaultClassDragging: 'on',
    defaultClassDragged: 'off',
    applyUserSelectHack: true,
    defaultPosition: { x: 0, y: 0 },
    onDragStart: (data) => {
      console.log('Started dragging:', data);
    },
    onDragEnd: (data) => {
      console.log('Finished dragging:', data);  
    }
  });

  // const rotation = Math.random() * 4 - 2;;
  const rotationVariations = useRef(Math.random() * 4 - 2).current;
  const rotation = isDragging ? `${rotationVariations}deg` : '0deg';
  
  return (
    <article 
      ref={draggableRef} 
      style={{  cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <div className={styles.draggable} style={{ transform: isDragging && `rotate(${rotation})`, transition: 'transform ease-in-out 150ms' }}>
        {children}
      </div>
    </article>
  );
}

export default Draggable;
