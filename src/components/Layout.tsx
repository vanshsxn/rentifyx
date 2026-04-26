import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
interface LayoutProps {children: ReactNode;role: "tenant" | "landlord" | "admin";onRoleChange: (role: "tenant" | "landlord" | "admin") => void;}
const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
      <Header />
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