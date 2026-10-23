import { useState } from 'react';
import { useInView } from '../hooks/useInView';

// ── Reemplaza estos valores con los reales ──────────────────────────
const WHATSAPP_1    = '5215611233722'; // Diana — código de país + número
const WHATSAPP_2    = '5218143835797'; // segundo número
const TELEGRAM_USER = 'DnCraftLoop';   // usuario de Telegram sin @
// ────────────────────────────────────────────────────────────────────

function buildMessage(name: string, email: string, subject: string, message: string) {
  return encodeURIComponent(
    `*Nuevo contacto desde Dn Craft & Loop*\n\n` +
    `*Nombre:* ${name}\n` +
    `*Email:* ${email}\n` +
    `*Asunto:* ${subject}\n\n` +
    `*Mensaje:*\n${message}`
  );
}

const WA_SVG = (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
);

export default function Contact() {
  const [fields,   setFields]   = useState({ name: '', email: '', subject: '', message: '' });
  const [error,    setError]    = useState(false);
  const [sentUrls, setSentUrls] = useState<{ wa1: string; wa2: string; telegram: string } | null>(null);
  const { ref: infoRef, inView: infoVisible } = useInView();
  const { ref: formRef, inView: formVisible } = useInView();

  const update = (k: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFields(f => ({ ...f, [k]: e.target.value }));
    setError(false);
  };

  const sendToAll = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (Object.values(fields).some(v => v.trim() === '')) { setError(true); return; }
    const msg = buildMessage(fields.name, fields.email, fields.subject, fields.message);
    const urls = {
      wa1:      `https://wa.me/${WHATSAPP_1}?text=${msg}`,
      wa2:      `https://wa.me/${WHATSAPP_2}?text=${msg}`,
      telegram: `https://t.me/${TELEGRAM_USER}?text=${msg}`,
    };
    // El primero siempre abre (gesto directo del usuario)
    window.open(urls.wa1, '_blank', 'noopener,noreferrer');
    // El segundo puede ser bloqueado por el navegador; se muestra como respaldo en pantalla de confirmación
    setTimeout(() => window.open(urls.wa2, '_blank', 'noopener,noreferrer'), 600);
    setSentUrls(urls);
  };

  return (
    <section id="contact" className="bg-primary py-24 px-6">
      <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-[72px] items-start">

        {/* Info — slide from left */}
        <div
          ref={infoRef as React.RefObject<HTMLDivElement>}
          className={`transition-all duration-700 ease-out ${infoVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}
        >
          <span className="section-label">Contacto</span>
          <h2 className="section-title">
            Hablemos de tu <span className="text-mint">proyecto</span>
          </h2>
          <p className="text-cream/55 text-[1.05rem] leading-[1.8] mt-4 mb-9">
            ¿Tienes una idea, un proyecto o simplemente quieres conocer más?
            Estamos disponibles para freelance y colaboraciones.
          </p>
          <div className="flex flex-col gap-3.5">
            {[
              { icon: '✉', label: 'diana.dom.mt@gmail.com', href: 'mailto:diana.dom.mt@gmail.com' },
              { icon: '⌥', label: 'GitHub', href: 'https://github.com/' },
              { icon: 'in', label: 'LinkedIn', href: 'https://linkedin.com/' },
            ].map((item, i) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 text-cream/55 text-[0.95rem] hover:text-mint transition-all duration-500
                  ${infoVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                style={{ transitionDelay: infoVisible ? `${200 + i * 80}ms` : '0ms' }}
              >
                <span className="w-9 h-9 rounded-lg bg-card border border-accent/15 flex items-center justify-center text-[0.85rem] font-bold shrink-0 transition-colors duration-300 hover:border-accent">
                  {item.icon}
                </span>
                {item.label}
              </a>
            ))}
          </div>
        </div>

        {/* Form — slide from right */}
        <div
          ref={formRef as React.RefObject<HTMLDivElement>}
          className={`bg-card border border-accent/15 rounded-2xl p-10 transition-all duration-700 ease-out
            ${formVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
        >
          {sentUrls ? (
            <div className="flex flex-col items-center gap-4 min-h-[280px] justify-center text-center">
              <span className="w-[60px] h-[60px] rounded-full bg-accent/10 border-2 border-accent flex items-center justify-center text-2xl text-mint animate-scale-in">
                ✓
              </span>
              <h3 className="text-[1.3rem] font-bold animate-fade-up [animation-delay:0.1s]">¡Listo!</h3>
              <p className="text-cream/55 text-[0.9rem] animate-fade-up [animation-delay:0.15s]">
                Se abrieron los chats automáticamente.<br />
                Si alguno no se abrió, usa estos enlaces:
              </p>
              <div className="flex flex-col gap-2 w-full animate-fade-up [animation-delay:0.25s]">
                <a href={sentUrls.wa1} target="_blank" rel="noopener noreferrer"
                  className="btn-primary justify-center gap-2 flex items-center text-sm">
                  {WA_SVG} WhatsApp — Diana
                </a>
                <a href={sentUrls.wa2} target="_blank" rel="noopener noreferrer"
                  className="btn-primary justify-center gap-2 flex items-center text-sm">
                  {WA_SVG} WhatsApp — Contacto 2
                </a>
                <a href={sentUrls.telegram} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm border border-[#229ED9]/40 text-[#229ED9] hover:bg-[#229ED9]/10 transition-colors duration-200">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                  Telegram
                </a>
              </div>
            </div>
          ) : (
            <form className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="text-[0.85rem] font-semibold text-cream/55">Nombre</label>
                  <input id="name" type="text" placeholder="Tu nombre" required className="input-field" value={fields.name} onChange={update('name')} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-[0.85rem] font-semibold text-cream/55">Email</label>
                  <input id="email" type="email" placeholder="tu@email.com" required className="input-field" value={fields.email} onChange={update('email')} />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="subject" className="text-[0.85rem] font-semibold text-cream/55">Asunto</label>
                <input id="subject" type="text" placeholder="¿De qué se trata?" required className="input-field" value={fields.subject} onChange={update('subject')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="message" className="text-[0.85rem] font-semibold text-cream/55">Mensaje</label>
                <textarea id="message" placeholder="Cuéntanos sobre tu proyecto..." rows={5} required className="input-field" value={fields.message} onChange={update('message')} />
              </div>

              {error && (
                <p className="text-red-400 text-[0.82rem]">Por favor completa todos los campos antes de enviar.</p>
              )}

              <button
                type="button"
                onClick={sendToAll}
                className="btn-primary justify-center gap-2 flex items-center"
              >
                {WA_SVG}
                Enviar mensaje →
              </button>
            </form>
          )}
        </div>

      </div>
    </section>
  );
}
