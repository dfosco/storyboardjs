import { describe, expect, it } from 'vitest';
import { slugifyCanvasPageName } from './pageRoute.js';

describe('slugifyCanvasPageName', () => {
  it('converts filename stems to stable kebab-case route segments', () => {
    expect(slugifyCanvasPageName('SecondPage')).toBe('second-page');
    expect(slugifyCanvasPageName('HTTPOverview')).toBe('http-overview');
    expect(slugifyCanvasPageName('review_queue')).toBe('review-queue');
  });

  it('rejects filename stems without a usable route segment', () => {
    expect(() => slugifyCanvasPageName('---')).toThrow(
      'page filenames must contain a letter or number'
    );
  });
});
