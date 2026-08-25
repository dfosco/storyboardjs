import type { HTMLAttributeAnchorTarget, ReactNode } from 'react'

interface LowlandLinkProps {
  children: ReactNode
  href: string
  target?: HTMLAttributeAnchorTarget
}

interface LowlandButtonProps extends LowlandLinkProps {
  variant?: 'primary' | 'secondary'
}

export const LOWLAND_SITE_ROUTE = `${import.meta.env.BASE_URL}site`

export function LowlandButton({ children, href, target, variant = 'primary' }: LowlandButtonProps) {
  return (
    <a className="lowland-button tc-no-drag" data-variant={variant} href={href} target={target}>
      {children}
    </a>
  )
}

export function LowlandTextLink({ children, href, target }: LowlandLinkProps) {
  return (
    <a className="lowland-text-link tc-no-drag" href={href} target={target}>
      {children}
      <span aria-hidden="true">→</span>
    </a>
  )
}

export function LowlandComponents() {
  const visitHref = `${LOWLAND_SITE_ROUTE}#visit`

  return (
    <section className="component-specimen">
      <header>
        <h2>Components</h2>
      </header>
      <div className="component-actions">
        <LowlandButton href={visitHref} target="_blank">Find a cabin</LowlandButton>
        <LowlandButton href={visitHref} target="_blank" variant="secondary">View availability</LowlandButton>
        <LowlandTextLink href={`${LOWLAND_SITE_ROUTE}#journal`} target="_blank">Read the journal</LowlandTextLink>
      </div>
      <div className="component-swatches" aria-label="Lowland color palette">
        {[
          ['Pine', '#173d2b'],
          ['Sand', '#e9dfc8'],
          ['Clay', '#b96f4b'],
          ['Sky', '#c9dce4'],
        ].map(([name, color]) => (
          <div key={name}>
            <span style={{ backgroundColor: color }} aria-hidden="true" />
            <small>{name}</small>
          </div>
        ))}
      </div>
    </section>
  )
}

export function LowlandSite() {
  return (
    <div className="lowland-site">
      <header className="site-header">
        <a className="site-logo" href="#top" aria-label="Lowland home">LOWLAND</a>
        <nav aria-label="Primary navigation">
          <a href="#cabins">Cabins</a>
          <a href="#journal">Journal</a>
          <a href="#visit">Visit</a>
        </nav>
      </header>

      <main id="top">
        <section className="site-hero">
          <div className="site-hero-copy">
            <h1>A slower weekend by the North Sea.</h1>
            <p>Three cabins, open skies, and room to do very little.</p>
            <div className="site-hero-actions">
              <LowlandButton href="#visit">Find a cabin</LowlandButton>
              <a className="site-journal-link" href="#journal">See the journal</a>
            </div>
          </div>
          <figure className="site-hero-media">
            <img src="/tiny-canvas/lowland-cabin.jpg" alt="Dark timber cabin among coastal dune grass" />
          </figure>
        </section>

        <section className="site-cabins" id="cabins">
          <div>
            <h2>Three places, one horizon.</h2>
            <p>Each cabin sleeps two, faces west, and keeps the essentials deliberately simple.</p>
          </div>
          <ol>
            <li><span>01</span><strong>North cabin</strong><small>Closest to the dunes</small></li>
            <li><span>02</span><strong>Field cabin</strong><small>Morning light</small></li>
            <li><span>03</span><strong>Sea cabin</strong><small>Longest horizon</small></li>
          </ol>
        </section>

        <section className="site-journal" id="journal">
          <h2>Notes from the coast</h2>
          <div>
            <article><time dateTime="2026-08-18">18 August</time><h3>A good day for doing less</h3></article>
            <article><time dateTime="2026-07-29">29 July</time><h3>The long walk to the lighthouse</h3></article>
          </div>
        </section>

        <section className="site-visit" id="visit">
          <h2>Come for two nights. Stay for the weather.</h2>
          <LowlandButton href="mailto:stay@lowland.example">Check availability</LowlandButton>
        </section>
      </main>

      <footer className="site-footer">
        <span>Lowland · Noord-Holland</span>
        <span>Three cabins by the sea</span>
      </footer>
    </div>
  )
}
