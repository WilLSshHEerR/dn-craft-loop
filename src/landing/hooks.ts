import { useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Devuelve true (una sola vez) cuando el elemento entra en pantalla. */
export function useOnceInView<T extends Element>(threshold = 0.15) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return { ref, seen };
}

/** Actualiza --mx/--my para el brillo cian que sigue al cursor. */
export function trackGlow(e: PointerEvent<HTMLElement>) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty('--mx', `${e.clientX - r.left}px`);
  el.style.setProperty('--my', `${e.clientY - r.top}px`);
}

/** Brillo + inclinaciÃ³n 3D (solo ratÃ³n y sin movimiento reducido). */
export function trackTilt(e: PointerEvent<HTMLElement>) {
  trackGlow(e);
  if (e.pointerType !== 'mouse' || prefersReducedMotion()) return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const px = (e.clientX - r.left) / r.width - 0.5;
  const py = (e.clientY - r.top) / r.height - 0.5;
  el.style.setProperty('--ry', `${px * 14}deg`);
  el.style.setProperty('--rx', `${-py * 14}deg`);
}

export function resetTilt(e: PointerEvent<HTMLElement>) {
  e.currentTarget.style.setProperty('--rx', '0deg');
  e.currentTarget.style.setProperty('--ry', '0deg');
}

