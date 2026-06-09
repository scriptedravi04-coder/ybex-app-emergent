import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { Trophy, MapPin, TrendingUp } from "lucide-react";

const CATEGORIES = ["Fashion","Beauty","Tech","Food","Travel","Fitness","Comedy","Lifestyle","Finance","Education","Music"];

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [category, setCategory] = useState("");

  useEffect(() => {
    const p = category ? `?category=${category}&limit=25` : "?limit=25";
    api.get(`/leaderboard${p}`).then(({data})=>setRows(data)).catch(()=>{});
  }, [category]);

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-12 py-12" data-testid="leaderboard-page">
      <div className="flex items-center gap-3">
        <Trophy className="text-[#9D7CFF]" size={36}/>
        <h1 className="font-display text-5xl tracking-tight">Performance Leaderboard</h1>
      </div>
      <p className="text-white/70 mt-2">Top creators ranked by verified engagement, content quality & ROI delivered.</p>

      <div className="mt-6 flex gap-2 flex-wrap">
        <button onClick={()=>setCategory("")} className={`px-4 py-1.5 text-sm rounded-full border ${category==="" ? "bg-white/10 text-white border-white/20" : "border-white/10"}`} data-testid="cat-all">All</button>
        {CATEGORIES.map(c => (
          <button key={c} onClick={()=>setCategory(c)} className={`px-4 py-1.5 text-sm rounded-full border ${category===c ? "bg-white/10 text-white border-white/20" : "border-white/10"}`} data-testid={`cat-${c}`}>{c}</button>
        ))}
      </div>

      <div className="mt-8 bg-[#13131B] border border-white/10 rounded-2xl overflow-hidden" data-testid="leaderboard-table">
        <div className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-white/10 label-mini bg-[#13131B]/5">
          <div className="col-span-1">Rank</div>
          <div className="col-span-5">Creator</div>
          <div className="col-span-2">City</div>
          <div className="col-span-2">Engagement</div>
          <div className="col-span-2 text-right">Score</div>
        </div>
        {rows.map((r, i) => (
          <Link to={`/creator/${r.user_id}`} key={r.user_id} className="grid grid-cols-12 gap-2 px-5 py-4 border-b border-white/10 last:border-0 hover:bg-[#13131B]/5 items-center" data-testid={`rank-${i+1}`}>
            <div className="col-span-1 font-display text-2xl">{i+1}</div>
            <div className="col-span-5 flex items-center gap-3">
              <img src={r.photo || r.picture} alt={r.name} className="w-10 h-10 rounded-full object-cover"/>
              <div>
                <div className="font-medium">{r.name}</div>
                <div className="text-xs text-white/40">{r.category}</div>
              </div>
            </div>
            <div className="col-span-2 text-sm text-white/70 flex items-center gap-1"><MapPin size={12}/> {r.city}</div>
            <div className="col-span-2 font-mono text-sm">{r.engagement_rate}%</div>
            <div className="col-span-2 text-right">
              <span className="inline-flex items-center gap-1 font-display text-2xl text-emerald-400">
                <TrendingUp size={14}/> {r.performance_score}
              </span>
            </div>
          </Link>
        ))}
        {rows.length === 0 && <div className="px-5 py-12 text-center text-white/40">No creators</div>}
      </div>
    </div>
  );
}
