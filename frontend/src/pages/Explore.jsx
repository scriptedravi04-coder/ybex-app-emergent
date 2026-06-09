/* eslint-disable */
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { api } from "../lib/api";
import CreatorCard from "../components/CreatorCard";
import AllFiltersModal from "../components/AllFiltersModal";
import { Search, SlidersHorizontal, X } from "lucide-react";

const FOLLOWER_BUCKETS = {
  "lt25k": { min: 0, max: 25000 },
  "25-50k": { min: 25000, max: 50000 },
  "50-100k": { min: 50000, max: 100000 },
  "100-250k": { min: 100000, max: 250000 },
  "250-500k": { min: 250000, max: 500000 },
  "500-1m": { min: 500000, max: 1000000 },
  "1-3m": { min: 1000000, max: 3000000 },
  "3m+": { min: 3000000, max: null },
};

const DEFAULTS = {
  sort_by: "performance", platform: "", categories: [], sub_categories: [], city: "",
  follower_bucket: "all", gender: "", languages: [], content_quality: [],
  creator_type: "", labels: [], activity: "",
};

export default function Explore() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState(DEFAULTS);
  const [modalOpen, setModalOpen] = useState(false);

  const activeCount = useMemo(() => {
    let n = 0;
    if (filters.platform) n++;
    if ((filters.categories || []).length) n++;
    if ((filters.sub_categories || []).length) n++;
    if (filters.city) n++;
    if (filters.follower_bucket && filters.follower_bucket !== "all") n++;
    if (filters.gender) n++;
    if ((filters.languages || []).length) n++;
    if ((filters.content_quality || []).length) n++;
    if (filters.creator_type) n++;
    if ((filters.labels || []).length) n++;
    if (filters.activity) n++;
    return n;
  }, [filters]);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (filters.sort_by) params.set("sort_by", filters.sort_by);
    if (filters.platform) params.set("platform", filters.platform);
    if (filters.city) params.set("city", filters.city);
    if (filters.gender) params.set("gender", filters.gender);
    if (filters.creator_type) params.set("creator_type", filters.creator_type);
    // First category if multiple selected
    if ((filters.categories || []).length > 0) params.set("category", filters.categories[0]);
    // First language
    if ((filters.languages || []).length > 0) params.set("language", filters.languages[0]);
    // Follower bucket → min/max
    const bucket = FOLLOWER_BUCKETS[filters.follower_bucket];
    if (bucket) {
      if (bucket.min !== null) params.set("min_followers", bucket.min);
      if (bucket.max !== null) params.set("max_followers", bucket.max);
    }
    api.get(`/creators?${params.toString()}`)
      .then(({ data }) => {
        // Client-side filter for multi-select fields backend doesn't support
        let out = data;
        if ((filters.categories || []).length > 1) {
          const set = new Set(filters.categories);
          out = out.filter((c) => set.has(c.category));
        }
        if ((filters.sub_categories || []).length) {
          const set = new Set(filters.sub_categories);
          out = out.filter((c) => (c.sub_categories || []).some((s) => set.has(s)));
        }
        if ((filters.languages || []).length > 1) {
          const set = new Set(filters.languages);
          out = out.filter((c) => (c.languages || []).some((l) => set.has(l)));
        }
        setCreators(out);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [q, filters]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const removeChip = (type, value) => {
    setFilters((f) => {
      const next = { ...f };
      if (Array.isArray(next[type])) next[type] = next[type].filter((x) => x !== value);
      else next[type] = "";
      if (type === "follower_bucket") next.follower_bucket = "all";
      return next;
    });
  };

  const chips = [
    filters.platform && { label: filters.platform, type: "platform", value: filters.platform },
    ...(filters.categories || []).map((c) => ({ label: c, type: "categories", value: c })),
    ...(filters.sub_categories || []).map((c) => ({ label: c, type: "sub_categories", value: c })),
    filters.city && { label: filters.city, type: "city", value: filters.city },
    filters.follower_bucket && filters.follower_bucket !== "all" && {
      label: filters.follower_bucket.replace("lt", "<").replace("k", "K").replace("m", "M").replace("-", "–"),
      type: "follower_bucket", value: filters.follower_bucket,
    },
    filters.gender && { label: filters.gender, type: "gender", value: filters.gender },
    ...(filters.languages || []).map((l) => ({ label: l, type: "languages", value: l })),
    ...(filters.content_quality || []).map((q) => ({ label: q, type: "content_quality", value: q })),
    filters.creator_type && { label: filters.creator_type, type: "creator_type", value: filters.creator_type },
    ...(filters.labels || []).map((l) => ({ label: l, type: "labels", value: l })),
    filters.activity && { label: filters.activity, type: "activity", value: filters.activity },
  ].filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-12" data-testid="explore-page">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <span className="label-mini">Search</span>
          <h1 className="font-display text-5xl tracking-tighter mt-2">The Influencer Directory</h1>
          <p className="text-white/50 mt-2">{creators.length} creators · transparent rate cards · verified engagement</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="pill pill-gray">Sort: <span className="text-white capitalize ml-1">{filters.sort_by.replace("_", " ")}</span></span>
        </div>
      </div>

      <div className="mt-8 flex gap-3 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18}/>
          <input data-testid="search-input" value={q} onChange={(e) => setQ(e.target.value)} className="input-field pl-10" placeholder="Search creators by name..."/>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          data-testid="open-filters-btn"
          className="btn-secondary relative"
        >
          <SlidersHorizontal size={16}/> All Filters
          {activeCount > 0 && (
            <span className="ml-1 inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-[#7C5CFF] text-white text-xs font-bold">{activeCount}</span>
          )}
        </button>
      </div>

      {/* Active filter chips */}
      {chips.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2" data-testid="active-chips">
          {chips.map((c, i) => (
            <button key={`${c.type}-${c.value}-${i}`} onClick={() => removeChip(c.type, c.value)} className="pill pill-violet hover:bg-[#7C5CFF]/25" data-testid={`chip-${c.type}-${c.value}`}>
              {c.label} <X size={12}/>
            </button>
          ))}
          <button onClick={() => setFilters(DEFAULTS)} className="pill pill-gray hover:bg-white/10" data-testid="clear-all-chips">Clear all</button>
        </div>
      )}

      {/* Results */}
      <section className="mt-8" data-testid="creators-grid">
        {loading ? (
          <div className="text-white/50">Loading creators...</div>
        ) : creators.length === 0 ? (
          <div className="bg-[#13131B] border border-white/10 rounded-2xl p-12 text-center text-white/40">No creators match your filters. Try clearing some.</div>
        ) : (
          <motion.div
            initial="hidden" animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {creators.map((c, i) => <CreatorCard key={c.user_id} c={c} index={i}/>)}
          </motion.div>
        )}
      </section>

      <AllFiltersModal open={modalOpen} onClose={() => setModalOpen(false)} filters={filters} setFilters={setFilters} onApply={() => { /* triggers re-load via state change */ }}/>
    </div>
  );
}
