import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { api } from "../lib/api";
import {
  ArrowRight, Users, Hexagon, Lightbulb, Search, Briefcase, Eye, Play,
  MessageCircle, Phone, ShieldCheck, Check, X, IndianRupee, PhoneCall,
  Sparkles, Hand, Lock, UserCheck, MapPin
} from "lucide-react";

const formatNum = (n) => {
  if (!n) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
};

const BRANDS = ["Decathlon","Oppo","Samsung","Flipkart","Adidas","Cult.fit","JSW","Myntra","Nykaa","boAt","Mamaearth","Lenskart","Zomato","Swiggy","Starbucks","Sugar","Plum"];

export default function Landing() {
  const [creators, setCreators] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  // Scroll-locked timeline activation
  const timelineRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 70%", "end 30%"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    // Map progress 0..1 → step 0..2
    const step = Math.min(2, Math.max(0, Math.floor(v * 3)));
    setActiveStep(step);
  });

  useEffect(() => {
    api.get("/creators?limit=12&sort_by=performance").then(({data}) => setCreators(data)).catch(()=>{});
  }, []);

  return (
    <div data-testid="landing-page" className="overflow-hidden text-white">
      {/* ====================== HERO ====================== */}
      <Hero/>

      {/* ====================== TIMELINE — Built for Serious Creators ====================== */}
      <section ref={timelineRef} className="relative max-w-6xl mx-auto px-6 md:px-10 py-24 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7">
            <motion.h2 initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.7}} className="font-display text-5xl md:text-7xl tracking-tighter leading-[0.95]">
              Built for<br/>
              <span className="bg-gradient-to-r from-white via-[#9D7CFF] to-white bg-clip-text text-transparent">Serious Creators</span>
            </motion.h2>

            <div className="mt-12 relative">
              <div className="timeline-line"></div>
              {[
                {icon:<Users size={20}/>, t:"For more than \"Campaigns\"", d:"Where long-term brand relationships start."},
                {icon:<Hexagon size={20}/>, t:"Beyond Your Existing Network", d:"Grow further than Brands who know you."},
                {icon:<Lightbulb size={20}/>, t:"Only Serious Business", d:"For creators who are beyond creation phase."},
              ].map((item, i) => (
                <div key={item.t} className={`timeline-item flex gap-5 py-5 ${activeStep===i?"active":""}`} onMouseEnter={()=>setActiveStep(i)}>
                  <div className="timeline-dot">{item.icon}</div>
                  <div className="timeline-content flex-1 pt-2">
                    <h3 className="text-xl md:text-2xl font-semibold">{item.t}</h3>
                    <p className="text-white/60 mt-1">{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Phone Mockup */}
          <div className="md:col-span-5">
            <PhoneMockup />
          </div>
        </div>
      </section>

      {/* ====================== STAT CARDS + CREATOR CAROUSEL ====================== */}
      <section className="relative max-w-7xl mx-auto px-4 md:px-10 py-24">
        <div className="flex gap-3 md:gap-5 justify-center mb-12 flex-wrap">
          <StatCard icon={<Search size={20}/>} num="2,592" label="Brands Searched"/>
          <StatCard icon={<Briefcase size={20}/>} num="45" label="Collab Interest" featured/>
          <StatCard icon={<Eye size={20}/>} num="118" label="Brands Viewed"/>
        </div>

        <CreatorCarousel creators={creators}/>

        <div className="text-center mt-16">
          <motion.h2 initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="font-display text-4xl md:text-5xl tracking-tighter">
            Find the right creators for your next brief.
          </motion.h2>
          <p className="mt-4 text-white/60 max-w-xl mx-auto">Connect directly with verified creators and take conversations forward on your terms.</p>
          <Link to="/explore" data-testid="see-how-cta" className="btn-primary mt-7"><Play size={14} className="fill-current"/> See How It Works <ArrowRight size={14}/></Link>
        </div>
      </section>

      {/* ====================== WHERE BRAND × CREATOR ====================== */}
      <section className="relative max-w-6xl mx-auto px-6 md:px-10 py-24">
        <motion.h2 initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center font-display text-4xl md:text-6xl tracking-tighter">
          Where brand <span className="text-[#9D7CFF] italic font-light">x</span> creator relationships begin.
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-16">
          <BigCard
            mockup={<BrandReachMockup/>}
            title={<>Brands reach<br/>creators daily<br/>on Ybex.</>}
            sub="Connection & collaborations start here."
          />
          <BigCard
            mockup={<ChatCallMockup/>}
            title={<>Chat. Call.<br/>Take collabs<br/>offline.</>}
            sub="However you prefer to talk."
          />
          <BigCard
            mockup={<CollabAcceptMockup/>}
            title={<>Creators<br/>choose who they<br/>work with.</>}
            sub="You stay in control of every collab."
          />
        </div>
      </section>

      {/* ====================== SERIOUS BRANDS ONLY ====================== */}
      <section className="relative max-w-6xl mx-auto px-6 md:px-10 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display text-5xl md:text-6xl tracking-tighter">Serious Brands. Only.</h2>
            <p className="mt-5 text-lg text-white/60 leading-relaxed">Shaped by brands, agencies and talent networks that collaborate with intention, & clarity.</p>
          </div>
          <BrandsCollage/>
        </div>
      </section>

      {/* ====================== MORE WAYS THE NETWORK WORKS ====================== */}
      <section className="relative max-w-6xl mx-auto px-6 md:px-10 py-24">
        <motion.h2 initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="font-display text-5xl md:text-6xl tracking-tighter max-w-3xl">
          More ways<br/>the network<br/>works for you.
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-16">
          <NetworkCard
            title="See who's interested"
            sub="Brand activity"
            mockup={<BrandActivityMockup/>}
          />
          <NetworkCard
            title="Start the conversation"
            sub="Wave first"
            mockup={<WaveMockup/>}
          />
          <NetworkCard
            title="Stay private or open"
            sub="Control visibility"
            mockup={<VisibilityMockup/>}
          />
          <NetworkCard
            title="Control your value"
            sub="Your terms"
            mockup={<BudgetMockup/>}
          />
          <NetworkCard
            title="Bring your manager"
            sub="Cowork instantly"
            mockup={<ManagerMockup/>}
          />
          <NetworkCard
            title="Verified by performance"
            sub="Public rank system"
            mockup={<PerformanceMockup/>}
          />
        </div>
      </section>

      {/* ====================== FINAL CTA ====================== */}
      <section className="relative max-w-5xl mx-auto px-6 md:px-10 py-24">
        <div className="card-elevated p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 violet-glow orb pointer-events-none"></div>
          <div className="relative">
            <span className="pill pill-violet"><Sparkles size={14}/> Ready to begin?</span>
            <h2 className="font-display text-4xl md:text-6xl mt-6 tracking-tighter">Join the<br/><span className="bg-gradient-to-r from-[#9D7CFF] to-white bg-clip-text text-transparent">Brand ⟷ Creator Network</span></h2>
            <p className="mt-5 text-white/60 text-lg max-w-xl mx-auto">Verified creators. Real campaigns. Long-term relationships. No middleman fees.</p>
            <div className="mt-10 flex flex-wrap gap-3 justify-center">
              <Link to="/signup?role=creator" data-testid="final-creator-cta" className="btn-secondary">I&apos;m a Creator</Link>
              <Link to="/signup?role=brand" data-testid="final-brand-cta" className="btn-primary">Get Ybex <ArrowRight size={16}/></Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* =================== HERO =================== */
function Hero() {
  return (
    <section className="relative bg-noise">
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] violet-glow opacity-50 pointer-events-none"></div>
      <div className="relative max-w-6xl mx-auto px-6 md:px-10 pt-16 pb-12 md:pt-24 md:pb-20 text-center">
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.6}}>
          <span className="pill pill-violet"><span className="live-dot"></span> Live · India&apos;s Brand ⟷ Creator Network</span>
        </motion.div>
        <motion.h1
          initial={{opacity:0,y:30}}
          animate={{opacity:1,y:0}}
          transition={{duration:0.8, delay:0.1}}
          className="font-display text-5xl sm:text-7xl md:text-[112px] mt-7 tracking-tighter leading-[0.92]"
        >
          The Brand <span className="text-[#9D7CFF] italic font-light text-4xl sm:text-6xl md:text-[80px]">⟷</span><br/>
          Creator Network.
        </motion.h1>
        <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.3,duration:0.6}} className="mt-8 text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
          Where serious creators meet serious brands. Public rate cards. Verified performance. Direct collabs. Bharat-first.
        </motion.p>

        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.5,duration:0.5}} className="mt-10 flex flex-wrap gap-3 justify-center">
          <Link to="/signup?role=creator" data-testid="hero-creator-cta" className="btn-secondary">I&apos;m a Creator</Link>
          <Link to="/signup?role=brand" data-testid="hero-brand-cta" className="btn-primary">Get Ybex <ArrowRight size={16}/></Link>
        </motion.div>

        <div className="mt-14 grid grid-cols-3 md:flex gap-4 md:gap-12 items-center justify-center text-sm text-white/70 max-w-3xl mx-auto">
          <Metric n="2,800+" label="Creators"/>
          <Metric n="500+" label="Brands"/>
          <Metric n="₹0" label="Hidden Fees"/>
        </div>
      </div>
    </section>
  );
}

