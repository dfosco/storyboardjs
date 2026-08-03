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

function normalizeRoute(value) {
  const route = `/${String(value || 'canvas')}`
    .replaceAll('\\', '/')
    .replace(/\/{2,}/g, '/')
    .replace(/\/$/, '');

  if (route.includes('..')) {
    throw new TypeError('tinyCanvas pagesDir cannot contain "..".');
  }

  return route || '/canvas';
}

function humanize(value) {
  const words = value.replace(/[-_]+/g, ' ').trim();
  return words ? words[0].toUpperCase() + words.slice(1) : 'Canvas';
}

function readCanvasTitle(file) {
  try {
    const source = readFileSync(file, 'utf8');
    const match = source.match(
      /<Canvas\b[^>]*\btitle\s*=\s*(["'])(.*?)\1/s
    );
    return match?.[2]?.trim() || '';
  } catch {
    return '';
  }
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

function routeFromFile(file, pagesRoot, pagesDir) {
  const relativeFile = relative(pagesRoot, file)
    .split(sep)
    .join('/')
    .replace(/\.tsx$/, '')
    .replace(/(^|\/)index$/, '');

  return `${pagesDir}/${relativeFile}`.replace(/\/$/, '') || pagesDir;
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
export default function tinyCanvas({ pagesDir = '/canvas', titles = {} } = {}) {
  const normalizedPagesDir = normalizeRoute(pagesDir);
  let projectRoot = '';
  let base = '/';

  return {
    name: 'tiny-canvas-pages',
    configResolved(config) {
      projectRoot = config.root;
      base = config.base || '/';
    },
    transformIndexHtml() {
      const pagesRoot = resolve(
        projectRoot,
        'src/pages',
        normalizedPagesDir.slice(1)
      );
      const pages = collectPageFiles(pagesRoot)
        .map((file) => {
          const route = routeFromFile(file, pagesRoot, normalizedPagesDir);
          const fileName = basename(file, '.tsx');
          const fallbackTitle =
            fileName === 'index'
              ? humanize(basename(dirname(file)))
              : humanize(fileName);

          return {
            id: route,
            title: titles[route] || readCanvasTitle(file) || fallbackTitle,
            href: joinBase(base, route),
          };
        })
        .sort((a, b) => a.id.localeCompare(b.id));

      return [
        {
          tag: 'script',
          attrs: { id: MANIFEST_ID, type: 'application/json' },
          children: JSON.stringify({ pagesDir: normalizedPagesDir, pages }).replaceAll(
            '<',
            '\\u003c'
          ),
          injectTo: 'head-prepend',
        },
      ];
    },
  };
}

export { MANIFEST_ID };
