import ResizableBlock from './ResizableBlock';
import { authorizeCanvasChild } from './canvasChild';

const BACKGROUND_STYLES = new Set(['cover', 'ratio', 'repeat']);

function Group({
  label,
  background,
  backgroundStyle = 'cover',
  width = 640,
  height = 420,
  className,
  style,
  children,
  ...blockProps
}) {
  if (!BACKGROUND_STYLES.has(backgroundStyle)) {
    throw new TypeError(`Group backgroundStyle must be cover, ratio, or repeat.`);
  }

  return (
    <ResizableBlock
      {...blockProps}
      componentName="Group"
      resizeLabel={label ? `Resize ${label}` : 'Resize group'}
      defaultWidth={640}
      defaultHeight={420}
      width={width}
      height={height}
      className={['tc-group-block', className].filter(Boolean).join(' ')}
      style={style}
    >
      <section
        className="tc-group"
        style={
          background
            ? {
                backgroundImage: `url(${JSON.stringify(background)})`,
                backgroundSize:
                  backgroundStyle === 'cover'
                    ? 'cover'
                    : backgroundStyle === 'ratio'
                      ? 'contain'
                      : 'auto',
                backgroundRepeat:
                  backgroundStyle === 'repeat' ? 'repeat' : 'no-repeat',
                backgroundPosition: 'center',
              }
            : undefined
        }
        aria-label={label || undefined}
      >
        {label ? <h2 className="tc-group-label">{label}</h2> : null}
        {children}
      </section>
    </ResizableBlock>
  );
}

Group.displayName = 'Group';

export default authorizeCanvasChild(Group);
