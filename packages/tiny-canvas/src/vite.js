import { existsSync, readFileSync, readdirSync } from 'node:fs';
import {
  basename,
  dirname,
  extname,
  join,
  relative,
  resolve,
  sep,
} from 'node:path';

const PAGE_EXTENSIONS = new Set(['.tsx']);
const MANIFEST_ID = 'tiny-canvas-pages';
const VIRTUAL_PAGES_ID = 'virtual:tiny-canvas-pages';
const RESOLVED_VIRTUAL_PAGES_ID = `\0${VIRTUAL_PAGES_ID}`;

function normalizeRoute(value) {
  const route = `/${String(value || 'canvas')}`
    .replaceAll('\\', '/')
    .replace(/\/{2,}/g, '/')
    .replace(/\/$/, '');

  if (route.includes('..')) {
    throw new TypeError('tinyCanvas routeBase cannot contain "..".');
  }

  return route || '/canvas';
}

function humanize(value) {
  const words = value.replace(/[-_]+/g, ' ').trim();
  return words ? words[0].toUpperCase() + words.slice(1) : 'Canvas';
}

function readCanvasSource(file) {
  try {
    return readFileSync(file, 'utf8');
  } catch {
    return '';
  }
}

function readCanvasTitle(source) {
  const match = source.match(
    /<Canvas\b[^>]*\btitle\s*=\s*(["'])(.*?)\1/s
  );
  return match?.[2]?.trim() || '';
}

function collectPageFiles(directory) {
  if (!existsSync(directory)) {
    return [];
  }

  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) {
      continue;
    }

    const absolutePath = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectPageFiles(absolutePath));
    } else if (
      PAGE_EXTENSIONS.has(extname(entry.name)) &&
      !entry.name.endsWith('.test.tsx') &&
      !entry.name.endsWith('.spec.tsx') &&
      !entry.name.includes('[')
    ) {
      files.push(absolutePath);
    }
  }

  return files;
}

function routeFromFile(file, pagesRoot, routeBase) {
  const relativeFile = relative(pagesRoot, file)
    .split(sep)
    .join('/')
    .replace(/\.tsx$/, '')
    .replace(/(^|\/)index$/, '');

  return `${routeBase}/${relativeFile}`.replace(/\/$/, '') || routeBase;
}

function joinBase(base, route) {
  const normalizedBase = `/${String(base || '/')}`
    .replace(/\/{2,}/g, '/')
    .replace(/\/$/, '');
  return `${normalizedBase === '/' ? '' : normalizedBase}${route}` || '/';
}

/**
 * Vite plugin that discovers independent Tiny Canvas TSX pages.
 */
export default function tinyCanvas({
  pagesDir,
  pagesPath,
  routeBase = pagesDir || '/canvas',
  resolveRoute,
  titles = {},
  widgets = {},
} = {}) {
  if (pagesDir && routeBase !== pagesDir) {
    throw new TypeError(
      'tinyCanvas pagesDir and routeBase cannot define different routes.'
    );
  }
  if (resolveRoute !== undefined && typeof resolveRoute !== 'function') {
    throw new TypeError('tinyCanvas resolveRoute must be a function.');
  }

  const normalizedRouteBase = normalizeRoute(routeBase);
  let projectRoot = '';
  let base = '/';
  let environment = 'prod';

  const getPagesRoot = () =>
    resolve(
      projectRoot,
      pagesPath || join('src/pages', normalizedRouteBase.slice(1))
    );

  const getPages = () => {
    const pagesRoot = getPagesRoot();
    return collectPageFiles(pagesRoot)
      .flatMap((file) => {
        const source = readCanvasSource(file);
        if (!/<Canvas\b/.test(source)) {
          return [];
        }

        const relativePath = relative(pagesRoot, file).split(sep).join('/');
        const defaultRoute = routeFromFile(
          file,
          pagesRoot,
          normalizedRouteBase
        );
        const route = normalizeRoute(
          resolveRoute?.({
            file,
            relativePath,
            defaultRoute,
            routeBase: normalizedRouteBase,
          }) || defaultRoute
        );
        const fileName = basename(file, '.tsx');
        const fallbackTitle =
          fileName === 'index'
            ? humanize(basename(dirname(file)))
            : humanize(fileName);

        return [
          {
            file,
            id: route,
            title: titles[route] || readCanvasTitle(source) || fallbackTitle,
            href: joinBase(base, route),
          },
        ];
      })
      .sort((a, b) => a.id.localeCompare(b.id));
  };

  return {
    name: 'tiny-canvas-pages',
    configResolved(config) {
      projectRoot = config.root;
      base = config.base || '/';
      environment = config.command === 'serve' ? 'dev' : 'prod';
    },
    resolveId(id) {
      if (id === VIRTUAL_PAGES_ID) {
        return RESOLVED_VIRTUAL_PAGES_ID;
      }
      return null;
    },
    load(id) {
      if (id !== RESOLVED_VIRTUAL_PAGES_ID) {
        return null;
      }

      const registry = getPages()
        .map(
          ({ file, ...page }) =>
            `{...${JSON.stringify(page)},load:()=>import(${JSON.stringify(file)})}`
        )
        .join(',');
      return `export const pages=Object.freeze([${registry}]);export default pages;`;
    },
    transformIndexHtml() {
      const pages = getPages().map(({ file: _file, ...page }) => page);

      return [
        {
          tag: 'script',
          attrs: { id: MANIFEST_ID, type: 'application/json' },
          children: JSON.stringify({
            pagesDir: normalizedRouteBase,
            routeBase: normalizedRouteBase,
            environment,
            pages,
            widgets,
          }).replaceAll('<', '\\u003c'),
          injectTo: 'head-prepend',
        },
      ];
    },
  };
}

export { MANIFEST_ID, VIRTUAL_PAGES_ID };
