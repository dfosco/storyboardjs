export function buildFrameHref(route, currentHref = window.location.href) {
  if (typeof route !== 'string' && !(route instanceof URL)) {
    throw new TypeError('Frame route must be a string or URL.');
  }

  const currentUrl = new URL(currentHref);
  const frameUrl = new URL(route, currentUrl);

  if (frameUrl.origin !== currentUrl.origin) {
    throw new TypeError('Frame route must resolve to the current origin.');
  }

  frameUrl.searchParams.set('embedView', '1');
  return `${frameUrl.pathname}${frameUrl.search}${frameUrl.hash}`;
}
