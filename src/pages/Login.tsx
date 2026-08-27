import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../context/SessionContext";
import { supabase } from "../lib/supabase";

const DEMO_PROFILES = [
  ["propietario", "Propietario"],
  ["legal", "Departamento Legal"],
  ["arquitectura", "Departamento de Arquitectura"],
  ["arquitecto", "Arquitecto"],
  ["contratista", "Contratista"],
  ["obras", "Control de Obras"],
  ["electrica", "Electricidad"],
  ["hidrosanitaria", "Hidrosanitaria"],
  ["paisajismo", "Paisajismo"],
  ["mensura", "Mensura"],
  ["seguridad", "Seguridad"],
  ["admin", "Administración General"],
  ["gobernanza", "Gobernanza"],
] as const;

export function Login() {
  const navigate = useNavigate();
  const [selectedProfile, setSelectedProfile] = useState("propietario");
  const [menuOpen, setMenuOpen] = useState(false);

  const { isConfigured, isAuthenticated, primaryRole } = useSession();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !primaryRole) return;
    const destinations: Record<string, string> = {
      admin_general: "/admin", gobernanza: "/gobernanza", propietario: "/propietario/mis-propiedades",
      arquitecto: "/arquitecto/mis-proyectos", contratista: "/contratista/obras-activas",
      revision_tecnica: "/revision-tecnica", control_obras: "/control-obras",
      legal: "/legal", electrica: "/electrica", hidrosanitaria: "/hidrosanitaria",
      paisajismo: "/paisajismo", mensura: "/mensura", seguridad: "/seguridad",
    };
    navigate(destinations[primaryRole] ?? "/propietario/mis-propiedades", { replace: true });
  }, [isAuthenticated, primaryRole, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (!isConfigured) {
      setErrorMessage("La conexión con Costasur todavía no está configurada en este entorno.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: selectedProfile }),
      });
      const result = await response.json() as { error?: string; session?: Parameters<NonNullable<typeof supabase>["auth"]["setSession"]>[0] };
      if (!response.ok || !result.session || !supabase) {
        throw new Error(result.error || "No fue posible iniciar sesión.");
      }
      const { error } = await supabase.auth.setSession(result.session);
      if (error) throw new Error(error.message);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No fue posible iniciar sesión.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Navbar corporativo Costasur adaptado al CDE */}
      <header className="costasur-header">
        <div className="costasur-nav-container">
          <a href="#" className="costasur-logo-link" aria-label="Costasur Casa de Campo">
            <img src="/costasur-logo.svg" alt="Costasur Casa de Campo" className="costasur-logo-svg" />
          </a>
          <button type="button" className="costasur-menu-button md:hidden" aria-label="Abrir menú" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
            <span className="material-symbols-outlined">{menuOpen ? "close" : "menu"}</span>
          </button>
          <nav className={`${menuOpen ? "flex" : "hidden"} md:flex costasur-nav-links`} aria-label="Navegación principal del CDE">
            <a href="#normativas" onClick={() => setMenuOpen(false)}>NORMATIVAS</a>
            <a href="#formularios" onClick={() => setMenuOpen(false)}>FORMULARIOS</a>
            <a href="#carta-inicio" onClick={() => setMenuOpen(false)}>CARTA DE INICIO</a>
            <a href="#contactos" onClick={() => setMenuOpen(false)}>CONTACTOS</a>
          </nav>
          <div className="costasur-nav-actions">
            <button type="button" className="costasur-icon-button" aria-label="Buscar"><span className="material-symbols-outlined">search</span></button>
            <a href="#cde-login" className="costasur-owner-link">ACCESO PROPIETARIOS</a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Image Section */}
        <div 
          className="hidden md:block md:w-1/2 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2000&auto=format&fit=crop')` }}
        >
        </div>

        {/* Right Login Form Section */}
        <div id="cde-login" className="w-full md:w-1/2 flex items-center justify-center p-8 bg-surface">
          <div className="bg-white rounded-[2rem] p-8 md:p-12 max-w-md w-full shadow-lg border border-outline-variant/10">
            
            {/* Logo & Header */}
            <div className="text-center mb-10">
              <div className="flex justify-center mb-6">
                <div className="w-44 h-16 flex items-center justify-center">
                  <img src="/costasur-logo-dark.svg" alt="Costasur Casa de Campo" className="w-full h-full object-contain" />
                </div>
              </div>
              <p className="text-secondary mt-2 font-medium">Common Data Environment</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {errorMessage && (
                <div className="rounded-2xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">{errorMessage}</div>
              )}
              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2" htmlFor="demo-profile">
                  Perfil de Demostración
                </label>
                <select
                  id="demo-profile"
                  value={selectedProfile}
                  onChange={(e) => setSelectedProfile(e.target.value)}
                  className="w-full bg-white border-2 border-[#003B70] rounded-xl py-3 px-4 text-on-surface font-semibold focus:ring-2 focus:ring-[#003B70] focus:border-[#003B70] transition-all outline-none"
                >
                  {DEMO_PROFILES.map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2" htmlFor="demo-email">
                  Usuario / Correo Electrónico
                </label>
                <input
                  id="demo-email"
                  type="text"
                  readOnly
                  aria-disabled="true"
                  className="w-full bg-white border border-outline-variant/50 rounded-xl py-3 px-4 text-on-surface focus:ring-2 focus:ring-[#003B70] focus:border-[#003B70] transition-all outline-none"
                  placeholder="usuario@costasur.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2" htmlFor="demo-password">
                  Contraseña
                </label>
                <input
                  id="demo-password"
                  type="password"
                  readOnly
                  aria-disabled="true"
                  className="w-full bg-white border border-outline-variant/50 rounded-xl py-3 px-4 text-on-surface focus:ring-2 focus:ring-[#003B70] focus:border-[#003B70] transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>

              <button 
                type="submit"
                disabled={isSubmitting} className="w-full py-4 px-6 rounded-full bg-[#4A5056] text-white font-bold hover:bg-[#4A5056] transition-all shadow-md mt-4 flex items-center justify-center gap-2"
              >
                {isSubmitting ? "Accediendo..." : "Iniciar Sesión"}
                <span className="material-symbols-outlined text-[20px]">login</span>
              </button>
            </form>

            {/* Helper Note for Prototype Navigation */}
            <div className="mt-10 pt-6 border-t border-outline-variant/20">
              <p className="text-xs text-[#4A5056] text-center leading-relaxed">
                *Info Demo: Seleccione un perfil para explorar el entorno de demostración del CDE Costasur.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#333333] py-6 px-6 flex flex-col md:flex-row items-center justify-center border-t border-[#444444] gap-8">
        <div className="text-white flex flex-col text-center md:text-right">
          <div className="flex flex-col md:flex-row md:items-baseline md:justify-end gap-1 md:gap-2">
            <span className="text-sm md:text-base font-light tracking-wide uppercase">Proceso de</span>
            <span className="text-lg md:text-xl font-bold tracking-wide uppercase mt-1 md:mt-0">Registro de Obras</span>
          </div>
          <span className="text-sm md:text-base font-light tracking-wide uppercase mt-1">En Nuestra Comunidad</span>
        </div>

        <div className="hidden md:block h-12 w-px bg-white/30"></div>

        <div className="flex items-center gap-3">
          <img src="/costasur-logo.svg" alt="Costasur Casa de Campo" className="h-10 w-auto" />
        </div>
      </div>
      
      {/* Powered By */}
      <div className="bg-[#333333] py-3 text-center">
        <p className="text-xs text-white/65 font-medium tracking-wide">Powered by Dominican AI Studio</p>
      </div>
    </div>
  );
}

