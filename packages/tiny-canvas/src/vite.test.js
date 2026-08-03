import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import tinyCanvas from './vite.js';

const temporaryDirectories = [];

function createProject() {
  const root = mkdtempSync(join(tmpdir(), 'tiny-canvas-pages-'));
  temporaryDirectories.push(root);
  const pages = join(root, 'src/pages/canvas');
  mkdirSync(join(pages, 'nested'), { recursive: true });
  for (const file of [
    'index.tsx',
    'details.tsx',
    'nested/index.tsx',
    '[slug].tsx',
    'ignored.test.tsx',
    'ignored.jsx',
  ]) {
    const target = join(pages, file);
    mkdirSync(join(target, '..'), { recursive: true });
    writeFileSync(
      target,
      file === 'details.tsx'
        ? 'export default function Page() { return <Canvas title="Specs" /> }'
        : 'export default function Page() {}'
    );
  }
  return root;
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe('tinyCanvas Vite plugin', () => {
  it('discovers independent TSX pages under /canvas by default', () => {
    const root = createProject();
    const widgets = {
      Frame: {
        prepend: { value: '/preview', visible: false },
        apend: { value: '/embedded', visible: true },
      },
      Note: { color: 'blue' },
    };
    const plugin = tinyCanvas({
      titles: { '/canvas': 'Overview' },
      widgets,
    });
    plugin.configResolved({ root, base: '/app/' });
    const [tag] = plugin.transformIndexHtml();
    const manifest = JSON.parse(tag.children);

    expect(tag.attrs).toEqual({
      id: 'tiny-canvas-pages',
      type: 'application/json',
    });
    expect(manifest.widgets).toEqual(widgets);
    expect(manifest.pages).toEqual([
      { id: '/canvas', title: 'Overview', href: '/app/canvas' },
      {
        id: '/canvas/details',
        title: 'Specs',
        href: '/app/canvas/details',
      },
      {
        id: '/canvas/nested',
        title: 'Nested',
        href: '/app/canvas/nested',
      },
    ]);
  });

  it('supports a configured page directory', () => {
    const root = mkdtempSync(join(tmpdir(), 'tiny-canvas-pages-'));
    temporaryDirectories.push(root);
    const pages = join(root, 'src/pages/tiny-board');
    mkdirSync(pages, { recursive: true });
    writeFileSync(join(pages, 'roadmap.tsx'), 'export default function Page() {}');

    const plugin = tinyCanvas({ pagesDir: '/tiny-board' });
    plugin.configResolved({ root, base: '/' });
    const manifest = JSON.parse(plugin.transformIndexHtml()[0].children);

    expect(manifest.pages).toEqual([
      {
        id: '/tiny-board/roadmap',
        title: 'Roadmap',
        href: '/tiny-board/roadmap',
      },
    ]);
  });

  it('rejects directory traversal', () => {
    expect(() => tinyCanvas({ pagesDir: '/../private' })).toThrow(
      'cannot contain ".."'
    );
  });
});
