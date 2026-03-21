import { useState, useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import SplashScreen from "@/components/SplashScreen";
import DevToolsBlocker from "@/components/DevToolsBlocker";
import BoxLoader from "@/components/BoxLoader";

// Lazy load pages for faster initial load
const Landing = lazy(() => import("@/pages/Landing"));
const Properties = lazy(() => import("@/pages/Properties"));
const PropertyDetail = lazy(() => import("@/pages/PropertyDetail"));
const TenantDashboard = lazy(() => import("@/pages/TenantDashboard"));
const LandlordDashboard = lazy(() => import("@/pages/LandlordDashboard"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const Auth = lazy(() => import("@/pages/Auth"));
const Layout = lazy(() => import("@/components/Layout"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <BoxLoader />
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/auth" replace />;

  return <>{children}</>;
};

const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [role, setRole] = useState<"tenant" | "landlord" | "admin">("tenant");

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route path="/auth" element={<Auth />} />
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
    </Suspense>
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
