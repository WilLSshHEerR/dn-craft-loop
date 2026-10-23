import { useEffect, useState } from 'react';
import { useInView } from '../hooks/useInView';

const stack = [
  { name: 'HTML & CSS', level: 95 },
  { name: 'JavaScript', level: 88 },
  { name: 'TypeScript', level: 80 },
  { name: 'React', level: 85 },
  { name: 'Next.js', level: 75 },
  { name: 'Node.js', level: 70 },
];

const tools = ['Git & GitHub', 'Figma', 'VS Code', 'Vite', 'REST APIs', 'Responsive Design'];

export default function About() {
  const { ref: textRef, inView: textVisible } = useInView();
  const { ref: skillsRef, inView: skillsVisible } = useInView();

  // Contadores animados para los porcentajes (un loop RAF para todas las barras)
  const [counters, setCounters] = useState(stack.map(() => 0));

  useEffect(() => {
    if (!skillsVisible) return;

    const duration = 1200;
    const startTime = performance.now();

    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      // Ease-out cúbico para que desacelere al final
      const eased = 1 - Math.pow(1 - progress, 3);
      setCounters(stack.map((s) => Math.round(s.level * eased)));
      if (progress < 1) requestAnimationFrame(animate);
    };

    const raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [skillsVisible]);

  return (
    <section id="about" className="bg-navy py-24 px-6">
      <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-[72px] items-start">

        {/* Text — slide in from left */}
        <div
          ref={textRef as React.RefObject<HTMLDivElement>}
          className={`transition-all duration-700 ease-out ${textVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}
        >
          <span className="section-label">Sobre nosotros</span>
          <h2 className="section-title">
            Diseño y código que <span className="text-mint">hablan por sí solos</span>
          </h2>
          <p className="text-cream/55 text-[1.05rem] leading-[1.8] mb-4">
            Somos un equipo de desarrollo web full stack con pasión por construir
            interfaces limpias y funcionales. Nos especializamos en transformar
            ideas en experiencias digitales que se ven bien y funcionan aún mejor.
          </p>
          <p className="text-cream/55 text-[1.05rem] leading-[1.8] mb-6">
            Disponibles para proyectos freelance y colaboraciones.
            Si tienes una idea en mente, nos encantaría escucharte.
          </p>
          <div className="flex flex-wrap gap-2">
            {tools.map((t, i) => (
              <span
                key={t}
                className={`px-3.5 py-1.5 rounded-full text-[0.82rem] font-medium text-mint bg-mint/[0.08] border border-mint/25 transition-all duration-500 ${textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
                style={{ transitionDelay: textVisible ? `${300 + i * 60}ms` : '0ms' }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Skills — slide in from right */}
        <div
          ref={skillsRef as React.RefObject<HTMLDivElement>}
          className={`flex flex-col gap-5 transition-all duration-700 ease-out ${skillsVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
        >
          <h3 className="text-sm font-semibold text-cream/55 uppercase tracking-widest mb-2">
            Stack técnico
          </h3>
          {stack.map((s, i) => (
            <div
              key={s.name}
              className={`flex flex-col gap-1.5 transition-all duration-500 ${skillsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{ transitionDelay: skillsVisible ? `${i * 80}ms` : '0ms' }}
            >
              <div className="flex justify-between text-[0.92rem] font-medium">
                <span>{s.name}</span>
                {/* Número animado sincronizado con la barra */}
                <span className="text-cream/55 text-[0.85rem] tabular-nums w-9 text-right">
                  {counters[i]}%
                </span>
              </div>
              <div className="h-1.5 bg-primary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent to-mint transition-all duration-[1200ms] ease-out"
                  style={{
                    width: skillsVisible ? `${s.level}%` : '0%',
                    transitionDelay: skillsVisible ? `${i * 80}ms` : '0ms',
                  }}
                />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
