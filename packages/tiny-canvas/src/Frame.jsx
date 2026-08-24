import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import ResizableBlock from './ResizableBlock';
import { CanvasContext } from './CanvasContext';
import { authorizeCanvasChild } from './canvasChild';
import { getCanvasEnvironment } from './PageSelector';
import useFrameLoadPolicy from './useFrameLoadPolicy';
import {
  buildFrameDisplayRoute,
  buildFrameHref,
  buildFrameNavigationDisplayRoute,
  buildFrameOpenHref,
} from './frameUrl';

const DEFAULT_MIN_WIDTH = 320;
const DEFAULT_MIN_HEIGHT = 240;
const DEFAULT_WIDTH = 1270;
const DEFAULT_HEIGHT = 776;

function Frame({
  route,
  title,
  description,
  prepend,
  append,
  apend,
  loadStrategy,
  snapshot,
  interactLabel = 'Click to interact',
  width,
  height,
  minWidth = DEFAULT_MIN_WIDTH,
  minHeight = DEFAULT_MIN_HEIGHT,
  onSizeChange,
  id,
  blockId,
  selected,
  onSelectionChange,
  className,
  style,
  ...blockProps
}) {
  const iframeRef = useRef(null);
  const canvas = useContext(CanvasContext);
  const navigationCleanupRef = useRef(null);
  const interactButtonRef = useRef(null);
  const restoreInteractFocusRef = useRef(false);
  const environment = getCanvasEnvironment();
  const affixOptions = { prepend, append, apend, environment };
  const sourceKey = `${String(route)}\n${title}\n${environment}\n${JSON.stringify(prepend)}\n${JSON.stringify(append ?? apend)}`;
  const iframeSrc = useMemo(
    () =>
      buildFrameHref(route, window.location.href, affixOptions),
    [apend, append, environment, prepend, route]
  );
  const initialNavigation = useMemo(
    () => ({
      sourceKey,
      title,
      route: buildFrameDisplayRoute(route, affixOptions),
      href: buildFrameOpenHref(
        iframeSrc,
        window.location.href,
        affixOptions
      ),
    }),
    [apend, append, environment, iframeSrc, prepend, route, sourceKey, title]
  );
  const [navigation, setNavigation] = useState(initialNavigation);
  const [interactive, setInteractive] = useState(false);
  const [loadedFrameSrc, setLoadedFrameSrc] = useState(null);
  const [snapshotError, setSnapshotError] = useState(false);
  const {
    loadStrategy: resolvedLoadStrategy,
    shouldMountIframe,
    activate,
  } = useFrameLoadPolicy({ loadStrategy, snapshot });
  const currentNavigation =
    navigation.sourceKey === sourceKey ? navigation : initialNavigation;
  const usesInteractionGate = resolvedLoadStrategy === 'interaction';
  const iframeLoaded = loadedFrameSrc === iframeSrc;
  const showPoster = Boolean(snapshot) && !iframeLoaded;

  useEffect(() => {
    setSnapshotError(false);
  }, [snapshot]);

  useEffect(() => {
    if (
      usesInteractionGate &&
      ((canvas && blockId && canvas.selectedBlockId !== blockId) ||
        selected === false)
    ) {
      setInteractive(false);
    }
  }, [
    blockId,
    canvas,
    canvas?.selectedBlockId,
    selected,
    usesInteractionGate,
  ]);

  useEffect(() => {
    if (
      !interactive &&
      restoreInteractFocusRef.current &&
      interactButtonRef.current
    ) {
      restoreInteractFocusRef.current = false;
      interactButtonRef.current.focus();
    }
  }, [interactive]);

  useEffect(
    () => () => navigationCleanupRef.current?.(),
    []
  );

  const stopInteraction = useCallback((restoreFocus = false) => {
    restoreInteractFocusRef.current = restoreFocus;
    setInteractive(false);
  }, []);

  const startInteraction = useCallback(() => {
    activate();
    setInteractive(true);
  }, [activate]);

  const syncNavigation = () => {
    const iframe = iframeRef.current;
    try {
      const navigationHref = iframe.contentWindow.location.href;
      setNavigation({
        sourceKey,
        title: iframe.contentDocument?.title?.trim() || title,
        route: buildFrameNavigationDisplayRoute(
          navigationHref,
          affixOptions,
          window.location.href
        ),
        href: buildFrameOpenHref(
          navigationHref,
          window.location.href,
          affixOptions
        ),
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
      const forwardWheelZoom = (event) => {
        if (
          (!event.ctrlKey && !event.metaKey) ||
          !canvas?.zoomByWheel
        ) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        const iframeRect = iframe.getBoundingClientRect();
        canvas.zoomByWheel(
          event.deltaY,
          iframeRect.left + event.clientX,
          iframeRect.top + event.clientY
        );
      };
      const stopOnEscape = (event) => {
        if (event.key === 'Escape') {
          stopInteraction(true);
        }
      };
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
      frameDocument.addEventListener('wheel', forwardWheelZoom, {
        capture: true,
        passive: false,
      });
      frameDocument.addEventListener('keydown', stopOnEscape);

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
        frameDocument.removeEventListener('wheel', forwardWheelZoom, true);
        frameDocument.removeEventListener('keydown', stopOnEscape);
      };
    } catch {
      navigationCleanupRef.current = null;
    }
  };

  const showInteractionGuard =
    usesInteractionGate && (!interactive || !iframeLoaded);
  const interactionLoading =
    usesInteractionGate && shouldMountIframe && !iframeLoaded;
  const interactAccessibleLabel =
    typeof interactLabel === 'string'
      ? `${interactLabel} with ${currentNavigation.title}`
      : `Interact with ${currentNavigation.title}`;

  return (
    <ResizableBlock
      {...blockProps}
      id={id}
      blockId={blockId}
      selected={selected}
      componentName="Frame"
      resizeLabel={`Resize ${currentNavigation.title}`}
      defaultWidth={DEFAULT_WIDTH}
      defaultHeight={DEFAULT_HEIGHT}
      width={width}
      height={height}
      minWidth={minWidth}
      minHeight={minHeight}
      onSizeChange={onSizeChange}
      className={['tc-frame-block', className].filter(Boolean).join(' ')}
      style={style}
      onSelectionChange={(nextSelected) => {
        if (!nextSelected) {
          stopInteraction();
        }
        onSelectionChange?.(nextSelected);
      }}
    >
      <section className="tc-frame">
        <div className="tc-frame-title-bar">
          <span className="tc-frame-heading">
            <span className="tc-frame-title">{currentNavigation.title}</span>
            {description ? (
              <span className="tc-frame-description">{description}</span>
            ) : null}
          </span>
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
        <div className="tc-frame-viewport">
          {shouldMountIframe ? (
            <iframe
              ref={iframeRef}
              className="tc-frame-document"
              src={iframeSrc}
              title={currentNavigation.title}
              onLoad={() => {
                setLoadedFrameSrc(iframeSrc);
                observeNavigation();
              }}
            />
          ) : null}
          {showPoster ? (
            <div
              className="tc-frame-poster"
              data-loading={shouldMountIframe || undefined}
            >
              {snapshotError ? (
                <div
                  className="tc-frame-snapshot-fallback"
                  aria-hidden="true"
                >
                  Preview unavailable
                </div>
              ) : (
                <img
                  src={snapshot}
                  alt=""
                  draggable="false"
                  className="tc-frame-snapshot"
                  onError={() => setSnapshotError(true)}
                />
              )}
              {shouldMountIframe && !usesInteractionGate ? (
                <span className="tc-frame-loading-status" role="status">
                  Loading {currentNavigation.title}…
                </span>
              ) : null}
            </div>
          ) : null}
          {showInteractionGuard ? (
            <div
              className="tc-frame-interaction-guard"
              data-loading={interactionLoading || undefined}
              onClick={startInteraction}
            >
              <button
                ref={interactButtonRef}
                type="button"
                className="tc-frame-interact-button tc-no-drag"
                aria-label={
                  interactionLoading
                    ? `Loading ${currentNavigation.title}`
                    : interactAccessibleLabel
                }
                aria-busy={interactionLoading || undefined}
                disabled={interactionLoading}
              >
                {interactionLoading ? 'Loading…' : interactLabel}
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </ResizableBlock>
  );
}

Frame.displayName = 'Frame';

export default authorizeCanvasChild(Frame);
