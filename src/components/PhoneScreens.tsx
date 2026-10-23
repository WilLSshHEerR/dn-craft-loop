/* ─── Pantallas compartidas del teléfono ──────────────────── */

export function ScreenTienda() {
  return (
    <div className="h-full bg-[#0a0a0a] flex flex-col">
      <div className="flex justify-between items-center px-5 pt-3 pb-1">
        <span className="text-white text-[9px] font-semibold">9:41</span>
        <div className="flex gap-1 items-center">
          <div className="flex gap-[2px] items-end h-2.5">
            {[3, 5, 7, 9].map((h, i) => (
              <div key={i} className="w-[3px] bg-white/70 rounded-sm" style={{ height: h }} />
            ))}
          </div>
          <div className="w-5 h-2.5 rounded-sm border border-white/50 p-[1px]">
            <div className="h-full w-3/4 bg-white/70 rounded-sm" />
          </div>
        </div>
      </div>

      <div className="px-4 pt-2 pb-3 border-b border-white/5">
        <p className="text-[#d4af37] text-[9px] font-bold tracking-widest uppercase mb-0.5">Diamond Crown</p>
        <h2 className="text-white text-sm font-bold">Tienda</h2>
      </div>

      <div className="flex gap-2 px-4 py-2.5 overflow-x-auto scrollbar-none">
        {['Tatuajes', 'Piercings', 'Barbería'].map((c, i) => (
          <span
            key={c}
            className={`text-[9px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 ${
              i === 0 ? 'bg-[#d4af37] text-black' : 'bg-white/8 text-white/50'
            }`}
          >
            {c}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 px-4 pb-2 flex-1 overflow-hidden">
        {[
          { emoji: '🖤', name: 'Art Print',    price: '$299', bg: 'from-purple-900/60 to-purple-950/80' },
          { emoji: '💎', name: 'Piercing Set', price: '$450', bg: 'from-blue-900/60 to-blue-950/80'   },
          { emoji: '✂️', name: 'Razor Kit',    price: '$180', bg: 'from-zinc-800/60 to-zinc-900/80'   },
          { emoji: '🔮', name: 'Crystal Ring', price: '$320', bg: 'from-indigo-900/60 to-indigo-950/80'},
        ].map((prod) => (
          <div key={prod.name} className={`bg-gradient-to-br ${prod.bg} rounded-xl p-2.5 border border-white/8 flex flex-col`}>
            <span className="text-xl mb-1.5">{prod.emoji}</span>
            <p className="text-white text-[9px] font-semibold leading-tight">{prod.name}</p>
            <p className="text-[#d4af37] text-[10px] font-bold mt-auto pt-1">{prod.price}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-around items-center px-2 py-2.5 border-t border-white/8 bg-[#111] mt-auto">
        {['🏠', '🛒', '📅', '👤'].map((icon, i) => (
          <div key={i} className={`flex flex-col items-center ${i === 0 ? 'opacity-100' : 'opacity-30'}`}>
            <span className="text-sm">{icon}</span>
            {i === 0 && <div className="w-1 h-1 rounded-full bg-[#d4af37] mt-0.5" />}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ScreenCitas() {
  return (
    <div className="h-full bg-[#0a0a0a] flex flex-col">
      <div className="flex justify-between items-center px-5 pt-3 pb-1">
        <span className="text-white text-[9px] font-semibold">9:41</span>
        <div className="w-5 h-2.5 rounded-sm border border-white/50 p-[1px]">
          <div className="h-full w-3/4 bg-white/70 rounded-sm" />
        </div>
      </div>

      <div className="px-4 pt-2 pb-3 border-b border-white/5">
        <p className="text-[#d4af37] text-[9px] font-bold tracking-widest uppercase mb-0.5">Diamond Crown</p>
        <h2 className="text-white text-sm font-bold">Agendar Cita</h2>
      </div>

      <div className="px-4 pt-3 pb-2">
        <p className="text-white/40 text-[9px] uppercase tracking-wider mb-2">Artista</p>
        <div className="flex gap-3">
          {['A', 'B', 'C'].map((a, i) => (
            <div key={a} className="flex flex-col items-center gap-1">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                i === 0
                  ? 'border-[#d4af37] bg-[#d4af37]/20 text-[#d4af37]'
                  : 'border-white/10 bg-white/5 text-white/40'
              }`}>{a}</div>
              <div className="w-7 h-1.5 rounded bg-white/10" />
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pb-2">
        <p className="text-white/40 text-[9px] uppercase tracking-wider mb-2">Servicio</p>
        <div className="flex flex-wrap gap-1.5">
          {['Tatuaje', 'Piercing', 'Barba'].map((s, i) => (
            <span
              key={s}
              className={`text-[9px] px-2.5 py-1 rounded-full ${
                i === 0
                  ? 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40'
                  : 'bg-white/5 text-white/30 border border-white/8'
              }`}
            >{s}</span>
          ))}
        </div>
      </div>

      <div className="px-4 pb-2">
        <p className="text-white/40 text-[9px] uppercase tracking-wider mb-2">Fecha</p>
        <div className="grid grid-cols-7 gap-1">
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => (
            <div key={d} className="text-center text-[8px] text-white/30 font-medium">{d}</div>
          ))}
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className={`text-center text-[9px] rounded-full py-0.5 font-medium ${
                i === 3 ? 'bg-[#d4af37] text-black' : 'text-white/50'
              }`}
            >{i + 12}</div>
          ))}
        </div>
      </div>

      <div className="px-4 pb-3">
        <p className="text-white/40 text-[9px] uppercase tracking-wider mb-2">Hora</p>
        <div className="flex gap-1.5">
          {['10:00', '12:00', '15:00', '17:00'].map((h, i) => (
            <span
              key={h}
              className={`text-[8px] px-2 py-1 rounded-lg ${
                i === 1
                  ? 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40'
                  : 'bg-white/5 text-white/30'
              }`}
            >{h}</span>
          ))}
        </div>
      </div>

      <div className="px-4 mt-auto pb-4">
        <div className="w-full py-2.5 rounded-xl bg-[#d4af37] text-black text-[10px] font-bold text-center">
          Confirmar cita
        </div>
      </div>
    </div>
  );
}

export function ScreenDashboard() {
  return (
    <div className="h-full bg-[#0a0a0a] flex flex-col">
      <div className="flex justify-between items-center px-5 pt-3 pb-1">
        <span className="text-white text-[9px] font-semibold">9:41</span>
        <div className="w-5 h-2.5 rounded-sm border border-white/50 p-[1px]">
          <div className="h-full w-3/4 bg-white/70 rounded-sm" />
        </div>
      </div>

      <div className="px-4 pt-2 pb-3 border-b border-white/5 flex items-center justify-between">
        <div>
          <p className="text-[#d4af37] text-[9px] font-bold tracking-widest uppercase mb-0.5">Diamond Crown</p>
          <h2 className="text-white text-sm font-bold">Dashboard</h2>
        </div>
        <span className="text-[8px] px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30">
          Admin
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 px-4 pt-3 pb-2">
        {[
          { label: 'Citas',    value: '24',   color: 'text-blue-400',    bg: 'bg-blue-400/10'    },
          { label: 'Ventas',   value: '$12k', color: 'text-[#d4af37]',  bg: 'bg-[#d4af37]/10'  },
          { label: 'Clientes', value: '138',  color: 'text-green-400',   bg: 'bg-green-400/10'   },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-2 border border-white/5`}>
            <p className={`${s.color} text-[11px] font-black`}>{s.value}</p>
            <p className="text-white/30 text-[8px] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="px-4 flex-1">
        <p className="text-white/40 text-[9px] uppercase tracking-wider mb-2">Próximas citas</p>
        <div className="flex flex-col gap-2">
          {[
            { name: 'Carlos M.', service: 'Tatuaje', time: '10:00', color: 'bg-purple-400' },
            { name: 'Laura S.',  service: 'Piercing', time: '12:30', color: 'bg-blue-400'   },
            { name: 'Diego R.',  service: 'Barba',    time: '15:00', color: 'bg-green-400'  },
          ].map((c) => (
            <div key={c.name} className="flex items-center gap-2.5 bg-white/[0.04] rounded-xl p-2.5 border border-white/5">
              <div className={`w-6 h-6 rounded-full ${c.color}/20 flex items-center justify-center shrink-0`}>
                <div className={`w-2 h-2 rounded-full ${c.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-[9px] font-semibold truncate">{c.name}</p>
                <p className="text-white/30 text-[8px]">{c.service}</p>
              </div>
              <span className="text-white/40 text-[8px] shrink-0">{c.time}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-around items-center px-2 py-2.5 border-t border-white/8 bg-[#111] mt-auto">
        {['📊', '🛒', '📅', '👥'].map((icon, i) => (
          <div key={i} className={`flex flex-col items-center ${i === 0 ? 'opacity-100' : 'opacity-30'}`}>
            <span className="text-sm">{icon}</span>
            {i === 0 && <div className="w-1 h-1 rounded-full bg-[#d4af37] mt-0.5" />}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Marco del teléfono ─────────────────────────────────── */

export function PhoneFrame({
  children,
  width = 220,
  screenHeight = 440,
}: {
  children: React.ReactNode;
  width?: number;
  screenHeight?: number;
}) {
  const scale      = screenHeight / 440;
  const borderR    = Math.round(42 * scale);
  const pad        = Math.round(10 * scale);
  const screenR    = Math.round(34 * scale);
  const pwrTop     = Math.round(90 * scale);
  const pwrH       = Math.round(40 * scale);
  const vol1Top    = Math.round(80 * scale);
  const volH       = Math.round(30 * scale);
  const vol2Top    = Math.round(118 * scale);

  return (
    <div
      className="relative border border-white/15 shadow-2xl"
      style={{
        width,
        background: 'linear-gradient(to bottom, #1c1c1e, #0d0d0f)',
        borderRadius: borderR,
        padding: pad,
      }}
    >
      {/* Botón de encendido */}
      <div className="absolute -right-[3px] w-[3px] bg-white/20 rounded-r-full" style={{ top: pwrTop, height: pwrH }} />
      {/* Volumen */}
      <div className="absolute -left-[3px] w-[3px] bg-white/20 rounded-l-full" style={{ top: vol1Top, height: volH }} />
      <div className="absolute -left-[3px] w-[3px] bg-white/20 rounded-l-full" style={{ top: vol2Top, height: volH }} />

      {/* Pantalla */}
      <div className="overflow-hidden bg-black relative" style={{ height: screenHeight, borderRadius: screenR }}>
        {/* Dynamic Island */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-20 flex items-center justify-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#1a1a1a] border border-white/10" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a]" />
        </div>

        {children}

        {/* Reflejo */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%)' }}
        />
      </div>
    </div>
  );
}
