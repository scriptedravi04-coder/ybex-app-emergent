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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.4 }}
      data-testid={`creator-card-${c.user_id}`}
      className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden hover:border-[#E84A27] transition-all duration-300 group"
    >
      <Link to={`/creator/${c.user_id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#F7F5F2]">
          <img src={c.photo || c.picture} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          {c.performance_score >= 85 && (
            <div className="absolute top-3 left-3 bg-[#1A4331] text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
              <TrendingUp size={11}/> Top {Math.max(1, 100 - (c.performance_score || 0))}%
            </div>
          )}
          <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur px-2 py-1 rounded-full text-xs font-mono">
            {c.engagement_rate}% ER
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display text-lg leading-tight">{c.name}</h3>
              <p className="text-xs text-[#525252] flex items-center gap-1 mt-0.5">
                <MapPin size={11}/> {c.city}, {c.state}
              </p>
            </div>
            <CheckCircle2 size={16} className="text-[#1A4331] flex-shrink-0" />
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="text-xs px-2 py-0.5 rounded-full border border-[#E5E5E5] text-[#525252]">{c.category}</span>
            {(c.languages || []).slice(0, 2).map((l) => (
              <span key={l} className="text-xs px-2 py-0.5 rounded-full border border-[#E5E5E5] text-[#525252]">{l}</span>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#E5E5E5] pt-3">
            <div>
              <div className="label-mini">Reach</div>
              <div className="font-display text-base">{formatNum(totalFollowers)}</div>
            </div>
            <div>
              <div className="label-mini">Score</div>
              <div className="font-display text-base text-[#1A4331]">{c.performance_score}</div>
            </div>
            <div>
              <div className="label-mini">From</div>
              <div className="font-display text-base">₹{formatNum(minRate)}</div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
