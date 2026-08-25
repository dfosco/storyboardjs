import { useEffect } from 'react'
import { Block, Canvas, Link, Note } from '@dfosco/tiny-canvas'
import { LaunchMasthead, ReviewGate } from '../../components/LaunchBlocks.jsx'

export default function CanvasDetailsPage() {
  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Review board'
    return () => {
      document.title = previousTitle
    }
  }, [])

  const isEmbeddedView = new URLSearchParams(window.location.search).has('embedView')

  return (
    <Canvas
      title="Review board"
      className={isEmbeddedView ? 'launch-canvas review-canvas is-embedded' : 'launch-canvas review-canvas'}
      colorMode="light"
      dotted
      gridSize={24}
      canvasWidth={1500}
      canvasHeight={1100}
      resettable={!isEmbeddedView}
      copyable={!isEmbeddedView}
    >
      <Block id="review-masthead" x={24} y={20} className="launch-masthead-block">
        <LaunchMasthead />
      </Block>
      <Block id="review-gate" x={150} y={150} className="review-gate-block">
        <ReviewGate />
      </Block>
      <Note id="open-questions" x={800} y={180} width={330} height={220} color="blue" className="review-note">
        {'## OPEN QUESTIONS\n\n- Does the use case read instantly?\n- Is the mobile board still usable?\n- Are layout changes easy to hand off?'}
      </Note>
      <Note id="ship-note" x={740} y={500} width={300} height={180} color="green" className="review-note">
        {'## SHIP CALL\n\nReady when the build, interaction loop, and Pages deployment are green.'}
      </Note>
      <Link
        id="review-github-link"
        url="https://github.com/dfosco/tiny-canvas"
        title="tiny-canvas on GitHub"
        displayUrl="github.com/dfosco/tiny-canvas"
        x={270}
        y={680}
        width={340}
        className="launch-link"
      />
    </Canvas>
  )
}
