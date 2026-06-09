import React, { useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";
import CreatorCard from "../components/CreatorCard";
import { Search, SlidersHorizontal } from "lucide-react";

const CATEGORIES = ["Fashion","Beauty","Tech","Food","Travel","Fitness","Comedy","Lifestyle","Finance","Education","Music","Art","Parenting","Sports","Gaming","Spiritual","Automotive","Wellness","Books","Home Decor"];
const LANGUAGES = ["Hindi","English","Tamil","Telugu","Marathi","Bengali","Gujarati","Punjabi","Kannada","Malayalam"];
const CITIES = ["Mumbai","Lucknow","Jaipur","Indore","Surat","Hyderabad","Patna","Chennai","Kanpur","Bhopal","Ranchi","Kochi","Varanasi","Ahmedabad","Chandigarh","Bangalore","Nagpur","Kolkata","Allahabad","Pune","Vizag","Trivandrum","Dehradun"];

export default function Explore() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState({
    category: "", city: "", platform: "", language: "", gender: "",
    barter: "", creator_type: "",
    min_followers: "", max_followers: "", max_budget: "", min_engagement: "",
    sort_by: "performance",
  });

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    Object.entries(filters).forEach(([k, v]) => { if (v !== "" && v !== null && v !== undefined) params.set(k, v); });
    api.get(`/creators?${params.toString()}`)
      .then(({data}) => { setCreators(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [q, filters]);

  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [load]);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12" data-testid="explore-page">
      <h1 className="font-display text-5xl tracking-tight">Discover Bharat creators</h1>
      <p className="text-white/70 mt-2">{creators.length} creators · transparent rate cards · verified engagement</p>

      <div className="mt-8 flex gap-3 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18}/>
          <input data-testid="search-input" value={q} onChange={(e)=>setQ(e.target.value)} className="input-field pl-10" placeholder="Search creators by name..."/>
        </div>
        <select data-testid="sort-select" value={filters.sort_by} onChange={(e)=>setFilters({...filters, sort_by:e.target.value})} className="input-field max-w-[200px]">
          <option value="performance">Top Performance</option>
          <option value="followers">Followers (High to Low)</option>
          <option value="engagement">Engagement Rate</option>
          <option value="budget">Budget (Low to High)</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-8">
        {/* Filters sidebar */}
        <aside className="md:col-span-1 bg-[#13131B] border border-white/10 rounded-2xl p-5 h-fit sticky top-20" data-testid="filters-panel">
          <div className="flex items-center gap-2 mb-4"><SlidersHorizontal size={16}/><h2 className="font-display text-xl">Filters</h2></div>

          <FilterSection label="Category">
            <select data-testid="filter-category" value={filters.category} onChange={(e)=>setFilters({...filters, category:e.target.value})} className="input-field text-sm"><option value="">All</option>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select>
          </FilterSection>
          <FilterSection label="City">
            <select data-testid="filter-city" value={filters.city} onChange={(e)=>setFilters({...filters, city:e.target.value})} className="input-field text-sm"><option value="">All</option>{CITIES.map(c=><option key={c}>{c}</option>)}</select>
          </FilterSection>
          <FilterSection label="Platform">
            <select data-testid="filter-platform" value={filters.platform} onChange={(e)=>setFilters({...filters, platform:e.target.value})} className="input-field text-sm"><option value="">Any</option><option value="instagram">Instagram</option><option value="youtube">YouTube</option></select>
          </FilterSection>
          <FilterSection label="Language">
            <select data-testid="filter-language" value={filters.language} onChange={(e)=>setFilters({...filters, language:e.target.value})} className="input-field text-sm"><option value="">All</option>{LANGUAGES.map(l=><option key={l}>{l}</option>)}</select>
          </FilterSection>
          <FilterSection label="Gender">
            <select data-testid="filter-gender" value={filters.gender} onChange={(e)=>setFilters({...filters, gender:e.target.value})} className="input-field text-sm"><option value="">All</option><option>female</option><option>male</option><option>other</option></select>
          </FilterSection>
          <FilterSection label="Followers Range">
            <div className="grid grid-cols-2 gap-2">
              <input data-testid="filter-min-followers" type="number" placeholder="Min" value={filters.min_followers} onChange={(e)=>setFilters({...filters, min_followers:e.target.value})} className="input-field text-sm"/>
              <input data-testid="filter-max-followers" type="number" placeholder="Max" value={filters.max_followers} onChange={(e)=>setFilters({...filters, max_followers:e.target.value})} className="input-field text-sm"/>
            </div>
          </FilterSection>
          <FilterSection label="Max Budget (₹)">
            <input data-testid="filter-budget" type="number" placeholder="e.g. 25000" value={filters.max_budget} onChange={(e)=>setFilters({...filters, max_budget:e.target.value})} className="input-field text-sm"/>
          </FilterSection>
          <FilterSection label="Min Engagement %">
            <input data-testid="filter-engagement" type="number" step="0.1" placeholder="e.g. 5" value={filters.min_engagement} onChange={(e)=>setFilters({...filters, min_engagement:e.target.value})} className="input-field text-sm"/>
          </FilterSection>
          <FilterSection label="Barter">
            <select data-testid="filter-barter" value={filters.barter} onChange={(e)=>setFilters({...filters, barter:e.target.value})} className="input-field text-sm"><option value="">Any</option><option value="cash_only">Cash only</option><option value="barter_ok">Barter OK</option><option value="partial_barter">Partial barter</option></select>
          </FilterSection>
          <FilterSection label="Creator Type">
            <select data-testid="filter-type" value={filters.creator_type} onChange={(e)=>setFilters({...filters, creator_type:e.target.value})} className="input-field text-sm"><option value="">All</option><option value="influencer">Influencer</option><option value="celebrity">Celebrity</option><option value="publisher">Publisher</option></select>
          </FilterSection>

          <button onClick={()=>setFilters({category:"",city:"",platform:"",language:"",gender:"",barter:"",creator_type:"",min_followers:"",max_followers:"",max_budget:"",min_engagement:"",sort_by:"performance"})} data-testid="clear-filters" className="w-full mt-4 text-sm text-[#9D7CFF] font-semibold hover:underline">Clear filters</button>
        </aside>

        {/* Results */}
        <section className="md:col-span-3" data-testid="creators-grid">
          {loading ? (
            <div className="text-white/70">Loading creators...</div>
          ) : creators.length === 0 ? (
            <div className="bg-[#13131B] border border-white/10 rounded-2xl p-12 text-center text-white/70">No creators match your filters.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {creators.map((c, i) => <CreatorCard key={c.user_id} c={c} index={i}/>)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function FilterSection({ label, children }) {
  return (
    <div className="mb-4 pb-4 border-b border-white/10 last:border-0">
      <div className="label-mini mb-2">{label}</div>
      {children}
    </div>
  );
}
