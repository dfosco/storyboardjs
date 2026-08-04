/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import Canvas from './Canvas.jsx';
import Frame from './Frame.jsx';
import Link from './Link.jsx';
import Mark from './Mark.jsx';
import Note from './Note.jsx';

function setPageManifest(pages, widgets = {}) {
  const script = document.createElement('script');
  script.id = 'tiny-canvas-pages';
  script.type = 'application/json';
  script.textContent = JSON.stringify({ pagesDir: '/canvas', pages, widgets });
  document.head.append(script);
}

describe('Canvas components', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
    document.getElementById('tiny-canvas-pages')?.remove();
    window.history.replaceState({}, '', '/');
  });

  it('renders Markdown in resizable Note and Mark components', () => {
    render(
      <Canvas>
        <Note id="note" color="yellow">## Sticky note</Note>
        <Mark id="mark">### Markdown block</Mark>
      </Canvas>
    );

    expect(screen.getByRole('heading', { name: 'Sticky note' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Markdown block' })).toBeTruthy();
    expect(screen.getByLabelText('Resize note')).toBeTruthy();
    expect(screen.getByLabelText('Resize markdown')).toBeTruthy();
  });

  it('shows bottom controls and copies current-board changes', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    localStorage.setItem(
      'tiny-canvas-queue',
      JSON.stringify([
        { id: 'note', x: 40, y: 80, width: 300, height: 190 },
        { id: 'stale', x: 1, y: 2 },
      ])
    );

    render(
      <Canvas resettable>
        <Note id="note">Keep me</Note>
      </Canvas>
    );

    expect(screen.getByRole('button', { name: 'Reset board' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Copy changes' }));

    await waitFor(() => expect(writeText).toHaveBeenCalledOnce());
    expect(writeText.mock.calls[0][0]).toContain('"component": "Note"');
    expect(writeText.mock.calls[0][0]).toContain('"width": 300');
    expect(writeText.mock.calls[0][0]).not.toContain('stale');
    expect(screen.getByRole('button', { name: 'Copied' })).toBeTruthy();
  });

  it('zooms the board from bottom controls', () => {
    const { container } = render(
      <Canvas>
        <Note id="note">Zoom me</Note>
      </Canvas>
    );
    const board = container.querySelector('.tc-canvas-board');

    expect(board.style.getPropertyValue('--tc-canvas-zoom')).toBe('1');
    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    expect(board.style.getPropertyValue('--tc-canvas-zoom')).toBe('1.25');
    expect(screen.getByRole('button', { name: 'Reset zoom' }).textContent).toBe(
      '125%'
    );

    fireEvent.click(screen.getByRole('button', { name: 'Reset zoom' }));
    expect(board.style.getPropertyValue('--tc-canvas-zoom')).toBe('1');
    fireEvent.click(screen.getByRole('button', { name: 'Zoom out' }));
    expect(board.style.getPropertyValue('--tc-canvas-zoom')).toBe('0.75');
  });

  it('scopes persisted geometry by page and keeps the source component ID', () => {
    window.history.replaceState({}, '', '/app/canvas');
    setPageManifest([
      { id: '/canvas', title: 'Canvas', href: '/app/canvas' },
      { id: '/canvas/details', title: 'Details', href: '/app/canvas/details' },
    ]);

    const { container, unmount } = render(
      <Canvas title="Overview">
        <Note id="note">Page note</Note>
      </Canvas>
    );

    fireEvent.keyDown(screen.getByLabelText('Resize note'), {
      key: 'ArrowRight',
    });

    const block = container.querySelector('#note');
    expect(block.getAttribute('data-block-id')).toBe(
      'tc-page:%2Fcanvas:note'
    );
    expect(JSON.parse(localStorage.getItem('tiny-canvas-queue'))[0]).toMatchObject({
      id: 'tc-page:%2Fcanvas:note',
      width: 180,
      height: 60,
    });

    unmount();
    window.history.replaceState({}, '', '/app/canvas/details');
    render(
      <Canvas title="Details">
        <Note id="note">Page note</Note>
      </Canvas>
    );
    fireEvent.keyDown(screen.getByLabelText('Resize note'), {
      key: 'ArrowDown',
    });

    expect(
      JSON.parse(localStorage.getItem('tiny-canvas-queue')).map(({ id }) => id)
    ).toEqual([
      'tc-page:%2Fcanvas:note',
      'tc-page:%2Fcanvas%2Fdetails:note',
    ]);
  });

  it('renders a resizable Link with an origin favicon', () => {
    const { container } = render(
      <Canvas>
        <Link
          id="repo"
          url="https://github.com/dfosco/tiny-canvas?tab=readme"
          title="Tiny Canvas"
          displayUrl="github.com/dfosco/tiny-canvas"
        />
      </Canvas>
    );

    const link = screen.getByRole('link', { name: 'Tiny Canvas' });
    expect(link.getAttribute('href')).toBe(
      'https://github.com/dfosco/tiny-canvas?tab=readme'
    );
    expect(screen.getByText('github.com/dfosco/tiny-canvas')).toBeTruthy();
    expect(container.querySelector('.tc-link-favicon img').src).toBe(
      'https://github.com/favicon.ico'
    );
    expect(screen.getByLabelText('Resize link: Tiny Canvas')).toBeTruthy();
  });

  it('applies optional widget config defaults before instance props', () => {
    setPageManifest([], {
      Frame: {
        prepend: { value: '/preview', visible: false },
        apend: { value: '/embedded', visible: true },
      },
      Note: { color: 'blue', width: 310 },
    });

    const { container } = render(
      <Canvas>
        <Frame id="frame" route="/settings?tab=profile" title="Settings" />
        <Note id="note" color="pink">Configured note</Note>
      </Canvas>
    );

    expect(screen.getByText('/settings/embedded?tab=profile')).toBeTruthy();
    expect(screen.getByTitle('Settings').getAttribute('src')).toBe(
      '/preview/settings/embedded?tab=profile&embedView=1'
    );
    expect(container.querySelector('#note').style.width).toBe('310px');
    expect(container.querySelector('.tc-note').dataset.color).toBe('pink');
  });

  it('tracks same-origin Frame title and route navigation', () => {
    const { container } = render(
      <Canvas>
        <Frame
          id="frame"
          route="/settings"
          title="Initial title"
          prepend={{ value: '/preview', visible: false }}
          apend={{ value: '/embedded', visible: true }}
        />
      </Canvas>
    );
    const iframe = container.querySelector('iframe');
    let href =
      'http://localhost:3000/preview/settings/embedded?embedView=1#/profile';
    let documentTitle = 'Profile';
    const listeners = {};
    const history = {
      pushState: vi.fn(),
      replaceState: vi.fn(),
    };
    const navigation = {
      addEventListener: vi.fn((type, listener) => {
        listeners[type] = listener;
      }),
      removeEventListener: vi.fn(),
    };
    const frameWindow = {
      get location() {
        return { href };
      },
      history,
      navigation,
      addEventListener: vi.fn((type, listener) => {
        listeners[type] = listener;
      }),
      removeEventListener: vi.fn(),
    };
    const frameDocument = {
      get title() {
        return documentTitle;
      },
      querySelector: vi.fn(() => null),
      head: null,
    };
    Object.defineProperty(iframe, 'contentWindow', {
      configurable: true,
      value: frameWindow,
    });
    Object.defineProperty(iframe, 'contentDocument', {
      configurable: true,
      value: frameDocument,
    });

    fireEvent.load(iframe);
    expect(screen.getByText('Profile')).toBeTruthy();
    expect(screen.getByText('/settings/embedded#/profile')).toBeTruthy();
    const openLink = screen.getByRole('link', {
      name: 'Open Profile in new tab',
    });
    expect(openLink.getAttribute('href')).toBe(
      'http://localhost:3000/preview/settings/embedded#/profile'
    );
    expect(openLink.getAttribute('target')).toBe('_blank');

    href =
      'http://localhost:3000/preview/details/embedded?embedView=1&tab=activity';
    documentTitle = 'Details';
    act(() => history.pushState({}, '', '/details'));
    expect(screen.getByText('Details')).toBeTruthy();
    expect(screen.getByText('/details/embedded?tab=activity')).toBeTruthy();
    expect(
      screen
        .getByRole('link', { name: 'Open Details in new tab' })
        .getAttribute('href')
    ).toBe(
      'http://localhost:3000/preview/details/embedded?tab=activity'
    );
  });
});
