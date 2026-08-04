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
      (entry.external !== undefined && typeof entry.external !== 'boolean') ||
      (entry.env !== undefined && entry.env !== 'dev' && entry.env !== 'prod')
    ) {
      throw new TypeError(
        `Frame ${propName} entries must contain a string value, boolean visible, optional boolean external, and optional dev or prod env.`
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
  return affix.value.startsWith('?') || affix.value.startsWith('/?');
}

function queryAffixValue(affix) {
  return affix.value.slice(affix.value.startsWith('/?') ? 2 : 1);
}

function pathAffixValue(affixes, include = () => true) {
  return affixes
    .filter((affix) => !isQueryAffix(affix) && include(affix))
    .map((affix) => affix.value)
    .join('');
}

function applyQueryAffixes(frameUrl, affixes, visibleOnly = false) {
  for (const affix of affixes) {
    if (!isQueryAffix(affix) || (visibleOnly && !affix.visible)) {
      continue;
    }
    const params = new URLSearchParams(queryAffixValue(affix));
    for (const [key, value] of params) {
      frameUrl.searchParams.set(key, value);
    }
  }
}

function applyPathAffixes(frameUrl, affixes, visibleOnly = false) {
  const include = (affix) => !visibleOnly || affix.visible;
  const prefixValue = pathAffixValue(affixes.prepend, include);
  const suffixValue = pathAffixValue(affixes.append, include);
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

function isUrlStateParam(key) {
  return key === 'urlstate' || key.startsWith('state.');
}

function removeUrlStateParams(frameUrl) {
  for (const key of [...frameUrl.searchParams.keys()]) {
    if (isUrlStateParam(key)) {
      frameUrl.searchParams.delete(key);
    }
  }
  return frameUrl;
}

function hideUrlStateFromRoute(route) {
  const value = String(route);
  const hashIndex = value.indexOf('#');
  const beforeHash = hashIndex === -1 ? value : value.slice(0, hashIndex);
  const hash = hashIndex === -1 ? '' : value.slice(hashIndex);
  const queryIndex = beforeHash.indexOf('?');
  if (queryIndex === -1) {
    return value;
  }

  const pathname = beforeHash.slice(0, queryIndex);
  const searchParams = new URLSearchParams(beforeHash.slice(queryIndex + 1));
  for (const key of [...searchParams.keys()]) {
    if (isUrlStateParam(key)) {
      searchParams.delete(key);
    }
  }
  const search = searchParams.toString();
  return `${pathname}${search ? `?${search}` : ''}${hash}`;
}

function replaceAppliedPathAffixes(
  pathname,
  affixes,
  edge,
  include = (affix) => affix.visible
) {
  const applied = pathAffixValue(affixes);
  if (!applied) {
    return pathname;
  }

  const matches =
    edge === 'start' ? pathname.startsWith(applied) : pathname.endsWith(applied);
  if (!matches) {
    return pathname;
  }

  const retained = pathAffixValue(affixes, include);
  const nextPathname =
    edge === 'start'
      ? `${retained}${pathname.slice(applied.length)}`
      : `${pathname.slice(0, -applied.length)}${retained}`;
  return nextPathname.startsWith('/') ? nextPathname : `/${nextPathname}`;
}

function removeQueryAffixes(
  frameUrl,
  affixes,
  shouldRemove = (affix) => !affix.visible
) {
  for (const affix of affixes) {
    if (!isQueryAffix(affix) || !shouldRemove(affix)) {
      continue;
    }
    const params = new URLSearchParams(queryAffixValue(affix));
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
    return hideUrlStateFromRoute(route);
  }

  const frameUrl = resolveFrameUrl(route, currentHref);
  return relativeFrameUrl(
    removeUrlStateParams(applyPathAffixes(frameUrl, affixes, true))
  );
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
  removeQueryAffixes(frameUrl, [
    ...affixes.prepend,
    ...affixes.append,
  ]);
  frameUrl.searchParams.delete('embedView');
  return relativeFrameUrl(removeUrlStateParams(frameUrl));
}

export function buildFrameOpenHref(
  navigationHref,
  currentHref = window.location.href,
  options = {}
) {
  const frameUrl = resolveFrameUrl(navigationHref, currentHref);
  const affixes = resolveAffixes(options);
  const includeExternal = (affix) => affix.external !== false;
  frameUrl.pathname = replaceAppliedPathAffixes(
    replaceAppliedPathAffixes(
      frameUrl.pathname,
      affixes.prepend,
      'start',
      includeExternal
    ),
    affixes.append,
    'end',
    includeExternal
  );
  removeQueryAffixes(
    frameUrl,
    [...affixes.prepend, ...affixes.append],
    (affix) => affix.external === false
  );
  frameUrl.searchParams.delete('embedView');
  return frameUrl.href;
}
