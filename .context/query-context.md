# SigMap Query Context
Generated: 2026-08-21T13:20:25.905Z

## packages/tiny-canvas/src/style.css
```
var --tc-border-radius
var --tc-shadow-rest
var --tc-border-color
var --tc-selection-color
var --tc-grid-size
var --tc-grid-offset
var --tc-font-stack
.tc-canvas
.tc-canvas
.tc-canvas
.tc-canvas
.tc-canvas-controls
.tc-canvas-board
.tc-canvas-zoom
.tc-canvas-zoom
```

## packages/tiny-canvas/src/vite.js
```
function normalizeRoute(value)  :17-28
function humanize(value)  :30-33
function readCanvasSource(file)  :35-41
function readCanvasTitle(source)  :43-48
function collectPageFiles(directory)  :50-75
function routeFromFile(file, pagesRoot, routeBase)  :77-85
function joinBase(base, route)  :87-92
```

## packages/tiny-canvas/README.md
```
h1 Tiny Canvas
h2 Install
h2 Quick start
h2 Multiple canvas pages
h2 How it works
h2 API
h3 `Canvas`
h3 `Block`
h3 `Frame`
h3 `Note` and `Mark`
h3 `Link`
h3 `useResetCanvas`
h2 Styling
h2 Requirements
h2 License
code-fence bash
code-fence plain
code-fence jsx
code-fence ts
code-fence text
```

## packages/tiny-canvas/src/frameUrl.js
```
export function buildFrameDisplayRoute(route, options = {}, currentHref = window.location.href)  :125-137
export function buildFrameHref(route, currentHref = window.location.href, options = {})  :139-151
export function buildFrameNavigationDisplayRoute(navigationHref, options = {}, currentHref = window.location.href)  :153-171
export function buildFrameOpenHref(navigationHref, currentHref = window.location.href)  :173-180
function resolveFrameUrl(route, currentHref)  :1-14
function pathAffixes(value, propName, environment = 'prod')  :16-37
function resolveAffixes({ prepend, append, apend, environment = 'prod' } = {})  :39-48
function isQueryAffix(affix)  :50-52
function pathAffixValue(affixes, visibleOnly = false)  :54-61
function applyQueryAffixes(frameUrl, affixes, visibleOnly = false)  :63-73
function applyPathAffixes(frameUrl, affixes, visibleOnly = false)  :75-85
function relativeFrameUrl(frameUrl)  :87-89
function replaceAppliedPathAffixes(pathname, affixes, edge)  :91-109
function removeHiddenQueryAffixes(frameUrl, affixes)  :111-123
```

## packages/tiny-canvas/src/canvasChild.js
```
export function authorizeCanvasChild(Component)  :3-6
export function isAuthorizedCanvasChild(child)  :8-10
```
