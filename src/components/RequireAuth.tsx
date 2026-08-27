import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSession } from "../context/SessionContext";
import type { RoleKey } from "../lib/cde-types";

const routeRoles: Array<[string, RoleKey[]]> = [
  ["/gobernanza", ["gobernanza"]],
  ["/admin", ["admin_general"]],
  ["/propietario", ["propietario", "admin_general"]],
  ["/arquitecto", ["arquitecto", "admin_general"]],
  ["/contratista", ["contratista", "admin_general"]],
  ["/revision-tecnica", ["revision_tecnica", "admin_general"]],
  ["/control-obras", ["control_obras", "admin_general"]],
  ["/legal", ["legal", "admin_general"]],
  ["/electrica", ["electrica", "admin_general"]],
  ["/hidrosanitaria", ["hidrosanitaria", "admin_general"]],
  ["/paisajismo", ["paisajismo", "admin_general"]],
  ["/mensura", ["mensura", "admin_general"]],
  ["/seguridad", ["seguridad", "admin_general"]],
];

function rolesForPath(pathname: string) {
  return routeRoles.find(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`))?.[1] ?? [];
}

export function RequireAuth() {
  const location = useLocation();
  const { isAuthenticated, loading, isConfigured, profile, roles } = useSession();

  if (loading) {
    return <div className="min-h-screen bg-surface flex items-center justify-center text-on-surface-variant">Cargando sesión…</div>;
  }

  if (!isConfigured || !isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  const allowedRoles = rolesForPath(location.pathname);
  const isAllowed = allowedRoles.length === 0 || roles.some((role) => allowedRoles.includes(role.role_key) && role.is_active);

  if (!isAllowed || profile?.status !== "active") {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <div className="glass-panel max-w-lg p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-warning mb-4">pending_actions</span>
          <h1 className="text-2xl font-semibold text-on-surface">Acceso pendiente de autorización</h1>
          <p className="mt-3 text-on-surface-variant">Tu cuenta existe, pero un Administrador General todavía debe activar tu perfil y asignar tu rol o membresía al proyecto correspondiente.</p>
        </div>
      </div>
    );
  }

    return <Outlet />;
}

export function ProtectedOutlet() {
  const { isAuthenticated, loading } = useSession();
  if (loading) return null;
  return isAuthenticated ? null : <Navigate to="/" replace />;
}
