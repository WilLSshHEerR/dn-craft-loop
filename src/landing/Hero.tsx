import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion, trackGlow } from './hooks';
import { Reveal } from './Reveal';
import { DEFAULT_SITE_COPY, fetchSiteCopy, useCmsValue } from '../lib/cms';

/* ---------- Snippet del editor: [clase de color, texto] ---------- */
type Tok = [cls: string, text: string];
const snippet: Tok[][] = [
  [['c', '// craft.config.js']],
  [['k', 'const'], ['', ' proyecto = {']],
  [['', '  cliente: '], ['s', '"tu marca"'], ['', ',']],
  [['', '  stack: ['], ['s', '"React"'], ['', ', '], ['s', '"Laravel"'], ['', '],']],
  [['', '  rendimiento: '], ['s', '"100/100"'], ['', ',']],
  [['', '};']],
  [],
  [['k', 'async function'], ['', ' '], ['f', 'loop'], ['', '(idea) {']],
  [['', '  '], ['k', 'while'], ['', ' ('], ['k', 'true'], ['', ') {']],
  [['', '    '], ['k', 'await'], ['', ' '], ['f', 'build'], ['', '(idea);']],
  [['', '    '], ['k', 'await'], ['', ' '], ['f', 'deploy'], ['', '(); '], ['c', '// ✔']],
  [['', '  }']],
  [['', '}']],
];
const TOTAL = snippet.reduce((n, l) => n + l.reduce((m, t) => m + t[1].length, 0) + 1, 0) - 1;

function CodeEditor() {
  const [count, setCount] = useState(() => (prefersReducedMotion() ? TOTAL : 0));

  useEffect(() => {
    if (count >= TOTAL) return;
    const id = setTimeout(() => setCount(c => c + 1), count === 0 ? 700 : 28 + Math.random() * 30);
    return () => clearTimeout(id);
  }, [count]);

  let left = count;
  const nodes: React.ReactNode[] = [];
  snippet.forEach((line, li) => {
    if (left <= 0) return;
    line.forEach((tok, ti) => {
      if (left <= 0) return;
      const text = tok[1].slice(0, left);
      left -= text.length;
      nodes.push(<span key={`${li}-${ti}`} className={tok[0]}>{text}</span>);
    });
    if (left > 0 && li < snippet.length - 1) {
      nodes.push('\n');
      left -= 1;
    }
  });

  return (
    <Reveal className="editor" delay={200} role="img" aria-label="Editor de código que escribe una función de ejemplo en JavaScript">
      <div className="editor-bar" aria-hidden="true">
        <span className="dot" /><span className="dot" /><span className="dot" />
        <span className="file">craft.config.js</span>
      </div>
      <div className="code" aria-hidden="true">
        <div className="ln">{snippet.map((_, i) => i + 1).join('\n')}</div>
        <div className="src">{nodes}<span className="caret" /></div>
      </div>
    </Reveal>
  );
}

/* ---------- Fondo: partículas conectadas ---------- */
export function Particles({ rgb = '0,212,255' }: { rgb?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext('2d');
    if (!cv || !ctx || prefersReducedMotion()) return;

    type P = { x: number; y: number; vx: number; vy: number };
    let w = 0, h = 0, pts: P[] = [], running = true, raf = 0;

    const resize = () => {
      const r = cv.parentElement!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(70, Math.floor((w * h) / 18000));
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      }));
    };

    const frame = () => {
      if (running) {
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = `rgba(${rgb},.6)`;
        for (const p of pts) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
          ctx.fillRect(p.x, p.y, 2, 2);
        }
        for (let i = 0; i < pts.length; i++) {
          for (let j = i + 1; j < pts.length; j++) {
            const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = dx * dx + dy * dy;
            if (d < 14400) {
              ctx.strokeStyle = `rgba(${rgb},${0.16 * (1 - d / 14400)})`;
              ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
            }
          }
        }
      }
      raf = requestAnimationFrame(frame);
    };

    // Pausa el dibujo cuando el hero no es visible
    const io = new IntersectionObserver(([e]) => { running = e.isIntersecting; });
    io.observe(cv);
    window.addEventListener('resize', resize);
    resize();
    frame();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, [rgb]);

  return <canvas id="bg" ref={ref} aria-hidden="true" />;
}

export default function Hero() {
  const copy = useCmsValue(fetchSiteCopy, DEFAULT_SITE_COPY);
  return (
    <section className="hero" id="inicio" aria-labelledby="h-hero">
      <Particles />
      <div className="container hero-grid">
        <div>
          <Reveal as="span" className="tag">{copy.hero_tag}</Reveal>
          <Reveal as="h1" id="h-hero" delay={80}>
            {copy.hero_title} <em>{copy.hero_emphasis}</em>
          </Reveal>
          <Reveal as="p" className="lead" delay={160}>
            {copy.hero_description}
          </Reveal>
          <Reveal className="cta-row" delay={240}>
            <a href="#contacto" className="btn btn-cta" onPointerMove={trackGlow}>
              Inicia tu proyecto <span className="arrow" aria-hidden="true">→</span>
            </a>
            <a href="#proyectos" className="btn btn-ghost" onPointerMove={trackGlow}>
              Ver trabajos <span className="arrow" aria-hidden="true">→</span>
            </a>
          </Reveal>
          <Reveal as="p" className="terminal-line" delay={320}>
            <span aria-hidden="true">$ npm run build</span> <span className="ok" aria-hidden="true">✔ deploy listo</span>
            <span className="sr-only">Compilación y despliegue listos</span>
          </Reveal>
        </div>
        <CodeEditor />
      </div>
    </section>
  );
}
