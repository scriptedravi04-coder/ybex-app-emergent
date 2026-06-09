import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Bell, LogOut, Settings as SettingsIcon, Menu, X } from "lucide-react";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const onLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#07070B] text-white relative">
      {/* Floating Pill Navbar */}
      <header data-testid="main-header" className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <nav className={`pointer-events-auto bg-[#13131B]/95 backdrop-blur-xl border border-white/10 rounded-2xl transition-all duration-300 ${scrolled ? "shadow-2xl shadow-violet-900/30" : ""} px-3 md:px-4 h-14 flex items-center gap-2 w-full max-w-5xl`}>
          <Link to="/" data-testid="logo-link" className="flex items-center gap-2 mr-2 pl-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C5CFF] to-[#5B3EE0] flex items-center justify-center font-display text-white text-sm shadow-[0_4px_14px_rgba(124,92,255,0.5)]">Y</div>
            <span className="font-display text-lg tracking-tight">ybex</span>
          </Link>

          <div className="hidden md:flex items-center gap-1 mx-auto">
            <NavItem to="/explore" testId="nav-explore">Explore Creators</NavItem>
            <NavItem to="/campaigns" testId="nav-campaigns">For Brands / Agencies</NavItem>
            <Link to="/campaigns" className="px-3 py-2 rounded-lg text-sm font-medium text-white/90 hover:bg-white/5 flex items-center gap-1.5">
              <span className="live-dot"></span>
              LIVE Campaigns!
            </Link>
            {user && <NavItem to="/chat" testId="nav-chat">Chat</NavItem>}
            {user && <NavItem to="/dashboard" testId="nav-dashboard">Dashboard</NavItem>}
            {user?.role === "admin" && <NavItem to="/admin" testId="nav-admin">Admin</NavItem>}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {user ? (
              <>
                <Link to="/notifications" data-testid="nav-notifications" className="p-2 rounded-lg hover:bg-white/5 hidden md:inline-flex text-white/80"><Bell size={17}/></Link>
                <Link to="/settings" data-testid="nav-settings" className="p-2 rounded-lg hover:bg-white/5 hidden md:inline-flex text-white/80"><SettingsIcon size={17}/></Link>
                <div className="hidden md:flex items-center gap-2 pl-2 border-l border-white/10 ml-1">
                  {user.picture ? (
                    <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-lg object-cover"/>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C5CFF] to-[#5B3EE0] text-white flex items-center justify-center text-sm font-semibold">{(user.name||"U").charAt(0).toUpperCase()}</div>
                  )}
                  <button onClick={onLogout} data-testid="logout-button" className="p-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white" title="Logout"><LogOut size={16}/></button>
                </div>
                <button className="md:hidden p-2 text-white/80" onClick={()=>setMenuOpen(!menuOpen)}>{menuOpen ? <X size={18}/> : <Menu size={18}/>}</button>
              </>
            ) : (
              <>
                <Link to="/login" data-testid="nav-login" className="btn-ghost text-sm hidden md:inline-flex">Sign In</Link>
                <Link to="/signup" data-testid="nav-signup" className="btn-primary text-sm" style={{padding:"0.5rem 1.125rem"}}>Get Ybex</Link>
                <button className="md:hidden p-2 text-white/80 ml-1" onClick={()=>setMenuOpen(!menuOpen)}>{menuOpen ? <X size={18}/> : <Menu size={18}/>}</button>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed top-20 left-4 right-4 z-40 md:hidden bg-[#13131B] border border-white/10 rounded-2xl shadow-2xl p-3 flex flex-col gap-1">
          <Link to="/explore" className="px-4 py-2.5 rounded-xl hover:bg-white/5">Explore Creators</Link>
          <Link to="/campaigns" className="px-4 py-2.5 rounded-xl hover:bg-white/5">Campaigns</Link>
          <Link to="/leaderboard" className="px-4 py-2.5 rounded-xl hover:bg-white/5">Leaderboard</Link>
          {user && <Link to="/dashboard" className="px-4 py-2.5 rounded-xl hover:bg-white/5">Dashboard</Link>}
          {!user && <Link to="/login" className="px-4 py-2.5 rounded-xl hover:bg-white/5">Sign In</Link>}
        </div>
      )}

      <main className="pt-24">{children}</main>

      <footer className="border-t border-white/10 mt-24 bg-[#0A0A10]">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-14 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7C5CFF] to-[#5B3EE0] flex items-center justify-center font-display text-white text-xs">Y</div>
              <span className="font-display text-lg">ybex</span>
            </div>
            <p className="mt-3 text-white/50 leading-relaxed">The Brand ⟷ Creator Network. Built for serious collaborations.</p>
          </div>
          <div>
            <h4 className="label-mini mb-3">For Creators</h4>
            <ul className="space-y-2 text-white/60"><li>Get Discovered</li><li>Public Rate Card</li><li>Performance Rank</li></ul>
          </div>
          <div>
            <h4 className="label-mini mb-3">For Brands</h4>
            <ul className="space-y-2 text-white/60"><li>Find Creators</li><li>Launch Campaigns</li><li>ROI Tracking</li></ul>
          </div>
          <div>
            <h4 className="label-mini mb-3">Company</h4>
            <ul className="space-y-2 text-white/60"><li>About</li><li>Contact</li><li>Terms</li><li>Privacy</li></ul>
          </div>
        </div>
        <div className="border-t border-white/10 py-5 text-center text-xs text-white/40">© 2026 Ybex · The Brand ⟷ Creator Network</div>
      </footer>
    </div>
  );
}

const NavItem = ({ to, testId, children }) => (
  <NavLink to={to} data-testid={testId} className={({isActive}) => `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? "text-white bg-white/10" : "text-white/70 hover:text-white hover:bg-white/5"}`}>{children}</NavLink>
);
