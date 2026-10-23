import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { trackGlow } from './hooks';
import { Reveal } from './Reveal';
import { Logo } from './Nav';

// Mismos canales de contacto que el resto del sitio
const WHATSAPP = '5215611233722';
const TELEGRAM_USER = 'DnCraftLoop';

type Fields = { nombre: string; correo: string; mensaje: string };
const rules: Record<keyof Fields, (v: string) => boolean> = {
  nombre: v => v.trim().length >= 2,
  correo: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
  mensaje: v => v.trim().length >= 10,
};
const errors: Record<keyof Fields, string> = {
  nombre: 'Escribe tu nombre (mínimo 2 caracteres).',
  correo: 'Ingresa un correo válido.',
  mensaje: 'El mensaje debe tener al menos 10 caracteres.',
};
const fieldMeta: { name: keyof Fields; label: string; placeholder: string; type?: string; autoComplete?: string }[] = [
  { name: 'nombre', label: 'const nombre =', placeholder: 'Tu nombre', type: 'text', autoComplete: 'name' },
  { name: 'correo', label: 'const correo =', placeholder: 'tucorreo@empresa.com', type: 'email', autoComplete: 'email' },
  { name: 'mensaje', label: 'const mensaje =', placeholder: 'Cuéntanos sobre tu proyecto' },
];

export function Contact() {
  const [values, setValues] = useState<Fields>({ nombre: '', correo: '', mensaje: '' });
  const [invalid, setInvalid] = useState<Partial<Record<keyof Fields, boolean>>>({});
  const [status, setStatus] = useState('');
  const [telegramUrl, setTelegramUrl] = useState('');

  const validate = (name: keyof Fields, value = values[name]) => {
    const ok = rules[name](value);
    setInvalid(i => ({ ...i, [name]: !ok }));
    return ok;
  };

  const onChange = (name: keyof Fields) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues(v => ({ ...v, [name]: e.target.value }));
    if (invalid[name]) validate(name, e.target.value);
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const names = Object.keys(rules) as (keyof Fields)[];
    const bad = names.filter(n => !validate(n));
    if (bad.length) {
      setStatus('✖ Revisa los campos marcados.');
      e.currentTarget.querySelector<HTMLElement>(`[name="${bad[0]}"]`)?.focus();
      return;
    }
    const text = encodeURIComponent(
      `*Nuevo contacto desde Dn Craft & Loop*\n\n*Nombre:* ${values.nombre}\n*Correo:* ${values.correo}\n\n*Mensaje:*\n${values.mensaje}`,
    );
    window.open(`https://wa.me/${WHATSAPP}?text=${text}`, '_blank', 'noopener,noreferrer');
    setTelegramUrl(`https://t.me/${TELEGRAM_USER}?text=${text}`);
    setStatus('$ enviando… ✔ se abrió WhatsApp con tu mensaje. Gracias por escribirnos.');
    setValues({ nombre: '', correo: '', mensaje: '' });
    setInvalid({});
  };

  return (
    <section id="contacto" aria-labelledby="h-cont">
      <div className="container contact-grid">
        <div>
          <Reveal as="span" className="tag">{'{ contacto }'}</Reveal>
          <Reveal as="h2" id="h-cont">Empecemos a construir</Reveal>
          <Reveal as="p" className="lead">Escríbenos con los detalles de tu proyecto: alcance, plazos y presupuesto aproximado.</Reveal>
        </div>
        <Reveal>
        <form className="form" noValidate onSubmit={onSubmit}>
          {fieldMeta.map(f => {
            const common = {
              id: f.name,
              name: f.name,
              value: values[f.name],
              placeholder: f.placeholder,
              required: true,
              'aria-describedby': `e-${f.name}`,
              'aria-invalid': !!invalid[f.name],
              onChange: onChange(f.name),
              onBlur: () => validate(f.name),
            };
            return (
              <div key={f.name} className={`field ${invalid[f.name] ? 'invalid' : ''}`}>
                <label htmlFor={f.name}>{f.label}</label>
                {f.type
                  ? <input {...common} type={f.type} autoComplete={f.autoComplete} />
                  : <textarea {...common} />}
                <p className="err" id={`e-${f.name}`}>{errors[f.name]}</p>
              </div>
            );
          })}
          <div>
            <button className="btn btn-cta" type="submit" onPointerMove={trackGlow}>
              Enviar mensaje <span className="arrow" aria-hidden="true">→</span>
            </button>
          </div>
          <p className="status" role="status" aria-live="polite">
            {status}
            {telegramUrl && (
              <> <a href={telegramUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>¿Prefieres Telegram?</a></>
            )}
          </p>
        </form>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  const social = [
    { label: 'GitHub', href: 'https://github.com/', d: 'M9 19c-4 1.500-4-2-6-2m12 4v-3.500c0-1 .1-1.400-.5-2 2.800-.3 5.500-1.400 5.500-6a4.600 4.600 0 00-1.300-3.200 4.200 4.200 0 00-.1-3.200s-1.100-.3-3.500 1.300a12 12 0 00-6.200 0C6.500 2.800 5.400 3.100 5.400 3.100a4.200 4.200 0 00-.1 3.200A4.600 4.600 0 004 9.500c0 4.600 2.700 5.700 5.500 6-.6.600-.6 1.200-.5 2V21' },
    { label: 'LinkedIn', href: 'https://linkedin.com/', d: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z' },
    { label: 'Telegram', href: `https://t.me/${TELEGRAM_USER}`, d: 'M22 3L2 11l7 2.500L11.500 21l3-5 5 4z' },
  ];
  return (
    <footer>
      <div className="container">
        <div className="foot">
          <div>
            <Logo label="Dn Craft & Loop, volver al inicio" />
            <p>Ideas que cobran vida, código que no se detiene.</p>
          </div>
          <nav aria-label="Pie de página">
            <ul>
              <li><a href="#servicios">Servicios</a></li>
              <li><a href="#proceso">Proceso</a></li>
              <li><a href="#proyectos">Proyectos</a></li>
              <li><a href="#contacto">Contacto</a></li>
            </ul>
          </nav>
          <div className="social">
            {social.map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d={s.d} /></svg>
              </a>
            ))}
          </div>
        </div>
        <p className="copy">© {new Date().getFullYear()} Dn Craft &amp; Loop · Hecho con código y café.</p>
      </div>
    </footer>
  );
}
