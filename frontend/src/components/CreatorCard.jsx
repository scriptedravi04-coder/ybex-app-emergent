import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, MapPin, TrendingUp } from "lucide-react";

const formatNum = (n) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(0) + "K";
  return String(n || 0);
};

export default function CreatorCard({ c, index = 0 }) {
  const totalFollowers = (c.followers_instagram || 0) + (c.followers_youtube || 0);
  const minRate = (() => {
    const rc = c.rate_card || {};
    const vals = Object.values(rc).filter((x) => typeof x === "number");
    return vals.length ? Math.min(...vals) : 0;
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.4 }}
      data-testid={`creator-card-${c.user_id}`}
      className="bg-[#13131B] border border-white/10 rounded-2xl overflow-hidden hover:border-[#7C5CFF]/50 hover:shadow-[0_8px_32px_rgba(124,92,255,0.15)] transition-all duration-300 group"
    >
      <Link to={`/creator/${c.user_id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-black">
          <img src={c.photo || c.picture} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          {c.performance_score >= 85 && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 bg-gradient-to-r from-[#7C5CFF] to-[#5B3EE0] text-white shadow-lg">
              <TrendingUp size={10}/> Top {Math.max(1, 100 - (c.performance_score || 0))}%
            </div>
          )}
          <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur px-2 py-1 rounded-full text-[11px] font-mono text-white">
            {c.engagement_rate}% ER
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-base leading-tight">{c.name}</h3>
              <p className="text-xs text-white/50 flex items-center gap-1 mt-0.5">
                <MapPin size={11}/> {c.city}, {c.state}
              </p>
            </div>
            <CheckCircle2 size={16} className="text-[#9D7CFF] flex-shrink-0" />
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="pill pill-violet" style={{padding:"0.25rem 0.625rem", fontSize:"0.7rem"}}>{c.category}</span>
            {(c.languages || []).slice(0, 1).map((l) => (
              <span key={l} className="pill pill-gray" style={{padding:"0.25rem 0.625rem", fontSize:"0.7rem"}}>{l}</span>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-3">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">Reach</div>
              <div className="font-display text-lg tracking-tight">{formatNum(totalFollowers)}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">Score</div>
              <div className="font-display text-lg tracking-tight text-[#9D7CFF]">{c.performance_score}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">From</div>
              <div className="font-display text-lg tracking-tight">₹{formatNum(minRate)}</div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
