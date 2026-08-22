const MANIFEST_ID = 'tiny-canvas-pages';

function normalizePath(value) {
  return value.length > 1 ? value.replace(/\/$/, '') : value;
}

function getHashPath(hash) {
  if (!hash.startsWith('#/')) {
    return null;
  }

  return normalizePath(hash.slice(1).split(/[?#]/, 1)[0]);
}

function getPageRoute(page) {
  return normalizePath(page.id || page.href);
}

function getHashPageHref(page) {
  const queryStart = window.location.hash.indexOf('?');
  const query = queryStart < 0 ? '' : window.location.hash.slice(queryStart);
  return `#${getPageRoute(page)}${query}`;
}

function getPageManifest() {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return null;
  }

  const element = document.getElementById(MANIFEST_ID);
  if (!element?.textContent) {
    return null;
  }

  try {
    const manifest = JSON.parse(element.textContent);
    if (!Array.isArray(manifest.pages)) {
      return null;
    }

    return manifest;
  } catch {
    return null;
  }
}

export function getCanvasConfig() {
  return getPageManifest();
}

export function getCanvasEnvironment(manifest = getCanvasConfig()) {
  return manifest?.environment === 'dev' ? 'dev' : 'prod';
}

export function getCanvasPageContext(manifest = getCanvasConfig()) {
  if (!manifest) {
    return null;
  }

  const pathname = normalizePath(window.location.pathname);
  let currentIndex = manifest.pages.findIndex(
    (page) => normalizePath(page.href) === pathname
  );
  let hashRoute = false;

  if (currentIndex < 0) {
    const hashPath = getHashPath(window.location.hash);
    if (hashPath) {
      currentIndex = manifest.pages.findIndex(
        (page) => getPageRoute(page) === hashPath
      );
      hashRoute = currentIndex >= 0;
    }
  }

  if (currentIndex < 0) {
    return null;
  }

  return {
    ...manifest,
    currentIndex,
    currentPage: manifest.pages[currentIndex],
    hashRoute,
  };
}

export default function PageSelector({ title }) {
  const pageContext = getCanvasPageContext();
  if (!pageContext || pageContext.pages.length < 2) {
    return null;
  }

  const { currentIndex, currentPage, pages, hashRoute } = pageContext;
  const currentTitle =
    typeof title === 'string' && title.trim() ? title : currentPage.title;

  return (
    <details className="tc-canvas-pages tc-no-drag">
      <summary className="tc-canvas-pages-trigger">
        <span className="tc-canvas-pages-label">{currentTitle}</span>
        <span className="tc-canvas-pages-count">
          {currentIndex + 1}/{pages.length}
        </span>
        <svg
          viewBox="0 0 12 12"
          width="12"
          height="12"
          aria-hidden="true"
        >
          <path
            d="M3 4.5 6 7.5l3-3"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>
      </summary>
      <ul className="tc-canvas-pages-menu" aria-label="Canvas pages">
        {pages.map((page) => (
          <li key={page.id}>
            <a
              href={hashRoute ? getHashPageHref(page) : page.href}
              className="tc-canvas-pages-link"
              aria-current={page.id === currentPage.id ? 'page' : undefined}
            >
              {page.title}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
