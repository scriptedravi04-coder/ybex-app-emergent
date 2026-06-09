/* eslint-disable */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../lib/api";
import {
  ArrowRight, IndianRupee, TrendingUp, Map, Shield, Search, Handshake, LineChart,
  Bell, Sparkles, Award, Trophy, Medal
} from "lucide-react";

const BRANDS = ["Nykaa","Noise","Meesho","Bewakoof","Wow Skin Science","Swiggy","Mamaearth","boAt","Moj","PhonePe","Lenskart","Zomato"];

export default function Landing() {
  const [stats, setStats] = useState({ creators: "140K+", cities: "500+", categories: "25+", collabs: "10K+" });

  useEffect(() => {
    api.get("/creators").then(({data}) => {
      // Optionally update verified counter using real data
      if (Array.isArray(data) && data.length) {
        setStats((s) => ({ ...s, creators: `${data.length}+ Demo · 140K+ Target` }));
      }
    }).catch(()=>{});
  }, []);

  return (
    <div className="text-white overflow-hidden" data-testid="landing-page">
      <Hero/>
      <StatsBar/>
      <WhatMakesUsDifferent/>
      <BrandsMarquee/>
      <PerformanceRankShowcase/>
      <HowItWorks/>
      <FinalCTA/>
    </div>
  );
}

/* ====================== HERO ====================== */
function Hero() {
  return (
    <section className="relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-[#7C5CFF]/20 blur-[120px]"></div>
        <div className="absolute top-60 left-1/4 w-[300px] h-[300px] rounded-full bg-[#7C5CFF]/15 blur-[100px]"></div>
        <div className="absolute top-40 right-1/4 w-[300px] h-[300px] rounded-full bg-[#9D7CFF]/10 blur-[100px]"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-20 md:pb-28 text-center">
        <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.5}} className="inline-block">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#7C5CFF]/10 border border-[#7C5CFF]/30 text-sm" data-testid="hero-live-pill">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-white/90">Live · 140K+ Creators Available Now</span>
          </span>
        </motion.div>

        <motion.h1 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.7, delay:0.1}} className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl mt-8 tracking-tighter leading-[1] whitespace-nowrap">
          India's Most Transparent
        </motion.h1>
        <motion.h1 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.7, delay:0.2}} className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl mt-3 tracking-tighter leading-[1] whitespace-nowrap">
          <span className="bg-gradient-to-r from-[#9D7CFF] via-[#B19CFF] to-[#7C5CFF] bg-clip-text text-transparent">Influencer Marketplace</span>
        </motion.h1>

        <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.4,duration:0.6}} className="mt-10 italic text-lg md:text-xl text-white/65">
          Know the Price, Trust the Data, Measure the Result.
        </motion.p>

        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.5,duration:0.5}} className="mt-10 flex flex-wrap gap-3 justify-center">
          <Link to="/explore" data-testid="hero-explore-cta" className="btn-secondary">Explore Creators</Link>
          <Link to="/signup" data-testid="hero-signup-cta" className="btn-primary">Get Started Free <ArrowRight size={16}/></Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ====================== STATS BAR ====================== */
