import { useEffect } from 'react'
import { Block, Canvas, Frame, Link, Mark, Note } from '@dfosco/tiny-canvas'
import '@dfosco/tiny-canvas/style.css'
import { LOWLAND_SITE_ROUTE, LowlandComponents } from '../../components/LowlandDemo'

const RESOURCE_LINKS = [
  {
    id: 'lowland-stays-link',
    url: 'https://www.visitwadden.nl/en/visit/accommodations/holiday-homes',
    title: 'Explore Wadden coast stays',
    displayUrl: 'visitwadden.nl/holiday-homes',
    x: 850,
  },
  {
    id: 'lowland-train-link',
    url: 'https://www.ns.nl/en/journeyplanner/',
    title: 'Plan the train journey',
    displayUrl: 'ns.nl/journeyplanner',
    x: 1080,
  },
  {
    id: 'lowland-weather-link',
    url: 'https://www.knmi.nl/nederland-nu/maritiem/coastal-waters',
    title: 'Check the coastal forecast',
    displayUrl: 'knmi.nl/coastal-waters',
    x: 1310,
  },
] as const

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
      canvasHeight={1400}
      resettable
    >
      <Frame
        id="lowland-home-frame"
        route={LOWLAND_SITE_ROUTE}
        title="Lowland — Home"
        description="Desktop · interactive booking flow"
        snapshot="/tiny-canvas/lowland-home-snapshot.png"
        prepend={[]}
        append={[]}
        x={36}
        y={36}
        width={900}
        height={650}
      />
      <Block id="lowland-components" x={960} y={58} className="component-specimen-block">
        <LowlandComponents />
      </Block>
      <Note
        id="content-note"
        x={1320}
        y={118}
        width={200}
        height={220}
        minHeight={180}
        color="yellow"
        className="project-note"
      >
        {'## CONTENT\n\nConfirm winter opening dates. Add train directions from Amsterdam.'}
      </Note>
      <Note
        id="photo-list-note"
        x={1320}
        y={410}
        width={200}
        height={240}
        minHeight={200}
        color="blue"
        className="project-note"
      >
        {'## PHOTO LIST\n\n- North cabin at dusk\n- Breakfast table\n- Path to the dunes'}
      </Note>
      <Mark id="launch-checklist" x={396} y={669} width={430} height={240} className="project-markdown">
        {'## Launch checklist\n\n- Responsive navigation\n- Calendar month controls\n- Cabin + guest choices\n- Confirmation state\n- SEO titles + social image\n\n---\n\n**Target:** Friday review'}
      </Mark>
      {RESOURCE_LINKS.map((link) => (
        <Link
          key={link.id}
          {...link}
          y={900}
          width={210}
          className="project-link"
        />
      ))}
    </Canvas>
  )
}
