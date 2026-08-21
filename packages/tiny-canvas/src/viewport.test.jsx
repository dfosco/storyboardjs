/**
 * @vitest-environment jsdom
 */
import { createRef } from 'react';
import { act, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Block from './Block';
import Canvas from './Canvas';

describe('Canvas viewport API', () => {
  it('sets content-space position and supported zoom level', () => {
    const ref = createRef();
    const { container } = render(
      <Canvas ref={ref} viewportFromUrl={false}>
        <Block id="one" x={100} y={200}>One</Block>
      </Canvas>
    );

    act(() => ref.current.setViewport({ x: 120, y: 80, zoom: 0.5 }));

    const canvas = container.querySelector('.tc-canvas');
    const board = container.querySelector('.tc-canvas-board');
    expect(board.style.getPropertyValue('--tc-canvas-zoom')).toBe('0.5');
    expect(canvas.scrollLeft).toBe(60);
    expect(canvas.scrollTop).toBe(40);
    expect(ref.current.getViewport().zoom).toBe(0.5);
    expect(ref.current.getDocument().nodes[0]).toMatchObject({
      id: 'one',
      type: 'text',
      x: 100,
      y: 200,
    });
  });

  it('centers known graph nodes and fits selected nodes', () => {
    const ref = createRef();
    render(
      <Canvas
        ref={ref}
        viewportFromUrl={false}
        graphNodes={[
          { id: 'one', type: 'text', x: 100, y: 200, width: 300, height: 100 },
        ]}
      >
        <Block id="one" x={100} y={200}>One</Block>
      </Canvas>
    );

    act(() => ref.current.centerOnNode('one'));
    expect(ref.current.getViewport().x).toBe(250);
    expect(ref.current.getViewport().y).toBe(250);
    expect(ref.current.centerOnNode('missing')).toBe(false);
    expect(ref.current.fitToNodes(['one'])).toBe(true);
  });

  it('accepts URL and postMessage viewport targeting', () => {
    const previousUrl = window.location.href;
    window.history.replaceState({}, '', '?canvasX=40&canvasY=60&canvasZoom=0.25');
    const ref = createRef();
    const { container, unmount } = render(
      <Canvas ref={ref}>
        <Block id="one" x={0} y={0}>One</Block>
      </Canvas>
    );
    const canvas = container.querySelector('.tc-canvas');
    expect(canvas.scrollLeft).toBe(10);
    expect(canvas.scrollTop).toBe(15);

    act(() => {
      window.dispatchEvent(new MessageEvent('message', {
        data: { type: 'tiny-canvas:set-viewport', viewport: { x: 80, y: 20, zoom: 0.5 } },
      }));
    });
    expect(container.querySelector('.tc-canvas-board').style.getPropertyValue('--tc-canvas-zoom')).toBe('0.5');
    unmount();
    window.history.replaceState({}, '', previousUrl);
  });
});
