import { useEffect, useRef, useState } from 'react';
import logo from '../assets/Logo Dn Craft & Loop.png';
import { useTypewriter } from '../hooks/useTypewriter';

const PART1 = 'Desarrollo digital ';
const PART2 = 'a tu medida';
const FULL_LEN = PART1.length + PART2.length;

const techBadges = ['React', 'TypeScript', 'Next.js', 'Node.js', 'CSS', 'Git'];

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const hasLeft = useRef(false);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) {
        hasLeft.current = true;
      } else if (hasLeft.current) {
        hasLeft.current = false;
        setAnimKey((k) => k + 1);
      }
    }, { threshold: 0.4 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { count, done } = useTypewriter(FULL_LEN, 100, 300, animKey);

  const shown1 = PART1.slice(0, Math.min(count, PART1.length));
  const shown2 = count > PART1.length ? PART2.slice(0, count - PART1.length) : '';

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative min-h-svh flex flex-col items-center justify-center pt-[120px] pb-20 px-6 overflow-hidden"
    >
      {/* Background glow */}
      <div
        className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(78,156,235,0.18) 0%, transparent 70%)' }}
      />

      <div key={animKey} className="max-w-[1100px] mx-auto w-full grid grid-cols-1 md:grid-cols-2 items-start gap-16">

        {/* Content */}
        <div className="flex flex-col md:items-start items-center text-center md:text-left pt-8">

          {/* Altura fija reservada para el título — evita que el logo se mueva */}
          <div className="min-h-[9rem] md:min-h-[8.5rem] flex items-start w-full mb-3">
            <h1 className="text-[clamp(2.8rem,6vw,4.2rem)] font-extrabold tracking-tight leading-[1.05] animate-fade-in [animation-delay:0.1s]">
              {shown1}
              {shown2 && <span className="text-mint">{shown2}</span>}
              {!done && (
                <span className="animate-blink text-accent ml-0.5 font-light">|</span>
              )}
            </h1>
          </div>

          {/* Párrafo aparece desde el inicio */}
          <p className="text-[1.05rem] text-cream/55 leading-[1.75] max-w-[480px] mb-9 animate-fade-in [animation-delay:0.4s]">
            En <strong className="text-cream font-semibold">Dn Craft & Loop</strong> desarrollamos
            páginas web, aplicaciones móviles y soluciones digitales adaptadas a cada proyecto.
            Desde el diseño hasta el despliegue, nos encargamos de cada detalle
            con criterio técnico y visual.
          </p>

          <div className="flex gap-3.5 flex-wrap mb-10 justify-center md:justify-start animate-fade-in [animation-delay:0.6s]">
            <a href="#services" className="btn-primary">Ver servicios</a>
            <a href="#contact" className="btn-outline">Contáctanos</a>
          </div>

          <div className="flex flex-wrap gap-2 justify-center md:justify-start animate-fade-in [animation-delay:0.8s]">
            {techBadges.map((tech) => (
              <span
                key={tech}
                className="inline-block px-3.5 py-[5px] rounded-full text-xs font-medium text-cream/55 bg-card border border-accent/15 hover:border-mint hover:text-mint transition-colors duration-300"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Logo — columna de altura fija para que no se desplace */}
        <div className="relative flex items-center justify-center h-[420px]">

          <div
            className="absolute w-[240px] h-[240px] rounded-full blur-3xl z-[1]"
            style={{ animation: 'ring-pulse 3s ease-in-out infinite', background: 'radial-gradient(circle, rgba(78,156,235,0.15), rgba(202,229,188,0.06), transparent)' }}
          />

          <img
            src={logo}
            alt="Dn Craft & Loop"
            className="w-[260px] h-auto object-contain relative z-[2]"
            style={{ animation: 'logo-aura 3s ease-in-out infinite, fade-in 0.6s ease 0.2s both' }}
          />

          <div
            className="absolute w-[300px] h-[300px] rounded-full border-2 border-mint/30 z-[3]"
            style={{ animation: 'spin-cw 18s linear infinite, ring-pulse 3s ease-in-out infinite' }}
          />
          <div
            className="absolute w-[400px] h-[400px] rounded-full border border-accent/20 z-[3]"
            style={{ animation: 'spin-ccw 28s linear infinite, ring-pulse 3s ease-in-out 1.5s infinite' }}
          />
        </div>
      </div>

      <a
        href="#about"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center animate-fade-in [animation-delay:1s]"
        aria-label="Scroll hacia abajo"
      >
        <span
          className="block w-5 h-5 border-r-2 border-b-2 border-cream/40 rotate-45"
          style={{ animation: 'bounce-arrow 1.8s ease infinite' }}
        />
      </a>
    </section>
  );
}
