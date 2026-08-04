import { describe, expect, it } from 'vitest';
import {
  buildFrameDisplayRoute,
  buildFrameHref,
  buildFrameNavigationDisplayRoute,
  buildFrameOpenHref,
} from './frameUrl.js';

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

  it('adds prepend and apend values to the URL pathname', () => {
    const result = buildFrameHref('/settings?tab=profile#/account', BASE, {
      prepend: { value: '/preview', visible: false },
      apend: { value: '/embedded', visible: true },
    });
    const url = new URL(result, ORIGIN);

    expect(url.pathname).toBe('/preview/settings/embedded');
    expect(url.searchParams.get('tab')).toBe('profile');
    expect(url.searchParams.get('embedView')).toBe('1');
    expect(url.hash).toBe('#/account');
  });

  it('hides invisible affixes only from the displayed route', () => {
    const options = {
      prepend: { value: '/preview', visible: false },
      apend: { value: '/embedded', visible: true },
    };

    expect(buildFrameDisplayRoute('/settings?tab=profile', options, BASE)).toBe(
      '/settings/embedded?tab=profile'
    );
    expect(buildFrameHref('/settings?tab=profile', BASE, options)).toBe(
      '/preview/settings/embedded?tab=profile&embedView=1'
    );
  });

  it('preserves the original route label when no affix is visible', () => {
    expect(buildFrameDisplayRoute('#/settings', {}, BASE)).toBe('#/settings');
    expect(
      buildFrameDisplayRoute(
        '/settings?tab=profile',
        { prepend: { value: '/preview', visible: false } },
        BASE
      )
    ).toBe('/settings?tab=profile');
  });

  it('validates path affix values', () => {
    expect(() =>
      buildFrameHref('/settings', BASE, {
        prepend: { value: '/preview', visible: 'no' },
      })
    ).toThrow(
      'Frame prepend must contain a string value and boolean visible.'
    );
  });

  it('displays the current iframe route without hidden affixes or embedView', () => {
    expect(
      buildFrameNavigationDisplayRoute(
        `${ORIGIN}/preview/settings/embedded?embedView=1&tab=profile#/account`,
        {
          prepend: { value: '/preview', visible: false },
          apend: { value: '/embedded', visible: true },
        },
        BASE
      )
    ).toBe('/settings/embedded?tab=profile#/account');
  });

  it('builds an absolute new-tab URL without embedView', () => {
    expect(
      buildFrameOpenHref(
        `${ORIGIN}/preview/settings/embedded?embedView=1&tab=profile#/account`,
        BASE
      )
    ).toBe(
      `${ORIGIN}/preview/settings/embedded?tab=profile#/account`
    );
  });
});
