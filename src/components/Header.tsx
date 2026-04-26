import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { 
  Home, LogOut, Moon, Sun, User, Menu, X, 
  MessageCircle, CalendarDays, Building2, 
  Shield, MapPin, LayoutGrid 
} from "lucide-react";
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

  // Sync activeRole whenever the global auth state changes
  useEffect(() => {
    setActiveRole(userRole);
  }, [userRole]);

  // Fetch all assigned roles for the switcher
  useEffect(() => {
    const loadRoles = async () => {
      if (!user) {
        setAvailableRoles([]);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);
        
        if (data && data.length > 0) {
          const roles = data.map((r) => r.role as AppRole);
          setAvailableRoles(roles);
        } else {
          // If no roles in DB, fallback to the context role
          setAvailableRoles([userRole]);
        }
      } catch (err) {
        console.error("Error loading header roles:", err);
        setAvailableRoles([userRole]);
      }
    };
    
    loadRoles();
  }, [user, userRole]);

  const handleRoleSwitch = (r: AppRole) => {
    setActiveRole(r);
    toast.info(`Switched to ${r} view`);
    if (r === "admin") navigate("/admin");
    else if (r === "landlord") navigate("/landlord");
    else navigate("/tenant");
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
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
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 shrink-0 group">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
            <Home className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-black tracking-tighter italic uppercase">RentifyX</span>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => {
            const isActive = location.pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <l.icon className="w-3.5 h-3.5" />
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT SECTION: THEME, ROLE, PROFILE */}
        <div className="flex items-center gap-2">
          
          {/* ROLE SWITCHER PILL */}
          {user && availableRoles.length > 1 && (
            <div className="hidden sm:flex items-center gap-1 p-1 bg-secondary/50 rounded-xl border border-border/50">
              {availableRoles.map((r) => (
                <button
                  key={r}
                  onClick={() => handleRoleSwitch(r)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    activeRole === r 
                      ? "bg-background shadow-sm text-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r === "admin" && <Shield className="w-3 h-3" />}
                  {r === "landlord" && <Building2 className="w-3 h-3" />}
                  {r === "tenant" && <User className="w-3 h-3" />}
                  {r}
                </button>
              ))}
            </div>
          )}

          {/* THEME TOGGLE */}
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
            className="p-2 rounded-xl bg-secondary hover:bg-border transition-colors border border-transparent hover:border-border"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {user ? (
            <>
              {/* HUB LINK (Dynamic based on role) */}
              <button 
                onClick={() => navigate(activeRole === 'landlord' ? "/landlord" : "/tenant")}
                className="hidden md:flex p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                title="Go to Dashboard"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>

              {/* PROFILE LINK */}
              <button 
                onClick={() => navigate("/profile")} 
                className="hidden sm:flex p-2 rounded-xl bg-secondary hover:bg-border transition-colors"
              >
                <User className="w-4 h-4" />
              </button>

              {/* SIGN OUT */}
              <button 
                onClick={handleSignOut} 
                className="p-2 rounded-xl bg-secondary hover:bg-destructive hover:text-destructive-foreground transition-colors group"
              >
                <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </>
          ) : (
            <button 
              onClick={() => navigate("/auth")} 
              className="px-4 py-2 rounded-xl bg-foreground text-background text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
            >
              Sign In
            </button>
          )}

          {/* MOBILE MENU TOGGLE */}
          <button 
            onClick={() => setOpen(!open)} 
            className="md:hidden p-2 rounded-xl bg-secondary"
          >
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {open && (
        <div className="md:hidden border-t border-border bg-background animate-in slide-in-from-top duration-200">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {navLinks.map((l) => (
              <Link 
                key={l.to} 
                to={l.to} 
                onClick={() => setOpen(false)} 
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-secondary"
              >
                <l.icon className="w-4 h-4 text-primary" /> {l.label}
              </Link>
            ))}
            
            {user && (
              <>
                <Link 
                  to="/profile" 
                  onClick={() => setOpen(false)} 
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-secondary"
                >
                  <User className="w-4 h-4 text-primary" /> Profile
                </Link>

                {/* MOBILE ROLE SWITCHER */}
                {availableRoles.length > 1 && (
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-border">
                    {availableRoles.map((r) => (
                      <button 
                        key={r} 
                        onClick={() => { handleRoleSwitch(r); setOpen(false); }} 
                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                          activeRole === r 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;