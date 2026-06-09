import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { CheckCircle2, MapPin, Instagram, Youtube, Sparkles, ArrowLeft, TrendingUp, Eye } from "lucide-react";

const formatNum = (n) => {
  if (!n) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(0) + "K";
  return String(n);
};

export default function CreatorProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [c, setC] = useState(null);
  const [collabOpen, setCollabOpen] = useState(false);
  const [collab, setCollab] = useState({ deliverable: "Instagram Reel", proposed_amount: 0, message: "" });

  useEffect(() => {
    api.get(`/creators/${id}`).then(({data}) => setC(data)).catch(()=>setC(null));
  }, [id]);

  if (!c) return <div className="max-w-7xl mx-auto px-6 py-16">Loading...</div>;

  const totalFollowers = (c.followers_instagram || 0) + (c.followers_youtube || 0);

  const wave = async () => {
    if (!user) { toast.error("Login to wave"); return; }
    try { await api.post("/collabs/wave", { creator_id: c.user_id, message: "Hey, would love to collab!" }); toast.success("Wave sent!"); }
    catch(e){ toast.error("Failed"); }
  };

  const sendCollab = async () => {
    if (!user) { toast.error("Login first"); return; }
    if (!collab.proposed_amount || collab.proposed_amount < 100) { toast.error("Enter valid amount"); return; }
    try {
      await api.post("/collabs/request", { creator_id: c.user_id, ...collab });
      toast.success("Collab request sent!");
      setCollabOpen(false);
    } catch (e) { toast.error("Failed"); }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12" data-testid="creator-profile">
      <Link to="/explore" className="text-sm text-white/70 hover:text-[#9D7CFF] flex items-center gap-1 mb-6"><ArrowLeft size={14}/> Back to explore</Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Photo + Actions */}
        <aside className="md:sticky md:top-20 md:self-start space-y-5">
          <div className="aspect-square overflow-hidden rounded-2xl bg-[#13131B] border border-white/10">
            <img src={c.photo || c.picture} alt={c.name} className="w-full h-full object-cover"/>
          </div>
          <div className="flex gap-2">
            <button onClick={wave} data-testid="wave-btn" className="btn-secondary flex-1">Wave 👋</button>
            <button onClick={()=>setCollabOpen(true)} data-testid="collab-btn" className="btn-primary flex-1">Collab</button>
          </div>
          {user && user.user_id !== c.user_id && (
            <Link to={`/chat/${c.user_id}`} data-testid="chat-btn" className="btn-secondary w-full text-sm">💬 Message</Link>
          )}
          <div className="bg-[#13131B] border border-white/10 rounded-2xl p-5">
            <h3 className="label-mini mb-3">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Total Reach" value={formatNum(totalFollowers)}/>
              <Stat label="Profile Views" value={formatNum(c.profile_views || 0)} icon={<Eye size={12}/>}/>
              <Stat label="Avg Views" value={formatNum(c.avg_views_30d || 0)}/>
              <Stat label="Past Brands" value={(c.past_brands||[]).length}/>
            </div>
          </div>
        </aside>

        {/* Right: Details */}
        <main className="md:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-display text-5xl tracking-tighter">{c.name}</h1>
              <CheckCircle2 className="text-emerald-400" size={28}/>
              {c.performance_score >= 85 && <span className="bg-emerald-600 text-white text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1"><TrendingUp size={11}/> Top {Math.max(1,100-c.performance_score)}%</span>}
            </div>
            <p className="text-white/70 flex items-center gap-1.5"><MapPin size={14}/> {c.city}, {c.state}</p>
            <p className="mt-4 text-lg text-white">{c.bio}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Tag>{c.category}</Tag>
            <Tag>{c.creator_type}</Tag>
            {(c.languages||[]).map(l=><Tag key={l}>{l}</Tag>)}
            <Tag>{c.barter?.replace("_"," ")}</Tag>
          </div>

          {/* Performance Cards */}
          <div className="grid grid-cols-3 gap-4">
            <PerfCard label="Engagement Rate" value={`${c.engagement_rate}%`} accent/>
            <PerfCard label="Performance Score" value={c.performance_score}/>
            <PerfCard label="Fake Followers" value={`${c.fake_follower_pct}%`}/>
          </div>

          {/* Rate Card */}
          <div className="bg-[#13131B] border border-white/10 rounded-2xl p-6" data-testid="rate-card">
            <h2 className="font-display text-2xl mb-1">Public Rate Card</h2>
            <p className="text-xs text-white/40 mb-5">All prices transparent. No hidden fees.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Object.entries(c.rate_card || {}).map(([k, v]) => (
                <div key={k} className="border border-white/10 p-4 rounded-xl">
                  <div className="label-mini">{k.replace("_"," ")}</div>
                  <div className="font-display text-3xl mt-1">₹{v?.toLocaleString("en-IN")}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-[#13131B] border border-white/10 rounded-2xl p-6">
            <h2 className="font-display text-2xl mb-4">Social Channels</h2>
            <div className="grid grid-cols-2 gap-4">
              <SocialRow icon={<Instagram size={18}/>} handle={c.instagram} followers={c.followers_instagram}/>
              <SocialRow icon={<Youtube size={18}/>} handle={c.youtube} followers={c.followers_youtube}/>
            </div>
          </div>

          {/* Past Brands */}
          {(c.past_brands||[]).length > 0 && (
            <div className="bg-[#13131B] border border-white/10 rounded-2xl p-6">
              <h2 className="font-display text-2xl mb-3">Worked with</h2>
              <div className="flex flex-wrap gap-2">
                {c.past_brands.map((b) => <span key={b} className="px-4 py-2 bg-[#13131B]/5 rounded-full text-sm font-medium">{b}</span>)}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Collab Modal */}
      {collabOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={()=>setCollabOpen(false)}>
          <div onClick={(e)=>e.stopPropagation()} className="bg-[#13131B] rounded-2xl p-8 max-w-md w-full" data-testid="collab-modal">
            <h2 className="font-display text-3xl mb-4">Send collab request</h2>
            <div className="space-y-4">
              <div>
                <label className="label-mini block mb-1.5">Deliverable</label>
                <select value={collab.deliverable} onChange={(e)=>setCollab({...collab, deliverable:e.target.value})} className="input-field">
                  {Object.keys(c.rate_card||{}).map(k=><option key={k} value={k}>{k.replace("_"," ")}</option>)}
                </select>
              </div>
              <div>
                <label className="label-mini block mb-1.5">Your Offer (₹)</label>
                <input data-testid="collab-amount" type="number" value={collab.proposed_amount} onChange={(e)=>setCollab({...collab, proposed_amount:parseInt(e.target.value||"0")})} className="input-field" placeholder={`Listed: ₹${(c.rate_card||{})[collab.deliverable]||0}`}/>
              </div>
              <div>
                <label className="label-mini block mb-1.5">Brief Message</label>
                <textarea data-testid="collab-message" rows={3} value={collab.message} onChange={(e)=>setCollab({...collab, message:e.target.value})} className="input-field" placeholder="Tell them about your campaign..."/>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>setCollabOpen(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={sendCollab} data-testid="send-collab" className="btn-primary flex-1">Send Request</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const Tag = ({ children }) => <span className="px-3 py-1 text-xs rounded-full border border-white/10 text-white/70">{children}</span>;
const Stat = ({ label, value, icon }) => (<div><div className="label-mini flex items-center gap-1">{icon}{label}</div><div className="font-display text-2xl mt-0.5">{value}</div></div>);
const PerfCard = ({ label, value, accent }) => (<div className={`p-5 rounded-2xl border ${accent ? "bg-white/10 text-white border-white/20" : "bg-[#13131B] border-white/10"}`}><div className="label-mini opacity-80">{label}</div><div className="font-display text-4xl mt-1">{value}</div></div>);
const SocialRow = ({ icon, handle, followers }) => (<div className="flex items-center gap-3"><div className="text-white/70">{icon}</div><div><div className="text-sm font-medium">{handle || "—"}</div><div className="text-xs text-white/40">{formatNum(followers)} followers</div></div></div>);
