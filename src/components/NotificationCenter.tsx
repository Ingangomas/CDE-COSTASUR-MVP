import { useEffect, useMemo, useState } from "react";
import { useSession } from "../context/SessionContext";
import { getUserNotifications, markNotificationRead, type NotificationRecord } from "../lib/cde-data";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-DO", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function iconFor(type: string) {
  if (type.includes("calendar")) return "calendar_month";
  if (type.includes("supervisor_assignment")) return "engineering";
  if (type.includes("incident")) return "error";
  if (type.includes("review")) return "rate_review";
  if (type.includes("license")) return "verified";
  if (type.includes("request")) return "assignment";
  return "notifications_active";
}

export function NotificationCenter() {
  const { session } = useSession();
  const [items, setItems] = useState<NotificationRecord[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const unread = useMemo(() => items.filter((item) => !item.read_at).length, [items]);

  const load = async () => {
    if (!session?.user.id) { setItems([]); return; }
    setLoading(true); setError(null);
    try { setItems(await getUserNotifications(session.user.id)); }
    catch (loadError) { setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar las notificaciones."); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [session?.user.id]);

  const markRead = async (item: NotificationRecord) => {
    if (item.read_at) return;
    try {
      await markNotificationRead(item.id);
      setItems((current) => current.map((candidate) => candidate.id === item.id ? { ...candidate, read_at: new Date().toISOString() } : candidate));
    } catch (readError) { setError(readError instanceof Error ? readError.message : "No se pudo actualizar la notificación."); }
  };

  return <div className="relative">
    <button type="button" onClick={() => setOpen((value) => !value)} className="relative rounded-full p-2 text-primary transition-colors hover:bg-primary-container/10" aria-label={`Notificaciones${unread ? `, ${unread} sin leer` : ""}`} aria-expanded={open}>
      <span className="material-symbols-outlined text-[20px]">notifications</span>
      {unread > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[9px] font-bold text-white">{unread > 9 ? "9+" : unread}</span>}
    </button>
    {open && <>
      <button type="button" aria-label="Cerrar notificaciones" className="fixed inset-0 z-40 cursor-default" onClick={() => setOpen(false)} />
      <div className="absolute right-0 top-12 z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-xl">
        <div className="flex items-center justify-between border-b border-outline-variant/20 px-4 py-3"><div><p className="font-bold text-primary">Notificaciones</p><p className="text-xs text-secondary">{unread ? `${unread} pendientes de lectura` : "Todo al día"}</p></div><button type="button" onClick={() => void load()} className="text-secondary hover:text-primary" aria-label="Actualizar"><span className={`material-symbols-outlined text-[18px] ${loading ? "animate-spin" : ""}`}>refresh</span></button></div>
        {error && <p className="bg-error/10 px-4 py-3 text-xs text-error">{error}</p>}
        <div className="max-h-[min(420px,60vh)] overflow-y-auto">
          {!loading && !items.length && <p className="px-4 py-8 text-center text-sm text-secondary">No tienes notificaciones nuevas.</p>}
          {items.map((item) => <button key={item.id} type="button" onClick={() => void markRead(item)} className={`w-full border-b border-outline-variant/15 px-4 py-3 text-left transition-colors hover:bg-surface-container-low ${item.read_at ? "opacity-70" : "bg-primary/5"}`}><span className="flex gap-3"><span className={`material-symbols-outlined mt-0.5 text-[19px] ${item.read_at ? "text-secondary" : "text-primary"}`}>{iconFor(item.notification_type)}</span><span className="min-w-0 flex-1"><span className="flex items-start justify-between gap-2"><span className="text-sm font-semibold text-on-surface">{item.title}</span>{!item.read_at && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}</span><span className="mt-1 block text-xs leading-5 text-secondary">{item.body}</span><span className="mt-2 block text-[10px] text-secondary">{formatDate(item.created_at)}</span></span></span></button>)}
        </div>
      </div>
    </>}
  </div>;
}
