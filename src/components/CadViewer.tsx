import { useEffect, useRef, useState } from "react";

interface CadViewerProps {
  url: string;
  filename: string;
}

export function CadViewer({ url, filename }: CadViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isDxf = filename.toLowerCase().endsWith(".dxf");

  useEffect(() => {
    if (!isDxf || !containerRef.current) { setLoading(false); return; }
    let disposed = false;
    let viewer: { Load: (options: { url: string }) => Promise<void>; Clear: () => void } | null = null;
    import("dxf-viewer").then(({ DxfViewer }) => {
      if (disposed || !containerRef.current) return;
      viewer = new DxfViewer(containerRef.current, { autoResize: true });
      return viewer.Load({ url });
    }).catch((reason) => { if (!disposed) setError(reason instanceof Error ? reason.message : "No fue posible renderizar el DXF."); }).finally(() => { if (!disposed) setLoading(false); });
    return () => { disposed = true; viewer?.Clear(); if (containerRef.current) containerRef.current.replaceChildren(); };
  }, [isDxf, url]);

  if (!isDxf) return <div className="rounded-2xl bg-surface-container-low p-10 text-center"><span className="material-symbols-outlined text-5xl text-primary">view_in_ar</span><h3 className="text-xl font-bold text-on-surface mt-4">Visor CAD de solo lectura</h3><p className="text-sm text-secondary mt-2">El archivo {filename} está guardado en el expediente. La vista DWG se habilitará mediante conversión CAD o Autodesk Platform Services en la siguiente integración.</p><a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-5 text-sm font-semibold text-primary hover:underline">Abrir archivo autorizado <span className="material-symbols-outlined text-base">open_in_new</span></a></div>;
  return <div className="rounded-2xl overflow-hidden bg-[#101318] min-h-[520px] relative"><div ref={containerRef} className="absolute inset-0" />{loading && <div className="absolute inset-0 grid place-items-center text-white/70">Cargando modelo CAD…</div>}{error && <div className="absolute inset-0 grid place-items-center p-8 text-center text-error bg-black/50">{error}</div>}<div className="absolute top-4 left-4 rounded-full bg-black/50 px-3 py-1.5 text-xs text-white/80">DXF · solo lectura</div></div>;
}
