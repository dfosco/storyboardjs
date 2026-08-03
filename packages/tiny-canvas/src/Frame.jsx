import Block from './Block';
import { authorizeCanvasChild } from './canvasChild';

function buildFrameHref(route) {
  const url = new URL(window.location.href);
  url.searchParams.set('embedView', '1');
  url.hash = route;
  return `${url.pathname}${url.search}${url.hash}`;
}

function Frame({ route, title, className, ...blockProps }) {
  return (
    <Block
      {...blockProps}
      className={['tc-frame-block', className].filter(Boolean).join(' ')}
    >
      <section className="tc-frame">
        <div className="tc-frame-title-bar">
          <span className="tc-frame-title">{title}</span>
          <span className="tc-frame-route">{route}</span>
        </div>
        <iframe
          className="tc-frame-viewport"
          src={buildFrameHref(route)}
          title={title}
        />
      </section>
    </Block>
  );
}

Frame.displayName = 'Frame';

export default authorizeCanvasChild(Frame);
