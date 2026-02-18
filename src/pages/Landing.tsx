import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Search, Building2, Shield, Sparkles, TrendingUp, Lock, Star, MapPin } from "lucide-react";
const Landing = () => {
const navigate = useNavigate();
const propertyRef = useRef<HTMLDivElement>(null); 
const features = [
{ icon: Search, title: "Smart Search", desc: "Filter by area, price, and more." },
{ icon: TrendingUp, title: "Budget Analyzer", desc: "40/30/30 income split calculator." },
{ icon: Lock, title: "Privacy First", desc: "Contact info revealed only on acceptance." },
{ icon: Shield, title: "Fraud Detection", desc: "AI-powered fraud scoring system." },
];const demoProperties = [
{
id: 1,
title: "Vansh's PG",
location: "Indira Nagar, Near Metro",
price: "₹8,500",
rating: "4.8",
image: "https://i.pinimg.com/736x/20/ae/95/20ae95fbe2c97934e0d3a733b150a403.jpg",
tags: ["Wi-Fi", "Food"]
},
{
id: 2,
title: "HAHA PG RENT",
location: "Gomti Nagar, Fully Furnished",
price: "₹1,000",
rating: "4.5",
image: "https://th.bing.com/th/id/OIP.LHgJIlJhOTi0PDPo1VhAyQHaFj?o=7&cb=defcache2&rm=3&defcache=1&rs=1&pid=ImgDetMain&o=7&rm=3",
tags: ["AC", "Parking"]
},
{
id: 3,
title: "Anshuman's homes",
location: "Hazratganj, Shared Room",
price: "₹6,000",
rating: "4.2",
image: "https://tse1.mm.bing.net/th/id/OIP.ewl35_kvZqZzn5ttlL0qWQHaFj?cb=defcache2&defcache=1&rs=1&pid=ImgDetMain&o=7&rm=3",
tags: ["Cleaning"]
}];
function handleScroll() {
if (propertyRef.current) {
propertyRef.current.scrollIntoView({ behavior: "smooth" });
}}
return (
<div className="min-h-screen bg-background flex flex-col">
{/*the part which you are seeing is the hero section of my webiste*/}
<div className="pt-32 pb-20 flex items-center justify-center px-4">
<div className="text-center max-w-2xl mx-auto space-y-8">
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-4">
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
{/*changed the gap verion of expolore now*/}
<motion.div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-24" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
<button onClick={handleScroll} className="flex items-center gap-2 px-6 py-3 rounded-lg gradient-primary text-primary-foreground text-sm font-semibold transition-all hover:opacity-90 shadow-elevated">
Browse Properties <ArrowRight className="w-4 h-4" />
</button>
<button onClick={() => navigate("/landlord")} className="flex items-center gap-2 px-6 py-3 rounded-lg bg-card border border-border text-foreground text-sm font-medium transition-all hover:bg-secondary card-shadow">
<Building2 className="w-4 h-4" /> Landlord Portal
</button>
</motion.div>
</div>
</div>
{/*hello nice to see you */}
<motion.div className="container max-w-4xl mx-auto px-4 pb-20 mt-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
{features.map((item) => {
const Icon = item.icon;
return (
<div key={item.title} className="bg-card border border-border rounded-xl p-5 card-shadow text-center space-y-3 hover:border-primary/20 transition-colors">
<div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center mx-auto">
<Icon className="w-5 h-5 text-primary" />
</div>
<h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
<p className="text-[11px] text-muted-foreground leading-tight">{item.desc}</p>
</div>
);
})}
</div>
</motion.div>
<section ref={propertyRef} className="container max-w-6xl mx-auto px-4 py-16 space-y-10">
<div className="text-center space-y-2">
<h2 className="text-3xl font-bold tracking-tight">Featured Listings</h2>
<p className="text-muted-foreground">Hand-picked properties just for you</p>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
{demoProperties.map((p) => (
<motion.div key={p.id} whileHover={{ y: -5 }} className="bg-card border border-border rounded-2xl overflow-hidden card-shadow group">
<div className="relative h-48 overflow-hidden">
<img src={p.image} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
<div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-bold text-primary shadow-sm">
{p.price}/mo
</div>
</div>
<div className="p-5 space-y-3">
<div className="flex justify-between items-start">
<h3 className="font-bold text-lg">{p.title}</h3>
<div className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
<Star className="w-3 h-3 fill-current" /> {p.rating}
</div>
</div>
<div className="flex items-center gap-1 text-muted-foreground text-xs">
<MapPin className="w-3 h-3" /> {p.location}
</div>
<div className="flex gap-2 pt-1">
{p.tags.map(t => (
<span key={t} className="text-[10px] px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground font-medium">
{t}
</span>
))}
</div>
</div>
</motion.div>
))}
</div>
</section>
<footer className="py-10 border-t border-border mt-auto">
<p className="text-xs text-muted-foreground tracking-wide text-center">
© 2026 Made by MV Studios Japan.
</p>
</footer>
</div>
);
};
export default Landing;