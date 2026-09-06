import React from 'react';
import { TicketStatusBadge } from './TicketStatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { formatDate } from '../../utils/formatters';
import { Ticket, User, Clock, ChevronRight } from 'lucide-react';

export const TicketList = ({ tickets = [], onSelectTicket, loading = false }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-slate-900/60 border border-slate-800 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
        <Ticket className="w-10 h-10 text-slate-600 mb-2" />
        <h4 className="text-base font-bold text-slate-300">No Tickets Found</h4>
        <p className="text-xs text-slate-500 mt-1">There are no support tickets matching your current criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tickets.map((t) => (
        <div
          key={t._id}
          onClick={() => onSelectTicket(t)}
          className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-brand-500/40 hover:bg-slate-850 cursor-pointer transition-all duration-200 shadow-sm gap-3"
        >
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold text-brand-400">{t.ticketNumber}</span>
              <TicketStatusBadge status={t.status} />
              <PriorityBadge priority={t.priority} />
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                {t.category}
              </span>
            </div>

            <h4 className="text-sm font-semibold text-white truncate group-hover:text-brand-300 transition-colors">
              {t.title}
            </h4>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-500" />
                {t.customerId?.name || 'Customer'}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {formatDate(t.createdAt)}
              </span>
              {t.assignedAgentId && (
                <span className="text-purple-400 font-medium">
                  Agent: {t.assignedAgentId.name}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center text-slate-500 group-hover:text-white transition-colors">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      ))}
    </div>
  );
};
