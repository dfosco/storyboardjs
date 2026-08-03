/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { formatCanvasChanges, getCanvasChanges } from './utils.js';

describe('canvas changes', () => {
  beforeEach(() => localStorage.clear());

  it('returns current-board geometry without timestamps or stale blocks', () => {
    localStorage.setItem(
      'tiny-canvas-queue',
      JSON.stringify([
        {
          id: 'note-1',
          x: 12,
          y: 34,
          width: 280,
          height: 170,
          time: 'ignored',
        },
        { id: 'old-board-item', x: 50, y: 60 },
      ])
    );

    expect(
      getCanvasChanges(
        new Map([['note-1', { component: 'Note' }]])
      )
    ).toEqual([
      {
        component: 'Note',
        id: 'note-1',
        x: 12,
        y: 34,
        width: 280,
        height: 170,
      },
    ]);
  });

  it('formats an agent-readable JSON payload', () => {
    const text = formatCanvasChanges([
      { component: 'Mark', id: 'docs', width: 530, height: 240 },
    ]);

    expect(text).toContain('matching JSX components');
    expect(text).toContain('"component": "Mark"');
    expect(text).toContain('"width": 530');
  });
});
