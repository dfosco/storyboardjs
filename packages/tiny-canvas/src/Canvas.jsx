import { Children, cloneElement, isValidElement } from 'react';
import Draggable from './Draggable';
import { findDragId, generateDragId } from './utils';

function Canvas({
  children,
  centered = true,
  dotted = false,
  grid = false,
  gridSize,
  colorMode = 'auto',
}) {
  const showDots = dotted || grid;

  return (
    <main
      className="tc-canvas"
      data-dotted={showDots || undefined}
      data-color-mode={colorMode !== 'auto' ? colorMode : undefined}
    >
      {Children.map(children, (child, index) => {
        const dragId = findDragId(child) ?? generateDragId(child, index);
        const defaultPosition = isValidElement(child)
          ? child.props.defaultPosition
          : undefined;
        const renderedChild =
          defaultPosition === undefined
            ? child
            : cloneElement(child, { defaultPosition: undefined });

        return (
          <Draggable
            key={dragId}
            gridSize={gridSize}
            dragId={dragId}
            defaultPosition={defaultPosition}
          >
            {renderedChild}
          </Draggable>
        );
      })}
    </main>
  );
}

export default Canvas;
