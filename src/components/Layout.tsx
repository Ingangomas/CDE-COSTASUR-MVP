import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useSession } from "../context/SessionContext";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function Layout({ role }: { role: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { signOut } = useSession();

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
        onCloseMobileMenu={() => setMobileMenuOpen(false)}
        onSignOut={handleSignOut}
      />
      <div className="flex-1 md:ml-[280px] flex flex-col min-w-0">
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

