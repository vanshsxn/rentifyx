import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Lock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase puts type=recovery in URL hash on the redirect link
    const hash = window.location.hash;
    if (hash.includes("type=recovery") || hash.includes("access_token")) {
      setIsRecovery(true);
    }
    // Listen for the PASSWORD_RECOVERY auth event too
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setIsRecovery(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be 6+ characters");
    if (password !== confirm) return toast.error("Passwords do not match");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Password updated! Sign in with your new password.");
      await supabase.auth.signOut();
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <button onClick={() => navigate("/auth")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to login
        </button>
        <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Reset Password</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isRecovery ? "Enter your new password" : "Open this page from the recovery email link"}
            </p>
          </div>
          {isRecovery && (
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-border bg-background text-sm" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Confirm</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="password" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-border bg-background text-sm" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50">
                {loading ? "Updating…" : "Update Password"}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;