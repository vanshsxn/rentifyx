import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Building2, Shield, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LayoutProps {
  children: ReactNode;
  role: "tenant" | "landlord" | "admin";
  onRoleChange: (role: "tenant" | "landlord" | "admin") => void;
}

const roles = [
  { key: "tenant" as const, label: "Tenant", icon: Search, path: "/tenant" },
  { key: "landlord" as const, label: "Landlord", icon: Building2, path: "/landlord" },
  { key: "admin" as const, label: "Admin", icon: Shield, path: "/admin" },
];

const Layout = ({ children, role, onRoleChange }: LayoutProps) => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container max-w-6xl mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2">
            <Home className="w-5 h-5 text-primary" />
            <span className="text-lg font-bold tracking-tight text-foreground">RentifyX</span>
          </Link>

          <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
            {roles.map((r) => {
              const Icon = r.icon;
              const isActive = role === r.key;
              return (
                <Link
                  key={r.key}
                  to={r.path}
                  onClick={() => onRoleChange(r.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-card text-foreground card-shadow"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{r.label}</span>
                </Link>
              );
            })}
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

      <footer className="py-6 text-center">
        <p className="text-xs text-muted-foreground tracking-wide">Made by MV Studios Japan.</p>
      </footer>
    </div>
  );
};

export default Layout;
