import { useState } from 'react'

const RELEASE_STATES = ['Holding', 'Ready', 'Shipped']

function readReleaseSignal() {
  try {
    const storedSignal = window.localStorage.getItem('launch-room:release-signal')
    return RELEASE_STATES.includes(storedSignal) ? storedSignal : 'Ready'
  } catch {
    return 'Ready'
  }
}

export function LaunchMasthead() {
  return (
    <header className="launch-masthead">
      <div>
        <strong>LAUNCH ROOM</strong>
        <span>Tiny Canvas example</span>
      </div>
      <button className="launch-date tc-no-drag" type="button" aria-label="Ship date: 06 September">
        SHIP <span aria-hidden="true">·</span> 06 SEP
        <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
          <path d="m3 4.5 3 3 3-3" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        </svg>
      </button>
    </header>
  )
}

export function LaunchBrief() {
  return (
    <section className="launch-brief">
      <div className="launch-block-rule">
        <span>01</span>
        <span aria-hidden="true">•••</span>
      </div>
      <h1>Make tiny-canvas impossible to misunderstand.</h1>
      <p>One clear example, one useful workflow, no setup theatre.</p>
      <dl>
        <div>
          <dt>Owner</dt>
          <dd><span className="status-dot status-dot-neutral" />Design systems</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd><span className="status-dot status-dot-coral" />In progress</dd>
        </div>
        <div>
          <dt>Scope</dt>
          <dd><span className="status-dot status-dot-blue" />Example site</dd>
        </div>
      </dl>
    </section>
  )
}

export function ReleaseSignal() {
  const [signal, setSignal] = useState(readReleaseSignal)

  const updateSignal = (nextSignal) => {
    setSignal(nextSignal)
    try {
      window.localStorage.setItem('launch-room:release-signal', nextSignal)
    } catch {
      // The control remains useful when storage is unavailable.
    }
  }

  return (
    <fieldset className="release-signal">
      <legend>Release signal</legend>
      <div className="release-options">
        {RELEASE_STATES.map((state) => (
          <label key={state} className="tc-no-drag" data-active={signal === state || undefined}>
            <input
              type="radio"
              name="release-signal"
              value={state}
              checked={signal === state}
              onChange={() => updateSignal(state)}
            />
            <span>{state}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function DefinitionCard() {
  return (
    <section className="definition-card">
      <div className="launch-block-rule">
        <span>02</span>
        <span aria-hidden="true">•••</span>
      </div>
      <h2>Definition of done</h2>
      <p>Useful in 10 seconds. Memorable in 60.</p>
    </section>
  )
}

export function ReviewGate() {
  return (
    <section className="review-gate">
      <div className="launch-block-rule">
        <span>01</span>
        <span aria-hidden="true">REVIEW GATE</span>
      </div>
      <h1>Everything essential works without explanation.</h1>
      <ul>
        <li><span>01</span> The board reads as a real workflow</li>
        <li><span>02</span> Every primary control has a purpose</li>
        <li><span>03</span> The published URL survives refresh</li>
      </ul>
    </section>
  )
}

