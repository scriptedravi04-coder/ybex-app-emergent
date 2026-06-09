import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../lib/api";
import CreatorCard from "../components/CreatorCard";
import { ArrowRight, Eye, BadgeCheck, Map, BarChart3, Sparkles, Star } from "lucide-react";

export default function Landing() {
  const [creators, setCreators] = useState([]);

  useEffect(() => {
    api.get("/creators?limit=8&sort_by=performance").then(({ data }) => setCreators(data)).catch(() => {});
  }, []);

  return (
    <div data-testid="landing-page">
      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-end">
          <div className="md:col-span-8">
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.7}}>
              <div className="label-mini flex items-center gap-2 mb-4"><span className="w-2 h-2 bg-[#E84A27] rounded-full inline-block animate-pulse"></span>India&apos;s Bharat Creator Network</div>
              <h1 className="font-display text-5xl sm:text-7xl md:text-[88px] leading-[0.95] tracking-tighter">
                Know the price.<br/>
                Trust the <span className="text-[#E84A27]">data</span>.<br/>
                Measure the result.
              </h1>
              <p className="mt-6 text-lg text-[#525252] max-w-xl">
                The most transparent influencer marketplace for Tier 2/3 India. Public rate cards, verified engagement, real ROI tracking — no more black-box pricing.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/signup" data-testid="cta-get-started" className="btn-primary">Get Started <ArrowRight size={18}/></Link>
                <Link to="/explore" data-testid="cta-explore" className="btn-secondary">Explore Creators</Link>
              </div>
            </motion.div>
          </div>
          <div className="md:col-span-4 hidden md:block">
            <motion.div initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} transition={{duration:0.7,delay:0.2}} className="bg-white border border-[#E5E5E5] rounded-3xl p-6">
              <div className="label-mini mb-2">Live · Today</div>
              <div className="stat-num text-[#E84A27]">2,847</div>
              <div className="text-sm text-[#525252] mt-1">Verified creators across 142 cities</div>
              <div className="divider my-5"></div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="label-mini">Avg ER</div>
                  <div className="font-display text-3xl">7.4%</div>
                </div>
                <div>
                  <div className="label-mini">Tier 2/3</div>
                  <div className="font-display text-3xl">68%</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* USP BENTO */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pb-20">
        <h2 className="font-display text-3xl md:text-5xl tracking-tight mb-10">Why brands switch to <span className="text-[#E84A27]">Ybex</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-5">
          {[
            { icon: <BadgeCheck/>, title: "Rate Card Transparency", desc: "Every creator's pricing is public. Filter by budget. Negotiate fairly.", span: "md:col-span-3", num: "01" },
            { icon: <BarChart3/>, title: "Verified Performance Data", desc: "Engagement rate, fake follower detection, avg views — auto-fetched.", span: "md:col-span-3", num: "02" },
            { icon: <Map/>, title: "Bharat Creators Focus", desc: "Tier 2/3 city creators. Regional languages. Authentic audiences.", span: "md:col-span-2", num: "03" },
            { icon: <BarChart3/>, title: "ROI Tracking + Rank", desc: "Post-campaign performance scores. Auto re-collab top performers.", span: "md:col-span-2", num: "04" },
            { icon: <Sparkles/>, title: "No Hidden Fees", desc: "Direct creator connect. Transparent margins.", span: "md:col-span-2", num: "05" },
          ].map((u, i) => (
            <motion.div key={u.num} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.08}} className={`${u.span} bg-white border border-[#E5E5E5] rounded-2xl p-8 hover:border-[#E84A27] transition-colors`}>
              <div className="flex items-start justify-between">
                <div className="text-[#E84A27]">{u.icon}</div>
                <div className="font-mono text-xs text-[#A3A3A3]">{u.num}</div>
              </div>
              <h3 className="font-display text-2xl mt-6">{u.title}</h3>
              <p className="text-sm text-[#525252] mt-2">{u.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURED CREATORS */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pb-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="label-mini">Top Performers</div>
            <h2 className="font-display text-3xl md:text-5xl mt-2">Featured Bharat creators</h2>
          </div>
          <Link to="/explore" data-testid="featured-see-all" className="text-sm font-semibold hover:text-[#E84A27] flex items-center gap-1">See all <ArrowRight size={16}/></Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {creators.slice(0, 8).map((c, i) => <CreatorCard key={c.user_id} c={c} index={i} />)}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-[#0A0A0A] text-white py-20 my-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <h2 className="font-display text-3xl md:text-5xl">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {[
              { n: "01", t: "Discover", d: "Filter 2,800+ creators across 25 categories by city, budget, language, engagement." },
              { n: "02", t: "Connect", d: "Wave → Negotiate → Lock the deal. Public rate cards. No middleman fees." },
              { n: "03", t: "Measure", d: "Performance score & ROI calculator post-campaign. Auto-rank top performers." },
            ].map((s) => (
              <div key={s.n} className="border-l-2 border-[#E84A27] pl-6">
                <div className="font-mono text-xs text-[#E84A27]">{s.n}</div>
                <h3 className="font-display text-3xl mt-2">{s.t}</h3>
                <p className="text-sm text-[#A3A3A3] mt-3">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pb-32">
        <div className="bg-[#E84A27] text-white rounded-3xl p-12 md:p-20">
          <h2 className="font-display text-4xl md:text-6xl leading-none">Ready to collab transparently?</h2>
          <p className="mt-4 text-lg opacity-90 max-w-xl">Join 2,800+ creators and 400+ brands building the future of Bharat influencer marketing.</p>
          <div className="mt-8 flex gap-3 flex-wrap">
            <Link to="/signup?role=brand" data-testid="cta-brand-signup" className="bg-white text-[#0A0A0A] px-6 py-3 font-semibold hover:bg-[#F7F5F2]">I&apos;m a Brand</Link>
            <Link to="/signup?role=creator" data-testid="cta-creator-signup" className="border border-white px-6 py-3 font-semibold hover:bg-white hover:text-[#E84A27]">I&apos;m a Creator</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
