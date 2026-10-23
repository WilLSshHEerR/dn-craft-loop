import { useEffect, useRef } from 'react';

export default function ProgressBar() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      ref.current?.style.setProperty('transform', `scaleX(${max > 0 ? window.scrollY / max : 0})`);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return <div className="progress" aria-hidden="true"><span ref={ref} /></div>;
}

