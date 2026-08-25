import { useEffect } from 'react'
import { Block, Canvas, Frame, Link, Mark, Note } from '@dfosco/tiny-canvas'
import '@dfosco/tiny-canvas/style.css'
import { LOWLAND_SITE_ROUTE, LowlandComponents } from '../../components/LowlandDemo'

export default function CanvasOverviewPage() {
  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Lowland website board — Tiny Canvas example'
    return () => {
      document.title = previousTitle
    }
  }, [])

  return (
    <Canvas
      title="Homepage board"
      className="lowland-board"
      colorMode="light"
      dotted
      gridSize={24}
      canvasWidth={1800}
      canvasHeight={1300}
      resettable
    >
      <Frame
        id="lowland-home-frame"
        route={LOWLAND_SITE_ROUTE}
        title="Lowland — Home"
        description="Desktop · approved direction"
        prepend={[]}
        append={[]}
        x={36}
        y={36}
        width={900}
        height={650}
      />
      <Block id="lowland-components" x={970} y={98} className="component-specimen-block">
        <LowlandComponents />
      </Block>
      <Note
        id="content-note"
        x={1270}
        y={118}
        width={250}
        height={220}
        minHeight={180}
        color="yellow"
        className="project-note"
      >
        {'## CONTENT\n\nConfirm winter opening dates. Add train directions from Amsterdam.'}
      </Note>
      <Note
        id="photo-list-note"
        x={1230}
        y={410}
        width={285}
        height={240}
        minHeight={200}
        color="blue"
        className="project-note"
      >
        {'## PHOTO LIST\n\n- North cabin at dusk\n- Breakfast table\n- Path to the dunes'}
      </Note>
      <Mark id="launch-checklist" x={430} y={690} width={430} height={240} className="project-markdown">
        {'## Launch checklist\n\n- Responsive navigation\n- Cabin availability CTA\n- Journal index\n- SEO titles + social image\n\n---\n\n**Target:** Friday review'}
      </Mark>
      <Link
        id="lowland-github-link"
        url="https://www.visitwadden.nl/en/visit/accommodations/holiday-homes"
        title="Explore Wadden coast stays"
        displayUrl="visitwadden.nl/holiday-homes"
        x={970}
        y={760}
        width={360}
        className="project-link"
      />
    </Canvas>
  )
}
