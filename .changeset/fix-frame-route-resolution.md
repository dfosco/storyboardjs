---
"@dfosco/tiny-canvas": minor
---

Fix Frame route resolution and add test suite.

`Frame` now accepts any same-origin route — relative paths, query strings with hash routes (e.g. `/?urlstate=board#/canvas`), full same-origin URLs, and bare hash routes (`#/view`) — and correctly builds the embedded `src` by resolving `route` against the current page origin. Cross-origin routes throw a `TypeError`. Previously, non-hash routes were incorrectly embedded as a hash fragment, producing a broken iframe URL.

The `route` prop type is widened from `` `#/${string}` `` to `string | URL`.

Also adds Vitest as the test runner with tests for `buildFrameHref` (11 cases) and `useResetCanvas` (5 cases).
