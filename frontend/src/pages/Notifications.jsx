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
          <Bell className="text-[#9D7CFF]" size={28}/>
          <h1 className="font-display text-4xl tracking-tight">Notifications</h1>
        </div>
        <button onClick={markAll} data-testid="mark-all-read" className="text-sm font-semibold text-[#9D7CFF] hover:underline">Mark all read</button>
      </div>

      <div className="space-y-2">
        {items.length === 0 && <div className="bg-[#13131B] border border-white/10 rounded-2xl p-12 text-center text-white/40">All caught up!</div>}
        {items.map(n => (
          <div key={n.notif_id} className={`flex items-start gap-3 p-4 rounded-xl border ${n.read ? "border-white/10 bg-[#13131B]" : "border-[#7C5CFF]/40 bg-[#7C5CFF]/5"}`}>
            <div className="w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center flex-shrink-0">{n.type === "wave" ? "👋" : n.type === "collab_request" ? "🤝" : "📢"}</div>
            <div className="flex-1">
              <div className="text-sm font-medium">{n.message}</div>
              <div className="text-xs text-white/40 mt-1">{new Date(n.created_at).toLocaleString()}</div>
            </div>
            {n.read && <Check size={16} className="text-white/40"/>}
          </div>
        ))}
      </div>
    </div>
  );
}
