import { Link, useLocation } from "react-router-dom";

export function Sidebar({ 
  role, 
  isMobileOpen, 
  onCloseMobileMenu,
  onSignOut,
  collapsed = false,
  onToggleCollapsed,
}: { 
  role: string; 
  isMobileOpen?: boolean; 
  onCloseMobileMenu?: () => void;
  onSignOut?: () => Promise<void>;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}) {
  const location = useLocation();
  const path = location.pathname;
  const isCollapsed = collapsed;

  const getNavClass = (isActive: boolean, compact = isCollapsed) =>
    isActive
      ? `bg-white text-primary border-l-4 border-primary py-3 flex items-center gap-4 transition-all duration-200 ${compact ? "justify-center px-3" : "px-6"}`
      : `text-secondary hover:text-primary py-3 flex items-center gap-4 hover:bg-secondary-container/30 transition-all duration-200 ${compact ? "justify-center px-3" : "px-6"}`;

  let links: { to: string; icon: string; label: string }[] = [];

  switch (role) {
    case 'gobernanza':
      links = [
        { to: "/gobernanza", icon: "admin_panel_settings", label: "Gobernanza" },
        { to: "/gobernanza/solicitudes", icon: "approval", label: "Solicitudes" },
        { to: "/gobernanza/calendario", icon: "calendar_month", label: "Calendario" },
      ];
      break;
    case 'propietario':
      links = [
        { to: "/propietario/mis-propiedades", icon: "domain", label: "Mis Propiedades" },
      ];
      break;
    case 'arquitecto':
      links = [
        { to: "/arquitecto/mis-proyectos", icon: "architecture", label: "Mis Proyectos" },
        { to: "/arquitecto", icon: "dashboard", label: "Dashboard" },
      ];
      break;
    case 'contratista':
      links = [
        { to: "/contratista/obras-activas", icon: "construction", label: "Mis Proyectos" },
        { to: "/contratista", icon: "dashboard", label: "Dashboard" },
      ];
      break;
    case 'revision-tecnica':
      links = [
        { to: "/revision-tecnica/revision", icon: "fact_check", label: "Revisión General" },
        { to: "/revision-tecnica/proyectos", icon: "folder_open", label: "Proyectos" },
        { to: "/revision-tecnica", icon: "dashboard", label: "Dashboard" },
        { to: "/revision-tecnica/calendario", icon: "calendar_month", label: "Calendario" },
      ];
      break;
    case 'control-obras':
      links = [
        { to: "/control-obras/control", icon: "construction", label: "Control de Obras General" },
        { to: "/control-obras/proyectos", icon: "folder_open", label: "Proyectos" },
        { to: "/control-obras", icon: "dashboard", label: "Dashboard" },
        { to: "/control-obras/calendario", icon: "calendar_month", label: "Calendario" },
      ];
      break;
    case 'legal':
      links = [
        { to: "/legal/validaciones", icon: "gavel", label: "Validaciones Legales" },
        { to: "/legal/proyectos", icon: "folder_open", label: "Proyectos" },
        { to: "/legal", icon: "dashboard", label: "Dashboard" },
        { to: "/legal/calendario", icon: "calendar_month", label: "Calendario" },
      ];
      break;
    case 'electrica':
      links = [
        { to: "/electrica/revision", icon: "electrical_services", label: "Revisión Eléctrica" },
        { to: "/electrica/proyectos", icon: "folder_open", label: "Proyectos" },
        { to: "/electrica", icon: "dashboard", label: "Dashboard" },
        { to: "/electrica/calendario", icon: "calendar_month", label: "Calendario" },
      ];
      break;
    case 'hidrosanitaria':
      links = [
        { to: "/hidrosanitaria/revision", icon: "plumbing", label: "Revisión Hidrosanitaria" },
        { to: "/hidrosanitaria/proyectos", icon: "folder_open", label: "Proyectos" },
        { to: "/hidrosanitaria", icon: "dashboard", label: "Dashboard" },
        { to: "/hidrosanitaria/calendario", icon: "calendar_month", label: "Calendario" },
      ];
      break;
    case 'paisajismo':
      links = [
        { to: "/paisajismo/revision", icon: "park", label: "Revisión Paisajismo" },
        { to: "/paisajismo/proyectos", icon: "folder_open", label: "Proyectos" },
        { to: "/paisajismo", icon: "dashboard", label: "Dashboard" },
        { to: "/paisajismo/calendario", icon: "calendar_month", label: "Calendario" },
      ];
      break;
    case 'mensura':
      links = [
        { to: "/mensura/revision", icon: "straighten", label: "Revisión Mensura" },
        { to: "/mensura/proyectos", icon: "folder_open", label: "Proyectos" },
        { to: "/mensura", icon: "dashboard", label: "Dashboard" },
        { to: "/mensura/calendario", icon: "calendar_month", label: "Calendario" },
      ];
      break;
    case 'seguridad':
      links = [
        { to: "/seguridad/revision", icon: "security", label: "Revisión Seguridad" },
        { to: "/seguridad/proyectos", icon: "folder_open", label: "Proyectos" },
        { to: "/seguridad", icon: "dashboard", label: "Dashboard" },
        { to: "/seguridad/calendario", icon: "calendar_month", label: "Calendario" },
      ];
      break;
    case 'admin':
      links = [
        { to: "/admin/mapa", icon: "admin_panel_settings", label: "Admin General" },
        { to: "/admin/proyectos", icon: "folder_open", label: "Proyectos Generales" },
        { to: "/admin/departamentos", icon: "corporate_fare", label: "Control Departamentos" },
        { to: "/admin/dashboard", icon: "dashboard", label: "Dashboard General" },
        { to: "/admin/calendario", icon: "calendar_month", label: "Calendario" },
      ];
      break;
  }

  const renderNavContent = (isMobile: boolean = false) => (
    <>
      <div className={`${isCollapsed && !isMobile ? "px-3 justify-center" : "px-6"} mb-8 flex items-start justify-between gap-2`}>
        <div className={isCollapsed && !isMobile ? "flex justify-center w-full" : ""}>
          <div className="bg-[#333333] p-3 rounded-xl inline-block mb-2 shadow-sm">
            <img src="/costasur-logo.svg" alt="Costasur Casa de Campo" className={`block h-auto ${isCollapsed && !isMobile ? "w-[48px]" : "w-[120px]"}`} />
          </div>
          {!isCollapsed || isMobile ? <p className="text-xs text-secondary font-medium">Oficina de Control de Obras</p> : null}
        </div>

        {isMobile ? (
          <button 
            onClick={onCloseMobileMenu}
            className="p-2 rounded-full hover:bg-surface-variant text-secondary"
            aria-label="Cerrar menú"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="absolute right-[-14px] top-7 z-10 grid h-7 w-7 place-items-center rounded-full border border-outline-variant/30 bg-white text-secondary shadow-md transition-colors hover:text-primary"
            aria-label={isCollapsed ? "Ampliar menú lateral" : "Plegar menú lateral"}
            title={isCollapsed ? "Ampliar menú lateral" : "Plegar menú lateral"}
          >
            <span className="material-symbols-outlined text-base">{isCollapsed ? "chevron_right" : "chevron_left"}</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <ul className="space-y-2">
          {links.map((link, idx) => (
            <li key={idx}>
              <Link 
                to={link.to} 
                onClick={isMobile ? onCloseMobileMenu : undefined}
                className={getNavClass(path === link.to, isCollapsed && !isMobile)}
                title={isCollapsed && !isMobile ? link.label : undefined}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{link.icon}</span>
                {(!isCollapsed || isMobile) && <span className="font-medium text-sm md:text-base">{link.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className={`${isCollapsed && !isMobile ? "px-3" : "px-6"} mt-6`}>
        {role === 'propietario' && (
          <Link
            to="/propietario/mis-propiedades?nuevo=1"
            onClick={isMobile ? onCloseMobileMenu : undefined}
            className="w-full bg-primary-container text-white rounded-full py-3 px-3 flex items-center justify-center gap-2 font-medium hover:bg-primary-container/90 transition-colors shadow-md text-sm"
            title={isCollapsed && !isMobile ? "Nuevo Proyecto" : undefined}
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            {!isCollapsed || isMobile ? "Nuevo Proyecto" : null}
          </Link>
        )}
        {role === 'arquitecto' && (
          <button type="button" className="w-full bg-primary-container text-white rounded-full py-3 px-3 flex items-center justify-center gap-2 font-medium hover:bg-primary-container/90 transition-colors shadow-md text-sm" title={isCollapsed && !isMobile ? "Nuevo Proyecto" : undefined}>
            <span className="material-symbols-outlined text-[20px]">add</span>
            {!isCollapsed || isMobile ? "Nuevo Proyecto" : null}
          </button>
        )}
        {role === 'contratista' && (
          <Link
            to="/contratista/obras-activas?nuevo=1"
            onClick={isMobile ? onCloseMobileMenu : undefined}
            className="w-full bg-primary-container text-white rounded-full py-3 px-3 flex items-center justify-center gap-2 font-medium hover:bg-primary-container/90 transition-colors shadow-md text-sm"
            title={isCollapsed && !isMobile ? "Nuevo proyecto" : undefined}
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            {!isCollapsed || isMobile ? "Nuevo proyecto" : null}
          </Link>
        )}
      </div>

      <div className="mt-6 border-t border-outline-variant/20 pt-4">
        <ul className="space-y-2">
          <li>
            <button
              type="button"
              onClick={() => { void onSignOut?.(); }}
              className={`${getNavClass(false, isCollapsed && !isMobile)} w-full text-left`}
              title={isCollapsed && !isMobile ? "Cerrar Sesión" : undefined}
            >
              <span className="material-symbols-outlined">logout</span>
              {(!isCollapsed || isMobile) && <span className="font-medium text-sm md:text-base">Cerrar Sesión</span>}
            </button>
          </li>
        </ul>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className={`hidden md:flex flex-col h-full py-8 fixed left-0 top-0 backdrop-blur-2xl border-r border-outline-variant/20 shadow-xl bg-surface/70 z-40 transition-[width] duration-200 ${isCollapsed ? "w-[88px]" : "w-[280px]"}`}>
        {renderNavContent(false)}
      </nav>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
            onClick={onCloseMobileMenu} 
          />
          
          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-xs bg-surface py-6 flex flex-col h-full shadow-2xl z-10 overflow-y-auto">
            {renderNavContent(true)}
          </div>
        </div>
      )}
    </>
  );
}

