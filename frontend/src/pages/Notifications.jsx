import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Bell, Check } from "lucide-react";

export default function Notifications() {
  const [items, setItems] = useState([]);

  const load = () => api.get("/notifications").then(({data})=>setItems(data)).catch(()=>{});
  useEffect(()=>{ load(); }, []);

  const markAll = async () => { await api.post("/notifications/read-all"); load(); };

  return (
    <div className="max-w-3xl mx-auto px-6 md:px-12 py-12" data-testid="notifications-page">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="text-[#E84A27]" size={28}/>
          <h1 className="font-display text-4xl tracking-tight">Notifications</h1>
        </div>
        <button onClick={markAll} data-testid="mark-all-read" className="text-sm font-semibold text-[#E84A27] hover:underline">Mark all read</button>
      </div>

      <div className="space-y-2">
        {items.length === 0 && <div className="bg-white border border-[#E5E5E5] rounded-2xl p-12 text-center text-[#A3A3A3]">All caught up!</div>}
        {items.map(n => (
          <div key={n.notif_id} className={`flex items-start gap-3 p-4 rounded-xl border ${n.read ? "border-[#E5E5E5] bg-white" : "border-[#E84A27]/40 bg-[#E84A27]/5"}`}>
            <div className="w-9 h-9 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center flex-shrink-0">{n.type === "wave" ? "👋" : n.type === "collab_request" ? "🤝" : "📢"}</div>
            <div className="flex-1">
              <div className="text-sm font-medium">{n.message}</div>
              <div className="text-xs text-[#A3A3A3] mt-1">{new Date(n.created_at).toLocaleString()}</div>
            </div>
            {n.read && <Check size={16} className="text-[#A3A3A3]"/>}
          </div>
        ))}
      </div>
    </div>
  );
}
