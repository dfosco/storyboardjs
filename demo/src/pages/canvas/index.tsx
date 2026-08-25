import { useEffect } from 'react'
import { Block, Canvas, Frame, Link, Note } from '@dfosco/tiny-canvas'
import '@dfosco/tiny-canvas/style.css'
import {
  DefinitionCard,
  LaunchBrief,
  LaunchMasthead,
  ReleaseSignal,
} from '../../components/LaunchBlocks.jsx'

export default function CanvasOverviewPage() {
  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Launch Room — Tiny Canvas example'
    return () => {
      document.title = previousTitle
    }
  }, [])

  return (
    <Canvas
      title="Launch plan"
      className="launch-canvas"
      colorMode="light"
      dotted
      gridSize={24}
      canvasWidth={1800}
      canvasHeight={1300}
      resettable
    >
      <Block id="launch-masthead" x={24} y={20} className="launch-masthead-block">
        <LaunchMasthead />
      </Block>
      <Block id="launch-brief" x={170} y={138} className="launch-brief-block">
        <LaunchBrief />
      </Block>
      <Note
        id="today-note"
        x={900}
        y={176}
        width={310}
        height={238}
        minHeight={200}
        color="orange"
        className="launch-today-note"
      >
        {'## TODAY\n\n□ Tighten the first viewport\n\n□ Test touch + keyboard\n\n□ Publish to GitHub Pages'}
      </Note>
      <Block id="release-signal" x={850} y={466} className="release-signal-block">
        <ReleaseSignal />
      </Block>
      <Block id="definition-of-done" x={195} y={650} className="definition-card-block">
        <DefinitionCard />
      </Block>
      <Link
        id="github-link"
        url="https://github.com/dfosco/tiny-canvas"
        title="tiny-canvas on GitHub"
        displayUrl="github.com/dfosco/tiny-canvas"
        x={670}
        y={654}
        width={330}
        className="launch-link"
      />
      <Frame
        id="review-board-frame"
        route="/tiny-canvas/canvas/details"
        title="Review board"
        description="Final checks and open questions"
        prepend={[]}
        append={[]}
        x={1060}
        y={640}
        width={520}
        height={390}
      />
    </Canvas>
  )
}
