import { describe, expect, it } from 'vitest';
import { getLinkData } from './linkUrl.js';

describe('getLinkData', () => {
  it('keeps the destination and derives favicon.ico from its origin', () => {
    expect(getLinkData('https://example.com/docs/page?q=canvas')).toEqual({
      href: 'https://example.com/docs/page?q=canvas',
      faviconHref: 'https://example.com/favicon.ico',
    });
  });

  it('accepts URL objects', () => {
    expect(getLinkData(new URL('http://localhost:3000/page')).faviconHref).toBe(
      'http://localhost:3000/favicon.ico'
    );
  });

  it('rejects invalid and non-web URLs', () => {
    expect(() => getLinkData('not a URL')).toThrow('valid absolute URL');
    expect(() => getLinkData('mailto:hello@example.com')).toThrow(
      'HTTP or HTTPS'
    );
  });
});
