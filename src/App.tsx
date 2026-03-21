import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import DevToolsBlocker from "@/components/DevToolsBlocker";
import Landing from "@/pages/Landing";
import Properties from "@/pages/Properties";
import PropertyDetail from "@/pages/PropertyDetail";
import TenantDashboard from "@/pages/TenantDashboard";
import LandlordDashboard from "@/pages/LandlordDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import Auth from "@/pages/Auth";
import Layout from "@/components/Layout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const AppContent = () => {
  const [role, setRole] = useState<"tenant" | "landlord" | "admin">("tenant");

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/properties" element={<Properties />} />
      <Route path="/property/:id" element={<PropertyDetail />} />
      <Route
        path="/tenant"
        element={
          <Layout role={role} onRoleChange={setRole}>
            <TenantDashboard />
          </Layout>
        }
      />
      <Route
        path="/landlord"
        element={
          <ProtectedRoute>
            <Layout role={role} onRoleChange={setRole}>
              <LandlordDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <Layout role={role} onRoleChange={setRole}>
            <AdminDashboard />
          </Layout>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <DevToolsBlocker />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
