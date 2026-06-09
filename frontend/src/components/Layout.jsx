import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Bell, LogOut, Search, LayoutDashboard, Users, Megaphone, Trophy, Settings as SettingsIcon } from "lucide-react";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#F7F5F2] text-[#0A0A0A]">
      <header
        data-testid="main-header"
        className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-[#E5E5E5]"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
          <Link to="/" data-testid="logo-link" className="flex items-center gap-2">
            <span className="font-display text-2xl tracking-tight">ybex<span className="text-[#E84A27]">.</span></span>
            <span className="hidden sm:inline label-mini">Bharat Marketplace</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            <NavLink to="/explore" data-testid="nav-explore" className={({isActive}) => `flex items-center gap-1.5 ${isActive ? "text-[#E84A27]" : "text-[#0A0A0A] hover:text-[#E84A27]"}`}>
              <Search size={16}/> Explore
            </NavLink>
            <NavLink to="/campaigns" data-testid="nav-campaigns" className={({isActive}) => `flex items-center gap-1.5 ${isActive ? "text-[#E84A27]" : "text-[#0A0A0A] hover:text-[#E84A27]"}`}>
              <Megaphone size={16}/> Campaigns
            </NavLink>
            <NavLink to="/leaderboard" data-testid="nav-leaderboard" className={({isActive}) => `flex items-center gap-1.5 ${isActive ? "text-[#E84A27]" : "text-[#0A0A0A] hover:text-[#E84A27]"}`}>
              <Trophy size={16}/> Leaderboard
            </NavLink>
            {user && (
              <NavLink to="/dashboard" data-testid="nav-dashboard" className={({isActive}) => `flex items-center gap-1.5 ${isActive ? "text-[#E84A27]" : "text-[#0A0A0A] hover:text-[#E84A27]"}`}>
                <LayoutDashboard size={16}/> Dashboard
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to="/notifications" data-testid="nav-notifications" className="p-2 hover:bg-[#F7F5F2] rounded-full">
                  <Bell size={18} />
                </Link>
                <Link to="/settings" data-testid="nav-settings" className="p-2 hover:bg-[#F7F5F2] rounded-full">
                  <SettingsIcon size={18} />
                </Link>
                <div className="hidden md:flex items-center gap-2">
                  {user.picture ? (
                    <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-[#E5E5E5]" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#1A4331] text-white flex items-center justify-center text-sm font-semibold">
                      {(user.name || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium">{user.name?.split(" ")[0]}</span>
                </div>
                <button onClick={onLogout} data-testid="logout-button" className="p-2 hover:bg-[#F7F5F2] rounded-full" title="Logout">
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" data-testid="nav-login" className="text-sm font-semibold hover:text-[#E84A27]">Login</Link>
                <Link to="/signup" data-testid="nav-signup" className="btn-primary text-sm">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-[#E5E5E5] mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div>
            <span className="font-display text-2xl">ybex<span className="text-[#E84A27]">.</span></span>
            <p className="mt-3 text-[#525252]">India&apos;s most transparent influencer marketplace.</p>
          </div>
          <div>
            <h4 className="label-mini mb-3">For Brands</h4>
            <ul className="space-y-2 text-[#525252]"><li>Browse Creators</li><li>Post Campaign</li><li>ROI Tracking</li></ul>
          </div>
          <div>
            <h4 className="label-mini mb-3">For Creators</h4>
            <ul className="space-y-2 text-[#525252]"><li>Join as Creator</li><li>Performance Rank</li><li>Rate Card</li></ul>
          </div>
          <div>
            <h4 className="label-mini mb-3">Company</h4>
            <ul className="space-y-2 text-[#525252]"><li>About</li><li>Contact</li><li>Terms</li></ul>
          </div>
        </div>
        <div className="border-t border-[#E5E5E5] py-5 text-center text-xs text-[#A3A3A3]">© 2026 Ybex. Know the price. Trust the data.</div>
      </footer>
    </div>
  );
}
