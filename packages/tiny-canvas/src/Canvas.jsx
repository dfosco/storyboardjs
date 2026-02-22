import { Children } from 'react';
import Draggable from './Draggable';
import { findDragId, generateDragId } from './utils';

const DEFAULT_GRID_SIZE = 18;

function Canvas({
  children,
  centered = true,
  dotted = false,
  grid = false,
  gridSize = DEFAULT_GRID_SIZE,
  colorMode = 'auto',
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

  const showDots = dotted || grid;
  const computedGridSize = grid ? gridSize : undefined;

  return (
    <main
      className="tc-canvas"
      style={centeredStyle}
      data-dotted={showDots || undefined}
      data-color-mode={colorMode !== 'auto' ? colorMode : undefined}
    >
      {Children.map(children, (child, index) => {
        const dragId = findDragId(child) ?? generateDragId(child, index);
        return (
          <Draggable key={index} gridSize={computedGridSize} dragId={dragId}>
            {child}
          </Draggable>
        );
      })}
    </main>
  );
}

export default Canvas;
