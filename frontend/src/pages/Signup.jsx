import React, { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

export default function Signup() {
  const [params] = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const intentRole = params.get("role");

  const handleGoogle = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/onboarding";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(name, email, password);
      toast.success("Account created!");
      navigate("/onboarding" + (intentRole ? `?role=${intentRole}` : ""));
    } catch (err) {
      toast.error(err.response?.data?.detail || "Signup failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16" data-testid="signup-page">
      <h1 className="font-display text-5xl tracking-tight">Join Ybex</h1>
      <p className="text-white/70 mt-2">Start collaborating with India&apos;s most transparent network.</p>

      <button onClick={handleGoogle} data-testid="google-signup-btn" className="mt-8 w-full bg-[#13131B] border border-white/20 py-3 font-semibold hover:bg-white/10 hover:text-white transition-colors flex items-center justify-center gap-2">
        <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.2 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.1l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.2 29.3 4 24 4c-7.7 0-14.4 4.4-17.7 10.1z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35 26.7 36 24 36c-5.2 0-9.6-3.3-11.2-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C40.9 35.4 44 30.1 44 24c0-1.3-.1-2.3-.4-3.5z"/></svg>
        Continue with Google
      </button>

      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-[#E5E5E5]"></div>
        <span className="text-xs text-white/40 tracking-widest">OR</span>
        <div className="flex-1 h-px bg-[#E5E5E5]"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label-mini block mb-1.5">Full Name</label>
          <input data-testid="signup-name" required value={name} onChange={(e)=>setName(e.target.value)} className="input-field" placeholder="Your name"/>
        </div>
        <div>
          <label className="label-mini block mb-1.5">Email</label>
          <input data-testid="signup-email" type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} className="input-field" placeholder="you@example.com"/>
        </div>
        <div>
          <label className="label-mini block mb-1.5">Password</label>
          <input data-testid="signup-password" type="password" required minLength={6} value={password} onChange={(e)=>setPassword(e.target.value)} className="input-field" placeholder="Min 6 characters"/>
        </div>
        <button type="submit" data-testid="signup-submit" disabled={loading} className="btn-primary w-full">{loading ? "Creating..." : "Create Account"}</button>
      </form>

      <p className="mt-6 text-sm text-white/70">Already have an account? <Link to="/login" className="text-[#9D7CFF] font-semibold">Log in</Link></p>
    </div>
  );
}
