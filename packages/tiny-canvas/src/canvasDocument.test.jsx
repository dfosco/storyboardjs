/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import JsonCanvas from './CanvasDocumentView';

describe('JsonCanvas', () => {
  it('materializes standard nodes and renders edge layer', () => {
    const { container } = render(
      <JsonCanvas
        viewportFromUrl={false}
        document={{
          nodes: [
            { id: 'text', type: 'text', x: 0, y: 0, width: 200, height: 100, text: 'Hello' },
            { id: 'group', type: 'group', x: 300, y: 0, width: 400, height: 300, label: 'Group' },
            { id: 'link', type: 'link', x: 800, y: 0, width: 300, height: 100, url: 'https://example.com' },
          ],
          edges: [{ id: 'edge', fromNode: 'text', toNode: 'link', toEnd: 'arrow' }],
        }}
      />
    );

    expect(container.querySelector('[data-block-id="text"]')).not.toBeNull();
    expect(container.querySelector('[data-block-id="group"]')).not.toBeNull();
    expect(container.querySelector('[data-block-id="link"]')).not.toBeNull();
    expect(container.querySelector('[data-edge-id="edge"]')).not.toBeNull();
  });

  it('renders registered extension widgets inside authorized blocks', () => {
    function Widget({ label }) {
      return <span>{label}</span>;
    }
    const { container } = render(
      <JsonCanvas
        viewportFromUrl={false}
        document={{
          nodes: [{
            id: 'widget',
            type: 'text',
            x: 0,
            y: 0,
            width: 200,
            height: 100,
            text: 'fallback',
            'x-tiny-canvas': { renderer: 'Widget', props: { label: 'Custom' } },
          }],
        }}
        renderers={{ Widget }}
      />
    );
    expect(screen.getByText('Custom')).not.toBeNull();
    expect(container.querySelector('[data-block-id="widget"]')).not.toBeNull();
  });
});
