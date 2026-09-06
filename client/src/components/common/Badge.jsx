import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const variants = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    brand: 'bg-brand-950/80 text-brand-400 border-brand-500/30',
    success: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-950/80 text-amber-400 border-amber-500/30',
    danger: 'bg-rose-950/80 text-rose-400 border-rose-500/30',
    purple: 'bg-purple-950/80 text-purple-400 border-purple-500/30',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-sm ${variants[variant] || variants.default} ${
        sizes[size] || sizes.md
      } ${className}`}
    >
      {children}
    </span>
  );
};
