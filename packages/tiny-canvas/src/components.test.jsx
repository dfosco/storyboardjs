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

function setPageManifest(pages, widgets = {}, environment = 'prod') {
  const script = document.createElement('script');
  script.id = 'tiny-canvas-pages';
  script.type = 'application/json';
  script.textContent = JSON.stringify({
    pagesDir: '/canvas',
    pages,
    widgets,
    environment,
  });
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
    const canvas = container.querySelector('.tc-canvas');
    const board = container.querySelector('.tc-canvas-board');
    Object.defineProperties(canvas, {
      clientWidth: { configurable: true, value: 800 },
      clientHeight: { configurable: true, value: 600 },
      scrollLeft: { configurable: true, value: 100, writable: true },
      scrollTop: { configurable: true, value: 200, writable: true },
    });
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 800,
      height: 600,
    });

    expect(board.style.getPropertyValue('--tc-canvas-zoom')).toBe('1');
    expect(board.style.getPropertyValue('--tc-canvas-width')).toBe('10000px');
    expect(board.style.getPropertyValue('--tc-canvas-height')).toBe('10000px');
    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    expect(board.style.getPropertyValue('--tc-canvas-zoom')).toBe('1.25');
    expect(canvas.scrollLeft).toBe(225);
    expect(canvas.scrollTop).toBe(325);
    expect(screen.getByRole('button', { name: 'Reset zoom' }).textContent).toBe(
      '125%'
    );

    fireEvent.click(screen.getByRole('button', { name: 'Reset zoom' }));
    expect(board.style.getPropertyValue('--tc-canvas-zoom')).toBe('1');
    expect(canvas.scrollLeft).toBe(100);
    expect(canvas.scrollTop).toBe(200);
    fireEvent.click(screen.getByRole('button', { name: 'Zoom out' }));
    expect(board.style.getPropertyValue('--tc-canvas-zoom')).toBe('0.75');
  });

  it('resizes Frames in logical pixels while the Canvas is zoomed', () => {
    const onSizeChange = vi.fn();
    const { container } = render(
      <Canvas>
        <Frame
          id="frame"
          route="/settings"
          title="Settings"
          width={1000}
          height={800}
          onSizeChange={onSizeChange}
        />
      </Canvas>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Zoom out' }));

    const frame = container.querySelector('#frame');
    const handle = screen.getByRole('button', { name: 'Resize Settings' });
    handle.setPointerCapture = vi.fn();

    fireEvent.pointerDown(handle, {
      pointerId: 1,
      clientX: 750,
      clientY: 600,
    });
    fireEvent.pointerMove(handle, {
      pointerId: 1,
      clientX: 825,
      clientY: 675,
    });

    expect(frame.style.width).toBe('1100px');
    expect(frame.style.height).toBe('900px');
    expect(onSizeChange).toHaveBeenLastCalledWith({
      width: 1100,
      height: 900,
    });
  });

  it('anchors modified-wheel zoom at the cursor', () => {
    const { container } = render(<Canvas />);
    const canvas = container.querySelector('.tc-canvas');
    const board = container.querySelector('.tc-canvas-board');
    Object.defineProperties(canvas, {
      scrollLeft: { configurable: true, value: 100, writable: true },
      scrollTop: { configurable: true, value: 200, writable: true },
    });
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
    });
    const wheelEvent = new WheelEvent('wheel', {
      bubbles: true,
      cancelable: true,
      clientX: 200,
      clientY: 150,
      ctrlKey: true,
      deltaY: -100,
    });

    act(() => canvas.dispatchEvent(wheelEvent));

    expect(wheelEvent.defaultPrevented).toBe(true);
    expect(board.style.getPropertyValue('--tc-canvas-zoom')).toBe('1.25');
    expect(canvas.scrollLeft).toBe(175);
    expect(canvas.scrollTop).toBe(287.5);
  });

  it('supports custom Canvas dimensions', () => {
    const { container } = render(
      <Canvas canvasWidth={2400} canvasHeight={1800} />
    );
    const board = container.querySelector('.tc-canvas-board');

    expect(board.style.getPropertyValue('--tc-canvas-width')).toBe('2400px');
    expect(board.style.getPropertyValue('--tc-canvas-height')).toBe('1800px');
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
      width: 280,
      height: 170,
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

  it('renders a fixed-size Link with an origin favicon', () => {
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
    expect(container.querySelector('#repo').style.width).toBe('320px');
    expect(screen.queryByLabelText('Resize link: Tiny Canvas')).toBeNull();
    expect(container.querySelector('#repo .tc-resize-handle')).toBeNull();
  });

  it('applies optional widget config defaults before instance props', () => {
    setPageManifest([], {
      Frame: {
        prepend: [{ value: '/preview', visible: false }],
        append: [
          { value: '/embedded', external: false, visible: true },
        ],
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
    expect(
      screen
        .getByRole('link', { name: 'Open Settings in new tab' })
        .getAttribute('href')
    ).toBe('http://localhost:3000/preview/settings?tab=profile');
    expect(container.querySelector('#frame').style.width).toBe('1270px');
    expect(container.querySelector('#frame').style.height).toBe('776px');
    expect(container.querySelector('#note').style.width).toBe('310px');
    expect(container.querySelector('.tc-note').dataset.color).toBe('pink');
  });

  it('applies only Frame affixes for the injected environment', () => {
    setPageManifest(
      [],
      {
        Frame: {
          prepend: [
            { value: '/development', visible: false, env: 'dev' },
            { value: '/previews/branch', visible: false, env: 'prod' },
          ],
        },
      },
      'dev'
    );

    const { container } = render(
      <Canvas>
        <Frame id="frame" route="/settings" title="Settings" />
      </Canvas>
    );

    expect(container.querySelector('iframe').getAttribute('src')).toBe(
      '/development/settings?embedView=1'
    );
  });

  it('tracks same-origin Frame title and route navigation', () => {
    const { container } = render(
      <Canvas>
        <Frame
          id="frame"
          route="/settings"
          title="Initial title"
          prepend={[{ value: '/preview', visible: false }]}
          append={[{ value: '/embedded', visible: true }]}
        />
      </Canvas>
    );
    const iframe = container.querySelector('iframe');
    let href =
      'http://localhost:3000/preview/settings/embedded?embedView=1#/profile';
    let documentTitle = 'Profile';
    const listeners = {};
    const documentListeners = {};
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
      addEventListener: vi.fn((type, listener) => {
        documentListeners[type] = listener;
      }),
      removeEventListener: vi.fn(),
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
    expect(documentListeners.wheel).toBeTypeOf('function');
    expect(screen.getByText('Profile')).toBeTruthy();
    expect(screen.getByText('/settings/embedded#/profile')).toBeTruthy();
    const openLink = screen.getByRole('link', {
      name: 'Open Profile in new tab',
    });
    expect(openLink.getAttribute('href')).toBe(
      'http://localhost:3000/preview/settings/embedded#/profile'
    );
    expect(openLink.getAttribute('target')).toBe('_blank');

    const canvasElement = container.querySelector('.tc-canvas');
    Object.defineProperties(canvasElement, {
      scrollLeft: { configurable: true, value: 0, writable: true },
      scrollTop: { configurable: true, value: 0, writable: true },
    });
    vi.spyOn(canvasElement, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
    });
    vi.spyOn(iframe, 'getBoundingClientRect').mockReturnValue({
      left: 50,
      top: 100,
    });
    const preventDefault = vi.fn();
    const stopPropagation = vi.fn();
    act(() =>
      documentListeners.wheel({
        ctrlKey: true,
        metaKey: false,
        deltaY: -100,
        clientX: 20,
        clientY: 30,
        preventDefault,
        stopPropagation,
      })
    );
    expect(preventDefault).toHaveBeenCalledOnce();
    expect(stopPropagation).toHaveBeenCalledOnce();
    expect(
      container
        .querySelector('.tc-canvas-board')
        .style.getPropertyValue('--tc-canvas-zoom')
    ).toBe('1.25');
    expect(canvasElement.scrollLeft).toBe(17.5);
    expect(canvasElement.scrollTop).toBe(32.5);

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
