/**
 * @vitest-environment jsdom
 */
import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import {
  applyCanvasGeometry,
  materializeCanvasSource,
  materializeReactChildren,
  normalizeCanvasDocument,
  parseCanvasJSONL,
  getStoredCanvasDocument,
  saveStoredCanvasDocument,
  serializeCanvasMDX,
  serializeCanvasJSONL,
  validateCanvasDocument,
} from './jsoncanvas.js';

const document = {
  nodes: [
    {
      id: 'note',
      type: 'text',
      x: 0,
      y: 20,
      width: 300,
      height: 180,
      text: '## Hello',
      color: '3',
    },
    {
      id: 'site',
      type: 'link',
      x: 400,
      y: 20,
      width: 300,
      height: 180,
      url: 'https://example.com',
    },
  ],
  edges: [
    {
      id: 'edge',
      fromNode: 'note',
      toNode: 'site',
      toEnd: 'arrow',
    },
  ],
  'x-tiny-canvas': { title: 'Test' },
};

describe('JSON Canvas model', () => {
  it('validates standard nodes, edges, and extensions', () => {
    expect(validateCanvasDocument(document)).toEqual({ valid: true, issues: [] });
    expect(normalizeCanvasDocument(document)).toEqual({
      ...document,
      nodes: document.nodes,
      edges: document.edges,
    });
  });

  it('rejects invalid geometry and dangling edges', () => {
    const result = validateCanvasDocument({
      nodes: [{ id: 'a', type: 'text', x: 0.5, y: 0, width: 10, height: 10, text: 'x' }],
      edges: [{ id: 'e', fromNode: 'a', toNode: 'missing' }],
    });
    expect(result.valid).toBe(false);
    expect(result.issues.map(({ path }) => path)).toEqual([
      'nodes[0].x',
      'edges[0].toNode',
    ]);
  });

  it('round-trips JSONL while preserving node order and metadata', () => {
    const serialized = serializeCanvasJSONL(document);
    expect(parseCanvasJSONL(serialized)).toEqual(document);
  });

  it('materializes JSON and JSONL sources', () => {
    expect(materializeCanvasSource(JSON.stringify(document))).toEqual(document);
    expect(materializeCanvasSource(serializeCanvasJSONL(document), { format: 'jsonl' })).toEqual(document);
  });

  it('materializes JSX and MDX-compatible component descriptors', async () => {
    function Note({ children, ...props }) {
      return createElement('note', props, children);
    }
    Note.displayName = 'Note';
    const result = materializeReactChildren(
      createElement(Note, { id: 'mdx-note', x: 12.4, y: 8.2 }, '## MDX')
    );
    expect(result.warnings).toEqual([]);
    expect(result.document.nodes[0]).toMatchObject({
      id: 'mdx-note',
      type: 'text',
      x: 12,
      y: 8,
      text: '## MDX',
    });
    expect(() => materializeCanvasSource('{}', { format: 'mdx' })).toThrow('materializeCanvasMDX');
  });

  it('applies persisted geometry without changing document order', () => {
    const next = applyCanvasGeometry(document, [{ id: 'site', x: 401.7, y: 23 }]);
    expect(next.nodes.map(({ id }) => id)).toEqual(['note', 'site']);
    expect(next.nodes[1]).toMatchObject({ x: 402, y: 23, width: 300, height: 180 });
  });

  it('serializes MDX as a document-preserving source', () => {
    const mdx = serializeCanvasMDX(document, { importPath: '@scope/canvas' });
    expect(mdx).toContain("import { JsonCanvas } from \"@scope/canvas\"");
    expect(mdx).toContain('"fromNode": "note"');
    expect(mdx).toContain('<JsonCanvas document={');
  });

  it('stores versioned full documents', () => {
    saveStoredCanvasDocument('round-trip', document);
    expect(getStoredCanvasDocument('round-trip')).toEqual(document);
    localStorage.removeItem('tiny-canvas-document:round-trip');
  });
});
