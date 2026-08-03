function resolveFrameUrl(route, currentHref) {
  if (typeof route !== 'string' && !(route instanceof URL)) {
    throw new TypeError('Frame route must be a string or URL.');
  }

  const currentUrl = new URL(currentHref);
  const frameUrl = new URL(route, currentUrl);

  if (frameUrl.origin !== currentUrl.origin) {
    throw new TypeError('Frame route must resolve to the current origin.');
  }

  return frameUrl;
}

function pathAffix(value, propName) {
  if (value === undefined) {
    return null;
  }

  if (
    !value ||
    typeof value !== 'object' ||
    typeof value.value !== 'string' ||
    typeof value.visible !== 'boolean'
  ) {
    throw new TypeError(
      `Frame ${propName} must contain a string value and boolean visible.`
    );
  }

  return value;
}

function applyPathAffixes(frameUrl, prepend, apend, visibleOnly = false) {
  const prefix = pathAffix(prepend, 'prepend');
  const suffix = pathAffix(apend, 'apend');
  const prefixValue =
    prefix && (!visibleOnly || prefix.visible) ? prefix.value : '';
  const suffixValue =
    suffix && (!visibleOnly || suffix.visible) ? suffix.value : '';
  frameUrl.pathname = `${prefixValue}${frameUrl.pathname}${suffixValue}`;
  return frameUrl;
}

function relativeFrameUrl(frameUrl) {
  return `${frameUrl.pathname}${frameUrl.search}${frameUrl.hash}`;
}

export function buildFrameDisplayRoute(
  route,
  { prepend, apend } = {},
  currentHref = window.location.href
) {
  const prefix = pathAffix(prepend, 'prepend');
  const suffix = pathAffix(apend, 'apend');
  if (!prefix?.visible && !suffix?.visible) {
    return String(route);
  }

  const frameUrl = resolveFrameUrl(route, currentHref);
  return relativeFrameUrl(
    applyPathAffixes(frameUrl, prepend, apend, true)
  );
}

export function buildFrameHref(
  route,
  currentHref = window.location.href,
  { prepend, apend } = {}
) {
  const frameUrl = applyPathAffixes(
    resolveFrameUrl(route, currentHref),
    prepend,
    apend
  );

  frameUrl.searchParams.set('embedView', '1');
  return relativeFrameUrl(frameUrl);
}