const Metric = ({n, label}) => (
  <div className="text-center">
    <div className="font-display text-2xl md:text-3xl tracking-tight">{n}</div>
    <div className="text-xs uppercase tracking-widest text-white/40 mt-1">{label}</div>
  </div>
);

/* =================== PHONE MOCKUP =================== */
function PhoneMockup() {
  return (
    <motion.div initial={{opacity:0,scale:0.95}} whileInView={{opacity:1,scale:1}} viewport={{once:true}} transition={{duration:0.7}} className="relative mx-auto w-full max-w-[280px]">
      <div className="absolute -inset-8 violet-glow opacity-60 pointer-events-none"></div>
      <div className="relative aspect-[9/19] rounded-[2.5rem] p-3 bg-gradient-to-br from-[#1a1a28] to-[#0a0a0f] border border-white/10 shadow-2xl">
        <div className="w-full h-full rounded-[2rem] bg-gradient-to-br from-white via-[#E8E0FF] to-[#7C5CFF] flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full"></div>
          <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center">
            <Play size={14} className="text-[#7C5CFF] fill-current ml-0.5"/>
          </div>
          <div className="mt-auto mb-auto flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-[#7C5CFF] flex items-center justify-center font-display text-white text-2xl shadow-lg">Y</div>
            <h3 className="font-display text-2xl mt-3 text-[#1a1a2e]">ybex</h3>
            <p className="text-xs text-[#5B3EE0] font-medium mt-1">The Brand ⟷ Creator Network</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* =================== STAT CARD =================== */
function StatCard({icon, num, label, featured}) {
  return (
    <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className={`relative rounded-2xl p-5 min-w-[160px] ${featured ? "bg-gradient-to-br from-[#1a1a28] to-[#13131B] border border-[#7C5CFF]/40 shadow-lg shadow-violet-900/30" : "card-dark"}`}>
      <div className="icon-bubble" style={{width:"2.25rem",height:"2.25rem"}}>{icon}</div>
      <div className="font-display text-3xl mt-3">{num}</div>
      <div className="text-xs text-white/50 mt-1">{label}</div>
    </motion.div>
  );
}

/* =================== CREATOR CAROUSEL =================== */
function CreatorCarousel({ creators }) {
  if (!creators?.length) return <div className="h-64"></div>;
  // Center one card visually larger
  return (
    <div className="relative">
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 px-4 -mx-4" data-testid="creator-carousel">
        {creators.map((c, i) => {
          const isCenter = i === Math.floor(creators.length / 2);
          return (
            <Link key={c.user_id} to={`/creator/${c.user_id}`} className={`flex-shrink-0 ${isCenter ? "w-56" : "w-44"} transition-all duration-500`} data-testid={`carousel-${c.user_id}`}>
              <div className={`rounded-2xl overflow-hidden border ${isCenter ? "border-[#7C5CFF]/40 shadow-2xl shadow-violet-900/40 scale-105" : "border-white/10"} bg-[#13131B] hover:border-[#7C5CFF]/40 transition-all`}>
                <div className="aspect-[3/4] overflow-hidden bg-black">
                  <img src={c.photo || c.picture} alt={c.name} className="w-full h-full object-cover"/>
                </div>
                <div className="p-3">
                  <div className="font-semibold text-sm truncate">{c.name}</div>
                  <div className="text-xs text-white/40 mt-1 font-mono">📷 {formatNum(c.followers_instagram)} · ▶ {formatNum(c.followers_youtube)}</div>
                  <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60">{c.category}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* =================== BIG CARD (Where brand x creator) =================== */
function BigCard({ mockup, title, sub }) {
  return (
    <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.6}} className="relative rounded-3xl p-6 overflow-hidden bg-gradient-to-br from-[#3A2E7A] via-[#2A1F66] to-[#15103D] border border-white/10 min-h-[480px] flex flex-col">
      <div className="flex-1 min-h-[260px] flex items-center justify-center">{mockup}</div>
      <div className="mt-6">
        <h3 className="font-display text-3xl tracking-tight leading-tight">{title}</h3>
        <p className="text-sm text-white/60 mt-3">{sub}</p>
      </div>
    </motion.div>
  );
}

/* =================== BIG CARD MOCKUPS =================== */
function BrandReachMockup() {
  return (
    <div className="relative w-full">
      <div className="absolute -top-2 right-4 bg-white rounded-lg px-3 py-1.5 text-sm text-black flex items-center gap-1.5 shadow-lg">
        <Search size={12}/> Travel, Tech creators
      </div>
      <div className="flex items-center gap-2 mt-12">
        {[{c:"#FF5A5F",l:"airbnb"},{c:"#FF6F61",l:""},{c:"#E5E5E5",l:""},{c:"#F4D03F",l:""},{c:"#E74C3C",l:""}].map((s,i)=>(
          <div key={i} className={`w-12 h-12 rounded-full flex-shrink-0 ${i===0?"":""} border-2 border-white/20`} style={{background:s.c}}></div>
        ))}
      </div>
      <div className="mt-3 flex flex-col gap-2">
        <span className="text-xs bg-white text-black rounded px-2 py-1 self-start font-medium">Creator Manager</span>
        <span className="text-xs bg-white text-black rounded px-2 py-1 self-center font-medium ml-8">Influencer Manager</span>
      </div>
    </div>
  );
}

function ChatCallMockup() {
  return (
    <div className="relative w-full">
      <div className="bg-white rounded-lg px-3 py-1.5 text-sm text-[#5B3EE0] flex items-center gap-1.5 shadow-lg self-start inline-flex">
        <Phone size={12}/> Call directly
      </div>
      <div className="bg-black/40 rounded-2xl mt-4 p-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center">
            <span className="text-xs">😊</span>
          </div>
          <div className="text-xs text-white">
            <div className="font-semibold">Marketing Manager</div>
            <div className="text-white/60 font-mono">1.62M Followers</div>
          </div>
        </div>
      </div>
      <div className="mt-3 inline-flex items-center gap-1.5 bg-green-500 text-white text-xs px-2.5 py-1.5 rounded-lg font-medium">
        <MessageCircle size={12}/> Chat
      </div>
    </div>
  );
}

function CollabAcceptMockup() {
  return (
    <div className="w-full">
      <div className="bg-white rounded-xl p-3 text-black shadow-lg">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
          <div className="w-8 h-8 rounded-lg bg-orange-500"></div>
          <div className="text-xs">
            <div className="text-gray-500">Collab request from</div>
            <div className="font-semibold">Cultfit</div>
          </div>
        </div>
        <div className="text-xs mt-2 text-gray-600">
          <div className="font-medium mb-1">Requested for</div>
          <div>📷 1 Insta Reel (collab post)</div>
          <div>▶ 1 YT Shorts</div>
          <div>📷 1 LinkedIn post</div>
        </div>
        <div className="flex gap-2 mt-3">
          <button className="flex-1 bg-green-500 text-white text-xs py-1.5 rounded font-medium flex items-center justify-center gap-1"><Check size={12}/> Accept</button>
          <button className="flex-1 border border-gray-300 text-xs py-1.5 rounded font-medium flex items-center justify-center gap-1 text-gray-700"><X size={12}/> Ignore</button>
        </div>
      </div>
    </div>
  );
}

/* =================== BRANDS COLLAGE =================== */
function BrandsCollage() {
  const logos = ["Flipkart","JSW","Oppo","Samsung","Mamaearth","Nykaa","Myntra","boAt","Starbucks","Sugar"];
  return (
    <div className="relative h-80 transform rotate-3">
      <div className="absolute inset-0 grid grid-cols-3 gap-3">
        {logos.map((b, i) => (
          <motion.div key={b} initial={{opacity:0,scale:0.8}} whileInView={{opacity:1,scale:1}} viewport={{once:true}} transition={{delay:i*0.05}} className="aspect-square bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl flex items-center justify-center font-display text-xs md:text-sm text-white/90">{b}</motion.div>
        ))}
      </div>
    </div>
  );
}

/* =================== NETWORK CARD =================== */
function NetworkCard({ title, sub, mockup }) {
  return (
    <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="card-dark min-h-[280px] flex flex-col">
      <div className="flex-1 mb-5 min-h-[140px] flex items-center justify-center">{mockup}</div>
      <div className="pt-4 border-t border-white/10">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-white/50 mt-1">{sub}</p>
      </div>
    </motion.div>
  );
}

/* =================== NETWORK CARD MOCKUPS =================== */
function BrandActivityMockup() {
  return (
    <div className="w-full space-y-2 max-w-[240px]">
      {[{n:"Decathlon",r:"Senior marketer",t:"Viewed · 8m ago",c:"#0082C9"},{n:"Oppo",r:"Influencer manager",t:"Viewed · 12m",c:"#1AB300"},{n:"Cult fit",r:"",t:"",c:"#F88F00"}].map((b)=>(
        <div key={b.n} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10">
          <div className="w-7 h-7 rounded flex-shrink-0" style={{background:b.c}}></div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate">{b.n}</div>
            <div className="text-[10px] text-white/40 truncate">{b.r}{b.r&&b.t?" · ":""}{b.t}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function WaveMockup() {
  return (
    <div className="w-full max-w-[240px] space-y-3">
      <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10">
        <div className="w-9 h-9 rounded bg-gradient-to-br from-blue-500 to-cyan-400"></div>
        <div className="text-xs">
          <div className="font-semibold">Samsumg</div>
          <div className="text-white/50">Marketing manager</div>
        </div>
      </div>
      <div className="bg-[#7C5CFF]/20 border border-[#7C5CFF]/40 rounded-lg px-3 py-2 inline-flex items-center gap-2 text-sm">
        <Hand size={14} className="text-[#9D7CFF]"/> Waved at you
      </div>
    </div>
  );
}

function VisibilityMockup() {
  return (
    <div className="w-full max-w-[240px]">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-9 h-9 rounded bg-yellow-400 text-black flex items-center justify-center font-bold">F</div>
        <div className="text-xs"><div className="font-semibold">Flipkart</div><div className="text-white/50">Wants to connect with you</div></div>
      </div>
      <div className="flex items-center gap-3 text-xs">
        <span className="flex items-center gap-1 text-green-400"><Check size={14}/></span>
        <span className="flex items-center gap-1 text-red-400"><X size={14}/></span>
      </div>
    </div>
  );
}

function BudgetMockup() {
  return (
    <div className="w-full max-w-[240px] space-y-2">
      <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10">
        <div className="w-9 h-9 rounded bg-white/90 text-black flex items-center justify-center font-bold text-xs">a</div>
        <div className="text-xs flex-1">
          <div className="font-semibold">Adidas requested for</div>
          <div className="text-white/50">1 Insta reel (collab post)</div>
          <div className="text-white/50">1 YouTube shorts</div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 p-2 rounded-lg bg-white/5 border border-[#7C5CFF]/30">
        <IndianRupee size={14} className="text-[#9D7CFF]"/>
        <span className="text-xs text-white/70">Enter your budget</span>
      </div>
    </div>
  );
}

function ManagerMockup() {
  return (
    <div className="w-full max-w-[240px] space-y-2">
      <div className="text-xs font-semibold mb-1">Business calls</div>
      <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10">
        <div className="w-9 h-9 rounded-lg bg-[#7C5CFF] flex items-center justify-center"><PhoneCall size={16}/></div>
        <div className="text-xs">
          <div className="font-semibold flex items-center gap-1"><UserCheck size={11} className="text-green-400"/> My manager</div>
          <div className="text-white/50">Dhanush · 985xx xxxxx</div>
        </div>
      </div>
    </div>
  );
}

function PerformanceMockup() {
  return (
    <div className="w-full max-w-[240px] space-y-2">
      <div className="text-xs text-white/50 mb-1">Top Performer</div>
      <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-[#7C5CFF]/20 to-transparent border border-[#7C5CFF]/30">
        <div className="font-display text-3xl text-[#9D7CFF]">94</div>
        <div className="text-xs">
          <div className="font-semibold">Performance Score</div>
          <div className="text-white/50">Top 6% in Tech category</div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-[10px] text-white/40 font-mono">
        <span>ER: 8.4%</span>
        <span>·</span>
        <span>Fake: 3.2%</span>
      </div>
    </div>
  );
}
