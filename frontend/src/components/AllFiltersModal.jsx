/* eslint-disable */
import React, { useMemo, useState } from "react";
import { X, Search as SearchIcon, ChevronRight, Check } from "lucide-react";

// =================== Data sets ===================
const CATEGORIES_WITH_SUBS = {
  "Fashion": ["Streetwear", "Luxury", "Ethnic Wear", "Sustainable", "Mens Fashion", "Womens Fashion", "Kids"],
  "Beauty": ["Makeup", "Skincare", "Haircare", "Fragrance", "Nails", "K-Beauty"],
  "Tech": ["Smartphones", "Laptops", "Gaming", "Gadgets", "Coding", "AI"],
  "Food": ["Recipes", "Restaurants", "Street Food", "Healthy", "Baking", "Beverages"],
  "Travel": ["Budget", "Luxury", "Adventure", "Solo", "International", "Domestic", "Backpacking"],
  "Fitness": ["Gym", "Yoga", "Calisthenics", "Running", "CrossFit", "Pilates"],
  "Comedy": ["Standup", "Skits", "Memes", "Parody", "Reactions"],
  "Lifestyle": ["Daily Vlogs", "Minimalism", "Productivity", "Home Decor"],
  "Finance": ["Stocks", "Crypto", "Personal Finance", "Startups", "Real Estate"],
  "Education": ["UPSC", "JEE/NEET", "Coding", "English Speaking", "Languages"],
  "Music": ["Singing", "Instrumental", "Hip-Hop", "Classical", "Independent"],
  "Art": ["Painting", "Digital Art", "Photography", "Crafts", "Calligraphy"],
  "Parenting": ["Newborn", "Toddler", "Teen", "Mom Vlogs"],
  "Sports": ["Cricket", "Football", "Esports", "Athletics", "Combat"],
  "Gaming": ["BGMI", "Free Fire", "Valorant", "Minecraft", "Game Dev"],
  "Spiritual": ["Yoga", "Meditation", "Devotional", "Astrology"],
  "Automotive": ["Cars", "Bikes", "EVs", "Reviews"],
  "Wellness": ["Mental Health", "Nutrition", "Sleep", "Self-care"],
  "Books": ["Fiction", "Self-help", "Reviews", "Poetry"],
  "Home Decor": ["DIY", "Minimalist", "Indian Traditional"],
};

const LANGUAGES = [
  "Arabic","Assamese","Bagheli","Banjari","Bengali","Bhili/bhilodi","Bhojpuri","Bodo","Bundeli","Dogri",
  "English","Garhwali","Gujarati","Haryanvi","Hindi","Kannada","Kashmiri","Konkani","Maithili","Malayalam",
  "Marathi","Nepali","Odia","Pahari","Punjabi","Rajasthani","Sadri","Santali","Sindhi","Tamil","Telugu",
  "Tripuri","Tulu","Urdu",
];

const CITIES = ["Mumbai","Delhi","Bangalore","Hyderabad","Chennai","Kolkata","Pune","Ahmedabad","Lucknow","Jaipur","Indore","Patna","Surat","Bhopal","Nagpur","Chandigarh","Kanpur","Ranchi","Kochi","Trivandrum","Varanasi","Allahabad","Dehradun","Vizag"];

const FOLLOWER_BUCKETS = [
  { id: "all", label: "All (Default)", min: null, max: null },
  { id: "lt25k", label: "Less than 25K", min: 0, max: 25000 },
  { id: "25-50k", label: "25K – 50K", min: 25000, max: 50000 },
  { id: "50-100k", label: "50K – 100K", min: 50000, max: 100000 },
  { id: "100-250k", label: "100K – 250K", min: 100000, max: 250000 },
  { id: "250-500k", label: "250K – 500K", min: 250000, max: 500000 },
  { id: "500-1m", label: "500K – 1M", min: 500000, max: 1000000 },
  { id: "1-3m", label: "1M – 3M", min: 1000000, max: 3000000 },
  { id: "3m+", label: "3M+", min: 3000000, max: null },
];

const SORT_OPTIONS = [
  { id: "performance", label: "Top Performance (Default)" },
  { id: "followers", label: "Most Followers" },
  { id: "engagement", label: "Highest Engagement" },
  { id: "budget", label: "Lowest Budget" },
];

const SOCIAL_PLATFORMS = [
  { id: "", label: "All (Default)" },
  { id: "instagram", label: "Instagram" },
  { id: "youtube", label: "YouTube" },
];

const GENDERS = [
  { id: "", label: "All (Default)" },
  { id: "female", label: "Female" },
  { id: "male", label: "Male" },
  { id: "other", label: "Non-binary" },
];

