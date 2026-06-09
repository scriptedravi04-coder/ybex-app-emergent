import React, { useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { Sparkles, Building2, Users } from "lucide-react";
import ImageUpload from "../components/ImageUpload";

const CATEGORIES = ["Fashion","Beauty","Tech","Food","Travel","Fitness","Comedy","Lifestyle","Finance","Education","Music","Art","Parenting","Sports","Gaming","Spiritual","Automotive","Wellness","Books","Home Decor"];
const LANGUAGES = ["Hindi","English","Tamil","Telugu","Marathi","Bengali","Gujarati","Punjabi","Kannada","Malayalam","Urdu","Bhojpuri"];
const CITIES = ["Mumbai","Delhi","Bangalore","Hyderabad","Chennai","Kolkata","Pune","Ahmedabad","Lucknow","Jaipur","Indore","Patna","Surat","Bhopal","Nagpur","Chandigarh","Kanpur","Ranchi","Kochi","Trivandrum","Varanasi","Allahabad","Dehradun","Vizag"];

export default function Onboarding() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [step, setStep] = useState(user?.role ? 1 : 0);
  const [role, setRole] = useState(user?.role || params.get("role") || "");
  const [submitting, setSubmitting] = useState(false);

  const [creator, setCreator] = useState({
    bio: "", category: "", city: "", state: "",
    languages: [], gender: "female", instagram: "", youtube: "",
    followers_instagram: 0, followers_youtube: 0,
    rate_card: { reel: 5000, story: 1500, yt_video: 25000 },
    barter: "cash_only", photo: user?.picture || "",
    creator_type: "influencer",
  });
  const [brand, setBrand] = useState({ company_name: "", industry: "", team_size: "1-10", website: "", description: "" });

  const pickRole = (r) => {
    setRole(r);
    setStep(1);
    api.post("/auth/role", { role: r })
      .then(() => refreshUser())
      .catch(() => {
        toast.error("Failed to set role");
        setStep(0);
      });
  };

  const toggleLang = useCallback((l) => {
    setCreator((c) => ({ ...c, languages: c.languages.includes(l) ? c.languages.filter(x=>x!==l) : [...c.languages, l] }));
  }, []);

  const submitCreator = async () => {
    if (!creator.category || !creator.city) { toast.error("Category & city required"); return; }
    setSubmitting(true);
    try {
      await api.post("/creators/profile", creator);
      await refreshUser();
      toast.success("Profile created!");
      navigate("/dashboard");
    } catch (e) { toast.error("Failed to save profile"); }
    finally { setSubmitting(false); }
  };

  const submitBrand = async () => {
    if (!brand.company_name || !brand.industry) { toast.error("Company name & industry required"); return; }
    setSubmitting(true);
    try {
      await api.post("/brands/profile", brand);
      await refreshUser();
      toast.success("Brand profile created!");
      navigate("/dashboard");
    } catch (e) { toast.error("Failed to save profile"); }
    finally { setSubmitting(false); }
  };

  if (step === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16" data-testid="role-select">
        <h1 className="font-display text-5xl tracking-tight">Choose your role</h1>
        <p className="text-white/70 mt-2">You can have only one role per account.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10">
          {[
            { id: "creator", icon: <Sparkles size={28}/>, t: "I'm a Creator", d: "Build a public rate card, get discovered by brands, earn through collabs." },
            { id: "brand", icon: <Building2 size={28}/>, t: "I'm a Brand", d: "Discover creators, post campaigns, track ROI transparently." },
            { id: "talent_manager", icon: <Users size={28}/>, t: "Talent Manager", d: "Manage multiple creators, agency dashboard, bulk negotiations." },
          ].map((opt) => (
            <button key={opt.id} data-testid={`role-${opt.id}`} onClick={()=>pickRole(opt.id)} className="text-left bg-[#13131B] border border-white/10 rounded-2xl p-8 hover:border-[#7C5CFF] hover:-translate-y-1 transition-all">
              <div className="text-[#9D7CFF]">{opt.icon}</div>
              <h3 className="font-display text-2xl mt-4">{opt.t}</h3>
              <p className="text-sm text-white/70 mt-2">{opt.d}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Creator onboarding
  if (role === "creator") {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16" data-testid="creator-onboarding">
        <h1 className="font-display text-4xl tracking-tight">Complete your creator profile</h1>
        <p className="text-white/70 mt-2">Public rate cards build trust. Fill all fields to unlock max visibility.</p>

        <div className="mt-10 space-y-6 bg-[#13131B] border border-white/10 rounded-2xl p-8">
          <div>
            <label className="label-mini block mb-2">Profile Photo</label>
            <ImageUpload value={creator.photo} onChange={(url)=>setCreator({...creator, photo:url})} label="Photo" testId="onb-photo-upload"/>
          </div>
          <div>
            <label className="label-mini block mb-1.5">Bio</label>
            <textarea data-testid="onb-bio" rows={3} value={creator.bio} onChange={(e)=>setCreator({...creator, bio:e.target.value})} className="input-field" placeholder="Tell brands what makes you unique..."/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-mini block mb-1.5">Primary Category</label>
              <select data-testid="onb-category" value={creator.category} onChange={(e)=>setCreator({...creator, category:e.target.value})} className="input-field"><option value="">Select...</option>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select>
            </div>
            <div>
              <label className="label-mini block mb-1.5">City</label>
              <select data-testid="onb-city" value={creator.city} onChange={(e)=>setCreator({...creator, city:e.target.value})} className="input-field"><option value="">Select...</option>{CITIES.map(c=><option key={c}>{c}</option>)}</select>
            </div>
            <div>
              <label className="label-mini block mb-1.5">State</label>
              <input data-testid="onb-state" value={creator.state} onChange={(e)=>setCreator({...creator, state:e.target.value})} className="input-field" placeholder="e.g. Maharashtra"/>
            </div>
            <div>
              <label className="label-mini block mb-1.5">Gender</label>
              <select data-testid="onb-gender" value={creator.gender} onChange={(e)=>setCreator({...creator, gender:e.target.value})} className="input-field"><option>female</option><option>male</option><option>other</option></select>
            </div>
          </div>

          <div>
            <label className="label-mini block mb-2">Languages</label>
            <div className="flex flex-wrap gap-2">{LANGUAGES.map(l => (
              <button key={l} type="button" onClick={()=>toggleLang(l)} className={`px-3 py-1 text-sm border rounded-full ${creator.languages.includes(l) ? "bg-white/10 text-white border-white/20" : "border-white/10 text-white/70"}`}>{l}</button>
            ))}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-mini block mb-1.5">Instagram handle</label>
              <input data-testid="onb-instagram" value={creator.instagram} onChange={(e)=>setCreator({...creator, instagram:e.target.value})} className="input-field" placeholder="@your_handle"/>
            </div>
            <div>
              <label className="label-mini block mb-1.5">YouTube channel</label>
              <input data-testid="onb-youtube" value={creator.youtube} onChange={(e)=>setCreator({...creator, youtube:e.target.value})} className="input-field" placeholder="Channel name"/>
            </div>
            <div>
              <label className="label-mini block mb-1.5">IG Followers</label>
              <input data-testid="onb-ig-followers" type="number" value={creator.followers_instagram} onChange={(e)=>setCreator({...creator, followers_instagram:parseInt(e.target.value||"0")})} className="input-field"/>
            </div>
            <div>
              <label className="label-mini block mb-1.5">YT Subscribers</label>
              <input data-testid="onb-yt-followers" type="number" value={creator.followers_youtube} onChange={(e)=>setCreator({...creator, followers_youtube:parseInt(e.target.value||"0")})} className="input-field"/>
            </div>
          </div>

          <div>
            <h3 className="font-display text-xl mb-3">Public Rate Card (₹)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="label-mini block mb-1.5">Reel</label><input data-testid="rate-reel" type="number" value={creator.rate_card.reel} onChange={(e)=>setCreator({...creator, rate_card:{...creator.rate_card, reel:parseInt(e.target.value||"0")}})} className="input-field"/></div>
              <div><label className="label-mini block mb-1.5">Story</label><input data-testid="rate-story" type="number" value={creator.rate_card.story} onChange={(e)=>setCreator({...creator, rate_card:{...creator.rate_card, story:parseInt(e.target.value||"0")}})} className="input-field"/></div>
              <div><label className="label-mini block mb-1.5">YT Video</label><input data-testid="rate-yt" type="number" value={creator.rate_card.yt_video} onChange={(e)=>setCreator({...creator, rate_card:{...creator.rate_card, yt_video:parseInt(e.target.value||"0")}})} className="input-field"/></div>
            </div>
          </div>

          <div>
            <label className="label-mini block mb-1.5">Barter Acceptability</label>
            <select data-testid="onb-barter" value={creator.barter} onChange={(e)=>setCreator({...creator, barter:e.target.value})} className="input-field">
              <option value="cash_only">Cash only</option>
              <option value="barter_ok">Barter OK</option>
              <option value="partial_barter">Partial barter</option>
            </select>
          </div>

          <button onClick={submitCreator} disabled={submitting} data-testid="creator-submit" className="btn-primary w-full">{submitting ? "Saving..." : "Save & Continue"}</button>
        </div>
      </div>
    );
  }

  // Brand / Talent Manager onboarding
  return (
    <div className="max-w-2xl mx-auto px-6 py-16" data-testid="brand-onboarding">
      <h1 className="font-display text-4xl tracking-tight">Set up your brand</h1>
      <div className="mt-10 space-y-5 bg-[#13131B] border border-white/10 rounded-2xl p-8">
        <div><label className="label-mini block mb-1.5">Company Name</label><input data-testid="brand-name" value={brand.company_name} onChange={(e)=>setBrand({...brand, company_name:e.target.value})} className="input-field"/></div>
        <div><label className="label-mini block mb-1.5">Industry</label><input data-testid="brand-industry" value={brand.industry} onChange={(e)=>setBrand({...brand, industry:e.target.value})} className="input-field" placeholder="D2C / SaaS / E-commerce"/></div>
        <div>
          <label className="label-mini block mb-2">Brand Logo</label>
          <ImageUpload value={brand.logo} onChange={(url)=>setBrand({...brand, logo:url})} label="Logo" testId="brand-logo-upload"/>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label-mini block mb-1.5">Team Size</label><select data-testid="brand-team" value={brand.team_size} onChange={(e)=>setBrand({...brand, team_size:e.target.value})} className="input-field"><option>1-10</option><option>10-50</option><option>50-200</option><option>200+</option></select></div>
          <div><label className="label-mini block mb-1.5">Website</label><input data-testid="brand-website" value={brand.website} onChange={(e)=>setBrand({...brand, website:e.target.value})} className="input-field" placeholder="https://..."/></div>
        </div>
        <div><label className="label-mini block mb-1.5">About</label><textarea data-testid="brand-desc" rows={3} value={brand.description} onChange={(e)=>setBrand({...brand, description:e.target.value})} className="input-field" placeholder="Brief description..."/></div>
        <button onClick={submitBrand} disabled={submitting} data-testid="brand-submit" className="btn-primary w-full">{submitting ? "Saving..." : "Save & Continue"}</button>
      </div>
    </div>
  );
}
