import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useSession } from "../context/SessionContext";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function Layout({ role }: { role: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try { return window.localStorage.getItem("cde-sidebar-collapsed") === "true"; } catch { return false; }
  });
  const navigate = useNavigate();
  const { signOut } = useSession();

  useEffect(() => {
    try { window.localStorage.setItem("cde-sidebar-collapsed", String(sidebarCollapsed)); } catch { /* Preferencia visual local no disponible. */ }
  }, [sidebarCollapsed]);

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
    navigate("/", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar 
        role={role} 
        isMobileOpen={mobileMenuOpen} 
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((value) => !value)}
        onCloseMobileMenu={() => setMobileMenuOpen(false)}
        onSignOut={handleSignOut}
      />
      <div className={`flex-1 flex flex-col min-w-0 transition-[margin] duration-200 ${sidebarCollapsed ? "md:ml-[88px]" : "md:ml-[280px]"}`}>
        <TopBar 
          role={role} 
          onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)} 
        />
        <main className="flex-1 relative overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