const CREATOR_TYPES = [
  { id: "", label: "All" },
  { id: "influencer", label: "Influencer" },
  { id: "celebrity", label: "Celebrity" },
  { id: "publisher", label: "Publisher" },
];

const CONTENT_QUALITY = ["Professional", "Standard", "Studio"];
const ACTIVITY = ["Active in last 7 days", "Active in last 30 days", "Active in last 90 days"];
const LABELS = ["Verified", "Exclusive Club", "Rising Star", "Top Rated"];

const TABS = [
  "Sort by", "Social Platform", "Categories", "Location",
  "Follower Count", "Gender", "Content Language", "Content Quality",
  "Creator Type", "Label", "Activity",
];

// =================== Main Modal ===================
export default function AllFiltersModal({ open, onClose, filters, setFilters, onApply }) {
  const [activeTab, setActiveTab] = useState("Sort by");
  const [draft, setDraft] = useState(filters);
  const [expandedCat, setExpandedCat] = useState(null);
  const [langSearch, setLangSearch] = useState("");

  React.useEffect(() => { if (open) setDraft(filters); }, [open, filters]);

  const filteredLangs = useMemo(
    () => LANGUAGES.filter((l) => l.toLowerCase().includes(langSearch.toLowerCase())),
    [langSearch]
  );

  if (!open) return null;

  const update = (k, v) => setDraft((d) => ({ ...d, [k]: v }));
  const toggleArr = (k, v) => {
    setDraft((d) => {
      const arr = d[k] || [];
      return { ...d, [k]: arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v] };
    });
  };

  const clear = () => {
    const empty = {
      sort_by: "performance", platform: "", categories: [], sub_categories: [], city: "",
      follower_bucket: "all", gender: "", languages: [], content_quality: [],
      creator_type: "", labels: [], activity: "",
    };
    setDraft(empty);
  };

  const apply = () => {
    setFilters(draft);
    onApply?.(draft);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6" onClick={onClose} data-testid="all-filters-modal">
      <div onClick={(e) => e.stopPropagation()} className="bg-[#0F0F14] w-full max-w-5xl rounded-t-3xl md:rounded-3xl border border-white/10 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 md:px-7 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#7C5CFF]/15 border border-[#7C5CFF]/30 flex items-center justify-center text-[#9D7CFF]">
              <SearchIcon size={16}/>
            </div>
            <h2 className="font-display text-2xl tracking-tight">All Filters</h2>
          </div>
          <button onClick={onClose} data-testid="filters-close" className="p-2 hover:bg-white/5 rounded-lg"><X size={20}/></button>
        </div>

        {/* Two-column body */}
        <div className="flex-1 overflow-hidden grid grid-cols-[140px_1fr] md:grid-cols-[200px_1fr]">
          {/* LEFT — tab rail */}
          <aside className="border-r border-white/10 overflow-y-auto scroll-thin py-2 bg-[#0A0A10]">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                data-testid={`filter-tab-${t.replace(/\s+/g,'-').toLowerCase()}`}
                className={`w-full text-left px-4 md:px-5 py-3.5 text-sm border-l-2 transition-colors ${activeTab === t ? "text-[#9D7CFF] font-semibold border-[#9D7CFF] bg-[#7C5CFF]/8" : "text-white/55 border-transparent hover:bg-white/3 hover:text-white/80"}`}
              >
                {t}
              </button>
            ))}
          </aside>

          {/* RIGHT — options */}
          <section className="overflow-y-auto scroll-thin px-5 md:px-8 py-5">
            <h3 className="font-semibold text-lg mb-4 text-white">Filter by {activeTab.replace("Sort by", "Sort")}</h3>

            {activeTab === "Sort by" && (
              <RadioList options={SORT_OPTIONS} value={draft.sort_by} onChange={(v) => update("sort_by", v)} testIdPrefix="sort"/>
            )}

            {activeTab === "Social Platform" && (
              <RadioList options={SOCIAL_PLATFORMS} value={draft.platform} onChange={(v) => update("platform", v)} testIdPrefix="platform"/>
            )}

            {activeTab === "Categories" && (
              <div className="space-y-1.5">
                {Object.entries(CATEGORIES_WITH_SUBS).map(([cat, subs]) => {
                  const expanded = expandedCat === cat;
                  const checked = (draft.categories || []).includes(cat);
                  return (
                    <div key={cat} className="border border-white/10 rounded-xl overflow-hidden bg-white/3">
                      <button
                        onClick={() => setExpandedCat(expanded ? null : cat)}
                        data-testid={`cat-${cat.replace(/\s+/g,'-').toLowerCase()}`}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5"
                      >
                        <CheckBox checked={checked} onChange={(e) => { e.stopPropagation(); toggleArr("categories", cat); }}/>
                        <span className="flex-1 text-left text-sm font-medium">{cat}</span>
                        <span className="text-xs text-white/40 mr-1">{subs.length} subs</span>
                        <ChevronRight size={16} className={`text-white/40 transition-transform ${expanded ? "rotate-90" : ""}`}/>
                      </button>
                      {expanded && (
                        <div className="px-4 pb-3 pt-1 grid grid-cols-1 md:grid-cols-2 gap-1 border-t border-white/5 bg-black/20">
                          {subs.map((s) => (
                            <label key={s} className="flex items-center gap-2.5 py-1.5 px-2 rounded hover:bg-white/5 cursor-pointer">
                              <CheckBox checked={(draft.sub_categories || []).includes(s)} onChange={() => toggleArr("sub_categories", s)}/>
                              <span className="text-sm text-white/75">{s}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === "Location" && (
              <CheckList options={CITIES} values={draft.city ? [draft.city] : []} onChange={(v) => update("city", draft.city === v ? "" : v)} single/>
            )}

            {activeTab === "Follower Count" && (
              <RadioList options={FOLLOWER_BUCKETS.map((b) => ({ id: b.id, label: b.label }))} value={draft.follower_bucket || "all"} onChange={(v) => update("follower_bucket", v)} testIdPrefix="fc"/>
            )}

            {activeTab === "Gender" && (
              <RadioList options={GENDERS} value={draft.gender} onChange={(v) => update("gender", v)} testIdPrefix="gender"/>
            )}

            {activeTab === "Content Language" && (
              <div>
                <div className="relative mb-4">
                  <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9D7CFF]"/>
                  <input value={langSearch} onChange={(e) => setLangSearch(e.target.value)} placeholder="Search by Language" data-testid="lang-search" className="w-full pl-10 pr-3 py-2.5 bg-transparent border-b border-white/15 focus:border-[#7C5CFF] outline-none text-sm"/>
                </div>
                <CheckList options={filteredLangs} values={draft.languages || []} onChange={(v) => toggleArr("languages", v)}/>
              </div>
            )}

            {activeTab === "Content Quality" && (
              <CheckList options={CONTENT_QUALITY} values={draft.content_quality || []} onChange={(v) => toggleArr("content_quality", v)}/>
            )}

            {activeTab === "Creator Type" && (
              <RadioList options={CREATOR_TYPES} value={draft.creator_type} onChange={(v) => update("creator_type", v)} testIdPrefix="ctype"/>
            )}

            {activeTab === "Label" && (
              <CheckList options={LABELS} values={draft.labels || []} onChange={(v) => toggleArr("labels", v)}/>
            )}

            {activeTab === "Activity" && (
              <RadioList options={[{ id: "", label: "All" }, ...ACTIVITY.map((a) => ({ id: a, label: a }))]} value={draft.activity} onChange={(v) => update("activity", v)} testIdPrefix="act"/>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-5 md:px-7 py-4 border-t border-white/10">
          <button onClick={clear} data-testid="filters-clear" className="flex-1 md:flex-none px-6 py-3 rounded-full bg-white/8 hover:bg-white/12 text-white/80 font-medium text-sm">Clear Filters</button>
          <div className="flex-1"></div>
          <button onClick={apply} data-testid="filters-apply" className="px-8 py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors">Done</button>
        </div>
      </div>
    </div>
  );
}

// ===== Reusable =====
function CheckBox({ checked, onChange }) {
  return (
    <button type="button" onClick={onChange} className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${checked ? "bg-[#7C5CFF] border-[#7C5CFF]" : "border-white/25 hover:border-white/50"}`}>
      {checked && <Check size={13} className="text-white"/>}
    </button>
  );
}

function Radio({ checked }) {
  return (
    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${checked ? "border-[#7C5CFF]" : "border-white/25"}`}>
      {checked && <div className="w-2.5 h-2.5 rounded-full bg-[#7C5CFF]"/>}
    </div>
  );
}

function RadioList({ options, value, onChange, testIdPrefix }) {
  return (
    <div className="space-y-1">
      {options.map((o) => (
        <label key={o.id} data-testid={`${testIdPrefix}-${o.id || "all"}`} onClick={() => onChange(o.id)} className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-white/3 cursor-pointer">
          <Radio checked={value === o.id || (!value && o.id === "")}/>
          <span className="text-sm">{o.label}</span>
        </label>
      ))}
    </div>
  );
}

function CheckList({ options, values, onChange, single }) {
  return (
    <div className="space-y-1">
      {options.map((o) => (
        <label key={o} onClick={() => onChange(o)} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-white/3 cursor-pointer">
          {single ? <Radio checked={values.includes(o)}/> : <CheckBox checked={values.includes(o)} onChange={() => onChange(o)}/>}
          <span className="text-sm">{o}</span>
        </label>
      ))}
    </div>
  );
}
