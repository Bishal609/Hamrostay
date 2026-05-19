import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatsCard({ title, value, icon: Icon, change, changeLabel, color = "gold", prefix = "", suffix = "" }) {
  const colorMap = {
    gold:    { bg: "bg-gold-500/10",    text: "text-gold-400",    border: "border-gold-500/20" },
    blue:    { bg: "bg-blue-500/10",    text: "text-blue-400",    border: "border-blue-500/20" },
    green:   { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
    purple:  { bg: "bg-purple-500/10",  text: "text-purple-400",  border: "border-purple-500/20" },
    red:     { bg: "bg-red-500/10",     text: "text-red-400",     border: "border-red-500/20" },
  };
  const c = colorMap[color] || colorMap.gold;
  const isPositive = parseFloat(change) >= 0;

  return (
    <div className={`card border ${c.border} p-6 hover:scale-[1.02] transition-transform duration-200`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-dark-400 text-sm font-medium mb-1">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-white font-mono">
            {prefix}{typeof value === "number" ? value.toLocaleString() : value}{suffix}
          </p>
        </div>
        <div className={`w-11 h-11 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${c.text}`} />
        </div>
      </div>
      {change !== undefined && (
        <div className="flex items-center gap-1.5">
          {isPositive ? (
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-red-400" />
          )}
          <span className={`text-sm font-semibold ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
            {isPositive ? "+" : ""}{change}%
          </span>
          {changeLabel && <span className="text-dark-500 text-xs">{changeLabel}</span>}
        </div>
      )}
    </div>
  );
}