import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SplashScreen from "@/components/SplashScreen";
import Landing from "@/pages/Landing";
import TenantDashboard from "@/pages/TenantDashboard";
import LandlordDashboard from "@/pages/LandlordDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import Layout from "@/components/Layout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [role, setRole] = useState<"tenant" | "landlord" | "admin">("tenant");

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
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
          <Layout role={role} onRoleChange={setRole}>
            <LandlordDashboard />
          </Layout>
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
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
