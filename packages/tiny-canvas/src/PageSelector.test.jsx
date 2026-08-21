/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import PageSelector, { getCanvasEnvironment } from './PageSelector.jsx';

function setManifest(pages) {
  document.getElementById('tiny-canvas-pages')?.remove();
  const script = document.createElement('script');
  script.id = 'tiny-canvas-pages';
  script.type = 'application/json';
  script.textContent = JSON.stringify({ pagesDir: '/canvas', pages });
  document.head.append(script);
}

afterEach(() => {
  cleanup();
  document.getElementById('tiny-canvas-pages')?.remove();
  window.history.replaceState({}, '', '/');
});

describe('PageSelector', () => {
  it('reads the environment injected by the Vite plugin', () => {
    setManifest([]);
    expect(getCanvasEnvironment()).toBe('prod');

    document.getElementById('tiny-canvas-pages').textContent = JSON.stringify({
      environment: 'dev',
      pages: [],
    });
    expect(getCanvasEnvironment()).toBe('dev');
  });

  it('renders sibling pages and marks the current TSX route', () => {
    window.history.replaceState({}, '', '/app/canvas/details');
    setManifest([
      { id: '/canvas', title: 'Overview', href: '/app/canvas' },
      {
        id: '/canvas/details',
        title: 'Details',
        href: '/app/canvas/details',
      },
    ]);

    render(<PageSelector title="Runtime details" />);

    expect(screen.getByText('2/2')).toBeTruthy();
    expect(
      screen.getByText('Runtime details', { selector: 'summary span' })
    ).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Overview' }).getAttribute('href')).toBe(
      '/app/canvas'
    );
    expect(screen.getByRole('link', { name: 'Details' }).getAttribute('aria-current')).toBe(
      'page'
    );
  });

  it('matches hash routes and keeps selector links in the hash router', () => {
    window.history.replaceState({}, '', '/preview/#/canvas/details');
    setManifest([
      { id: '/canvas', title: 'Overview', href: '/preview/canvas' },
      {
        id: '/canvas/details',
        title: 'Details',
        href: '/preview/canvas/details',
      },
    ]);

    render(<PageSelector />);

    expect(screen.getByText('2/2')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'Overview' }).getAttribute('href')
    ).toBe('#/canvas');
    expect(
      screen.getByRole('link', { name: 'Details' }).getAttribute('href')
    ).toBe('#/canvas/details');
    expect(
      screen.getByRole('link', { name: 'Details' }).getAttribute('aria-current')
    ).toBe('page');
  });

  it('stays hidden for a single page or a route outside the configured directory', () => {
    setManifest([{ id: '/canvas', title: 'Overview', href: '/canvas' }]);
    const { container, rerender } = render(<PageSelector />);
    expect(container.childElementCount).toBe(0);

    setManifest([
      { id: '/canvas', title: 'Overview', href: '/canvas' },
      { id: '/canvas/details', title: 'Details', href: '/canvas/details' },
    ]);
    rerender(<PageSelector />);
    expect(container.childElementCount).toBe(0);
  });

  it('ignores malformed manifests', () => {
    const script = document.createElement('script');
    script.id = 'tiny-canvas-pages';
    script.type = 'application/json';
    script.textContent = '{bad json';
    document.head.append(script);
    const { container } = render(<PageSelector />);
    expect(container.childElementCount).toBe(0);
  });
});
