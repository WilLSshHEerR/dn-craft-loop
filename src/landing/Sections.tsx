import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { prefersReducedMotion, resetTilt, trackGlow, trackTilt, useOnceInView } from './hooks';
import { Reveal } from './Reveal';
import {
  DEFAULT_PROJECTS,
  DEFAULT_SERVICES,
  DEFAULT_SITE_COPY,
  fetchProjects,
  fetchServices,
  fetchSiteCopy,
  useCmsValue,
} from '../lib/cms';
import type { Project, Service } from '../lib/cms';

/* ============ SERVICIOS ============ */
const serviceIcons: Record<Service['icon_key'], ReactNode> = {
  web: <><rect x="3" y="4" width="18" height="14" rx="2" /><path d="M3 8h18M8 21h8M12 18v3" /></>,
  react: <><circle cx="12" cy="12" r="2" /><ellipse cx="12" cy="12" rx="10" ry="4" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" /></>,
  backend: <><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v6c0 1.700 3.600 3 8 3s8-1.300 8-3V5M4 11v6c0 1.700 3.600 3 8 3s8-1.300 8-3v-6" /></>,
  automation: <path d="M13 2L4 14h7l-1 8 9-12h-7z" />,
  design: <><path d="M12 20h9" /><path d="M16.500 3.500a2.100 2.100 0 013 3L7 19l-4 1 1-4z" /></>,
  support: <><path d="M12 2a10 10 0 00-3 19.500M12 2c4 3 5 8 3 12l-3 8M8 14l-4 2M15 14l5 2" /><circle cx="12" cy="10" r="2" /></>,
};

