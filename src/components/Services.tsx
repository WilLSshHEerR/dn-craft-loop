import { useInView } from '../hooks/useInView';
import { services } from '../data/services';

export default function Services() {
  const { ref: headRef, inView: headVisible } = useInView();
  const { ref: gridRef, inView: gridVisible } = useInView();

  return (
    <section id="services" className="bg-primary py-24 px-6">
      <div className="max-w-[1100px] mx-auto">

        {/* Header */}
        <div
          ref={headRef as React.RefObject<HTMLDivElement>}
          className={`transition-all duration-700 ease-out ${headVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <span className="section-label">Servicios</span>
          <h2 className="section-title">
            ¿En qué podemos <span className="text-mint">ayudarte?</span>
          </h2>
          <p className="section-subtitle">
            Ofrecemos soluciones web a medida, desde el diseño hasta el despliegue.
          </p>
        </div>

        {/* Cards — staggered */}
        <div
          ref={gridRef as React.RefObject<HTMLDivElement>}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {services.map((s, i) => (
            <div
              key={s.title}
              className={`bg-card border border-accent/15 rounded-2xl p-9 flex flex-col gap-3
                transition-all duration-700 ease-out
                hover:border-accent hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(78,156,235,0.1)]
                ${gridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: gridVisible ? `${i * 120}ms` : '0ms' }}
            >
              <span className="text-[2.2rem] leading-none mb-1">{s.icon}</span>
              <h3 className="text-[1.15rem] font-bold text-cream">{s.title}</h3>
              <p className="text-cream/55 text-[0.95rem] leading-[1.7]">{s.description}</p>
              <ul className="flex flex-col gap-1.5 mt-2">
                {s.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[0.88rem] text-cream/55">
                    <span className="text-mint font-bold shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
