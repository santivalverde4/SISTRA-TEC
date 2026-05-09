export default function HomePage() {
  return (
    <main className="hero" id="vision">
      <section className="hero-card">
        <p className="eyebrow">Real-time traceability</p>
        <h1>Track every donation from intake to delivery.</h1>
        <p className="lede">
          SISTRA-TEC connects donors, transporters, and center admins in one
          timeline so every handoff is visible and accountable.
        </p>
        <div className="cta-row">
          <button className="btn primary">Register donation</button>
          <button className="btn ghost">Track donation</button>
        </div>
      </section>

      <section className="info-grid" id="roles">
        <article className="info-card">
          <h2>Donor view</h2>
          <p>
            Follow each status change: received, classified, in transit, and
            delivered.
          </p>
        </article>
        <article className="info-card">
          <h2>Center admin</h2>
          <p>
            Validate incoming goods, classify donations, and keep inventory
            accurate.
          </p>
        </article>
        <article className="info-card">
          <h2>Transporter</h2>
          <p>
            Update route progress with quick, secure status changes on the go.
          </p>
        </article>
      </section>

      <section className="timeline" id="timeline">
        <div className="timeline-card">
          <h3>Donation lifecycle</h3>
          <ol>
            <li>Received</li>
            <li>Classified</li>
            <li>In transit</li>
            <li>Delivered</li>
          </ol>
        </div>
        <div className="timeline-card">
          <h3>Security baseline</h3>
          <p>
            JWT for access, OAuth2 for identity, and Prisma with PostgreSQL for
            transactional integrity.
          </p>
        </div>
      </section>
    </main>
  );
}
