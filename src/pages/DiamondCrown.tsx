import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useInView } from '../hooks/useInView';
import './diamondCrown.css';
import ProgressBar from '../landing/ProgressBar';
import { Particles } from '../landing/Hero';
import { PhoneFrame, ScreenCitas, ScreenDashboard, ScreenTienda } from '../components/PhoneScreens';

/* ─── Iconos ─────────────────────────────────────────────── */

const IconBag = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);
const IconCalendar = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconChart = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);
const IconBox = ({ color }: { color: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="21 8 21 21 3 21 3 8"/>
    <rect x="1" y="3" width="22" height="5"/>
    <line x1="10" y1="12" x2="14" y2="12"/>
  </svg>
);

/* ─── Datos ──────────────────────────────────────────────── */

const GOLD       = '#d4af37';
const GOLD_LIGHT = '#f0cc50';

const STATS = [
  { end: 50,  suffix: '+', label: 'Productos en tienda'   },
  { end: 4,   suffix: '',  label: 'Artistas en el equipo' },
  { end: 100, suffix: '%', label: 'Personalizable'        },
];

const FEATURES = [
  {
    Icon: IconBag,
    color: GOLD,
    title: 'Tienda en línea',
    description: 'Catálogo completo de mercancía exclusiva con carrito, filtros por categoría y proceso de pago integrado.',
    bullets: ['Catálogo filtrado por categoría', 'Carrito y proceso de pago', 'Sincronizado con inventario admin'],
  },
  {
    Icon: IconCalendar,
    color: '#4e9ceb',
    title: 'Sistema de citas',
    description: 'Agendamiento personalizado donde el cliente elige artista, servicio, fecha y añade descripciones o referencias.',
    bullets: ['Selección de artista y servicio', 'Disponibilidad en tiempo real', 'Notas y preferencias del cliente'],
  },
  {
    Icon: IconChart,
    color: '#a78bfa',
    title: 'Dashboard admin',
    description: 'Centro de control con métricas del negocio, citas del día y gestión de contenido centralizada.',
    bullets: ['Métricas y KPIs en tiempo real', 'Gestión de citas y personal', 'Control de banners y contenido'],
  },
  {
    Icon: IconBox,
    color: '#34d399',
    title: 'Gestión de inventario',
    description: 'Control de stock en tiempo real para productos y equipo, con reportes para mantener todo al día.',
    bullets: ['Control de stock en tiempo real', 'Gestión del equipo de trabajo', 'Reportes y alertas automáticas'],
  },
];

const TABS = [
  {
    id: 'tienda', label: 'Tienda', Screen: ScreenTienda,
    title: 'Tienda en línea',
    description: 'Experiencia de compra completa para la comunidad de Diamond Crown. Los usuarios navegan por mercancía exclusiva filtrada por categoría y completan su compra en segundos.',
    features: ['Catálogo con categorías (Tatuajes, Piercings, Barbería)', 'Carrito y proceso de pago integrado', 'Inventario sincronizado con el dashboard admin'],
  },
  {
    id: 'citas', label: 'Citas', Screen: ScreenCitas,
    title: 'Sistema de Citas',
    description: 'Agendamiento que pone al cliente en control. Elige artista, servicio y horario, y añade descripciones o referencias para que el equipo llegue preparado.',
    features: ['Selección de artista y tipo de servicio', 'Calendario interactivo con disponibilidad real', 'Campo de descripción y referencias del cliente'],
  },
  {
    id: 'dashboard', label: 'Dashboard', Screen: ScreenDashboard,
    title: 'Panel Administrativo',
    description: 'Centro de comando para el equipo de Diamond Crown. Métricas del negocio, gestión de citas y control total desde un solo lugar.',
    features: ['Métricas clave: citas, ventas, clientes activos', 'Gestión de citas, personal y banners', 'Control de productos, inventario y reportes'],
  },
];

const TECH = [
  { name: 'React',        color: '#61dafb', bg: 'rgba(97,218,251,0.08)'  },
  { name: 'TypeScript',   color: '#3178c6', bg: 'rgba(49,120,198,0.1)'   },
  { name: 'Node.js',      color: '#68a063', bg: 'rgba(104,160,99,0.1)'   },
  { name: 'Express',      color: '#9ca3af', bg: 'rgba(156,163,175,0.08)' },
  { name: 'MongoDB',      color: '#47a248', bg: 'rgba(71,162,72,0.1)'    },
  { name: 'Tailwind CSS', color: '#38bdf8', bg: 'rgba(56,189,248,0.08)'  },
];

const HERO_SCREENS = [ScreenTienda, ScreenCitas, ScreenDashboard];

/* ─── Componente ─────────────────────────────────────────── */

export default function DiamondCrown() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  /* Detect mobile to simplify animations and avoid scroll distortion */
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  /* Hero phone rotation */
  const [current, setCurrent] = useState(0);
  const [fading,  setFading]  = useState(false);
  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => { setCurrent(c => (c + 1) % 3); setFading(false); }, 350);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  /* Stats counter */
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [counters, setCounters] = useState([0, 0, 0]);
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStatsVisible(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!statsVisible) return;
    const targets = STATS.map(s => s.end);
    const duration = 1400;
    const start = performance.now();
    let rafId: number;
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      setCounters(targets.map(t => Math.round(t * eased)));
      if (progress < 1) rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [statsVisible]);

  /* Feature card hover */
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  /* Showcase tab */
  const [activeTab, setActiveTab] = useState(0);
  const [tabFading, setTabFading] = useState(false);
  const switchTab = (i: number) => {
    if (i === activeTab) return;
    setTabFading(true);
    setTimeout(() => { setActiveTab(i); setTabFading(false); }, 300);
  };

  /* InView refs */
  const { ref: featuresRef, inView: featuresInView } = useInView();
  const { ref: showcaseRef, inView: showcaseInView } = useInView();
  const { ref: techRef,     inView: techInView     } = useInView();
  const { ref: ctaRef,      inView: ctaInView      } = useInView();

  const ActiveHeroScreen = HERO_SCREENS[current];
  const tab              = TABS[activeTab];
  const ActiveTabScreen  = tab.Screen;

  /* Helpers — on mobile only opacity (no translateY to avoid scroll distortion) */
  const reveal = (visible: boolean, delay = 0): React.CSSProperties => isMobile
    ? { opacity: visible ? 1 : 0, transition: `opacity 0.5s ease ${Math.min(delay, 100)}ms` }
    : {
        opacity:    visible ? 1 : 0,
        transform:  visible ? 'translateY(0)' : 'translateY(18px)',
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      };

  const slideLeft = (visible: boolean, delay = 0): React.CSSProperties => isMobile
    ? { opacity: visible ? 1 : 0, transition: `opacity 0.5s ease ${Math.min(delay, 100)}ms` }
    : {
        opacity:    visible ? 1 : 0,
        transform:  visible ? 'translateX(0)' : 'translateX(-28px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      };

  const slideRight = (visible: boolean, delay = 0): React.CSSProperties => isMobile
    ? { opacity: visible ? 1 : 0, transition: `opacity 0.5s ease ${Math.min(delay, 100)}ms` }
    : {
        opacity:    visible ? 1 : 0,
        transform:  visible ? 'translateX(0)' : 'translateX(28px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      };

  return (
    <div className="dc" style={{ background: '#070709', minHeight: '100vh', color: '#e1edd4', overflowX: 'hidden' }}>
      <ProgressBar />

      {/* ── Nav ──────────────────────────────────────────── */}
      <nav className="dc-nav" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        padding: '0.65rem 1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(7,7,9,0.92)', backdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <Link
          to="/"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 500, color: 'rgba(225,237,212,0.45)', textDecoration: 'none', transition: 'color 0.2s' }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#e1edd4')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(225,237,212,0.45)')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Volver
        </Link>
        <a href="/" className="dc-logo" aria-label="Dn Craft & Loop"><span className="dc-logo-mark" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 7l-5 5 5 5M15 7l5 5-5 5"/></svg></span><span>Dn Craft <b>&amp;</b> Loop</span></a>
        <a href="/#contact" className="btn btn-gold btn-sm">Contrátanos <span className="arrow" aria-hidden="true">→</span></a>
      </nav>

      {/* ── Hero ─────────────────────────────────────────── */}
      <div style={{ minHeight: '100vh', paddingTop: '5.5rem', paddingBottom: '3rem', paddingLeft: '1.5rem', paddingRight: '1.5rem', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, background: '#070709' }} />
        <div style={{ position: 'absolute', top: '-5%', right: '8%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 65%)', filter: 'blur(55px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '5%', left: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(78,156,235,0.08) 0%, transparent 65%)', filter: 'blur(55px)', pointerEvents: 'none' }} />
        <div className="dc-grid" />
        <Particles rgb="212,175,55" />

        <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: isMobile ? '2rem' : '4rem', alignItems: 'center', position: 'relative', zIndex: 10 }}>

          {/* Texto */}
          <div style={{ animation: 'fade-up 0.8s ease both' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(212,175,55,0.65)' }}>{'<Proyecto />'}</span>
              <span style={{ fontSize: '2rem', fontWeight: 900, color: 'rgba(255,255,255,0.04)', lineHeight: 1 }}>01</span>
            </div>
            <h1 style={{
              fontSize: 'clamp(2.8rem, 6vw, 4.5rem)', fontWeight: 900, lineHeight: 1.05,
              letterSpacing: '-0.025em', marginBottom: '0.875rem',
              background: `linear-gradient(90deg, #c9a227 0%, ${GOLD_LIGHT} 30%, ${GOLD} 55%, ${GOLD_LIGHT} 75%, #c9a227 100%)`,
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              animation: 'shimmer 4s linear infinite',
            }}>
              Diamond Crown
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'rgba(225,237,212,0.55)', lineHeight: 1.7, marginBottom: '1.75rem', maxWidth: 440 }}>
              Plataforma web completa para tatuajes, piercings y barbería — construida para escalar, diseñada para impresionar.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
              {['React', 'TypeScript', 'Node.js', 'MongoDB'].map(t => (
                <span key={t} style={{ padding: '0.35rem 0.85rem', borderRadius: 999, fontSize: '0.78rem', fontWeight: 600, background: 'rgba(212,175,55,0.1)', color: GOLD, border: '1px solid rgba(212,175,55,0.25)' }}>{t}</span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <a href="#showcase" className="btn btn-gold">
                Explorar la app <span className="arrow" aria-hidden="true">→</span>
              </a>
              <Link to="/" className="btn btn-ghost">
                <span className="arrow" aria-hidden="true" style={{ transform: 'scaleX(-1)' }}>→</span> Portafolio
              </Link>
            </div>
            <p className="terminal-line" aria-hidden="true">$ npm run build <span className="ok">✔ deploy listo</span><span className="caret" /></p>
          </div>

          {/* Teléfono */}
          <div style={{ display: 'flex', justifyContent: 'center', animation: 'scale-in 0.9s ease 0.3s both' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {!isMobile && <div style={{ position: 'absolute', width: 390, height: 390, borderRadius: '50%', border: '1px solid rgba(212,175,55,0.07)', pointerEvents: 'none' }} />}
              {!isMobile && <div style={{ position: 'absolute', width: 290, height: 290, borderRadius: '50%', border: '1px solid rgba(212,175,55,0.05)', pointerEvents: 'none' }} />}
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 85% 95% at 50% 50%, rgba(212,175,55,0.22) 0%, rgba(78,156,235,0.1) 50%, transparent 80%)', filter: 'blur(28px)', transform: 'scale(1.8)', pointerEvents: 'none', zIndex: 0 }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <PhoneFrame>
                  <div style={{ height: '100%', animation: fading ? 'screen-out 0.35s ease forwards' : 'screen-in 0.35s ease forwards' }}>
                    <ActiveHeroScreen />
                  </div>
                </PhoneFrame>
              </div>
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: '1.75rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', color: 'rgba(225,237,212,0.2)', animation: 'fade-in 1s ease 1.5s both' }}>
          <span style={{ fontSize: '0.6rem', letterSpacing: '2px', textTransform: 'uppercase' }}>Scroll</span>
          <div style={{ width: 1, height: 36, background: 'linear-gradient(to bottom, rgba(212,175,55,0.5), transparent)' }} />
        </div>
      </div>

      {/* ── Stats ────────────────────────────────────────── */}
      <div ref={statsRef} style={{ padding: '2.5rem 1.5rem', borderTop: '1px solid rgba(212,175,55,0.1)', borderBottom: '1px solid rgba(212,175,55,0.1)', background: 'rgba(212,175,55,0.018)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              style={{ textAlign: 'center', ...reveal(statsVisible, i * 150) }}
            >
              <div style={{ fontSize: '2.8rem', fontWeight: 900, color: GOLD, lineHeight: 1, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                {counters[i]}{stat.suffix}
              </div>
              <p style={{ color: 'rgba(225,237,212,0.4)', fontSize: '0.82rem', marginTop: '0.35rem' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ─────────────────────────────────────── */}
      <div ref={featuresRef as React.RefObject<HTMLDivElement>} style={{ padding: '4.5rem 1.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: '2.5rem', ...reveal(featuresInView) }}>
            <span className="section-label">Funcionalidades</span>
            <h2 className="section-title">Todo lo que necesita un <span style={{ color: GOLD }}>negocio completo</span></h2>
            <p className="section-subtitle">Cuatro módulos integrados para cubrir cada aspecto del negocio, desde la venta hasta la gestión del equipo.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.1rem' }}>
            {FEATURES.map((feat, i) => (
              <div
                key={feat.title}
                className="dc-card"
                onPointerMove={e => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`); e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`); }}
                style={{
                  position: 'relative', borderRadius: 16, padding: '1.6rem',
                  border: `1px solid ${hoveredCard === i ? `${feat.color}35` : 'rgba(255,255,255,0.07)'}`,
                  background: hoveredCard === i ? `${feat.color}07` : 'rgba(255,255,255,0.025)',
                  cursor: 'default',
                  ...reveal(featuresInView, i * 120),
                  ...(featuresInView && hoveredCard === i ? { transform: 'translateY(-4px)' } : {}),
                }}
                onMouseEnter={() => setHoveredCard(i)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div style={{ position: 'absolute', top: 0, left: '1.5rem', right: '1.5rem', height: 1, background: `linear-gradient(to right, transparent, ${feat.color}55, transparent)`, opacity: hoveredCard === i ? 1 : 0, transition: 'opacity 0.3s' }} />
                <div style={{ width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.875rem', background: `${feat.color}15`, border: `1px solid ${feat.color}30` }}>
                  <feat.Icon color={feat.color} />
                </div>
                <h3 style={{ fontSize: '1.02rem', fontWeight: 700, marginBottom: '0.4rem', color: '#e1edd4' }}>{feat.title}</h3>
                <p style={{ fontSize: '0.86rem', color: 'rgba(225,237,212,0.5)', lineHeight: 1.6, marginBottom: '0.875rem' }}>{feat.description}</p>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {feat.bullets.map((b, bi) => (
                    <li
                      key={b}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.8rem', color: 'rgba(225,237,212,0.6)',
                        ...reveal(featuresInView, i * 120 + 200 + bi * 80),
                      }}
                    >
                      <span style={{ width: 15, height: 15, borderRadius: '50%', background: `${feat.color}18`, border: `1px solid ${feat.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.55rem', color: feat.color, fontWeight: 700 }}>✓</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── App Showcase ─────────────────────────────────── */}
      <div id="showcase" ref={showcaseRef as React.RefObject<HTMLDivElement>} style={{ padding: '4.5rem 1.5rem', background: 'linear-gradient(to bottom, #0c0c14, #070709)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem', ...reveal(showcaseInView) }}>
            <span className="section-label">La app en acción</span>
            <h2 className="section-title">Tres módulos, <span style={{ color: GOLD }}>una experiencia</span></h2>
            <p className="section-subtitle">Explora cada pantalla y descubre cómo todo encaja en Diamond Crown.</p>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            {TABS.map((t, i) => (
              <button
                key={t.id}
                onClick={() => switchTab(i)}
                style={{
                  padding: '0.45rem 1.25rem', borderRadius: 999, fontSize: '0.85rem', fontWeight: 600,
                  border: 'none', cursor: 'pointer',
                  background: i === activeTab ? GOLD : 'rgba(255,255,255,0.06)',
                  color: i === activeTab ? '#000' : 'rgba(225,237,212,0.4)',
                  /* opacity reveal independent of transform (avoids override conflict) */
                  opacity: showcaseInView ? 1 : 0,
                  transform: !showcaseInView && !isMobile ? `translateY(18px)` : i === activeTab ? 'scale(1.04)' : 'scale(1)',
                  transition: `opacity 0.5s ease ${150 + i * 90}ms, transform 0.2s ease, background 0.25s`,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: isMobile ? '1.75rem' : '2.5rem', alignItems: 'center' }}>
            {/* Teléfono — entra desde la izquierda */}
            <div style={{ display: 'flex', justifyContent: 'center', ...slideLeft(showcaseInView, 250) }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 85% at 50% 50%, rgba(212,175,55,0.17) 0%, rgba(78,156,235,0.07) 55%, transparent 80%)', filter: 'blur(24px)', transform: 'scale(1.6)', pointerEvents: 'none', zIndex: 0 }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <PhoneFrame>
                    <div style={{ height: '100%', animation: tabFading ? 'screen-out 0.3s ease forwards' : 'screen-in 0.3s ease forwards' }}>
                      <ActiveTabScreen />
                    </div>
                  </PhoneFrame>
                </div>
              </div>
            </div>

            {/* Descripción — entra desde la derecha */}
            <div style={{ transition: 'opacity 0.3s', opacity: tabFading ? 0 : 1 }}>
              <div style={slideRight(showcaseInView, 300)}>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.75rem', color: GOLD }}>{tab.title}</h3>
                <p style={{ fontSize: '0.95rem', color: 'rgba(225,237,212,0.55)', lineHeight: 1.75, marginBottom: '1.25rem' }}>{tab.description}</p>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                  {tab.features.map((f, fi) => (
                    <li
                      key={f}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.9rem', color: 'rgba(225,237,212,0.7)',
                        ...reveal(showcaseInView, 400 + fi * 100),
                      }}
                    >
                      <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, fontSize: '0.6rem', color: GOLD, fontWeight: 700 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tech Stack ────────────────────────────────────── */}
      <div ref={techRef as React.RefObject<HTMLDivElement>} style={{ padding: '3.5rem 1.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem', ...reveal(techInView) }}>
            <span className="section-label">Stack tecnológico</span>
            <h2 className="section-title">Construido con las <span style={{ color: GOLD }}>mejores herramientas</span></h2>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem' }}>
            {TECH.map((t, i) => (
              <span
                key={t.name}
                style={{
                  padding: '0.6rem 1.4rem', borderRadius: 999, fontSize: '0.88rem', fontWeight: 600,
                  background: t.bg, color: t.color, border: `1px solid ${t.color}45`,
                  cursor: 'default',
                  ...reveal(techInView, i * 80),
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = 'translateY(0)')}
              >
                {t.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ──────────────────────────────────────────── */}
      <div ref={ctaRef as React.RefObject<HTMLDivElement>} style={{ padding: '4.5rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 55% 55% at 50% 50%, rgba(212,175,55,0.06) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <div className="dc-cta" style={{ maxWidth: 820, margin: '0 auto', padding: '3.5rem 1.5rem', textAlign: 'center', position: 'relative', zIndex: 10, ...reveal(ctaInView) }}>
          <span className="section-label">¿Empezamos?</span>
          <h2 className="section-title">¿Tienes un proyecto <span style={{ color: GOLD }}>como este?</span></h2>
          <p style={{ color: 'rgba(225,237,212,0.5)', fontSize: '1.02rem', lineHeight: 1.7, margin: '0 auto 2rem', maxWidth: 480 }}>
            Construimos aplicaciones a medida que combinan diseño profesional, tecnología sólida y resultados reales para tu negocio.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/#contact" className="btn btn-gold">Hablemos del proyecto <span className="arrow" aria-hidden="true">→</span></a>
            <Link to="/" className="btn btn-ghost">Ver más proyectos <span className="arrow" aria-hidden="true">→</span></Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ padding: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center', color: 'rgba(225,237,212,0.25)', fontSize: '0.8rem' }}>
        © {new Date().getFullYear()} Dn Craft &amp; Loop — Diamond Crown
      </footer>
    </div>
  );
}
