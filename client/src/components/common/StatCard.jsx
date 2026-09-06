import React from 'react';

export const StatCard = ({ title, value, change, icon: Icon, color = 'brand', subtext = '' }) => {
  const colorMap = {
    brand: 'from-brand-500/20 to-brand-500/5 text-brand-400 border-brand-500/20',
    emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/20',
    purple: 'from-purple-500/20 to-purple-500/5 text-purple-400 border-purple-500/20',
    amber: 'from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/20',
    rose: 'from-rose-500/20 to-rose-500/5 text-rose-400 border-rose-500/20',
  };

  const iconBgMap = {
    brand: 'bg-brand-500/10 text-brand-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    purple: 'bg-purple-500/10 text-purple-400',
    amber: 'bg-amber-500/10 text-amber-400',
    rose: 'bg-rose-500/10 text-rose-400',
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 border bg-gradient-to-br glass-panel ${
        colorMap[color] || colorMap.brand
      } transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="mt-2 text-3xl font-extrabold text-white tracking-tight">{value}</h3>
          {subtext && <p className="mt-1 text-xs text-slate-400">{subtext}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${iconBgMap[color] || iconBgMap.brand}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {change && (
        <div className="mt-4 flex items-center gap-1.5 text-xs font-medium">
          <span className={change.startsWith('+') ? 'text-emerald-400' : 'text-slate-400'}>{change}</span>
          <span className="text-slate-500">vs last week</span>
        </div>
      )}
    </div>
  );
};
