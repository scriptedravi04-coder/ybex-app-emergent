/* eslint-disable */
import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { Users, Megaphone, ShieldCheck, MessageCircle, Hand, Briefcase, Ban, Trash2, CheckCircle2, XCircle, Percent, AlertTriangle, Save, Eye } from "lucide-react";

const fmtINR = (n) => "₹" + (Number(n) || 0).toLocaleString("en-IN");

export default function Admin() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [reports, setReports] = useState([]);
  const [settings, setSettings] = useState(null);
  const [tab, setTab] = useState("users");

  const load = () => {
    api.get("/admin/stats").then(({ data }) => setStats(data)).catch(() => {});
    api.get("/admin/users").then(({ data }) => setUsers(data)).catch(() => {});
    api.get("/admin/campaigns").then(({ data }) => setCampaigns(data)).catch(() => {});
    api.get("/admin/verifications").then(({ data }) => setVerifications(data)).catch(() => {});
    api.get("/admin/reports").then(({ data }) => setReports(data)).catch(() => {});
    api.get("/admin/settings").then(({ data }) => setSettings(data)).catch(() => {});
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
  const decideVer = async (id, decision) => {
    try { await api.post(`/admin/verifications/${id}/${decision}`, { note: "" }); toast.success(decision === "approve" ? "Approved" : "Rejected"); load(); } catch { toast.error("Failed"); }
  };
  const resolveReport = async (id) => {
    try { await api.post(`/admin/reports/${id}/resolve`); toast.success("Resolved"); load(); } catch { toast.error("Failed"); }
  };

  const pendingVer = verifications.filter((v) => v.status === "pending").length;
  const openReports = reports.filter((r) => r.status === "open").length;

  const tabs = [
    { id: "users", label: `Users (${users.length})` },
    { id: "campaigns", label: `Campaigns (${campaigns.length})` },
    { id: "verifications", label: `Verifications (${pendingVer})`, dot: pendingVer > 0 },
    { id: "reports", label: `Reports (${openReports})`, dot: openReports > 0 },
    { id: "fees", label: "Fees & Settings" },
  ];

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
        <StatTile icon={<ShieldCheck/>} label="Pending Verifications" value={stats.pending_verifications || 0}/>
        <StatTile icon={<AlertTriangle/>} label="Open Reports" value={stats.open_reports || 0}/>
        <StatTile icon={<CheckCircle2/>} label="Collabs" value={stats.collabs || 0}/>
        <StatTile icon={<MessageCircle/>} label="Chat Messages" value={stats.messages || 0}/>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} data-testid={`admin-tab-${t.id}`} className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap flex items-center gap-1.5 ${tab === t.id ? "border-[#9D7CFF] text-[#9D7CFF]" : "border-transparent text-white/60 hover:text-white"}`}>
            {t.label}
            {t.dot && <span className="w-1.5 h-1.5 rounded-full bg-red-500"/>}
          </button>
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
              <div className="mt-2 text-sm text-white/70">{fmtINR(c.budget_min)} – {fmtINR(c.budget_max)}</div>
            </div>
          ))}
        </div>
      )}

      {tab === "verifications" && (
        <div className="space-y-3" data-testid="admin-verifications">
          {verifications.length === 0 && <div className="text-white/50 text-sm py-10 text-center">No verification requests yet.</div>}
          {verifications.map((v) => (
            <div key={v.verification_id} className="bg-[#13131B] border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {v.photo ? <img src={v.photo} alt="" className="w-12 h-12 rounded-full object-cover"/> : <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7C5CFF] to-[#5B3EE0] flex items-center justify-center font-semibold">{(v.name || "?").charAt(0)}</div>}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold truncate">{v.name}</span>
                    <span className={`pill ${v.kind === "brand" ? "pill-gray" : "pill-violet"}`} style={{padding:"0.15rem 0.5rem", fontSize:"0.65rem"}}>{v.kind}</span>
                  </div>
                  <div className="text-xs text-white/50 truncate">{v.email}{v.handle ? ` · ${v.handle}` : ""}{v.followers ? ` · ${v.followers.toLocaleString("en-IN")}` : ""}</div>
                </div>
              </div>
              <div className="hidden md:block text-xs text-white/50 w-32">
                <div className="label-mini">Category</div>
                <div className="text-white/80 mt-0.5">{v.category || "—"}</div>
              </div>
              <div className="text-xs text-white/50 w-28">
                <div className="label-mini">Documents</div>
                <div className="text-white/80 mt-0.5">{(v.documents || []).length} files</div>
              </div>
              {v.status === "pending" ? (
                <div className="flex items-center gap-2">
                  <button onClick={() => decideVer(v.verification_id, "approve")} data-testid={`approve-${v.verification_id}`} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-semibold"><CheckCircle2 size={15}/> Approve</button>
                  <button onClick={() => decideVer(v.verification_id, "reject")} data-testid={`reject-${v.verification_id}`} className="p-2 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10"><XCircle size={16}/></button>
                </div>
              ) : (
                <span className={`pill ${v.status === "approved" ? "pill-violet" : "pill-gray"}`}>{v.status}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "reports" && (
        <div className="space-y-3" data-testid="admin-reports">
          {reports.length === 0 && <div className="text-white/50 text-sm py-10 text-center">No reports yet.</div>}
          {reports.map((r) => (
            <div key={r.report_id} className="bg-[#13131B] border border-white/10 rounded-2xl p-5 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold capitalize">{(r.type || "").replace(/_/g, " ")}</span>
                  <SeverityPill severity={r.severity}/>
                </div>
                <div className="text-sm text-white/70 mt-1">Target: {r.target}</div>
                {r.description && <div className="text-xs text-white/50 mt-1">{r.description}</div>}
                <div className="text-xs text-white/40 mt-1">Reported by: {r.reported_by_name} · {r.created_at ? new Date(r.created_at).toLocaleString() : ""}</div>
              </div>
              {r.status === "open" ? (
                <button onClick={() => resolveReport(r.report_id)} data-testid={`resolve-${r.report_id}`} className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/15 hover:border-[#9D7CFF] text-sm font-semibold whitespace-nowrap"><CheckCircle2 size={15}/> Resolve</button>
              ) : (
                <span className="pill pill-gray">resolved</span>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "fees" && settings && (
        <FeesPanel settings={settings} onSaved={(s) => { setSettings(s); toast.success("Fee settings updated"); }} />
      )}
    </div>
  );
}

function FeesPanel({ settings, onSaved }) {
  const [form, setForm] = useState({ ...settings });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        brand_markup_pct: parseFloat(form.brand_markup_pct),
        creator_deduction_pct: parseFloat(form.creator_deduction_pct),
        agency_markup_pct: parseFloat(form.agency_markup_pct),
        agency_deduction_pct: parseFloat(form.agency_deduction_pct),
      };
      const { data } = await api.put("/admin/settings", payload);
      onSaved(data);
    } catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-3xl" data-testid="admin-fees">
      <div className="flex items-center gap-2 mb-2">
        <Percent size={18} className="text-[#9D7CFF]"/>
        <h2 className="font-display text-2xl tracking-tight">Platform Fee Controls</h2>
      </div>
      <p className="text-sm text-white/50 mb-6">These percentages apply instantly across the platform. They are hidden from users — brands see marked-up creator rates, creators see budgets net of deductions.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FeeField label="Brand Markup" hint="Added to creator rates shown to brands" value={form.brand_markup_pct} onChange={(v) => set("brand_markup_pct", v)} testid="fee-brand-markup"/>
        <FeeField label="Creator Deduction" hint="Deducted from budgets/payouts shown to creators" value={form.creator_deduction_pct} onChange={(v) => set("creator_deduction_pct", v)} testid="fee-creator-deduction"/>
        <FeeField label="Agency Markup" hint="Added to creator rates shown to agencies" value={form.agency_markup_pct} onChange={(v) => set("agency_markup_pct", v)} testid="fee-agency-markup"/>
        <FeeField label="Agency Deduction" hint="Deducted from agency-side payouts" value={form.agency_deduction_pct} onChange={(v) => set("agency_deduction_pct", v)} testid="fee-agency-deduction"/>
      </div>

      <div className="mt-6 p-4 rounded-xl bg-[#13131B] border border-white/10 text-sm text-white/70">
        <div className="label-mini mb-2">Live Example — creator rate ₹10,000</div>
        <div className="grid grid-cols-2 gap-2">
          <div>Brand sees: <span className="text-white font-semibold">{fmtINR(Math.round(10000 * (1 + (parseFloat(form.brand_markup_pct) || 0) / 100)))}</span></div>
          <div>Creator receives: <span className="text-white font-semibold">{fmtINR(Math.round(10000 * (1 - (parseFloat(form.creator_deduction_pct) || 0) / 100)))}</span></div>
          <div>Agency sees: <span className="text-white font-semibold">{fmtINR(Math.round(10000 * (1 + (parseFloat(form.agency_markup_pct) || 0) / 100)))}</span></div>
          <div>Platform margin: <span className="text-[#9D7CFF] font-semibold">{((parseFloat(form.brand_markup_pct) || 0) + (parseFloat(form.creator_deduction_pct) || 0)).toFixed(1)}%</span></div>
        </div>
      </div>

      <button onClick={save} disabled={saving} data-testid="save-fees" className="mt-6 flex items-center gap-2 px-6 py-3 rounded-xl bg-[#7C5CFF] hover:bg-[#6B4FE0] text-white font-semibold disabled:opacity-60">
        <Save size={16}/> {saving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}

const FeeField = ({ label, hint, value, onChange, testid }) => (
  <div className="bg-[#13131B] border border-white/10 rounded-2xl p-5">
    <label className="font-semibold text-sm">{label}</label>
    <p className="text-xs text-white/50 mt-0.5 mb-3">{hint}</p>
    <div className="flex items-center gap-2">
      <input
        type="number" step="0.1" min="0" max="50"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid={testid}
        className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-lg font-display focus:border-[#9D7CFF] outline-none"
      />
      <span className="text-white/40 font-display text-lg">%</span>
    </div>
  </div>
);

const SeverityPill = ({ severity }) => {
  const map = {
    critical: "bg-red-500/15 text-red-400 border-red-500/30",
    high: "bg-red-500/15 text-red-400 border-red-500/30",
    medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    low: "bg-white/10 text-white/60 border-white/20",
  };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full border capitalize ${map[severity] || map.low}`}>{severity}</span>;
};

const StatTile = ({ icon, label, value, accent }) => (
  <div className={`p-5 rounded-2xl border ${accent ? "bg-gradient-to-br from-[#7C5CFF]/15 to-transparent border-[#7C5CFF]/40" : "bg-[#13131B] border-white/10"}`}>
    <div className="text-[#9D7CFF]">{icon}</div>
    <div className="font-display text-3xl mt-2">{value}</div>
    <div className="text-xs text-white/50 mt-1">{label}</div>
  </div>
);
