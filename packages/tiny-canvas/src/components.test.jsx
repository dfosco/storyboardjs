/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Canvas from './Canvas.jsx';
import Link from './Link.jsx';
import Mark from './Mark.jsx';
import Note from './Note.jsx';

describe('Canvas components', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
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
});
