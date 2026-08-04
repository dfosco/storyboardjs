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

function pathAffixes(value, propName, environment = 'prod') {
  if (value === undefined) {
    return [];
  }

  const entries = Array.isArray(value) ? value : [value];
  for (const entry of entries) {
    if (
      !entry ||
      typeof entry !== 'object' ||
      typeof entry.value !== 'string' ||
      typeof entry.visible !== 'boolean' ||
      (entry.env !== undefined && entry.env !== 'dev' && entry.env !== 'prod')
    ) {
      throw new TypeError(
        `Frame ${propName} entries must contain a string value, boolean visible, and optional dev or prod env.`
      );
    }
  }

  return entries.filter((entry) => !entry.env || entry.env === environment);
}

function resolveAffixes({ prepend, append, apend, environment = 'prod' } = {}) {
  if (append !== undefined && apend !== undefined) {
    throw new TypeError('Frame cannot receive both append and legacy apend.');
  }

  return {
    prepend: pathAffixes(prepend, 'prepend', environment),
    append: pathAffixes(append ?? apend, 'append', environment),
  };
}

function isQueryAffix(affix) {
  return affix.value.startsWith('?');
}

function pathAffixValue(affixes, visibleOnly = false) {
  return affixes
    .filter(
      (affix) => !isQueryAffix(affix) && (!visibleOnly || affix.visible)
    )
    .map((affix) => affix.value)
    .join('');
}

function applyQueryAffixes(frameUrl, affixes, visibleOnly = false) {
  for (const affix of affixes) {
    if (!isQueryAffix(affix) || (visibleOnly && !affix.visible)) {
      continue;
    }
    const params = new URLSearchParams(affix.value.slice(1));
    for (const [key, value] of params) {
      frameUrl.searchParams.set(key, value);
    }
  }
}

function applyPathAffixes(frameUrl, affixes, visibleOnly = false) {
  const prefixValue = pathAffixValue(affixes.prepend, visibleOnly);
  const suffixValue = pathAffixValue(affixes.append, visibleOnly);
  frameUrl.pathname = `${prefixValue}${frameUrl.pathname}${suffixValue}`;
  applyQueryAffixes(
    frameUrl,
    [...affixes.prepend, ...affixes.append],
    visibleOnly
  );
  return frameUrl;
}

function relativeFrameUrl(frameUrl) {
  return `${frameUrl.pathname}${frameUrl.search}${frameUrl.hash}`;
}

function replaceAppliedPathAffixes(pathname, affixes, edge) {
  const applied = pathAffixValue(affixes);
  if (!applied) {
    return pathname;
  }

  const matches =
    edge === 'start' ? pathname.startsWith(applied) : pathname.endsWith(applied);
  if (!matches) {
    return pathname;
  }

  const visible = pathAffixValue(affixes, true);
  const nextPathname =
    edge === 'start'
      ? `${visible}${pathname.slice(applied.length)}`
      : `${pathname.slice(0, -applied.length)}${visible}`;
  return nextPathname.startsWith('/') ? nextPathname : `/${nextPathname}`;
}

function removeHiddenQueryAffixes(frameUrl, affixes) {
  for (const affix of affixes) {
    if (!isQueryAffix(affix) || affix.visible) {
      continue;
    }
    const params = new URLSearchParams(affix.value.slice(1));
    for (const [key, value] of params) {
      if (frameUrl.searchParams.get(key) === value) {
        frameUrl.searchParams.delete(key);
      }
    }
  }
}

export function buildFrameDisplayRoute(
  route,
  options = {},
  currentHref = window.location.href
) {
  const affixes = resolveAffixes(options);
  if (![...affixes.prepend, ...affixes.append].some((affix) => affix.visible)) {
    return String(route);
  }

  const frameUrl = resolveFrameUrl(route, currentHref);
  return relativeFrameUrl(applyPathAffixes(frameUrl, affixes, true));
}

export function buildFrameHref(
  route,
  currentHref = window.location.href,
  options = {}
) {
  const frameUrl = applyPathAffixes(
    resolveFrameUrl(route, currentHref),
    resolveAffixes(options)
  );

  frameUrl.searchParams.set('embedView', '1');
  return relativeFrameUrl(frameUrl);
}

export function buildFrameNavigationDisplayRoute(
  navigationHref,
  options = {},
  currentHref = window.location.href
) {
  const affixes = resolveAffixes(options);
  const frameUrl = resolveFrameUrl(navigationHref, currentHref);
  frameUrl.pathname = replaceAppliedPathAffixes(
    replaceAppliedPathAffixes(frameUrl.pathname, affixes.prepend, 'start'),
    affixes.append,
    'end'
  );
  removeHiddenQueryAffixes(frameUrl, [
    ...affixes.prepend,
    ...affixes.append,
  ]);
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
