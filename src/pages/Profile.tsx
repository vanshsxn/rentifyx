import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  User, Mail, Phone, MapPin, Camera, 
  ShieldCheck, CreditCard, Building, History, 
  Save, Loader2, ArrowLeft, LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ProfileDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userRole, setUserRole] = useState<"landlord" | "tenant">("tenant");
  
  // Form State
  const [profile, setProfile] = useState({
    full_name: "",
    phone: "",
    email: "",
    avatar_url: "",
    bio: "",
    location: "Tokyo, Japan"
  });

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (data) {
          setProfile({
            full_name: data.full_name || "",
            phone: data.phone || "",
            email: user.email || "",
            avatar_url: data.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
            bio: data.bio || "",
            location: data.location || "Tokyo, Japan"
          });
          setUserRole(data.role || "tenant");
        }
      }
    } catch (error) {
      toast.error("Error loading profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        bio: profile.bio,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user?.id);

    if (error) {
      toast.error("Update failed");
    } else {
      toast.success("Profile Updated", { description: "Your changes are now live." });
    }
    setSaving(false);
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
    <div className="min-h-screen bg-background pb-20">
      {/* GLOSSY HEADER */}
      <div className="h-64 bg-gradient-to-br from-primary/20 via-background to-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <div className="max-w-4xl mx-auto px-6 pt-12 relative z-10">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 bg-background/50 backdrop-blur-md rounded-2xl hover:bg-background transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 -mt-32 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: AVATAR CARD */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border/50 rounded-[2.5rem] p-8 text-center shadow-xl shadow-black/5"
            >
              <div className="relative inline-block group">
                <img 
                  src={profile.avatar_url} 
                  className="w-32 h-32 rounded-[2rem] object-cover ring-4 ring-background shadow-2xl" 
                  alt="Avatar"
                />
                <button className="absolute bottom-0 right-0 p-3 bg-primary text-white rounded-xl shadow-lg hover:scale-110 transition-transform">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <h2 className="mt-6 text-xl font-black uppercase tracking-tighter italic leading-none">
                {profile.full_name || "New User"}
              </h2>
              <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-2">
                Verified {userRole}
              </p>
              
              <div className="mt-8 pt-8 border-t border-border/50 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-lg font-black italic">
                    {userRole === "landlord" ? "12" : "2"}
                  </p>
                  <p className="text-[8px] font-bold uppercase opacity-50">
                    {userRole === "landlord" ? "Properties" : "Leases"}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-black italic">4.9</p>
                  <p className="text-[8px] font-bold uppercase opacity-50">Rating</p>
                </div>
              </div>
            </motion.div>

            <button className="w-full py-4 flex items-center justify-center gap-2 text-red-500 bg-red-500/5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-500/10">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>

          {/* RIGHT COLUMN: SETTINGS FORM */}
          <div className="lg:col-span-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }}
              className="bg-card border border-border/50 rounded-[2.5rem] p-10 shadow-xl"
            >
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-black uppercase tracking-tighter italic">Personal Info</h3>
                <ShieldCheck className="w-6 h-6 text-green-500" />
              </div>

              <form onSubmit={handleUpdate} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase ml-2 opacity-50">Full Identity</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input 
                        type="text" 
                        className="w-full bg-secondary/30 border-none rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                        value={profile.full_name}
                        onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase ml-2 opacity-50">Verified Phone</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input 
                        type="tel" 
                        className="w-full bg-secondary/30 border-none rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                        value={profile.phone}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                        placeholder="+81 00 000 000"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase ml-2 opacity-50">Email Address (Read-only)</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="email" 
                      className="w-full bg-secondary/10 border-none rounded-2xl py-4 pl-12 pr-6 text-sm font-bold opacity-50 cursor-not-allowed"
                      value={profile.email}
                      disabled
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase ml-2 opacity-50">Short Bio</label>
                  <textarea 
                    rows={4}
                    className="w-full bg-secondary/30 border-none rounded-[1.5rem] p-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                    value={profile.bio}
                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="w-full md:w-auto px-12 py-5 bg-foreground text-background rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-white hover:scale-105 transition-all flex items-center justify-center gap-3"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Confirm Changes
                  </button>
                </div>
              </form>
            </motion.div>

            {/* QUICK ACTIONS SECTION */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8">
              <QuickAction icon={History} label="History" />
              <QuickAction icon={CreditCard} label="Payments" />
              <QuickAction icon={userRole === "landlord" ? Building : MapPin} label={userRole === "landlord" ? "Units" : "Area"} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const QuickAction = ({ icon: Icon, label }: { icon: any, label: string }) => (
  <button className="flex flex-col items-center justify-center p-6 bg-card border border-border/50 rounded-[2rem] hover:border-primary/50 transition-all group">
    <div className="p-3 bg-secondary/50 rounded-xl group-hover:bg-primary/10 transition-colors">
      <Icon className="w-5 h-5 group-hover:text-primary transition-colors" />
    </div>
    <span className="mt-3 text-[8px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

export default ProfileDashboard;