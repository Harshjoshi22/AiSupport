import React from 'react';
import { PieChart, BarChart2 } from 'lucide-react';

export const CategoryChart = ({ categories = [], priorities = [] }) => {
  const totalCategoryCount = categories.reduce((sum, item) => sum + item.value, 0) || 1;
  const totalPriorityCount = priorities.reduce((sum, item) => sum + item.value, 0) || 1;

  const categoryColors = {
    Billing: 'bg-emerald-500',
    Technical: 'bg-brand-500',
    Account: 'bg-purple-500',
    'Course/Product': 'bg-indigo-500',
    Refund: 'bg-amber-500',
    General: 'bg-slate-500',
  };

  const priorityColors = {
    Urgent: 'bg-rose-500',
    High: 'bg-orange-500',
    Medium: 'bg-amber-500',
    Low: 'bg-slate-500',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Category Breakdown */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 glass-panel">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <PieChart className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-white text-base">Ticket Categories</h3>
        </div>

        <div className="space-y-3 pt-2">
          {categories.map((cat) => {
            const percentage = Math.round((cat.value / totalCategoryCount) * 100);
            return (
              <div key={cat.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-300">{cat.name}</span>
                  <span className="text-slate-400 font-mono">
                    {cat.value} ({percentage}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      categoryColors[cat.name] || 'bg-brand-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Priority Breakdown */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 glass-panel">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <BarChart2 className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-white text-base">Ticket Priority Distribution</h3>
        </div>

        <div className="space-y-3 pt-2">
          {priorities.map((pri) => {
            const percentage = Math.round((pri.value / totalPriorityCount) * 100);
            return (
              <div key={pri.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-300">{pri.name}</span>
                  <span className="text-slate-400 font-mono">
                    {pri.value} ({percentage}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      priorityColors[pri.name] || 'bg-slate-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
