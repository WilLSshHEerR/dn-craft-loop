import { useEffect, useState } from 'react';
import logo from '../assets/Logo Dn Craft & Loop.png';

const links = [
  { label: 'Inicio', href: '#hero' },
  { label: 'Portafolio', href: '#portfolio' },
  { label: 'Servicios', href: '#services' },
    { label: 'Sobre nosotros', href: '#about' },
  { label: 'Contacto', href: '#contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 px-6 transition-all duration-300 ${
      scrolled ? 'py-2 bg-primary/90 backdrop-blur-md border-b border-accent/15' : 'py-3'
    }`}>
      <div className="max-w-[1100px] mx-auto flex items-center justify-between">

        <a href="#hero" className="flex items-center shrink-0">
          <img src={logo} alt="Dn Craft & Loop" className="h-[90px] w-auto" />
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="px-3.5 py-2 rounded-md text-sm text-cream/55 hover:text-cream transition-colors duration-200"
            >
              {l.label}
            </a>
          ))}
          <a href="#contact" className="btn-primary-sm ml-2">
            Contrátanos
          </a>
        </nav>

        {/* Burger */}
        <button
          className="flex md:hidden flex-col gap-[5px] bg-transparent border-0 p-1 cursor-pointer z-[101]"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menú"
        >
          <span className={`block w-6 h-0.5 bg-cream rounded-sm transition-all duration-300 origin-center ${menuOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
          <span className={`block w-6 h-0.5 bg-cream rounded-sm transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-cream rounded-sm transition-all duration-300 origin-center ${menuOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
        </button>

        {/* Mobile menu overlay */}
        {menuOpen && (
          <nav
            className="fixed top-0 left-0 w-full z-[100] flex flex-col items-center justify-center gap-4"
            style={{ background: '#0e0d15', height: '100dvh' }}
          >
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-xl px-6 py-3 text-cream hover:text-mint transition-colors duration-200"
                onClick={closeMenu}
              >
                {l.label}
              </a>
            ))}
            <a href="#contact" className="btn-primary mt-2" onClick={closeMenu}>
              Contrátanos
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
