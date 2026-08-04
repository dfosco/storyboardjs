import { useEffect } from 'react'
import { Canvas, Mark, Note } from '@dfosco/tiny-canvas'

export default function CanvasOverviewPage() {
  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Tiny Canvas — Overview'
    return () => {
      document.title = previousTitle
    }
  }, [])

  return (
    <Canvas title="Overview" dotted resettable>
      <Note id="overview-note" x={180} y={120} color="blue">
        {'## Overview\nThis TSX file is one canvas page.'}
      </Note>
      <Mark id="overview-markdown" x={520} y={240} width={420}>
        {'### Filesystem pages\n\nUse the page selector to open Details.'}
      </Mark>
    </Canvas>
  )
}
