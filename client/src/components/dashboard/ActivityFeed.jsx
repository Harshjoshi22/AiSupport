import React from 'react';
import { formatDate } from '../../utils/formatters';
import { TicketStatusBadge } from '../tickets/TicketStatusBadge';
import { PriorityBadge } from '../tickets/PriorityBadge';
import { MessageSquare, Ticket, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ActivityFeed = ({ recentTickets = [], recentConversations = [], isAgent = false }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Tickets Card */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 glass-panel">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400">
              <Ticket className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-base">Recent Support Tickets</h3>
          </div>
          <Link
            to={isAgent ? '/agent/tickets' : '/admin/tickets'}
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {recentTickets.length > 0 ? (
            recentTickets.map((t) => (
              <div
                key={t._id}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors flex items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-brand-400">{t.ticketNumber}</span>
                    <TicketStatusBadge status={t.status} />
                    <PriorityBadge priority={t.priority} />
                  </div>
                  <p className="text-xs font-semibold text-white truncate">{t.title}</p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-500" />
                    {t.customerId?.name || 'Customer'} • {formatDate(t.createdAt)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 text-center py-6">No recent tickets available.</p>
          )}
        </div>
      </div>

      {/* Recent Conversations Card */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 glass-panel">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-base">Recent Conversations</h3>
          </div>
          <Link
            to={isAgent ? '/agent/conversations' : '/admin/conversations'}
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {recentConversations.length > 0 ? (
            recentConversations.map((c) => (
              <div
                key={c._id}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors flex items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        c.mode === 'human'
                          ? 'bg-purple-950/80 border-purple-500/30 text-purple-400'
                          : 'bg-brand-950/80 border-brand-500/30 text-brand-400'
                      }`}
                    >
                      {c.mode === 'human' ? 'HUMAN SUPPORT' : 'AI RESOLVED'}
                    </span>
                    <span className="text-[11px] text-slate-400">{formatDate(c.updatedAt)}</span>
                  </div>
                  <p className="text-xs font-semibold text-white truncate">{c.title || 'Support Chat'}</p>
                  <p className="text-[11px] text-slate-400">
                    Customer: {c.customerId?.name || 'Customer'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 text-center py-6">No recent conversations recorded.</p>
          )}
        </div>
      </div>
    </div>
  );
};
