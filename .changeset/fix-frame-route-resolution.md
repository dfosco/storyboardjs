---
"@dfosco/tiny-canvas": minor
---

Fix Frame route resolution, move resize handle outside iframe, and add test suite.

**Frame route fix:** `Frame` now accepts any same-origin route — relative paths, query strings with hash routes (e.g. `/?urlstate=board#/canvas`), full same-origin URLs, and bare hash routes (`#/view`) — and correctly builds the embedded `src` by resolving `route` against the current page origin. Cross-origin routes throw a `TypeError`. Previously, non-hash routes were incorrectly embedded as a hash fragment, producing a broken iframe URL.

The `route` prop type is widened from `` `#/${string}` `` to `string | URL`.

**Resize handle:** The resize handle button is now rendered outside the `<iframe>` element at the bottom-right corner of the Frame block, making it accessible and interactive regardless of iframe pointer-event capture.

Also adds Vitest as the test runner with tests for `buildFrameHref` (11 cases) and `useResetCanvas` (5 cases).
