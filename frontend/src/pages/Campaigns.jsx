import React, { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

const CATEGORIES = ["Fashion","Beauty","Tech","Food","Travel","Fitness","Comedy","Lifestyle","Finance","Education","Music","Art","Parenting","Sports","Gaming","Spiritual","Automotive","Wellness","Books","Home Decor"];
const DELIVERABLES = ["Instagram Reel","Instagram Story","Instagram Post","YouTube Video","YouTube Shorts","Twitter Post","LinkedIn Post"];
const PLATFORMS = ["Instagram","YouTube","Twitter","LinkedIn"];

export default function Campaigns() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [campaigns, setCampaigns] = useState([]);
  const [showNew, setShowNew] = useState(params.get("new") === "true");
  const [filter, setFilter] = useState({ category: "", platform: "" });

  const [form, setForm] = useState({
    title: "", description: "", budget_min: 5000, budget_max: 25000,
    deliverables: [], categories: [], platforms: [], deadline: "", language: "Hindi"
  });

  const load = useCallback(() => {
    const p = new URLSearchParams();
    if (filter.category) p.set("category", filter.category);
    if (filter.platform) p.set("platform", filter.platform);
    api.get(`/campaigns?${p.toString()}`).then(({data}) => setCampaigns(data)).catch(()=>{});
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const toggle = useCallback((key, value) => {
    setForm((f) => ({ ...f, [key]: f[key].includes(value) ? f[key].filter(x=>x!==value) : [...f[key], value] }));
  }, []);

  const submitCampaign = async () => {
    if (!user) { toast.error("Login first"); return; }
    if (user.role !== "brand") { toast.error("Only brands can post campaigns"); return; }
    if (!form.title || !form.description) { toast.error("Title & description required"); return; }
    if (form.categories.length === 0 || form.deliverables.length === 0 || form.platforms.length === 0) { toast.error("Add at least 1 category, deliverable, platform"); return; }
    try {
      await api.post("/campaigns", form);
      toast.success("Campaign posted!");
      setShowNew(false);
      setParams({});
      setForm({ title: "", description: "", budget_min: 5000, budget_max: 25000, deliverables: [], categories: [], platforms: [], deadline: "", language: "Hindi" });
      load();
    } catch (e) { toast.error(e.response?.data?.detail || "Failed to post"); }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12" data-testid="campaigns-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-5xl tracking-tight">Campaign Marketplace</h1>
          <p className="text-white/70 mt-2">{campaigns.length} live campaigns · apply with your rate</p>
        </div>
        {user?.role === "brand" && (
          <button onClick={()=>setShowNew(true)} data-testid="new-campaign-btn" className="btn-primary"><Plus size={18}/> Post Campaign</button>
        )}
      </div>

      <div className="flex gap-3 mb-6">
        <select data-testid="campaign-filter-category" value={filter.category} onChange={(e)=>setFilter({...filter, category:e.target.value})} className="input-field max-w-[200px]"><option value="">All categories</option>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select>
        <select data-testid="campaign-filter-platform" value={filter.platform} onChange={(e)=>setFilter({...filter, platform:e.target.value})} className="input-field max-w-[200px]"><option value="">All platforms</option>{PLATFORMS.map(p=><option key={p}>{p}</option>)}</select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {campaigns.map((c) => (
          <Link to={`/campaigns/${c.campaign_id}`} key={c.campaign_id} className="bg-[#13131B] border border-white/10 rounded-2xl p-6 hover:border-[#7C5CFF] hover:-translate-y-1 transition-all" data-testid={`campaign-card-${c.campaign_id}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs px-2 py-1 bg-emerald-600/10 text-emerald-400 rounded-full font-semibold">LIVE</span>
              <span className="text-xs text-white/40">{(c.applicants||[]).length} applicants</span>
            </div>
            <h3 className="font-display text-2xl">{c.title}</h3>
            <p className="text-sm text-white/70 mt-2 line-clamp-2">{c.description}</p>
            <div className="mt-4 border-t border-white/10 pt-3">
              <div className="label-mini">Budget</div>
              <div className="font-display text-2xl">₹{(c.budget_min||0).toLocaleString("en-IN")} - ₹{(c.budget_max||0).toLocaleString("en-IN")}</div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(c.categories||[]).slice(0,3).map(cat => <span key={cat} className="text-xs px-2 py-0.5 rounded-full border border-white/10 text-white/70">{cat}</span>)}
            </div>
            <div className="text-xs text-white/40 mt-3">by {c.brand_name}</div>
          </Link>
        ))}
        {campaigns.length === 0 && <div className="md:col-span-3 text-center text-white/40 py-12">No campaigns yet</div>}
      </div>

      {/* New Campaign Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={()=>{setShowNew(false); setParams({});}}>
          <div onClick={(e)=>e.stopPropagation()} className="bg-[#13131B] rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto scroll-thin" data-testid="new-campaign-modal">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-3xl">Post a campaign</h2>
              <button onClick={()=>{setShowNew(false); setParams({});}}><X/></button>
            </div>
            <div className="space-y-4">
              <div><label className="label-mini block mb-1.5">Title</label><input data-testid="camp-title" value={form.title} onChange={(e)=>setForm({...form, title:e.target.value})} className="input-field" placeholder="Summer Collection Launch"/></div>
              <div><label className="label-mini block mb-1.5">Brief / Description</label><textarea data-testid="camp-desc" rows={4} value={form.description} onChange={(e)=>setForm({...form, description:e.target.value})} className="input-field" placeholder="Detailed campaign brief..."/></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label-mini block mb-1.5">Budget Min (₹)</label><input data-testid="camp-budget-min" type="number" value={form.budget_min} onChange={(e)=>setForm({...form, budget_min:parseInt(e.target.value||"0")})} className="input-field"/></div>
                <div><label className="label-mini block mb-1.5">Budget Max (₹)</label><input data-testid="camp-budget-max" type="number" value={form.budget_max} onChange={(e)=>setForm({...form, budget_max:parseInt(e.target.value||"0")})} className="input-field"/></div>
              </div>
              <div>
                <label className="label-mini block mb-2">Categories</label>
                <div className="flex flex-wrap gap-2">{CATEGORIES.map(c => <button key={c} type="button" onClick={()=>toggle("categories", c)} className={`px-3 py-1 text-xs border rounded-full ${form.categories.includes(c) ? "bg-white/10 text-white border-white/20" : "border-white/10 text-white/70"}`}>{c}</button>)}</div>
              </div>
              <div>
                <label className="label-mini block mb-2">Platforms</label>
                <div className="flex flex-wrap gap-2">{PLATFORMS.map(p => <button key={p} type="button" onClick={()=>toggle("platforms", p)} className={`px-3 py-1 text-xs border rounded-full ${form.platforms.includes(p) ? "bg-white/10 text-white border-white/20" : "border-white/10 text-white/70"}`}>{p}</button>)}</div>
              </div>
              <div>
                <label className="label-mini block mb-2">Deliverables</label>
                <div className="flex flex-wrap gap-2">{DELIVERABLES.map(d => <button key={d} type="button" onClick={()=>toggle("deliverables", d)} className={`px-3 py-1 text-xs border rounded-full ${form.deliverables.includes(d) ? "bg-white/10 text-white border-white/20" : "border-white/10 text-white/70"}`}>{d}</button>)}</div>
              </div>
              <button onClick={submitCampaign} data-testid="camp-submit" className="btn-primary w-full">Post Campaign</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
