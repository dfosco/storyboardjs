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

function removeHiddenAffix(pathname, affix, edge) {
  if (!affix || affix.visible || !affix.value) {
    return pathname;
  }

  const values = affix.value.startsWith('/')
    ? [affix.value]
    : [affix.value, `/${affix.value}`];
  const match = values.find((value) =>
    edge === 'start' ? pathname.startsWith(value) : pathname.endsWith(value)
  );
  if (!match) {
    return pathname;
  }

  const nextPathname =
    edge === 'start'
      ? pathname.slice(match.length)
      : pathname.slice(0, -match.length);
  return nextPathname.startsWith('/') ? nextPathname : `/${nextPathname}`;
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

export function buildFrameNavigationDisplayRoute(
  navigationHref,
  { prepend, apend } = {},
  currentHref = window.location.href
) {
  const prefix = pathAffix(prepend, 'prepend');
  const suffix = pathAffix(apend, 'apend');
  const frameUrl = resolveFrameUrl(navigationHref, currentHref);
  frameUrl.pathname = removeHiddenAffix(
    removeHiddenAffix(frameUrl.pathname, prefix, 'start'),
    suffix,
    'end'
  );
  frameUrl.searchParams.delete('embedView');
  return relativeFrameUrl(frameUrl);
}

export function buildFrameOpenHref(
  navigationHref,
  currentHref = window.location.href
) {
  const frameUrl = resolveFrameUrl(navigationHref, currentHref);
  frameUrl.searchParams.delete('embedView');
  return frameUrl.href;
}
