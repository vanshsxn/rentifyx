import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"landlord" | "tenant">("tenant");
  const navigate = useNavigate();
  const { user } = useAuth();

  const MASTER_ADMIN_EMAIL = "vanshsxn2006@gmail.com";

  useEffect(() => {
    if (user) {
      checkRoleAndRedirect(user.id, user.email);
    }
  }, [user]);

  const checkRoleAndRedirect = async (userId: string, userEmail?: string) => {
    if (userEmail === MASTER_ADMIN_EMAIL) {
      navigate("/admin", { replace: true });
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (!roleData) {
      navigate(selectedRole === "landlord" ? "/landlord" : "/tenant", { replace: true });
      return;
    }

    if (roleData.role === "admin") navigate("/admin", { replace: true });
    else if (roleData.role === "landlord") navigate("/landlord", { replace: true });
    else navigate("/tenant", { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error("Login failed", { description: error.message });
      } else if (data.user) {
        toast.success("Welcome back!");
        await checkRoleAndRedirect(data.user.id, data.user.email);
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            role: email === MASTER_ADMIN_EMAIL ? "admin" : selectedRole,
            full_name: email.split("@")[0],
          },
        },
      });

      if (error) {
        toast.error("Signup failed", { description: error.message });
      } else if (data.user) {
        // Insert role into user_roles table
        const role = email === MASTER_ADMIN_EMAIL ? "admin" : selectedRole;
        await supabase.from("user_roles").upsert({
          user_id: data.user.id,
          role: role,
        });

        toast.success("Account created! Redirecting...");
        setTimeout(() => {
          navigate(selectedRole === "landlord" ? "/landlord" : "/tenant", { replace: true });
        }, 1500);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to home
        </button>

        <div className="bg-card border border-border rounded-2xl p-8 card-shadow space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-foreground">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Sign in to RentifyX" : "Join the rental community"}
            </p>
          </div>

          {!isLogin && (
            <div className="flex gap-2 p-1 bg-secondary/50 rounded-xl">
              {(["tenant", "landlord"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedRole(r)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedRole === r
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r === "tenant" ? "🏠 Tenant" : "🏢 Landlord"}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vansh@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              {loading ? "Processing..." : isLogin ? "Sign In" : "Sign Up"}
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin ? "Need an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>
        </div>
        <p className="text-center text-[10px] text-muted-foreground mt-8 uppercase tracking-widest opacity-50">
          © 2026 Made by MV Studios Japan
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