export function Services() {
  const services = useCmsValue(fetchServices, DEFAULT_SERVICES);
  const copy = useCmsValue(fetchSiteCopy, DEFAULT_SITE_COPY);
  return (
    <section id="servicios" aria-labelledby="h-serv">
      <div className="container">
        <div className="section-head">
          <Reveal as="span" className="tag">&lt;Servicios /&gt;</Reveal>
          <Reveal as="h2" id="h-serv">{copy.services_heading}</Reveal>
          <Reveal as="p" className="lead">{copy.services_subheading}</Reveal>
        </div>
        <div className="cards">
          {services.map((s, i) => (
            <Reveal key={s.id} delay={(i % 3) * 80}>
              <article className="card" onPointerMove={trackGlow}>
                <div className="icon"><svg viewBox="0 0 24 24" aria-hidden="true">{serviceIcons[s.icon_key]}</svg></div>
                <h3>{s.title}</h3>
                <p>{s.description}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ PROCESO ============ */
const steps = [
  { n: '01', title: 'Descubrir', text: 'Entendemos tu negocio, tus usuarios y los objetivos que hay que medir.' },
  { n: '02', title: 'Diseñar', text: 'Prototipos y sistema visual aprobados antes de escribir una sola línea.' },
  { n: '03', title: 'Desarrollar', text: 'Entregas semanales, código revisado y pruebas automatizadas.' },
  { n: '04', title: 'Desplegar', text: 'Lanzamiento, monitoreo y mejora continua con métricas reales.' },
];

export function Process() {
  const [revealed, setRevealed] = useState(0);
  const onReveal = useCallback(() => setRevealed(n => Math.min(n + 1, steps.length)), []);
  const copy = useCmsValue(fetchSiteCopy, DEFAULT_SITE_COPY);

  return (
    <section className="process" id="proceso" aria-labelledby="h-proc">
      <div className="container">
        <div className="section-head">
          <Reveal as="span" className="tag">// proceso</Reveal>
          <Reveal as="h2" id="h-proc">{copy.process_heading}</Reveal>
          <Reveal as="p" className="lead">{copy.process_subheading}</Reveal>
        </div>
        <ol className="steps" style={{ '--p': revealed / steps.length } as React.CSSProperties}>
          {steps.map((s, i) => (
            <Reveal as="li" key={s.n} className="step" delay={i * 120} onReveal={onReveal}>
              <span className="num">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </Reveal>
          ))}
        </ol>
        <Reveal as="p" className="loop-note">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12a9 9 0 11-3-6.700M21 4v5h-5" /></svg>
          <span>while (true) {'{'} descubrir → diseñar → desarrollar → desplegar {'}'}</span>
        </Reveal>
      </div>
    </section>
  );
}

/* ============ TECNOLOGÍAS ============ */
const tech = ['React', 'Laravel', 'PHP', 'Tailwind', 'JavaScript', 'HTML5', 'MySQL', 'Docker'];

export function Tech() {
  return (
    <section className="tech" aria-label="Tecnologías que utilizamos">
      <div className="marquee">
        <ul className="track">
          {[...tech, ...tech].map((t, i) => (
            <li key={i} className="chip" aria-hidden={i >= tech.length || undefined}>{t}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ============ PROYECTOS ============ */
function Tilt({ to, children }: { to?: string; children: ReactNode }) {
  const props = { className: 'tilt', onPointerMove: trackTilt, onPointerLeave: resetTilt };
  return to ? <Link to={to} {...props}>{children}</Link> : <div {...props}>{children}</div>;
}

const mockShop = (
  <div className="mock m1" role="img" aria-label="Maqueta de una tienda en línea">
    <div className="mbar"><i /><i /><i /></div>
    <div className="body">
      <div className="b hd" /><div className="b s" /><div className="b" /><div className="b c" /><div className="b" /><div className="b s" /><div className="b" />
    </div>
  </div>
);
const mockDash = (
  <div className="mock m2" role="img" aria-label="Maqueta de un panel administrativo">
    <div className="mbar"><i /><i /><i /></div>
    <div className="body">
      <div className="b side s" />
      <div className="b chart">{[35, 60, 45, 80, 65, 95].map(h => <i key={h} style={{ height: `${h}%` }} />)}</div>
      <div className="b row" />
    </div>
  </div>
);
const mockApp = (
  <div className="mock m3" role="img" aria-label="Maqueta de una aplicación móvil">
    <div className="phone"><div className="b big c" /><div className="b s" /><div className="b" /><div className="b" /></div>
  </div>
);

export function Projects() {
  const projects = useCmsValue(fetchProjects, DEFAULT_PROJECTS);
  const copy = useCmsValue(fetchSiteCopy, DEFAULT_SITE_COPY);
  const previews: Record<Project['preview_kind'], ReactNode> = {
    shop: mockShop,
    dashboard: mockDash,
    app: mockApp,
  };
  return (
    <section id="proyectos" aria-labelledby="h-proy">
      <div className="container">
        <div className="section-head">
          <Reveal as="span" className="tag">&lt;Proyectos /&gt;</Reveal>
          <Reveal as="h2" id="h-proy">{copy.projects_heading}</Reveal>
          <Reveal as="p" className="lead">{copy.projects_subheading}</Reveal>
        </div>
        <div className="projects">
          {projects.map((p, i) => (
            <Reveal as="article" key={p.slug} className="project" delay={i * 120}>
              <Tilt to={p.href || undefined}>
                {p.image_url
                  ? <img className="cms-project-image" src={p.image_url} alt="" loading="lazy" />
                  : previews[p.preview_kind]}
                <span className="meta">{p.meta}</span>
                <h3>{p.title}</h3>
                <p>{p.description}</p>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ CIFRAS ============ */
function Counter({ to }: { to: number }) {
  const { ref, seen } = useOnceInView<HTMLSpanElement>(0.6);
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!seen) return;
    const t0 = performance.now();
    const dur = prefersReducedMotion() ? 0 : 1600;
    let raf = 0;
    const step = (now: number) => {
      const p = dur ? Math.min((now - t0) / dur, 1) : 1;
      setValue(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [seen, to]);

  return <span ref={ref}>{value}</span>;
}

const stats = [
  { pre: '+', to: 60, post: '', label: 'Proyectos entregados' },
  { pre: '', to: 98, post: '%', label: 'Clientes satisfechos' },
  { pre: '', to: 5, post: '+', label: 'Años de experiencia' },
  { pre: '', to: 24, post: '/7', label: 'Monitoreo y soporte' },
];

export function Stats() {
  return (
    <section aria-label="Cifras" style={{ paddingTop: 0 }}>
      <div className="container stats">
        {stats.map((s, i) => (
          <Reveal key={s.label} className="stat" delay={i * 80}>
            <strong>
              {s.pre && <span>{s.pre}</span>}
              <Counter to={s.to} />
              {s.post && <span>{s.post}</span>}
            </strong>
            <p>{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ============ CTA FINAL ============ */
export function FinalCta() {
  const copy = useCmsValue(fetchSiteCopy, DEFAULT_SITE_COPY);
  return (
    <section style={{ paddingTop: 0 }} aria-labelledby="h-cta">
      <div className="container">
        <Reveal className="cta-box">
          <h2 id="h-cta">{copy.cta_heading}</h2>
          <p>{copy.cta_description}</p>
          <a href="#contacto" className="btn btn-cta btn-lg" onPointerMove={trackGlow}>
            Hablemos de tu proyecto <span className="arrow" aria-hidden="true">→</span>
          </a>
          <p className="terminal-line" aria-hidden="true">$ git push origin main <span>✔ deploy listo</span></p>
        </Reveal>
      </div>
    </section>
  );
}
