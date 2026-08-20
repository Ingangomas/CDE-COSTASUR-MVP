interface CasaDeCampoMapProps {
  title?: string;
  subtitle?: string;
  heightClassName?: string;
}

const CASA_DE_CAMPO_EMBED = "https://www.openstreetmap.org/export/embed.html?bbox=-68.96%2C18.36%2C-68.87%2C18.45&layer=mapnik&marker=18.40000%2C-68.91667";

export function CasaDeCampoMap({ title = "Casa de Campo y propiedades del CDE", subtitle = "Mapa de ubicación operativa · La Romana", heightClassName = "h-[300px] md:h-[360px]" }: CasaDeCampoMapProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-outline-variant/30 bg-surface-variant/20 shadow-sm">
      <div className="absolute left-4 top-4 z-10 rounded-2xl border border-white/70 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-sm">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-secondary">Casa de Campo · La Romana</p>
        <p className="mt-1 text-sm font-semibold text-primary">{title}</p>
        <p className="mt-1 text-[11px] text-secondary">{subtitle}</p>
      </div>
      <iframe
        title={`Mapa GIS de ${title}`}
        src={CASA_DE_CAMPO_EMBED}
        className={`${heightClassName} w-full border-0`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <p className="border-t border-outline-variant/20 bg-white px-4 py-2 text-[11px] text-secondary">Mapa base © OpenStreetMap contributors · Casa de Campo, La Romana · referencia operativa del CDE</p>
    </div>
  );
}
