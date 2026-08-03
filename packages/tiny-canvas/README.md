# Tiny Canvas

A small React canvas for arranging interactive blocks. Tiny Canvas gives every
block a stable generated identity, persists dragged positions in localStorage,
and keeps movement and selection behavior inside a reusable `<Block>`.

[View the live demo](https://dfosco.github.io/tiny-canvas/)

## Install

```bash
npm install @dfosco/tiny-canvas
```

## Quick start

```jsx
import { Block, Canvas } from '@dfosco/tiny-canvas'
import '@dfosco/tiny-canvas/style.css'

export function Board() {
  return (
    <Canvas dotted>
      <Block x={48} y={48}>
        Project summary
      </Block>

      <Block x={360} y={180}>
        Release checklist
      </Block>
    </Canvas>
  )
}
```

`Canvas` only accepts authorized canvas components. Use `Block` for arbitrary
content and `Frame` for same-origin route previews; passing a plain element
produces a clear runtime error.

## How it works

- **No explicit IDs required.** `Canvas` tags each `Block` with a generated
  persistence ID.
- **Position with props.** Set initial placement directly with `x` and `y`.
- **Persistent movement.** Dragged coordinates are restored from localStorage
  and take precedence over the initial `x` and `y`.
- **Built-in selection.** Clicking or focusing a block selects it. Clicking the
  canvas background or pressing Escape clears selection.
- **Same-origin previews.** `Frame` preserves the current path, adds
  `embedView=1`, and loads the requested hash route in a titled viewport.
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
| `children` | `Block \| Frame \| Array<Block \| Frame>` | — | Authorized canvas children. Plain elements are rejected. |
| `dotted` | `boolean` | `false` | Show the dotted canvas background. |
| `grid` | `boolean` | `false` | Legacy alias that also enables the dotted background. |
| `gridSize` | `number` | `36` | Dot-grid spacing in pixels. |
| `colorMode` | `'auto' \| 'light' \| 'dark'` | `'auto'` | Canvas color-scheme behavior. |
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

`Frame` is a draggable canvas item for previewing another hash route from the
current application:

```jsx
<Canvas>
  <Frame
    route="#/orgs/cli/security"
    title="Security overview"
    x={48}
    y={48}
    style={{ width: 640 }}
  />
</Canvas>
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `route` | `` `#/${string}` `` | — | Same-origin hash route loaded by the iframe. |
| `title` | `string` | — | Accessible iframe title shown in the frame header. |
| `x`, `y`, selection, and position props | `BlockProps` | — | Frame movement and selection use the same contract as `Block`. |

The embedded application can use the `embedView` query parameter to suppress
redirects or chrome that should not appear inside the preview.

### `useResetCanvas`

Clear all persisted block positions:

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
  --tc-frame-min-height: 448px;
  --tc-frame-title-bg: #f6f8fa;
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
