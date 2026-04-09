import { ReactNode } from "react";import { Link, useLocation } from "react-router-dom";import { Home, Moon, Sun, LogOut } from "lucide-react";import { motion, AnimatePresence } from "framer-motion";import { useTheme } from "next-themes";import { useAuth } from "@/contexts/AuthContext";import { useNavigate } from "react-router-dom";import { toast } from "sonner";
interface LayoutProps {children: ReactNode;role: "tenant" | "landlord" | "admin";onRoleChange: (role: "tenant" | "landlord" | "admin") => void;}
const Layout = ({ children }: LayoutProps) => {const location = useLocation();const { theme, setTheme } = useTheme();const { user, signOut } = useAuth();const navigate = useNavigate();const headerTitle = " ";const handleSignOut = async () => {await signOut();toast("Signed out successfully");navigate("/");};
  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border transition-colors duration-300">
        <div className="container max-w-6xl mx-auto flex items-center justify-between h-16 px-4">
          
          <Link to="/" className="flex items-center gap-2">
            <Home className="w-5 h-5 text-primary" />
            <div>
              <span className="text-lg font-bold tracking-tight text-foreground">RentifyX</span>
              <span className="hidden sm:inline text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-2">
                {headerTitle}
              </span></div></Link><div className="flex items-center gap-3">
            {/* ❌ ROLE TOGGLE COMPLETELY REMOVED */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {user && (
              <button
                onClick={handleSignOut}
                className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-destructive transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <footer className="py-6 text-center border-t border-border/40 mt-auto">
        <p className="text-xs text-muted-foreground tracking-wide">
          © 2026 Made by MV Studios Japan.
        </p>
      </footer>
    </div>
  );
};

export default Layout;