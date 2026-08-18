import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import type { Profile, RoleKey, UserRole } from "../lib/cde-types";

type AuthResult = { error: Error | null };

interface SessionContextValue {
  session: Session | null;
  profile: Profile | null;
  roles: UserRole[];
  primaryRole: RoleKey | null;
  loading: boolean;
  isAuthenticated: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
  refreshProfile: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

const rolePriority: RoleKey[] = [
  "admin_general", "control_obras", "revision_tecnica", "arquitecto",
  "contratista", "propietario", "legal", "electrica", "hidrosanitaria",
  "paisajismo", "mensura", "seguridad",
];

function getPrimaryRole(roles: UserRole[]) {
  return rolePriority.find((role) => roles.some((item) => item.role_key === role && item.is_active)) ?? null;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async (attempt = 0): Promise<void> => {
    if (!supabase || !session?.user) {
      setProfile(null);
      setRoles([]);
      setLoading(false);
      return;
    }

    const [profileResult, roleResult] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle(),
      supabase.from("user_roles").select("*").eq("user_id", session.user.id).eq("is_active", true),
    ]);

    if ((profileResult.error || roleResult.error) && attempt < 2) {
      await new Promise((resolve) => window.setTimeout(resolve, 200 * (attempt + 1)));
      return refreshProfile(attempt + 1);
    }

    setProfile((profileResult.data as Profile | null) ?? null);
    setRoles((roleResult.data as UserRole[] | null) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    let active = true;
    if (!supabase) { setLoading(false); return () => { active = false; }; }
    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      if (!data.session) setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      if (!nextSession) {
        setProfile(null);
        setRoles([]);
        setLoading(false);
      }
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!session) {
      setProfile(null);
      setRoles([]);
      return;
    }
    setLoading(true);
    void refreshProfile();
  }, [session?.user.id]);

  const value = useMemo<SessionContextValue>(() => ({
    session, profile, roles, primaryRole: getPrimaryRole(roles), loading,
    isAuthenticated: Boolean(session), isConfigured: isSupabaseConfigured,
    signIn: async (email, password) => {
      if (!supabase) return { error: new Error("Supabase no está configurado") };
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error ? new Error(error.message) : null };
    },
    signOut: async () => {
      if (!supabase) return { error: new Error("Supabase no está configurado") };
      const { error } = await supabase.auth.signOut();
      setSession(null);
      setProfile(null);
      setRoles([]);
      setLoading(false);
      return { error: error ? new Error(error.message) : null };
    },
    refreshProfile,
  }), [loading, profile, roles, session]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession debe utilizarse dentro de SessionProvider");
  return context;
}
