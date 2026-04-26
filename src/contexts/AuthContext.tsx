import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

type AppRole = "admin" | "landlord" | "tenant";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: AppRole;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  userRole: "tenant",
  signOut: async () => {},
  refreshRole: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<AppRole>("tenant");

  // Background sync for the role
  const syncRoleFromDB = async (userId: string) => {
    try {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (data?.role) {
        setUserRole(data.role as AppRole);
      }
    } catch (err) {
      console.error("Silent role sync failed:", err);
    }
  };

  const refreshRole = async () => {
    if (user) await syncRoleFromDB(user.id);
  };

  useEffect(() => {
    // 1. Initial Load: Check session quickly
    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
          
          // SPEED FIX: Immediately use metadata if available
          const metaRole = initialSession.user.user_metadata?.role;
          if (metaRole) setUserRole(metaRole as AppRole);
          
          // Sync DB in background (don't 'await' it)
          syncRoleFromDB(initialSession.user.id);
        }
      } catch (error) {
        console.error("Auth init error:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // 2. Auth State Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        // SPEED FIX: Trust metadata first for instant UI response
        const metaRole = currentUser.user_metadata?.role;
        if (metaRole) {
          setUserRole(metaRole as AppRole);
        }
        
        // Sync with DB in background
        syncRoleFromDB(currentUser.id);
      } else {
        setUserRole("tenant");
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setUserRole("tenant");
    } catch (error) {
      console.error("Signout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, userRole, signOut, refreshRole }}>
      {children}
    </AuthContext.Provider>
  );
};