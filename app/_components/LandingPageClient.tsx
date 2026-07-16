import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Compass,
  Network,
  Route,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
} from "lucide-react";

const routes = ["Students", "Graduates", "Skilled Workers", "Health & Care", "Families", "Founders"];
const capabilities = [
  { icon: Route, title: "A journey that keeps evolving", text: "Beginly connects what matters now with the next transition—settlement, study, work, family and progression." },
  { icon: BriefcaseBusiness, title: "Opportunities with reasons", text: "Jobs, training, events and services are matched by fit, trust, readiness and timing—not hidden commercial pressure." },
  { icon: Sparkles, title: "Nia, your adaptive navigator", text: "Nia checks free, owned, household, sponsored and reward-funded access before suggesting anything paid." },
  { icon: Users, title: "One household, private workspaces", text: "Coordinate shared family actions while preserving each adult member’s private career, notes and product work." },
  { icon: Network, title: "Flexible products, not forced tiers", text: "Use the Free OS, add a focused standalone tool, combine products or activate institution-sponsored access." },
  { icon: Building2, title: "Partner and commission infrastructure", text: "Verified businesses can structure offers, attribution, conversions and reconciliation without compromising user fit." },
];

export default function LandingPageClient() {
  return (
    <main className="public-site">
      <header className="public-nav">
        <Link href="/" className="public-brand" aria-label="Beginly home"><span>B</span><div><strong>Beginly</strong><small>Living Path OS</small></div></Link>
        <nav aria-label="Public navigation"><a href="#platform">Platform</a><Link href="/guides">Guides</Link><Link href="/cities">Cities</Link><Link href="/opportunity-categories">Opportunities</Link><Link href="/products">Products</Link><Link href="/partners/commission-readiness">For business</Link></nav>
        <div className="public-nav-actions"><Link href="/login" className="public-link">Sign in</Link><Link href="/signup" className="public-button">Start free <ArrowRight size={16}/></Link></div>
      </header>

      <section className="public-hero">
        <div className="public-hero-copy">
          <span className="public-kicker"><Compass size={15}/> Adaptive UK transition and opportunity intelligence</span>
          <h1>Your next UK chapter should not require a new platform.</h1>
          <p>Beginly continuously interprets your evolving route, household, goals and readiness—then prepares the actions, opportunities and support needed for what comes next.</p>
          <div className="public-hero-actions"><Link href="/signup" className="public-button large">Build my living path <ArrowRight size={17}/></Link><Link href="/platform" className="public-ghost large">Explore the working platform</Link></div>
          <div className="public-trust-row"><span><CheckCircle2 size={16}/> Deeply adaptive free core</span><span><ShieldCheck size={16}/> Explainable and trust-led</span><span><Smartphone size={16}/> Shared web and mobile architecture</span></div>
        </div>
        <div className="public-hero-visual" aria-label="Beginly adaptive journey illustration">
          <div className="path-orbit path-main"><strong>Now</strong><span>Settle and organise</span></div>
          <div className="path-orbit path-next"><strong>Next</strong><span>Career readiness</span></div>
          <div className="path-orbit path-future"><strong>Future</strong><span>Progress and transition</span></div>
          <div className="nia-beacon"><Sparkles size={27}/><strong>Nia</strong><span>interprets the whole path</span></div>
          <i className="path-line one"/><i className="path-line two"/><i className="path-line three"/>
        </div>
      </section>

      <section className="public-proof-strip"><div><strong>1 identity</strong><span>across changing routes</span></div><div><strong>1 adaptive dashboard</strong><span>across products and household members</span></div><div><strong>Smallest sufficient support</strong><span>including no purchase</span></div><div><strong>Lifetime relevance</strong><span>instead of subscription lock-in</span></div></section>

      <section id="platform" className="public-section"><div className="public-section-heading"><span>What Beginly does</span><h2>An operating system for transition—not another static checklist.</h2><p>The same intelligence kernel serves free guidance, premium autonomy, opportunities, households, partners and the mobile companion.</p></div><div className="public-capability-grid">{capabilities.map(({icon: Icon,title,text})=><article key={title}><div><Icon size={21}/></div><h3>{title}</h3><p>{text}</p></article>)}</div></section>

      <section id="routes" className="public-route-section"><div><span className="public-kicker light"><Route size={15}/> One platform, multiple living paths</span><h2>Start where you are. Beginly prepares where you are going.</h2><p>A student may become a graduate, employee, parent or founder. A dependant may begin a career. A Health and Care Worker may progress professionally. Beginly preserves context instead of resetting the user.</p></div><div className="public-route-cloud">{routes.map((route,index)=><span key={route} className={`route-${index+1}`}>{route}</span>)}</div></section>

      <section className="public-commercial-section"><div className="public-section-heading"><span>Adaptive value orchestration</span><h2>Pay only for support that is relevant.</h2><p>Nia resolves free and existing access first, then sponsored or reward-funded support, a focused standalone product, a useful bundle or an ongoing subscription.</p></div><div className="public-decision-flow"><article><b>01</b><h3>Use free or owned access</h3><p>Beginly first checks what already solves the need.</p></article><article><b>02</b><h3>Activate sponsored support</h3><p>University, employer, partner or ProofPoints access comes before duplicate purchase.</p></article><article><b>03</b><h3>Choose the smallest sufficient product</h3><p>A standalone tool can be better than a broad subscription.</p></article><article><b>04</b><h3>Reconfigure as life changes</h3><p>Pause, replace or expand support without losing work or history.</p></article></div></section>

      <section className="public-cta"><div><span>Beginly Free OS</span><h2>Build the path you need now—and keep it when life changes.</h2><p>Explore the coded multi-route platform, adaptive journey, opportunities, Nia, household access and flexible products.</p></div><div><Link href="/signup" className="public-button light-button">Create my account <ArrowRight size={17}/></Link><Link href="/platform" className="public-ghost light-ghost">Open demo platform</Link></div></section>

      <footer className="public-footer"><div className="public-brand inverse"><span>B</span><div><strong>Beginly</strong><small>Adaptive UK transition and opportunity OS</small></div></div><p>General information and organisational support—not personal legal, immigration, medical or financial advice.</p><nav><Link href="/guides">Guides</Link><Link href="/cities">Cities</Link><Link href="/opportunity-categories">Opportunities</Link><Link href="/privacy-policy">Privacy</Link><Link href="/terms-of-service">Terms</Link><Link href="/support">Support</Link></nav></footer>
    </main>
  );
}
