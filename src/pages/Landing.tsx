import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Search, Building2, Shield, Sparkles, TrendingUp, Lock } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    { icon: Search, title: "Smart Search", desc: "Filter by area, price, and more." },
    { icon: TrendingUp, title: "Budget Analyzer", desc: "40/30/30 income split calculator." },
    { icon: Lock, title: "Privacy First", desc: "Contact info revealed only on acceptance." },
    { icon: Shield, title: "Fraud Detection", desc: "AI-powered fraud scoring system." },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-2xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 text-primary text-xs font-medium border border-primary/10">
              <Sparkles className="w-3.5 h-3.5" /> Rental made simple
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
              Find Rent,<br />
              <span className="text-primary">Relax.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
              The minimalist platform for tenants, landlords, and administrators. Stress-free rental experience.
            </p>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <button
              onClick={() => navigate("/tenant")}
              className="flex items-center gap-2 px-6 py-3 rounded-lg gradient-primary text-primary-foreground text-sm font-semibold transition-all hover:opacity-90 shadow-elevated"
            >
              Browse Properties <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate("/landlord")}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-card border border-border text-foreground text-sm font-medium transition-all hover:bg-secondary card-shadow"
            >
              <Building2 className="w-4 h-4" /> Landlord Portal
            </button>
          </motion.div>
        </div>
      </div>

      {/* Features */}
      <motion.div
        className="container max-w-4xl mx-auto px-4 pb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="bg-card border border-border rounded-lg p-4 card-shadow text-center space-y-2">
                <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center mx-auto">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-xs text-muted-foreground tracking-wide">Made by MV Studios Japan.</p>
      </footer>
    </div>
  );
};

export default Landing;
