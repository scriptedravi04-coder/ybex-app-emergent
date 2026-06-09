/* eslint-disable */
import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { Users, Megaphone, ShieldCheck, MessageCircle, Hand, Briefcase, Ban, Trash2, CheckCircle2 } from "lucide-react";

export default function Admin() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [tab, setTab] = useState("overview");

  const load = () => {
    api.get("/admin/stats").then(({ data }) => setStats(data)).catch(() => {});
    api.get("/admin/users").then(({ data }) => setUsers(data)).catch(() => {});
    api.get("/admin/campaigns").then(({ data }) => setCampaigns(data)).catch(() => {});
  };

  useEffect(() => { if (user?.role === "admin") load(); }, [user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white/60">Loading...</div>;
  if (!user) return <Navigate to="/login" replace/>;
  if (user.role !== "admin") return <div className="max-w-2xl mx-auto px-6 py-20 text-center"><h1 className="font-display text-4xl">Access Denied</h1><p className="mt-3 text-white/60">Admin role required.</p></div>;

  const ban = async (id, currentlyBanned) => {
    try { await api.post(`/admin/users/${id}/${currentlyBanned ? "unban" : "ban"}`); toast.success(currentlyBanned ? "Unbanned" : "Banned"); load(); } catch { toast.error("Failed"); }
  };
  const delCamp = async (id) => {
    if (!window.confirm("Delete this campaign permanently?")) return;
    try { await api.delete(`/admin/campaigns/${id}`); toast.success("Deleted"); load(); } catch { toast.error("Failed"); }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-12" data-testid="admin-page">
      <div className="flex items-center gap-3 mb-8">
        <ShieldCheck size={32} className="text-[#9D7CFF]"/>
        <div>
          <span className="label-mini">Admin Panel</span>
          <h1 className="font-display text-5xl tracking-tighter">Ybex Control</h1>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" data-testid="admin-stats">
        <StatTile icon={<Users/>} label="Total Users" value={stats.users || 0}/>
        <StatTile icon={<Users/>} label="Creators" value={stats.creators || 0}/>
        <StatTile icon={<Briefcase/>} label="Brands" value={stats.brands || 0}/>
        <StatTile icon={<Megaphone/>} label="Live Campaigns" value={stats.live_campaigns || 0} accent/>
        <StatTile icon={<Hand/>} label="Waves" value={stats.waves || 0}/>
        <StatTile icon={<CheckCircle2/>} label="Collabs" value={stats.collabs || 0}/>
        <StatTile icon={<MessageCircle/>} label="Chat Messages" value={stats.messages || 0}/>
        <StatTile icon={<Megaphone/>} label="Total Campaigns" value={stats.campaigns || 0}/>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 mb-6">
        {[
          { id: "users", label: `Users (${users.length})` },
          { id: "campaigns", label: `Campaigns (${campaigns.length})` },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} data-testid={`admin-tab-${t.id}`} className={`px-4 py-3 text-sm font-semibold border-b-2 ${tab === t.id ? "border-[#9D7CFF] text-[#9D7CFF]" : "border-transparent text-white/60 hover:text-white"}`}>{t.label}</button>
        ))}
      </div>

      {tab === "users" && (
        <div className="bg-[#13131B] border border-white/10 rounded-2xl overflow-hidden" data-testid="users-table">
          <div className="grid grid-cols-12 px-5 py-3 border-b border-white/10 label-mini bg-white/3">
            <div className="col-span-4">User</div>
            <div className="col-span-3">Email</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-2">Joined</div>
            <div className="col-span-1 text-right">Action</div>
          </div>
          <div className="max-h-[600px] overflow-y-auto scroll-thin">
            {users.map((u) => (
              <div key={u.user_id} className="grid grid-cols-12 px-5 py-3 border-b border-white/5 items-center hover:bg-white/3">
                <div className="col-span-4 flex items-center gap-2.5">
                  {u.picture ? <img src={u.picture} alt="" className="w-8 h-8 rounded-full object-cover"/> : <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C5CFF] to-[#5B3EE0] flex items-center justify-center text-xs font-semibold">{(u.name || "?").charAt(0)}</div>}
                  <span className="text-sm font-medium truncate">{u.name}</span>
                  {u.banned && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30">BANNED</span>}
                </div>
                <div className="col-span-3 text-sm text-white/60 truncate">{u.email}</div>
                <div className="col-span-2 text-sm capitalize">{u.role || "—"}</div>
                <div className="col-span-2 text-xs text-white/40">{u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</div>
                <div className="col-span-1 flex justify-end">
                  {u.role !== "admin" && (
                    <button onClick={() => ban(u.user_id, u.banned)} data-testid={`ban-${u.user_id}`} className="p-1.5 rounded hover:bg-red-500/15 text-red-400" title={u.banned ? "Unban" : "Ban"}><Ban size={15}/></button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "campaigns" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="admin-campaigns">
          {campaigns.map((c) => (
            <div key={c.campaign_id} className="card-dark">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold flex-1">{c.title}</h3>
                <button onClick={() => delCamp(c.campaign_id)} data-testid={`del-${c.campaign_id}`} className="p-1.5 rounded hover:bg-red-500/15 text-red-400" title="Delete"><Trash2 size={15}/></button>
              </div>
              <p className="text-xs text-white/50 mt-1">by {c.brand_name}</p>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className={`pill ${c.status === "live" ? "pill-violet" : "pill-gray"}`}>{c.status}</span>
                <span className="text-white/50">{(c.applicants || []).length} apps</span>
              </div>
              <div className="mt-2 text-sm text-white/70">₹{(c.budget_min || 0).toLocaleString("en-IN")} – ₹{(c.budget_max || 0).toLocaleString("en-IN")}</div>
            </div>
          ))}
        </div>
      )}

      {(tab === "overview" || (tab !== "users" && tab !== "campaigns")) && tab === "overview" && (
        <div className="text-white/60 text-sm">Use tabs above to manage users and campaigns.</div>
      )}
    </div>
  );
}

const StatTile = ({ icon, label, value, accent }) => (
  <div className={`p-5 rounded-2xl border ${accent ? "bg-gradient-to-br from-[#7C5CFF]/15 to-transparent border-[#7C5CFF]/40" : "bg-[#13131B] border-white/10"}`}>
    <div className="text-[#9D7CFF]">{icon}</div>
    <div className="font-display text-3xl mt-2">{value}</div>
    <div className="text-xs text-white/50 mt-1">{label}</div>
  </div>
);
