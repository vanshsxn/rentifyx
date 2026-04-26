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
  refreshRole: () => Promise<void>; // Added to manually trigger a refresh
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

  const fetchRole = async (userId: string, currentUser?: User | null) => {
    try {
      // 1. Try fetching from the user_roles table
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle(); // maybeSingle is safer than .single()

      if (data?.role) {
        setUserRole(data.role as AppRole);
        return;
      }

      // 2. Fallback: Check Auth Metadata if database row is missing
      const roleFromMeta = currentUser?.user_metadata?.role || user?.user_metadata?.role;
      if (roleFromMeta) {
        setUserRole(roleFromMeta as AppRole);
      } else {
        setUserRole("tenant");
      }
    } catch (err) {
      console.error("Role fetch error:", err);
      setUserRole("tenant");
    }
  };

  const refreshRole = async () => {
    if (user) await fetchRole(user.id, user);
  };

  useEffect(() => {
    // Initial Session Check
    const initAuth = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      
      if (initialSession?.user) {
        await fetchRole(initialSession.user.id, initialSession.user);
      }
      setLoading(false);
    };

    initAuth();

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        await fetchRole(currentSession.user.id, currentSession.user);
      } else {
        setUserRole("tenant");
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserRole("tenant");
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, userRole, signOut, refreshRole }}>
      {children}
    </AuthContext.Provider>
  );
};