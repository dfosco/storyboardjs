import { describe, expect, it } from 'vitest';
import { buildFrameHref } from './frameUrl.js';

const ORIGIN = 'https://github.com';
const BASE = `${ORIGIN}/orgs/cli/security`;

describe('buildFrameHref', () => {
  it('handles a pure hash route', () => {
    const result = buildFrameHref('#/orgs/cli/security', BASE);
    const url = new URL(result, ORIGIN);
    expect(url.pathname).toBe('/orgs/cli/security');
    expect(url.searchParams.get('embedView')).toBe('1');
    expect(url.hash).toBe('#/orgs/cli/security');
  });

  it('handles a bare hash root (#/)', () => {
    const result = buildFrameHref('#/', BASE);
    const url = new URL(result, ORIGIN);
    expect(url.searchParams.get('embedView')).toBe('1');
    expect(url.hash).toBe('#/');
  });

  it('handles a path with query string and hash', () => {
    const result = buildFrameHref('/?urlstate=security#/orgs/cli/security', BASE);
    const url = new URL(result, ORIGIN);
    expect(url.pathname).toBe('/');
    expect(url.searchParams.get('embedView')).toBe('1');
    expect(url.searchParams.get('urlstate')).toBe('security');
    expect(url.hash).toBe('#/orgs/cli/security');
  });

  it('handles a relative path', () => {
    const result = buildFrameHref('/settings', BASE);
    const url = new URL(result, ORIGIN);
    expect(url.pathname).toBe('/settings');
    expect(url.searchParams.get('embedView')).toBe('1');
    expect(url.hash).toBe('');
  });

  it('accepts a URL object', () => {
    const routeUrl = new URL('/dashboard?tab=overview#/', ORIGIN);
    const result = buildFrameHref(routeUrl, BASE);
    const url = new URL(result, ORIGIN);
    expect(url.pathname).toBe('/dashboard');
    expect(url.searchParams.get('embedView')).toBe('1');
    expect(url.searchParams.get('tab')).toBe('overview');
    expect(url.hash).toBe('#/');
  });

  it('always sets embedView=1 even when already present in route', () => {
    const result = buildFrameHref('/foo?embedView=0#/', BASE);
    const url = new URL(result, ORIGIN);
    expect(url.searchParams.get('embedView')).toBe('1');
  });

  it('preserves other query params on the route', () => {
    const result = buildFrameHref('/?a=1&b=2#/view', BASE);
    const url = new URL(result, ORIGIN);
    expect(url.searchParams.get('a')).toBe('1');
    expect(url.searchParams.get('b')).toBe('2');
    expect(url.searchParams.get('embedView')).toBe('1');
  });

  it('throws for a cross-origin URL string', () => {
    expect(() =>
      buildFrameHref('https://evil.example.com/path', BASE)
    ).toThrow(TypeError);
    expect(() =>
      buildFrameHref('https://evil.example.com/path', BASE)
    ).toThrow('Frame route must resolve to the current origin.');
  });

  it('throws for a cross-origin URL object', () => {
    const crossOrigin = new URL('https://evil.example.com/path');
    expect(() => buildFrameHref(crossOrigin, BASE)).toThrow(TypeError);
  });

  it('throws when route is not a string or URL', () => {
    expect(() => buildFrameHref(42, BASE)).toThrow(TypeError);
    expect(() => buildFrameHref(null, BASE)).toThrow(TypeError);
    expect(() => buildFrameHref(undefined, BASE)).toThrow(TypeError);
  });

  it('returns a relative URL (no origin)', () => {
    const result = buildFrameHref('#/foo', BASE);
    expect(result).not.toMatch(/^https?:\/\//);
    expect(result.startsWith('/')).toBe(true);
  });
});
