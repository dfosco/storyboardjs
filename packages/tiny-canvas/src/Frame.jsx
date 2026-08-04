import { useEffect, useMemo, useRef, useState } from 'react';
import ResizableBlock from './ResizableBlock';
import { authorizeCanvasChild } from './canvasChild';
import {
  buildFrameDisplayRoute,
  buildFrameHref,
  buildFrameNavigationDisplayRoute,
  buildFrameOpenHref,
} from './frameUrl';

const DEFAULT_MIN_WIDTH = 320;
const DEFAULT_MIN_HEIGHT = 240;

function Frame({
  route,
  title,
  prepend,
  apend,
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
  const iframeRef = useRef(null);
  const navigationCleanupRef = useRef(null);
  const sourceKey = `${String(route)}\n${title}\n${prepend?.value ?? ''}\n${prepend?.visible ?? ''}\n${apend?.value ?? ''}\n${apend?.visible ?? ''}`;
  const iframeSrc = useMemo(
    () =>
      buildFrameHref(route, window.location.href, {
        prepend,
        apend,
      }),
    [apend, prepend, route]
  );
  const initialNavigation = useMemo(
    () => ({
      sourceKey,
      title,
      route: buildFrameDisplayRoute(route, { prepend, apend }),
      href: buildFrameOpenHref(iframeSrc),
    }),
    [apend, iframeSrc, prepend, route, sourceKey, title]
  );
  const [navigation, setNavigation] = useState(initialNavigation);
  const currentNavigation =
    navigation.sourceKey === sourceKey ? navigation : initialNavigation;

  useEffect(
    () => () => navigationCleanupRef.current?.(),
    []
  );

  const syncNavigation = () => {
    const iframe = iframeRef.current;
    try {
      const navigationHref = iframe.contentWindow.location.href;
      setNavigation({
        sourceKey,
        title: iframe.contentDocument?.title?.trim() || title,
        route: buildFrameNavigationDisplayRoute(
          navigationHref,
          { prepend, apend },
          window.location.href
        ),
        href: buildFrameOpenHref(navigationHref),
      });
    } catch {
      // Keep the last same-origin navigation state.
    }
  };

  const observeNavigation = () => {
    navigationCleanupRef.current?.();
    syncNavigation();

    const iframe = iframeRef.current;
    try {
      const frameWindow = iframe.contentWindow;
      const frameDocument = iframe.contentDocument;
      const observerTarget =
        frameDocument.querySelector('title') || frameDocument.head;
      const observer = observerTarget
        ? new MutationObserver(syncNavigation)
        : null;
      const frameHistory = frameWindow.history;
      const pushState = frameHistory.pushState;
      const replaceState = frameHistory.replaceState;
      const observeHistory = (method) =>
        function observedHistory(...args) {
          const result = method.apply(this, args);
          syncNavigation();
          return result;
        };
      const observedPushState = observeHistory(pushState);
      const observedReplaceState = observeHistory(replaceState);
      frameHistory.pushState = observedPushState;
      frameHistory.replaceState = observedReplaceState;
      observer?.observe(observerTarget, {
        childList: true,
        subtree: true,
        characterData: true,
      });
      frameWindow.addEventListener('hashchange', syncNavigation);
      frameWindow.addEventListener('popstate', syncNavigation);
      frameWindow.navigation?.addEventListener(
        'currententrychange',
        syncNavigation
      );

      navigationCleanupRef.current = () => {
        observer?.disconnect();
        if (frameHistory.pushState === observedPushState) {
          frameHistory.pushState = pushState;
        }
        if (frameHistory.replaceState === observedReplaceState) {
          frameHistory.replaceState = replaceState;
        }
        frameWindow.removeEventListener('hashchange', syncNavigation);
        frameWindow.removeEventListener('popstate', syncNavigation);
        frameWindow.navigation?.removeEventListener(
          'currententrychange',
          syncNavigation
        );
      };
    } catch {
      navigationCleanupRef.current = null;
    }
  };

  return (
    <ResizableBlock
      {...blockProps}
      id={id}
      blockId={blockId}
      componentName="Frame"
      resizeLabel={`Resize ${currentNavigation.title}`}
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
          <span className="tc-frame-title">{currentNavigation.title}</span>
          <span className="tc-frame-route">
            {currentNavigation.route}
          </span>
          <a
            className="tc-frame-open tc-no-drag"
            href={currentNavigation.href}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${currentNavigation.title} in new tab`}
            title="Open in new tab"
          >
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
              <path
                d="M9.5 2.5h4v4m0-4-6 6M7 4.5H3.5a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V9"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
            </svg>
          </a>
        </div>
        <iframe
          ref={iframeRef}
          className="tc-frame-viewport"
          src={iframeSrc}
          title={currentNavigation.title}
          onLoad={observeNavigation}
        />
      </section>
    </ResizableBlock>
  );
}

Frame.displayName = 'Frame';

export default authorizeCanvasChild(Frame);
