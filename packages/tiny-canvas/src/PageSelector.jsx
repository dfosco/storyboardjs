const MANIFEST_ID = 'tiny-canvas-pages';

function normalizePath(value) {
  return value.length > 1 ? value.replace(/\/$/, '') : value;
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

export function getCanvasPageContext() {
  const manifest = getPageManifest();
  if (!manifest) {
    return null;
  }

  const pathname = normalizePath(window.location.pathname);
  const currentIndex = manifest.pages.findIndex(
    (page) => normalizePath(page.href) === pathname
  );
  if (currentIndex < 0) {
    return null;
  }

  return {
    ...manifest,
    currentIndex,
    currentPage: manifest.pages[currentIndex],
  };
}

export default function PageSelector({ title }) {
  const pageContext = getCanvasPageContext();
  if (!pageContext || pageContext.pages.length < 2) {
    return null;
  }

  const { currentIndex, currentPage, pages } = pageContext;
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
              href={page.href}
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
