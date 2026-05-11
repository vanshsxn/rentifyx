import { ReactNode, memo } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";

interface LayoutProps {
  children: ReactNode;
  role: "tenant" | "landlord" | "admin";
  onRoleChange: (role: "tenant" | "landlord" | "admin") => void;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
      <Header />
      {/* pb-24 on mobile to clear the fixed bottom nav + iOS safe area */}
      <main
        className="flex-1 container max-w-6xl mx-auto px-4 py-8 pb-24 md:pb-8"
        style={{ paddingBottom: "max(6rem, calc(2rem + env(safe-area-inset-bottom)))" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <footer className="py-6 text-center border-t border-border/40 mt-auto md:mb-0 mb-16">
        <p className="text-xs text-muted-foreground tracking-wide">
          © 2026 Made by MV Studios Japan.
        </p>
      </footer>
    </div>
  );
};

export default memo(Layout);
