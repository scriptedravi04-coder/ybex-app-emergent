import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { TrendingUp, Eye, Users, Megaphone, ArrowRight, Sparkles } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [collabs, setCollabs] = useState({ sent: [], received: [], waves_received: [] });
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    api.get("/dashboard/stats").then(({data})=>setStats(data)).catch(()=>{});
    api.get("/collabs").then(({data})=>setCollabs(data)).catch(()=>{});
    if (user?.role === "brand") api.get("/campaigns?mine=true").then(({data})=>setCampaigns(data)).catch(()=>{});
    else api.get("/campaigns?limit=5").then(({data})=>setCampaigns(data.slice(0,5))).catch(()=>{});
  }, [user]);

  const isCreator = user?.role === "creator";

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12" data-testid="dashboard">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="label-mini">{user?.role?.toUpperCase()} DASHBOARD</div>
          <h1 className="font-display text-5xl tracking-tight">Hi, {user?.name?.split(" ")[0]}</h1>
        </div>
        {user?.role === "brand" && <Link to="/campaigns?new=true" className="btn-primary">Post Campaign <ArrowRight size={16}/></Link>}
        {isCreator && <Link to="/campaigns" className="btn-primary">Browse Campaigns <ArrowRight size={16}/></Link>}
      </div>

      {/* Stat Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {isCreator ? (
          <>
            <StatBlock icon={<Eye/>} label="Profile Views" value={stats.profile_views || 0}/>
            <StatBlock icon={<Users/>} label="Waves Received" value={stats.waves || 0}/>
            <StatBlock icon={<Megaphone/>} label="Collab Requests" value={stats.collab_requests || 0}/>
            <StatBlock icon={<TrendingUp/>} label="Performance" value={`${stats.performance_score || 0}`} accent/>
          </>
        ) : (
          <>
            <StatBlock icon={<Megaphone/>} label="Campaigns Posted" value={stats.campaigns || 0}/>
            <StatBlock icon={<Users/>} label="Waves Sent" value={stats.waves_sent || 0}/>
            <StatBlock icon={<Sparkles/>} label="Collabs Sent" value={stats.collabs_sent || 0}/>
            <StatBlock icon={<TrendingUp/>} label="Connections" value={stats.connections || 0} accent/>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
        {/* Recent Collabs */}
        <div className="bg-[#13131B] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl">{isCreator ? "Received Requests" : "Your Outgoing"}</h2>
            <Link to="/collabs" className="text-sm text-[#9D7CFF] font-semibold">View all</Link>
          </div>
          <div className="space-y-3" data-testid="dashboard-collabs">
            {(isCreator ? collabs.received : collabs.sent).slice(0, 4).map(c => (
              <div key={c.collab_id} className="flex items-center justify-between p-3 border border-white/10 rounded-xl">
                <div>
                  <div className="font-medium">{c.from_name}</div>
                  <div className="text-xs text-white/40">{c.deliverable} · ₹{(c.proposed_amount||0).toLocaleString("en-IN")}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${c.status === "pending" ? "bg-[#F59E0B]/10 text-[#F59E0B]" : c.status === "accepted" ? "bg-emerald-600/10 text-emerald-400" : "bg-[#DC2626]/10 text-[#DC2626]"}`}>{c.status}</span>
              </div>
            ))}
            {(isCreator ? collabs.received : collabs.sent).length === 0 && <div className="text-sm text-white/40 py-4 text-center">No items yet</div>}
          </div>
        </div>

        {/* Campaigns / Suggested */}
        <div className="bg-[#13131B] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl">{user?.role === "brand" ? "Your Campaigns" : "Campaigns for you"}</h2>
            <Link to="/campaigns" className="text-sm text-[#9D7CFF] font-semibold">View all</Link>
          </div>
          <div className="space-y-3">
            {campaigns.slice(0,4).map((c)=>(
              <Link to={`/campaigns/${c.campaign_id}`} key={c.campaign_id} className="block p-3 border border-white/10 rounded-xl hover:border-[#7C5CFF]">
                <div className="font-medium">{c.title}</div>
                <div className="text-xs text-white/70 mt-0.5">₹{(c.budget_min||0).toLocaleString("en-IN")} - ₹{(c.budget_max||0).toLocaleString("en-IN")} · {c.brand_name}</div>
              </Link>
            ))}
            {campaigns.length === 0 && <div className="text-sm text-white/40 py-4 text-center">No campaigns yet</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

const StatBlock = ({ icon, label, value, accent }) => (
  <div className={`p-6 rounded-2xl border ${accent ? "bg-white/10 text-white border-white/20" : "bg-[#13131B] border-white/10"} hover:-translate-y-0.5 transition-transform`}>
    <div className="flex items-center justify-between"><div className={accent ? "text-[#9D7CFF]" : "text-[#9D7CFF]"}>{icon}</div></div>
    <div className="font-display text-4xl mt-3">{value}</div>
    <div className="label-mini mt-1 opacity-80">{label}</div>
  </div>
);
