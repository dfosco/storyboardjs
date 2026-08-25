import { useEffect } from 'react'
import { Canvas, Frame, Mark, Note } from '@dfosco/tiny-canvas'
import { LOWLAND_SITE_ROUTE } from '../../components/LowlandDemo'

export default function CanvasDetailsPage() {
  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Lowland content review'
    return () => {
      document.title = previousTitle
    }
  }, [])

  const isEmbeddedView = new URLSearchParams(window.location.search).has('embedView')

  return (
    <Canvas
      title="Content review"
      className={isEmbeddedView ? 'lowland-board is-embedded' : 'lowland-board'}
      colorMode="light"
      dotted
      gridSize={24}
      canvasWidth={1500}
      canvasHeight={1100}
      resettable={!isEmbeddedView}
      copyable={!isEmbeddedView}
    >
      <Frame
        id="lowland-cabins-frame"
        route={`${LOWLAND_SITE_ROUTE}#cabins`}
        title="Lowland — Cabins"
        description="Section review"
        prepend={[]}
        append={[]}
        x={40}
        y={40}
        width={850}
        height={620}
      />
      <Note id="copy-pass" x={940} y={90} width={300} height={210} color="yellow" className="project-note">
        {'## COPY PASS\n\nKeep cabin descriptions practical. Add travel time from Amsterdam Central.'}
      </Note>
      <Note id="accessibility-note" x={960} y={380} width={300} height={210} color="green" className="project-note">
        {'## ACCESSIBILITY\n\nVerify image alternatives, keyboard navigation, and contrast over the full site.'}
      </Note>
      <Mark id="content-map" x={380} y={720} width={460} height={230} className="project-markdown">
        {'## Homepage sections\n\n1. Hero + booking action\n2. Cabin overview\n3. Journal\n4. Visit and availability\n\n**Next review:** photography and final copy'}
      </Mark>
    </Canvas>
  )
}
