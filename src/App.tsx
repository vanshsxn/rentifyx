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
import MobileNav from "@/components/MobileNav";
import { Loader2 } from "lucide-react";

// --- 1. ADD THIS LAZY IMPORT ---
const ProfileDashboard = lazy(() => import("@/pages/Profile")); 

const Landing = lazy(() => import("@/pages/Landing"));
const Properties = lazy(() => import("@/pages/Properties"));
const PropertyDetail = lazy(() => import("@/pages/PropertyDetail"));
const Furnished = lazy(() => import("@/pages/Furnished"));
const Shared = lazy(() => import("@/pages/Shared"));
const TenantDashboard = lazy(() => import("@/pages/TenantDashboard"));
const LandlordDashboard = lazy(() => import("@/pages/LandlordDashboard"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const Auth = lazy(() => import("@/pages/Auth"));
const Layout = lazy(() => import("@/components/Layout"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const NearMe = lazy(() => import("@/pages/NearMe"));

const queryClient = new QueryClient();

const CubeLoader = lazy(() => import("@/components/CubeLoader"));

const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
    <div className="cube-container-inline">
      <div className="cube-holder-inline"><div className="cube-box-inline" /></div>
      <div className="cube-holder-inline"><div className="cube-box-inline" /></div>
      <div className="cube-holder-inline"><div className="cube-box-inline" /></div>
    </div>
    <style>{`
      .cube-container-inline { transform-style:preserve-3d; perspective:2000px; transform:rotateX(-30deg) rotateY(-45deg); position:relative; width:3em; height:3em; }
      .cube-holder-inline { position:absolute; top:50%; left:50%; transform-style:preserve-3d; transform:translate3d(0,3em,1.5em); }
      .cube-holder-inline:last-child { transform:rotateY(-90deg) rotateX(90deg) translate3d(0,3em,1.5em); }
      .cube-holder-inline:first-child { transform:rotateZ(-90deg) rotateX(-90deg) translate3d(0,3em,1.5em); }
      .cube-holder-inline:nth-child(1) .cube-box-inline { background-color:#1FBCD3; }
      .cube-holder-inline:nth-child(1) .cube-box-inline::before { background-color:#0e8a9e; }
      .cube-holder-inline:nth-child(1) .cube-box-inline::after { background-color:#14a3b8; }
      .cube-holder-inline:nth-child(2) .cube-box-inline { background-color:#CBE2B4; }
      .cube-holder-inline:nth-child(2) .cube-box-inline::before { background-color:#9cc476; }
      .cube-holder-inline:nth-child(2) .cube-box-inline::after { background-color:#b3d395; }
      .cube-holder-inline:nth-child(3) .cube-box-inline { background-color:#F6B6CA; }
      .cube-holder-inline:nth-child(3) .cube-box-inline::before { background-color:#e87da0; }
      .cube-holder-inline:nth-child(3) .cube-box-inline::after { background-color:#ef99b5; }
      .cube-box-inline { position:absolute; top:50%; left:50%; transform-style:preserve-3d; animation:ani-cube-box-inline 6s infinite; width:3em; height:3em; }
      .cube-box-inline::before,.cube-box-inline::after { position:absolute; width:100%; height:100%; content:""; }
      .cube-box-inline::before { left:100%; bottom:0; transform:rotateY(90deg); transform-origin:0 50%; }
      .cube-box-inline::after { left:0; bottom:100%; transform:rotateX(90deg); transform-origin:0 100%; }
      @keyframes ani-cube-box-inline {
        8.33%{transform:translate3d(-50%,-50%,0) scaleZ(2)} 16.7%{transform:translate3d(-50%,-50%,-3em) scaleZ(1)} 25%{transform:translate3d(-50%,-100%,-3em) scaleY(2)} 33.3%{transform:translate3d(-50%,-150%,-3em) scaleY(1)} 41.7%{transform:translate3d(-100%,-150%,-3em) scaleX(2)} 50%{transform:translate3d(-150%,-150%,-3em) scaleX(1)} 58.3%{transform:translate3d(-150%,-150%,0) scaleZ(2)} 66.7%{transform:translate3d(-150%,-150%,0) scaleZ(1)} 75%{transform:translate3d(-150%,-100%,0) scaleY(2)} 83.3%{transform:translate3d(-150%,-50%,0) scaleY(1)} 91.7%{transform:translate3d(-100%,-50%,0) scaleX(2)} 100%{transform:translate3d(-50%,-50%,0) scaleX(1)}
      }
    `}</style>
    <p className="text-sm font-medium text-muted-foreground animate-pulse mt-8">Loading RentifyX...</p>
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
        <Route path="/furnished" element={<Furnished />} />
        <Route path="/shared" element={<Shared />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route path="/near-me" element={<NearMe />} />
        <Route path="/auth" element={<Auth />} />
        {/* --- 2. ADD THE PROFILE ROUTE HERE --- */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              {/* Wrapping in Layout keeps your sidebar/header consistent if needed */}
              <Layout role={role} onRoleChange={setRole}>
                <ProfileDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/tenant"
          element={
            <ProtectedRoute>
              <Layout role={role} onRoleChange={setRole}>
                <TenantDashboard />
              </Layout>
            </ProtectedRoute>
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
            <ProtectedRoute>
              <Layout role={role} onRoleChange={setRole}>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <MobileNav />
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