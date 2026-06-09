import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { toast } from "sonner";

export default function Collabs() {
  const [data, setData] = useState({ sent: [], received: [], waves_sent: [], waves_received: [] });
  const [tab, setTab] = useState("received");

  const load = () => api.get("/collabs").then(({data})=>setData(data)).catch(()=>{});
  useEffect(()=>{ load(); }, []);

  const act = async (cid, action) => {
    try { await api.post(`/collabs/${cid}/action?action=${action}`); toast.success(`Collab ${action}ed`); load(); }
    catch(e){ toast.error("Failed"); }
  };

  const tabs = [
    { id: "received", label: "Received Collabs", count: data.received.length },
    { id: "sent", label: "Sent Collabs", count: data.sent.length },
    { id: "waves_received", label: "Waves Received", count: data.waves_received.length },
    { id: "waves_sent", label: "Waves Sent", count: data.waves_sent.length },
  ];

  const items = data[tab] || [];

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-12 py-12" data-testid="collabs-page">
      <h1 className="font-display text-5xl tracking-tight">Collaborations</h1>
      <p className="text-white/70 mt-2">Manage your collab requests & waves</p>

      <div className="mt-8 flex gap-2 border-b border-white/10 overflow-x-auto scroll-thin">
        {tabs.map(t => (
          <button key={t.id} data-testid={`tab-${t.id}`} onClick={()=>setTab(t.id)} className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${tab===t.id ? "border-[#7C5CFF] text-[#9D7CFF]" : "border-transparent text-white/70"}`}>
            {t.label} <span className="ml-1 text-xs opacity-70">({t.count})</span>
          </button>
        ))}
      </div>

      <div className="space-y-3 mt-6">
        {items.length === 0 && <div className="bg-[#13131B] border border-white/10 rounded-2xl p-12 text-center text-white/40">No items</div>}
        {items.map((it, i) => (
          <div key={it.collab_id || it.wave_id || i} className="bg-[#13131B] border border-white/10 rounded-2xl p-5 flex items-center justify-between gap-4">
            <div>
              <div className="font-display text-lg">{it.from_name || it.to_user_id}</div>
              {it.deliverable && <div className="text-sm text-white/70">{it.deliverable} · ₹{(it.proposed_amount||0).toLocaleString("en-IN")}</div>}
              {it.message && <div className="text-sm text-white/70 mt-1 italic">&ldquo;{it.message}&rdquo;</div>}
              <div className="text-xs text-white/40 mt-1">{new Date(it.created_at).toLocaleString()}</div>
            </div>
            <div className="flex items-center gap-2">
              {it.status && <span className={`text-xs px-2 py-1 rounded-full ${it.status === "pending" ? "bg-[#F59E0B]/10 text-[#F59E0B]" : it.status === "accepted" ? "bg-emerald-600/10 text-emerald-400" : "bg-[#DC2626]/10 text-[#DC2626]"}`}>{it.status}</span>}
              {tab === "received" && it.status === "pending" && (
                <>
                  <button onClick={()=>act(it.collab_id, "accept")} data-testid={`accept-${it.collab_id}`} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700">Accept</button>
                  <button onClick={()=>act(it.collab_id, "decline")} data-testid={`decline-${it.collab_id}`} className="px-3 py-1.5 border border-white/10 text-xs font-semibold hover:bg-[#13131B]/5">Decline</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
