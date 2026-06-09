import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { User, Settings as SettingsIcon, Shield, LogOut } from "lucide-react";

export default function Settings() {
  const { user, logout } = useAuth();
  return (
    <div className="max-w-3xl mx-auto px-6 md:px-12 py-12" data-testid="settings-page">
      <h1 className="font-display text-5xl tracking-tight">Settings</h1>

      <div className="mt-8 bg-[#13131B] border border-white/10 rounded-2xl p-6">
        <h2 className="font-display text-2xl flex items-center gap-2"><User size={20}/> Account</h2>
        <div className="mt-4 space-y-3 text-sm">
          <Row label="Name" value={user?.name}/>
          <Row label="Email" value={user?.email}/>
          <Row label="Role" value={user?.role || "—"}/>
          <Row label="Auth Method" value={user?.auth_method}/>
        </div>
      </div>

      <div className="mt-6 bg-[#13131B] border border-white/10 rounded-2xl p-6">
        <h2 className="font-display text-2xl flex items-center gap-2"><SettingsIcon size={20}/> Profile</h2>
        <p className="text-sm text-white/70 mt-2">{user?.role === "creator" ? "Edit your creator profile, rate card, languages." : user?.role === "brand" ? "Edit your brand details, logo, and industry." : "Complete onboarding to access more settings."}</p>
        {user?.role && <Link to="/onboarding" className="inline-block mt-4 btn-secondary">Edit Profile</Link>}
      </div>

      <div className="mt-6 bg-[#13131B] border border-white/10 rounded-2xl p-6">
        <h2 className="font-display text-2xl flex items-center gap-2"><Shield size={20}/> Privacy</h2>
        <p className="text-sm text-white/70 mt-2">Your data is private. Only verified brands can see your rate card and contact info.</p>
      </div>

      <button onClick={logout} data-testid="settings-logout" className="mt-6 text-[#DC2626] font-semibold flex items-center gap-2 hover:underline"><LogOut size={16}/> Sign out</button>
    </div>
  );
}

const Row = ({ label, value }) => (
  <div className="flex justify-between border-b border-white/10 pb-2 last:border-0">
    <span className="label-mini">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);
