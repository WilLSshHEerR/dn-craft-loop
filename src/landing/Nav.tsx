import { useEffect, useState } from 'react';
import { trackGlow } from './hooks';
import logo from '../assets/Logo Dn Craft & Loop.png';

export function Logo({ label }: { label: string }) {
  return (
    <a href="#inicio" className="logo" aria-label={label}>
      <img src={logo} alt="" aria-hidden="true" />
    </a>
  );
}

const links = [
  { href: '#servicios', label: 'Servicios' },
  { href: '#proceso', label: 'Proceso' },
  { href: '#proyectos', label: 'Proyectos' },
  { href: '#contacto', label: 'Contacto' },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className="nav">
      <nav className="container nav-inner" aria-label="Principal">
        <Logo label="Dn Craft & Loop, inicio" />
        <button
          className="burger"
          aria-expanded={open}
          aria-controls="menu"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setOpen(o => !o)}
        >
          <span />
        </button>
        <div className={`menu ${open ? 'open' : ''}`} id="menu" onClick={e => (e.target as HTMLElement).closest('a') && setOpen(false)}>
          {links.map(l => <a key={l.href} href={l.href}>{l.label}</a>)}
          <a href="#contacto" className="btn btn-cta" onPointerMove={trackGlow}>
            Cotizar <span className="arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </nav>
    </header>
  );
}
