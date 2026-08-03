export function getLinkData(url) {
  let parsed;
  try {
    parsed = url instanceof URL ? url : new URL(url);
  } catch {
    throw new TypeError('Link url must be a valid absolute URL.');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new TypeError('Link url must use HTTP or HTTPS.');
  }

  return {
    href: parsed.href,
    faviconHref: new URL('/favicon.ico', parsed.origin).href,
  };
}
