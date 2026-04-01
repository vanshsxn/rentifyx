import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  User, Mail, Phone, Camera,
  ShieldCheck, CreditCard, Building, History,
  Save, Loader2, ArrowLeft, LogOut, MapPin
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ProfileDashboard = () => {
  const navigate = useNavigate();
  const { user, userRole, signOut } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [profile, setProfile] = useState({
    full_name: "",
    phone: "",
    email: "",
    avatar_url: "",
  });

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      setLoading(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (data) {
          setProfile({
            full_name: data.full_name || "",
            phone: data.phone || "",
            email: authUser.email || "",
            avatar_url: data.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.id}`,
          });
        }
      }
    } catch {
      toast.error("Error loading profile");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File too large (max 2MB)");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error("Upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    // Add cache buster
    const url = `${publicUrl}?t=${Date.now()}`;

    await supabase
      .from("profiles")
      .update({ avatar_url: url })
      .eq("id", user.id);

    setProfile(prev => ({ ...prev, avatar_url: url }));
    toast.success("Avatar updated!");
    setUploading(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { data: { user: authUser } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", authUser?.id);

    if (error) {
      toast.error("Update failed");
    } else {
      toast.success("Profile Updated", { description: "Your changes are now live." });
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    toast("Signed out successfully");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Initializing Identity...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-20">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarUpload}
        className="hidden"
      />

      {/* HEADER */}
      <div className="h-48 md:h-64 bg-gradient-to-br from-primary/20 via-background to-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <div className="max-w-4xl mx-auto px-4 md:px-6 pt-8 md:pt-12 relative z-10">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-background/50 backdrop-blur-md rounded-2xl hover:bg-background transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 md:px-6 -mt-24 md:-mt-32 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">

          {/* LEFT COLUMN: AVATAR CARD */}
          <div className="lg:col-span-4 space-y-4 md:space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border/50 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 text-center shadow-xl shadow-black/5"
            >
              <div className="relative inline-block group">
                <img
                  src={profile.avatar_url}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-[1.5rem] md:rounded-[2rem] object-cover ring-4 ring-background shadow-2xl"
                  alt="Avatar"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 p-2.5 md:p-3 bg-primary text-primary-foreground rounded-xl shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                </button>
              </div>
              <h2 className="mt-4 md:mt-6 text-lg md:text-xl font-black uppercase tracking-tighter italic leading-none">
                {profile.full_name || "New User"}
              </h2>
              <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-2">
                Verified {userRole}
              </p>

              <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-border/50 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-lg font-black italic">
                    {userRole === "landlord" ? "—" : "—"}
                  </p>
                  <p className="text-[8px] font-bold uppercase opacity-50">
                    {userRole === "landlord" ? "Properties" : "Leases"}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-black italic">—</p>
                  <p className="text-[8px] font-bold uppercase opacity-50">Rating</p>
                </div>
              </div>
            </motion.div>

            <button
              onClick={handleSignOut}
              className="w-full py-4 flex items-center justify-center gap-2 text-destructive bg-destructive/5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-destructive hover:text-destructive-foreground transition-all border border-destructive/10"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>

          {/* RIGHT COLUMN: SETTINGS FORM */}
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card border border-border/50 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-xl"
            >
              <div className="flex items-center justify-between mb-8 md:mb-10">
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic">Personal Info</h3>
                <ShieldCheck className="w-6 h-6 text-green-500" />
              </div>

              <form onSubmit={handleUpdate} className="space-y-6 md:space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase ml-2 opacity-50">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input
                        type="text"
                        className="w-full bg-secondary/30 border-none rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none min-h-[52px]"
                        value={profile.full_name}
                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase ml-2 opacity-50">Phone</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input
                        type="tel"
                        className="w-full bg-secondary/30 border-none rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none min-h-[52px]"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        placeholder="+91 00 000 000"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase ml-2 opacity-50">Email (Read-only)</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      className="w-full bg-secondary/10 border-none rounded-2xl py-4 pl-12 pr-6 text-sm font-bold opacity-50 cursor-not-allowed min-h-[52px]"
                      value={profile.email}
                      disabled
                    />
                  </div>
                </div>

                {/* Desktop save button */}
                <div className="hidden md:block pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full md:w-auto px-12 py-5 bg-foreground text-background rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-primary-foreground hover:scale-105 transition-all flex items-center justify-center gap-3"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Confirm Changes
                  </button>
                </div>
              </form>
            </motion.div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 mt-6 md:mt-8">
              <QuickAction icon={History} label="History" />
              <QuickAction icon={CreditCard} label="Payments" />
              <QuickAction icon={userRole === "landlord" ? Building : MapPin} label={userRole === "landlord" ? "Units" : "Area"} />
            </div>
          </div>
        </div>
      </main>

      {/* FLOATING SAVE BUTTON (Mobile only) */}
      <div className="fixed bottom-20 left-4 right-4 md:hidden z-50">
        <button
          onClick={handleUpdate}
          disabled={saving}
          className="w-full py-4 bg-foreground text-background rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>
    </div>
  );
};

const QuickAction = ({ icon: Icon, label }: { icon: any; label: string }) => (
  <button className="flex flex-col items-center justify-center p-4 md:p-6 bg-card border border-border/50 rounded-[1.5rem] md:rounded-[2rem] hover:border-primary/50 transition-all group">
    <div className="p-2.5 md:p-3 bg-secondary/50 rounded-xl group-hover:bg-primary/10 transition-colors">
      <Icon className="w-5 h-5 group-hover:text-primary transition-colors" />
    </div>
    <span className="mt-2 md:mt-3 text-[8px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

export default ProfileDashboard;
