import { useEffect } from 'react'
import { Canvas, Frame, Link, Note } from '@dfosco/tiny-canvas'

export default function CanvasDetailsPage() {
  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Tiny Canvas — Details'
    return () => {
      document.title = previousTitle
    }
  }, [])

  return (
    <Canvas title="Details" dotted resettable>
      <Note id="details-note" x={240} y={140} color="purple">
        {'## Details\nA separate TSX route and Canvas instance.'}
      </Note>
      <Link
        id="details-link"
        url="https://github.com/dfosco/tiny-canvas"
        title="Tiny Canvas"
        displayUrl="github.com/dfosco/tiny-canvas"
        x={560}
        y={340}
      />
      <Frame
        id="overview-frame"
        route="/"
        title="Overview preview"
        x={240}
        y={540}
        width={640}
        height={420}
      />
    </Canvas>
  )
}
