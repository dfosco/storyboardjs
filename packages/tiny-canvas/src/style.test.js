import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const styles = readFileSync(new URL('./style.css', import.meta.url), 'utf8');

describe('Canvas viewport styles', () => {
  it('covers the dynamic viewport and owns vertical scrolling', () => {
    expect(styles).toContain('position: fixed;');
    expect(styles).toContain('height: 100dvh;');
    expect(styles).toContain('overflow: auto;');
  });

  it('disables root and Canvas vertical overscroll', () => {
    expect(styles).toContain('html:has(.tc-canvas)');
    expect(styles.match(/overscroll-behavior-y: none;/g)).toHaveLength(2);
  });

  it('provides a large scrollable board extent', () => {
    expect(styles).toContain('var(--tc-canvas-width, 10000px)');
    expect(styles).toContain('var(--tc-canvas-height, 10000px)');
  });
});

describe('Frame interaction styles', () => {
  it('shields every iframe while a Frame is being dragged', () => {
    expect(styles).toContain(
      '.tc-canvas:has(.tc-frame-block.tc-block-dragging) .tc-frame::before'
    );
    expect(styles).toContain('content: "";');
    expect(styles).toContain('inset: 0;');
    expect(styles).toContain('pointer-events: auto;');
  });

  it('renders Frame descriptions as secondary text', () => {
    expect(styles).toContain('.tc-frame-description');
    expect(styles).toContain('font-size: var(--text-body-size-small, 12px);');
  });
});

describe('Image styles', () => {
  it('contains images with rounded corners and no drag capture', () => {
    expect(styles).toContain('.tc-image img');
    expect(styles).toContain('object-fit: contain;');
    expect(styles).toContain('border-radius: var(--tc-image-radius, 4px);');
    expect(styles).toContain('pointer-events: none;');
  });
});

describe('Note styles', () => {
  it('keeps Markdown readable on light sticky colors in dark mode', () => {
    const noteRule = styles.match(/\.tc-note \{([^}]*)\}/)?.[1];

    expect(noteRule).toContain('color: var(--tc-note-fg, #24292f);');
    expect(noteRule).toContain('color-scheme: light;');
    expect(noteRule).not.toContain('--fgColor-default');
    expect(styles).toContain('.tc-note-content :is(h1, h2, h3, h4)');
  });
});
