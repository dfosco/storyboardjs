# @dfosco/tiny-canvas

## 0.4.0

### Minor Changes

- 10097be: Fix Frame route resolution, move resize handle outside iframe, and add test suite.

  **Frame route fix:** `Frame` now accepts any same-origin route — relative paths, query strings with hash routes (e.g. `/?urlstate=board#/canvas`), full same-origin URLs, and bare hash routes (`#/view`) — and correctly builds the embedded `src` by resolving `route` against the current page origin. Cross-origin routes throw a `TypeError`. Previously, non-hash routes were incorrectly embedded as a hash fragment, producing a broken iframe URL.

  The `route` prop type is widened from `` `#/${string}` `` to `string | URL`.

  **Resize handle:** The resize handle button is now rendered outside the `<iframe>` element at the bottom-right corner of the Frame block, making it accessible and interactive regardless of iframe pointer-event capture.

  Also adds Vitest as the test runner with tests for `buildFrameHref` (11 cases) and `useResetCanvas` (5 cases).

## 0.3.0

### Minor Changes

- 5bbec33: Add persistent Frame resizing, non-negative dragging, and an optional Canvas reset button.

## 0.2.0

### Minor Changes

- Add a draggable `Frame` component for same-origin route previews and make `Block` own its default panel presentation.

## 0.1.0

### Initial release

- Add `Canvas` as the strict board container for authorized canvas components.
- Add `Block` with `x` and `y` placement, dragging, persisted positions, and
  selection state.
- Add generated block identities so explicit IDs are optional.
- Add dotted backgrounds, light and dark color modes, and customizable styles.
- Add `useResetCanvas` for clearing persisted positions.
