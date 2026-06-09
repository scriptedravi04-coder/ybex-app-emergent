import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { ArrowLeft, Send } from "lucide-react";

export default function CampaignDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [c, setC] = useState(null);
  const [pitch, setPitch] = useState("");
  const [amount, setAmount] = useState(0);
  const [applying, setApplying] = useState(false);

  const load = () => api.get(`/campaigns/${id}`).then(({data})=>setC(data)).catch(()=>setC(null));
  useEffect(()=>{ load(); }, [id]);

  const apply = async () => {
    if (!user) { toast.error("Login first"); return; }
    if (user.role !== "creator") { toast.error("Only creators can apply"); return; }
    if (!amount || amount < 100) { toast.error("Enter valid amount"); return; }
    setApplying(true);
    try {
      await api.post("/campaigns/apply", { campaign_id: id, proposed_amount: amount, pitch });
      toast.success("Application sent!");
      setPitch(""); setAmount(0);
      load();
    } catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
    finally { setApplying(false); }
  };

  if (!c) return <div className="max-w-7xl mx-auto px-6 py-16">Loading...</div>;

  const isOwner = user?.user_id === c.brand_user_id;

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-12 py-12" data-testid="campaign-detail">
      <Link to="/campaigns" className="text-sm text-white/70 hover:text-[#9D7CFF] flex items-center gap-1 mb-6"><ArrowLeft size={14}/> Back to campaigns</Link>

      <div className="bg-[#13131B] border border-white/10 rounded-2xl p-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs px-2 py-1 bg-emerald-600/10 text-emerald-400 rounded-full font-semibold">LIVE CAMPAIGN</span>
          <span className="text-xs text-white/40">by {c.brand_name}</span>
        </div>
        <h1 className="font-display text-5xl tracking-tight">{c.title}</h1>
        <p className="text-lg text-white/70 mt-4 whitespace-pre-line">{c.description}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 border-t border-white/10 pt-6">
          <div><div className="label-mini">Budget Range</div><div className="font-display text-2xl">₹{(c.budget_min||0).toLocaleString("en-IN")}–₹{(c.budget_max||0).toLocaleString("en-IN")}</div></div>
          <div><div className="label-mini">Platforms</div><div className="font-medium mt-1">{(c.platforms||[]).join(", ")}</div></div>
          <div><div className="label-mini">Categories</div><div className="font-medium mt-1">{(c.categories||[]).join(", ")}</div></div>
          <div><div className="label-mini">Language</div><div className="font-medium mt-1">{c.language}</div></div>
        </div>

        <div className="mt-6">
          <div className="label-mini mb-2">Deliverables</div>
          <div className="flex flex-wrap gap-2">{(c.deliverables||[]).map(d => <span key={d} className="px-3 py-1 bg-[#13131B]/5 text-sm rounded-full">{d}</span>)}</div>
        </div>
      </div>

      {/* Apply / Applicants */}
      {!isOwner && user?.role === "creator" && (
        <div className="bg-[#13131B] border border-white/10 rounded-2xl p-8 mt-6" data-testid="apply-section">
          <h2 className="font-display text-2xl mb-4">Apply with your proposal</h2>
          <div className="space-y-4">
            <div><label className="label-mini block mb-1.5">Your Quote (₹)</label><input data-testid="apply-amount" type="number" value={amount} onChange={(e)=>setAmount(parseInt(e.target.value||"0"))} className="input-field" placeholder="e.g. 15000"/></div>
            <div><label className="label-mini block mb-1.5">Pitch / Why you?</label><textarea data-testid="apply-pitch" rows={4} value={pitch} onChange={(e)=>setPitch(e.target.value)} className="input-field" placeholder="Tell the brand why you're the right fit..."/></div>
            <button onClick={apply} disabled={applying} data-testid="apply-submit" className="btn-primary"><Send size={16}/> {applying ? "Sending..." : "Submit Proposal"}</button>
          </div>
        </div>
      )}

      {isOwner && (
        <div className="bg-[#13131B] border border-white/10 rounded-2xl p-8 mt-6">
          <h2 className="font-display text-2xl mb-4">Proposals ({(c.applicants||[]).length})</h2>
          <div className="space-y-3" data-testid="applicants-list">
            {(c.applicants||[]).length === 0 && <div className="text-sm text-white/40">No applications yet.</div>}
            {(c.applicants||[]).map((a) => (
              <div key={a.application_id} className="p-4 border border-white/10 rounded-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-display text-lg">{a.creator_name}</div>
                    <p className="text-sm text-white/70 mt-1">{a.pitch}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-2xl">₹{(a.proposed_amount||0).toLocaleString("en-IN")}</div>
                    <span className="text-xs px-2 py-1 bg-[#F59E0B]/10 text-[#F59E0B] rounded-full">{a.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