function StatsBar() {
  const items = [
    { n: "140K+", l: "Verified Creators" },
    { n: "500+", l: "Cities Covered" },
    { n: "25+", l: "Categories" },
    { n: "10K+", l: "Brand Collaborations" },
  ];
  return (
    <section className="relative">
      <div className="border-y border-[#7C5CFF]/20 bg-[#7C5CFF]/[0.06] backdrop-blur" data-testid="stats-bar">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {items.map((s, i) => (
            <motion.div key={s.l} initial={{opacity:0,y:14}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.07, duration:0.4}}>
              <div className="font-display text-4xl md:text-5xl tracking-tighter">{s.n}</div>
              <div className="text-sm text-white/55 mt-1">{s.l}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ====================== WHAT MAKES YBEX DIFFERENT ====================== */
function WhatMakesUsDifferent() {
  const usps = [
    { num: "USP 01", color: "violet",  icon: <IndianRupee size={22}/>, t: "Rate Card Transparency",
      d: "Every creator's pricing is publicly visible — Reels, Stories, YouTube Videos. Know the cost before you connect. Zero negotiation surprises." },
    { num: "USP 02", color: "emerald", icon: <TrendingUp size={22}/>, t: "Verified Performance Data",
      d: "Real engagement scores, average views from the last 30 days, and AI-powered fake follower detection. Invest only where ROI is proven." },
    { num: "USP 03", color: "sky",     icon: <Map size={22}/>, t: "Bharat-First Creator Network",
      d: "Beyond Delhi and Mumbai — discover verified creators from Lucknow, Jaipur, Patna, Indore and 500+ cities across India." },
    { num: "USP 04", color: "amber",   icon: <Shield size={22}/>, t: "Performance Rank System",
      d: "After every campaign, each creator receives a score. A leaderboard ranks all collaborators. Your best performer gets an automatic re-collaboration alert." },
  ];
  const colors = {
    violet:  { bg: "bg-[#7C5CFF]/12 border-[#7C5CFF]/35", text: "text-[#9D7CFF]" },
    emerald: { bg: "bg-emerald-500/12 border-emerald-500/35", text: "text-emerald-400" },
    sky:     { bg: "bg-sky-500/12 border-sky-500/35", text: "text-sky-400" },
    amber:   { bg: "bg-amber-500/12 border-amber-500/35", text: "text-amber-400" },
  };

  return (
    <section className="max-w-6xl mx-auto px-6 md:px-10 py-24 md:py-28" data-testid="usps-section">
      <div className="text-center max-w-2xl mx-auto">
        <motion.h2 initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="font-display text-4xl md:text-6xl tracking-tighter">What Makes Ybex Different</motion.h2>
        <p className="mt-5 text-white/55">Four platform-exclusive features that no other Indian influencer marketplace offers.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-16">
        {usps.map((u, i) => {
          const c = colors[u.color];
          return (
            <motion.div key={u.num} initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.08}} className="card-dark min-h-[340px] flex flex-col" data-testid={`usp-${u.num.replace(/\s/g,'')}`}>
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${c.bg} ${c.text}`}>{u.icon}</div>
              <div className={`label-mini mt-7 ${c.text}`} style={{color: undefined}}><span className={c.text}>{u.num}</span></div>
              <h3 className="font-semibold text-lg mt-2 leading-snug">{u.t}</h3>
              <p className="text-sm text-white/55 mt-3 leading-relaxed">{u.d}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ====================== BRANDS MARQUEE ====================== */
function BrandsMarquee() {
  return (
    <section className="py-16 overflow-hidden border-t border-white/5" data-testid="brands-marquee">
      <p className="text-center label-mini text-white/40">Trusted by Brands Across India</p>
      <div className="mt-10 relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#07070B] to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#07070B] to-transparent z-10 pointer-events-none"></div>
        <div className="flex marquee-track w-max">
          {[...BRANDS, ...BRANDS, ...BRANDS].map((b, i) => (
            <span key={i} className="font-display text-2xl md:text-3xl mx-8 text-white/35 hover:text-white/80 transition-colors flex-shrink-0">{b}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ====================== PERFORMANCE RANK SHOWCASE ====================== */
function PerformanceRankShowcase() {
  const rows = [
    { rank: 1, name: "Priya Sharma", city: "Mumbai", promised: "50K", delivered: "73.2K", tier: "PLATINUM", score: 94, color: "from-[#7C5CFF]/35 to-[#5B3EE0]/35", border: "border-[#7C5CFF]/50", text: "text-[#B19CFF]" },
    { rank: 2, name: "Rohan Verma", city: "Bangalore", promised: "40K", delivered: "38.5K", tier: "GOLD", score: 79, color: "from-amber-500/25 to-orange-500/25", border: "border-amber-400/40", text: "text-amber-400" },
    { rank: 3, name: "Anjali Singh", city: "Delhi", promised: "80K", delivered: "61K", tier: "SILVER", score: 62, color: "from-slate-400/15 to-slate-500/15", border: "border-white/15", text: "text-white/70" },
  ];

  return (
    <section className="max-w-5xl mx-auto px-6 md:px-10 py-24" data-testid="performance-showcase">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs uppercase tracking-widest font-semibold">
          <Award size={14}/> Exclusive to Ybex — USP 04
        </span>
        <motion.h2 initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="font-display text-4xl md:text-6xl tracking-tighter mt-6">
          Performance Rank System
        </motion.h2>
        <p className="text-white/55 mt-5 max-w-xl mx-auto">After every campaign closes, each creator receives an objective score. A leaderboard ranks all collaborators by ROI delivered.</p>
      </div>

      <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="card-dark mt-14 p-0 overflow-hidden">
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-amber-400"/>
            <span className="font-semibold">Swiggy — Diwali Campaign Leaderboard</span>
          </div>
          <span className="text-xs text-white/45">5 Creators · Campaign Closed</span>
        </div>

        <div className="divide-y divide-white/5">
          {rows.map((r) => {
            const medalIcon = r.rank === 1 ? "🥇" : r.rank === 2 ? "🥈" : "🥉";
            return (
              <div key={r.rank} className={`px-6 py-5 grid grid-cols-12 items-center gap-3 ${r.rank===1 ? "bg-[#7C5CFF]/[0.06]" : ""}`}>
                <div className="col-span-1 text-2xl">{medalIcon}</div>
                <div className="col-span-5">
                  <div className="font-semibold">{r.name}</div>
                  <div className="text-xs text-white/45">{r.city}</div>
                </div>
                <div className="col-span-2 text-right">
                  <div className="text-xs text-white/45">Promised</div>
                  <div className="font-mono font-semibold">{r.promised} views</div>
                </div>
                <div className="col-span-2 text-right">
                  <div className="text-xs text-white/45">Delivered</div>
                  <div className={`font-mono font-semibold ${r.delivered >= r.promised ? "text-emerald-400" : "text-emerald-400"}`}>{r.delivered} views</div>
                </div>
                <div className="col-span-2 text-right">
                  <span className={`inline-block px-3 py-1.5 rounded-lg bg-gradient-to-r ${r.color} border ${r.border} ${r.text} text-xs font-bold tracking-wider`}>
                    {r.tier} · {r.score}/100
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      <motion.div initial={{opacity:0,y:14}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="mt-5 rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/5 p-5 md:p-6 flex items-start md:items-center gap-4 flex-col md:flex-row" data-testid="recollab-alert">
        <div className="text-3xl flex-shrink-0">🔔</div>
        <div className="flex-1">
          <div className="font-semibold text-emerald-400 mb-1">Automatic Re-Collaboration Alert</div>
          <p className="text-sm text-white/70">
            Priya Sharma scored 94/100 in the Swiggy campaign. Your ₹12,000 investment generated 73,200 views at ₹0.16 per view. She is your best performer — would you like to re-collaborate?
          </p>
        </div>
        <Link to="/leaderboard" data-testid="recollab-cta" className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm flex items-center gap-2 transition-colors flex-shrink-0">
          Re-Collaborate <ArrowRight size={14}/>
        </Link>
      </motion.div>
    </section>
  );
}

/* ====================== HOW IT WORKS ====================== */
function HowItWorks() {
  const steps = [
    { num: "STEP 01", color: "text-[#9D7CFF]", icon: <Search size={32}/>, t: "Discover Creators",
      d: "Use 24 smart filters — category, city, budget, engagement rate, and platform. Every creator's rate card is already visible before you connect." },
    { num: "STEP 02", color: "text-sky-400", icon: <Handshake size={32}/>, t: "Connect & Collaborate",
      d: "Send a connection request, request a quote, or post a campaign brief. Creators respond directly — no middlemen, zero hidden fees." },
    { num: "STEP 03", color: "text-emerald-400", icon: <LineChart size={32}/>, t: "Track ROI",
      d: "The Performance Rank System automatically scores every creator after a campaign. Your top performers receive instant re-collaboration suggestions." },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 md:px-10 py-24" data-testid="how-it-works">
      <div className="text-center">
        <motion.h2 initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="font-display text-4xl md:text-6xl tracking-tighter">How It Works</motion.h2>
        <p className="text-white/55 mt-5">Three steps to your first successful influencer collaboration.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
        {steps.map((s, i) => (
          <motion.div key={s.num} initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.1}} className="text-center px-4">
            <div className={`w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center ${s.color}`}>{s.icon}</div>
            <div className={`label-mini mt-6 ${s.color}`}>{s.num}</div>
            <h3 className="font-display text-2xl mt-2">{s.t}</h3>
            <p className="text-sm text-white/55 mt-4 leading-relaxed">{s.d}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ====================== FINAL CTA ====================== */
function FinalCTA() {
  return (
    <section className="max-w-5xl mx-auto px-6 md:px-10 pb-24">
      <div className="relative card-elevated p-10 md:p-16 text-center overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#7C5CFF]/25 blur-[120px] pointer-events-none"></div>
        <div className="relative">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#7C5CFF]/10 border border-[#7C5CFF]/30 text-sm">
            <Sparkles size={14} className="text-[#9D7CFF]"/> Ready to begin?
          </span>
          <h2 className="font-display text-4xl md:text-6xl mt-6 tracking-tighter">
            The most transparent way<br/>to <span className="bg-gradient-to-r from-[#9D7CFF] to-[#7C5CFF] bg-clip-text text-transparent">collaborate in India</span>
          </h2>
          <p className="mt-5 text-white/60 max-w-xl mx-auto">Public rate cards. Verified data. Performance-tracked ROI. Built for serious creators and serious brands.</p>
          <div className="mt-10 flex flex-wrap gap-3 justify-center">
            <Link to="/signup?role=creator" data-testid="final-creator-cta" className="btn-secondary">I'm a Creator</Link>
            <Link to="/signup?role=brand" data-testid="final-brand-cta" className="btn-primary">I'm a Brand <ArrowRight size={16}/></Link>
          </div>
        </div>
      </div>
    </section>
  );
}
