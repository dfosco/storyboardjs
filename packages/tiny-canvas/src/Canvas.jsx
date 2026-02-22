import { Children } from 'react';
import Draggable from './Draggable';

const DEFAULT_GRID_SIZE = 18;

function Canvas({
  children,
  centered = true,
  grid = false,
  gridSize = DEFAULT_GRID_SIZE,
}) {
  const centeredStyle = centered
    ? {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        alignItems: 'center',
        justifyContent: 'center',
      }
    : null;

  const computedGridSize = grid ? gridSize : undefined;

  return (
    <main className="tc-canvas" style={centeredStyle} data-grid={grid}>
      {Children.map(children, (child, index) => (
        <Draggable key={index} gridSize={computedGridSize}>
          {child}
        </Draggable>
      ))}
    </main>
  );
}

export default Canvas;
