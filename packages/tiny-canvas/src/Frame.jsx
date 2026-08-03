import ResizableBlock from './ResizableBlock';
import { authorizeCanvasChild } from './canvasChild';
import { buildFrameHref } from './frameUrl';

const DEFAULT_MIN_WIDTH = 320;
const DEFAULT_MIN_HEIGHT = 240;

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
  return (
    <ResizableBlock
      {...blockProps}
      id={id}
      blockId={blockId}
      componentName="Frame"
      resizeLabel={`Resize ${title}`}
      defaultWidth={640}
      defaultHeight={480}
      width={width}
      height={height}
      minWidth={minWidth}
      minHeight={minHeight}
      onSizeChange={onSizeChange}
      className={['tc-frame-block', className].filter(Boolean).join(' ')}
      style={style}
    >
      <section className="tc-frame">
        <div className="tc-frame-title-bar">
          <span className="tc-frame-title">{title}</span>
          <span className="tc-frame-route">{String(route)}</span>
        </div>
        <iframe
          className="tc-frame-viewport"
          src={buildFrameHref(route)}
          title={title}
        />
      </section>
    </ResizableBlock>
  );
}

Frame.displayName = 'Frame';

export default authorizeCanvasChild(Frame);
