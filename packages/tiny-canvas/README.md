# Tiny Canvas

A small React canvas for arranging interactive blocks. Tiny Canvas gives every
block a stable generated identity, persists dragged positions and sizes in
localStorage, and can copy layout changes as agent-readable JSON.

[View the live demo](https://dfosco.github.io/tiny-canvas/)

## Install

```bash
npm install @dfosco/tiny-canvas
```

## Quick start

```jsx
import { Block, Canvas, Mark, Note } from '@dfosco/tiny-canvas'
import '@dfosco/tiny-canvas/style.css'

export function Board() {
  return (
    <Canvas dotted resettable>
      <Block x={48} y={48}>
        Project summary
      </Block>

      <Block x={360} y={180}>
        Release checklist
      </Block>

      <Note x={48} y={240} color="yellow">
        {'## Remember\nShip the smallest useful thing.'}
      </Note>

      <Mark x={400} y={320}>
        {'### Status\n\n- Built\n- Tested'}
      </Mark>
    </Canvas>
  )
}
```

`Canvas` only accepts authorized canvas components. Use `Block` for arbitrary
content, `Frame` for same-origin route previews, `Note` for sticky notes, and
`Mark` for Markdown. Passing a plain element produces a clear runtime error.

## How it works

- **No explicit IDs required.** `Canvas` tags each `Block` with a generated
  persistence ID.
- **Position with props.** Set initial placement directly with `x` and `y`.
- **Persistent layout.** Dragged coordinates and resized frame dimensions are
  restored from localStorage and take precedence over initial props.
- **Agent handoff.** **Copy changes** copies changed coordinates and sizes as
  JSON with component, key/index, and persistence identity.
- **Built-in selection.** Clicking or focusing a block selects it. Clicking the
  canvas background or pressing Escape clears selection.
- **Same-origin previews.** `Frame` accepts relative paths, query strings,
  hash routes, or same-origin absolute URLs and adds `embedView=1`.
- **Stable across content edits.** Generated IDs use a React key when supplied,
  otherwise the block structure and sibling position.

Use a React `key` when blocks can be reordered and their persisted positions
must follow them:

```jsx
<Canvas>
  {cards.map((card) => (
    <Block key={card.slug} x={card.x} y={card.y}>
      <Card {...card} />
    </Block>
  ))}
</Canvas>
```

An optional `id` can still be supplied when an application needs a specific DOM
and persistence identifier, but it is not required.

## API

### `Canvas`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `Block \| Frame \| Note \| Mark \| Array<…>` | — | Authorized canvas children. Plain elements are rejected. |
| `dotted` | `boolean` | `false` | Show the dotted canvas background. |
| `grid` | `boolean` | `false` | Legacy alias that also enables the dotted background. |
| `gridSize` | `number` | `36` | Dot-grid spacing in pixels. |
| `colorMode` | `'auto' \| 'light' \| 'dark'` | `'auto'` | Canvas color-scheme behavior. |
| `resettable` | `boolean` | `false` | Show a built-in **Reset board** button that clears saved layout state and reloads. |
| `resetLabel` | `ReactNode` | `'Reset board'` | Customize the reset button content. |
| `copyable` | `boolean` | value of `resettable` | Show a built-in **Copy changes** button. |
| `copyLabel` | `ReactNode` | `'Copy changes'` | Customize the copy button content. |
| `copiedLabel` | `ReactNode` | `'Copied'` | Customize the temporary success content. |
| `onCopyChanges` | `(changes, text) => void` | — | Observe a successful clipboard copy. |
| `onSelectionChange` | `(blockId: string \| null) => void` | — | Observe selected block identity. |

Standard `<main>` attributes are forwarded to the canvas.

### `Block`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Content owned by the block. |
| `x` | `number` | `0` | Initial horizontal position in pixels. |
| `y` | `number` | `0` | Initial vertical position in pixels. |
| `id` | `string` | generated | Optional explicit DOM and persistence identifier. |
| `selected` | `boolean` | managed by `Canvas` | Control selected state. |
| `onPositionChange` | `({ x, y }) => void` | — | Observe drag position updates. |
| `onSelectionChange` | `(selected: boolean) => void` | — | Observe selection updates. |

Standard `<article>` attributes are forwarded to the block.

### `Frame`

`Frame` is a draggable canvas item for previewing another same-origin URL from
the current application:

```jsx
<Canvas>
  <Frame
    route="/?urlstate=security#/orgs/cli/security"
    title="Security overview"
    x={48}
    y={48}
    width={640}
    height={480}
  />
</Canvas>
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `route` | `string \| URL` | — | Same-origin URL, path, query, or hash route loaded by the iframe. |
| `title` | `string` | — | Accessible iframe title shown in the frame header. |
| `width` | `number` | `640` | Initial width in pixels. Saved width takes precedence. |
| `height` | `number` | `480` | Initial height in pixels. Saved height takes precedence. |
| `minWidth` | `number` | `320` | Minimum width while resizing. |
| `minHeight` | `number` | `240` | Minimum height while resizing. |
| `onSizeChange` | `({ width, height }) => void` | — | Observe live resize updates. |
| `x`, `y`, selection, and position props | `BlockProps` | — | Frame movement and selection use the same contract as `Block`. |

Select a frame, then drag its lower-right handle or use the handle's arrow keys
to resize it. The embedded application can use the `embedView` query parameter
to suppress redirects or chrome that should not appear inside the preview.

### `Note` and `Mark`

Both components accept Markdown string children, the movement props from
`Block`, and the size props from `Frame`. Both are resizable and persist their
width and height.

```jsx
<Note color="pink" x={48} y={48} width={270} height={170}>
  {'## Review\nCheck empty and loading states.'}
</Note>

<Mark x={360} y={48} width={530}>
  {'# Release plan\n\n1. Test\n2. Publish'}
</Mark>
```

`Note` supports `yellow`, `blue`, `green`, `pink`, `purple`, and `orange`.
`Mark` also accepts Markdown through its `content` prop; `Note` accepts `text`.

### `useResetCanvas`

Clear all persisted block positions and frame sizes:

```jsx
import { useResetCanvas } from '@dfosco/tiny-canvas'

function ResetButton() {
  const resetCanvas = useResetCanvas({ reload: true })
  return <button onClick={resetCanvas}>Reset layout</button>
}
```

The `reload` option defaults to `false`.

## Styling

Import the package stylesheet once:

```js
import '@dfosco/tiny-canvas/style.css'
```

Override CSS custom properties to fit your application:

```css
:root {
  --tc-bg-muted: #f6f8fa;
  --tc-dot-color: rgb(0 0 0 / 8%);
  --tc-selection-color: #0969da;
  --tc-border-radius: 12px;
  --tc-block-bg: #fff;
  --tc-block-border-color: rgb(0 0 0 / 15%);
  --tc-block-gap: 8px;
  --tc-block-min-width: 300px;
  --tc-block-padding: 24px;
  --tc-frame-bg: #fff;
  --tc-frame-border-color: rgb(0 0 0 / 15%);
  --tc-frame-width: 640px;
  --tc-frame-height: 480px;
  --tc-frame-title-bg: #f6f8fa;
  --tc-mark-bg: #fff;
  --tc-mark-border-color: rgb(0 0 0 / 15%);
  --tc-grid-size: 36px;
}
```

`Block` owns its panel layout, background, border, spacing, and minimum width.
Primer design tokens are used automatically when available.

## Requirements

- React 18 or 19
- React DOM 18 or 19

## License

[MIT](LICENSE)
