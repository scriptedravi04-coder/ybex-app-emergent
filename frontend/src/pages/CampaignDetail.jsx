import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { ArrowLeft, Send, BarChart3, X } from "lucide-react";

export default function CampaignDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [c, setC] = useState(null);
  const [pitch, setPitch] = useState("");
  const [amount, setAmount] = useState(0);
  const [applying, setApplying] = useState(false);
  const [roiOpen, setRoiOpen] = useState(false);
  const [roiForm, setRoiForm] = useState({ actual_views: 0, actual_engagement_rate: 5, on_time: true, content_quality: 4, brand_rating: 4 });
  const [roiResult, setRoiResult] = useState(null);

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
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl">Proposals ({(c.applicants||[]).length})</h2>
            {c.status !== "closed" && (
              <button onClick={()=>setRoiOpen(true)} data-testid="close-campaign-btn" className="btn-primary text-sm" style={{padding:"0.5rem 1rem"}}><BarChart3 size={14}/> Close & Score</button>
            )}
            {c.status === "closed" && c.performance && (
              <span className="pill pill-violet">Closed · Score {c.performance.performance_score}</span>
            )}
          </div>
          <div className="space-y-3" data-testid="applicants-list">
            {(c.applicants||[]).length === 0 && <div className="text-sm text-white/40">No applications yet.</div>}
            {(c.applicants||[]).map((a) => (
              <div key={a.application_id} className="p-4 border border-white/10 rounded-xl flex items-start gap-3">
                {a.creator_photo && <img src={a.creator_photo} alt="" className="w-12 h-12 rounded-lg object-cover"/>}
                <div className="flex-1">
                  <div className="font-display text-lg">{a.creator_name}</div>
                  <p className="text-sm text-white/70 mt-1">{a.pitch}</p>
                </div>
                <div className="text-right">
                  <div className="font-display text-2xl">₹{(a.proposed_amount||0).toLocaleString("en-IN")}</div>
                  <span className={`text-xs px-2 py-1 rounded-full ${a.status==="accepted"?"bg-emerald-600/20 text-emerald-400":"bg-yellow-500/10 text-yellow-400"}`}>{a.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ROI Close Modal */}
      {roiOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={()=>setRoiOpen(false)}>
          <div onClick={(e)=>e.stopPropagation()} className="bg-[#13131B] border border-white/10 rounded-2xl p-8 max-w-md w-full" data-testid="roi-modal">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl">Close Campaign & Score</h2>
              <button onClick={()=>setRoiOpen(false)}><X size={18}/></button>
            </div>
            {roiResult ? (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <div className="label-mini">Performance Score</div>
                  <div className="font-display text-7xl text-[#9D7CFF] mt-2">{roiResult.performance_score}</div>
                  <div className="text-sm text-white/60">/100</div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Stat label="Paid" value={`₹${roiResult.paid.toLocaleString("en-IN")}`}/>
                  <Stat label="Views Delivered" value={roiResult.actual_views.toLocaleString("en-IN")}/>
                  <Stat label="CPV (Cost per View)" value={`₹${roiResult.cpv}`}/>
                  <Stat label="ROI Score" value={roiResult.roi_score}/>
                </div>
                <button onClick={()=>{setRoiOpen(false); load();}} className="btn-primary w-full">Done</button>
              </div>
            ) : (
              <div className="space-y-4">
                <div><label className="label-mini block mb-1.5">Actual Views Delivered</label><input data-testid="roi-views" type="number" value={roiForm.actual_views} onChange={(e)=>setRoiForm({...roiForm, actual_views:parseInt(e.target.value||"0")})} className="input-field"/></div>
                <div><label className="label-mini block mb-1.5">Actual Engagement Rate (%)</label><input data-testid="roi-er" type="number" step="0.1" value={roiForm.actual_engagement_rate} onChange={(e)=>setRoiForm({...roiForm, actual_engagement_rate:parseFloat(e.target.value||"0")})} className="input-field"/></div>
                <div className="flex items-center gap-2"><input id="ontime" data-testid="roi-ontime" type="checkbox" checked={roiForm.on_time} onChange={(e)=>setRoiForm({...roiForm, on_time:e.target.checked})}/><label htmlFor="ontime" className="text-sm">Delivered on time</label></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label-mini block mb-1.5">Content Quality (1-5)</label><input data-testid="roi-quality" type="number" min="1" max="5" value={roiForm.content_quality} onChange={(e)=>setRoiForm({...roiForm, content_quality:parseInt(e.target.value||"3")})} className="input-field"/></div>
                  <div><label className="label-mini block mb-1.5">Brand Rating (1-5)</label><input data-testid="roi-rating" type="number" min="1" max="5" value={roiForm.brand_rating} onChange={(e)=>setRoiForm({...roiForm, brand_rating:parseInt(e.target.value||"3")})} className="input-field"/></div>
                </div>
                <button onClick={async ()=>{
                  try {
                    const { data } = await api.post(`/campaigns/${id}/close`, roiForm);
                    setRoiResult(data);
                    toast.success(`Campaign closed · Score: ${data.performance_score}`);
                  } catch(err) { toast.error(err.response?.data?.detail || "Failed"); }
                }} data-testid="roi-submit" className="btn-primary w-full"><BarChart3 size={16}/> Compute Score & Close</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const Stat = ({ label, value }) => (
  <div className="bg-white/5 rounded-xl p-3">
    <div className="label-mini">{label}</div>
    <div className="font-display text-lg mt-1">{value}</div>
  </div>
);
