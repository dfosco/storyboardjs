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
});
