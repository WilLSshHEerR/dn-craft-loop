import logo from '../assets/Logo Dn Craft & Loop.png';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-navy border-t border-accent/15 py-8 px-6">
      <div className="max-w-[1100px] mx-auto flex flex-wrap items-center justify-between gap-4">
        <a href="#hero" className="flex items-center shrink-0">
          <img src={logo} alt="Dn Craft & Loop" className="h-7 w-auto" />
        </a>
        <p className="text-cream/55 text-[0.85rem] text-center">
          © {year} Dn Craft & Loop · Desarrollado con React & TypeScript
        </p>
        <a href="#hero" className="text-[0.85rem] text-cream/55 hover:text-mint transition-colors duration-200">
          ↑ Volver arriba
        </a>
      </div>
    </footer>
  );
}
