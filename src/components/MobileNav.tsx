import { Home, Search, Heart, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { memo } from "react";

const items = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Search, label: "Search", path: "/properties" },
  { icon: Heart, label: "My Rentals", path: "/tenant", auth: true },
  { icon: User, label: "Account", path: "/profile", auth: true },
];

const MobileNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Bottom navigation"
    >
      <div className="flex items-center justify-around py-2 px-1">
        {items.map((item) => {
          const Icon = item.icon;
          const target = item.auth && !user ? "/auth" : item.path;
          const isActive = location.pathname === target;
          return (
            <button
              key={item.label}
              onClick={() => navigate(target)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-[56px] ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default memo(MobileNav);
