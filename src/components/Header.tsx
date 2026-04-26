import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Home, LogOut, Moon, Sun, User, Menu, X, MessageCircle, CalendarDays, Building2, LayoutDashboard, Shield, MapPin } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type AppRole = "tenant" | "landlord" | "admin";

const Header = () => {
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [availableRoles, setAvailableRoles] = useState<AppRole[]>([]);
  const [activeRole, setActiveRole] = useState<AppRole>(userRole);
  const [open, setOpen] = useState(false);

  useEffect(() => setActiveRole(userRole), [userRole]);

  useEffect(() => {
    const loadRoles = async () => {
      if (!user) return setAvailableRoles([]);
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      setAvailableRoles((data || []).map((r) => r.role as AppRole));
    };
    loadRoles();
  }, [user]);

  const handleRoleSwitch = (r: AppRole) => {
    setActiveRole(r);
    if (r === "admin") navigate("/admin");
    else if (r === "landlord") navigate("/landlord");
    else navigate("/tenant");
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/");
  };

  const navLinks = [
    { to: "/", label: "Home", icon: Home },
    { to: "/properties", label: "Browse", icon: Building2 },
    ...(user ? [
      { to: "/near-me", label: "Near Me", icon: MapPin },
      { to: "/chat", label: "Chats", icon: MessageCircle },
      { to: "/visits", label: "Visits", icon: CalendarDays },
    ] : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <Home className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-black tracking-tighter italic uppercase">RentifyX</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => {
            const isActive = location.pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <l.icon className="w-3.5 h-3.5" />
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {user && availableRoles.length > 1 && (
            <div className="hidden sm:flex items-center gap-1 p-1 bg-secondary rounded-xl">
              {availableRoles.map((r) => (
                <button
                  key={r}
                  onClick={() => handleRoleSwitch(r)}
                  className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                    activeRole === r ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {r === "admin" ? <Shield className="w-3 h-3 inline mr-1" /> : r === "landlord" ? <Building2 className="w-3 h-3 inline mr-1" /> : <User className="w-3 h-3 inline mr-1" />}
                  {r}
                </button>
              ))}
            </div>
          )}

          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 rounded-xl bg-secondary hover:bg-border transition-colors">
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {user ? (
            <>
              <button onClick={() => navigate("/profile")} className="hidden sm:flex p-2 rounded-xl bg-secondary hover:bg-border transition-colors">
                <User className="w-4 h-4" />
              </button>
              <button onClick={handleSignOut} className="p-2 rounded-xl bg-secondary hover:bg-destructive hover:text-destructive-foreground transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button onClick={() => navigate("/auth")} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest">
              Sign In
            </button>
          )}

          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-xl bg-secondary">
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container mx-auto px-4 py-3 flex flex-col gap-1">
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black uppercase hover:bg-secondary">
                <l.icon className="w-4 h-4" /> {l.label}
              </Link>
            ))}
            {user && availableRoles.length > 1 && (
              <div className="flex gap-2 mt-2 pt-2 border-t border-border">
                {availableRoles.map((r) => (
                  <button key={r} onClick={() => { handleRoleSwitch(r); setOpen(false); }} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase ${activeRole === r ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;