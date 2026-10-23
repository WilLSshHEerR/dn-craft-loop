import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useInView } from '../hooks/useInView';
import { featuredProject as p } from '../data/featuredProject';
import { PhoneFrame, ScreenCitas, ScreenDashboard, ScreenTienda } from './PhoneScreens';

const SCREENS = [
  { id: 'tienda',    label: 'Tienda',    Component: ScreenTienda    },
  { id: 'citas',     label: 'Citas',     Component: ScreenCitas     },
  { id: 'dashboard', label: 'Dashboard', Component: ScreenDashboard },
] as const;

export default function Portfolio() {
  const { ref: cardRef, inView }        = useInView();
  const { ref: infoRef, inView: infoV } = useInView();

  const [current, setCurrent] = useState(0);
  const [fading,  setFading]  = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setCurrent((c) => (c + 1) % SCREENS.length);
        setFading(false);
      }, 350);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  const ActiveScreen = SCREENS[current].Component;

  return (
    <section id="portfolio" className="relative py-28 px-6 overflow-hidden">

      {/* Fondo */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy via-primary to-navy" />
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(78,156,235,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(78,156,235,0.07) 1px,transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />
      <div className="absolute top-1/4 -left-20 w-[480px] h-[480px] rounded-full bg-accent/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-[380px] h-[380px] rounded-full bg-mint/8 blur-[100px] pointer-events-none" />

      <div className="max-w-[1100px] mx-auto relative z-10">

        {/* Header */}
        <div
          ref={infoRef as React.RefObject<HTMLDivElement>}
          className={`mb-14 transition-all duration-700 ${infoV ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <span className="section-label">Portafolio</span>
          <h2 className="section-title">Nuestro trabajo, <span className="text-mint">en acción</span></h2>
          <p className="section-subtitle">Proyectos construidos con propósito, atención al detalle y tecnología de primer nivel.</p>
        </div>

        {/* Tarjeta principal */}
        <div
          ref={cardRef as React.RefObject<HTMLDivElement>}
          className={`transition-all duration-1000 ease-out ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}
        >
          <div className="p-[1px] rounded-3xl bg-gradient-to-br from-accent/50 via-mint/20 to-accent/5">
            <div className="bg-[#080e1a] rounded-3xl p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

              {/* ── Teléfono ──────────────────────────── */}
              <div className={`flex flex-col items-center gap-6 transition-all duration-1000 delay-200 ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>

                {/* Indicadores de pantalla */}
                <div className="flex gap-2">
                  {SCREENS.map((s, i) => (
                    <button
                      key={s.id}
                      onClick={() => { setFading(true); setTimeout(() => { setCurrent(i); setFading(false); }, 350); }}
                      className={`text-[10px] font-semibold px-3 py-1 rounded-full transition-all duration-300 ${i === current ? 'bg-accent text-white' : 'bg-white/5 text-white/30 hover:text-white/60'}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Teléfono con luz de fondo */}
                <div className="relative flex items-center justify-center">
                  <div
                    className="absolute inset-0 -z-10 pointer-events-none"
                    style={{
                      background: 'radial-gradient(ellipse 70% 80% at 50% 50%, rgba(78,156,235,0.22) 0%, rgba(202,229,188,0.08) 45%, transparent 75%)',
                      transform: 'scale(1.6)',
                      filter: 'blur(18px)',
                    }}
                  />
                  <PhoneFrame>
                    <div
                      className="h-full"
                      style={{ animation: fading ? 'screen-out 0.35s ease forwards' : 'screen-in 0.35s ease forwards' }}
                    >
                      <ActiveScreen />
                    </div>
                  </PhoneFrame>
                </div>
              </div>

              {/* ── Info del proyecto ──────────────────── */}
              <div className={`flex flex-col gap-5 transition-all duration-1000 delay-300 ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>

                <div className="flex items-center gap-3">
                  <span className="text-[0.7rem] font-bold tracking-[3px] uppercase text-accent/70">Proyecto</span>
                  <span className="text-[1.8rem] font-black text-white/8 leading-none">{p.number}</span>
                </div>

                <div>
                  <h3 className="text-[1.9rem] font-extrabold leading-tight tracking-tight mb-1">{p.name}</h3>
                  <p className="text-[#d4af37] text-[0.95rem] font-medium">{p.tagline}</p>
                </div>

                <p className="text-cream/55 text-[0.95rem] leading-[1.75]">{p.description}</p>

                <ul className="flex flex-col gap-2.5">
                  {p.features.map((f, i) => (
                    <li
                      key={f}
                      className={`flex items-center gap-3 text-[0.9rem] transition-all duration-500 ${inView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
                      style={{ transitionDelay: inView ? `${500 + i * 100}ms` : '0ms' }}
                    >
                      <span className="w-5 h-5 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] text-[0.65rem] font-bold shrink-0">✓</span>
                      <span className="text-cream/75">{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <span key={t} className="px-3 py-1 rounded-full text-[0.78rem] font-semibold bg-accent/10 text-accent border border-accent/25 hover:bg-accent/20 transition-colors duration-200">{t}</span>
                  ))}
                </div>

                <div className="flex gap-3 pt-1">
                  <Link to={p.liveUrl} className="btn-primary">Ver proyecto →</Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
