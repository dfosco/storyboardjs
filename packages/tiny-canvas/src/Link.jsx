import ResizableBlock from './ResizableBlock';
import { authorizeCanvasChild } from './canvasChild';
import { getLinkData } from './linkUrl';

function text(value, propName) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new TypeError(`Link ${propName} must be a non-empty string.`);
  }

  return value;
}

function Link({
  url,
  title,
  displayUrl,
  width,
  height,
  minWidth = 240,
  minHeight = 72,
  onSizeChange,
  className,
  ...blockProps
}) {
  const { href, faviconHref } = getLinkData(url);
  const resolvedTitle = text(title, 'title');
  const resolvedDisplayUrl = text(displayUrl, 'displayUrl');

  return (
    <ResizableBlock
      {...blockProps}
      componentName="Link"
      resizeLabel={`Resize link: ${resolvedTitle}`}
      defaultWidth={320}
      width={width}
      height={height}
      minWidth={minWidth}
      minHeight={minHeight}
      onSizeChange={onSizeChange}
      className={['tc-link-block', className].filter(Boolean).join(' ')}
    >
      <article className="tc-link">
        <div className="tc-link-favicon" aria-hidden="true">
          <svg viewBox="0 0 16 16" focusable="false">
            <path
              fill="currentColor"
              d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm4.9 6H11a11.8 11.8 0 0 0-.8-3.4A5 5 0 0 1 12.9 7ZM8 3c.5 0 1.2 1.5 1.4 4H6.6C6.8 4.5 7.5 3 8 3ZM5.8 3.6A11.8 11.8 0 0 0 5 7H3.1a5 5 0 0 1 2.7-3.4ZM3.1 9H5c.1 1.3.4 2.5.8 3.4A5 5 0 0 1 3.1 9ZM8 13c-.5 0-1.2-1.5-1.4-4h2.8c-.2 2.5-.9 4-1.4 4Zm2.2-.6c.4-.9.7-2.1.8-3.4h1.9a5 5 0 0 1-2.7 3.4Z"
            />
          </svg>
          <img
            src={faviconHref}
            alt=""
            width="32"
            height="32"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
        </div>
        <div className="tc-link-body">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="tc-link-title tc-no-drag"
            onPointerDown={(event) => event.stopPropagation()}
          >
            {resolvedTitle}
          </a>
          <span className="tc-link-url">{resolvedDisplayUrl}</span>
        </div>
      </article>
    </ResizableBlock>
  );
}

Link.displayName = 'Link';

export default authorizeCanvasChild(Link);
