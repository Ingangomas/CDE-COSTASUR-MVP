export function CasaDeCampoMap() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-outline-variant/30 bg-surface-variant/20">
      <div className="absolute left-4 top-4 z-10 rounded-2xl border border-white/60 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-sm">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-secondary">Casa de Campo</p>
        <p className="mt-1 text-sm font-semibold text-primary">Mapa de ubicación operativa</p>
      </div>
      <iframe
        title="Mapa de Casa de Campo"
        src="https://www.google.com/maps?q=18.54021,-68.36541&z=15&output=embed"
        className="h-[360px] w-full border-0 md:h-[430px]"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
