import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { useSocket } from '../../hooks/useSocket';
import { ticketService } from '../../services/ticket.service';
import { chatService } from '../../services/chat.service';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { TicketStatusBadge } from '../../components/tickets/TicketStatusBadge';
import { PriorityBadge } from '../../components/tickets/PriorityBadge';
import { formatDate } from '../../utils/formatters';
import {
  Bot,
  Ticket,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Headphones,
  HelpCircle,
  Clock,
} from 'lucide-react';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [tickets, setTickets] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [ticketRes, convRes] = await Promise.all([
        ticketService.getTickets(),
        chatService.getConversations(),
      ]);
      setTickets(ticketRes.tickets || []);
      setConversations(convRes.conversations || []);
    } catch (err) {
      console.error('Error fetching customer data', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Real-time socket sync
  useEffect(() => {
    if (!socket) return;

    const handleRealtimeUpdate = () => {
      fetchData(true);
    };

    socket.on('new_ticket', handleRealtimeUpdate);
    socket.on('ticket_updated', handleRealtimeUpdate);
    socket.on('ticket_status_changed', handleRealtimeUpdate);
    socket.on('conversation_resolved', handleRealtimeUpdate);
    socket.on('conversation_escalated', handleRealtimeUpdate);

    return () => {
      socket.off('new_ticket', handleRealtimeUpdate);
      socket.off('ticket_updated', handleRealtimeUpdate);
      socket.off('ticket_status_changed', handleRealtimeUpdate);
      socket.off('conversation_resolved', handleRealtimeUpdate);
      socket.off('conversation_escalated', handleRealtimeUpdate);
    };
  }, [socket]);

  const openTickets = tickets.filter((t) => {
    const s = (t.status || '').toUpperCase();
    return s === 'OPEN' || s === 'HUMAN_REQUIRED' || s === 'IN_PROGRESS' || s === 'WAITING_CUSTOMER';
  });

  const resolvedTickets = tickets.filter((t) => {
    const s = (t.status || '').toUpperCase();
    return s === 'RESOLVED' || s === 'CLOSED';
  });

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-900/40 via-slate-900 to-slate-900 border border-brand-500/20 shadow-2xl relative overflow-hidden glass-card">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{user?.organization?.name || 'AI SupportHub'} Customer Center</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Hi, {user?.name}! How can we assist you today?
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            Get instant AI answers regarding {user?.organization?.name || 'your services'}, policies, and technical documentation, or request live human agent support.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link to="/chat">
              <Button variant="primary" size="md" icon={Bot}>
                Ask AI Assistant Now
              </Button>
            </Link>
            <Link to="/tickets">
              <Button variant="secondary" size="md" icon={Ticket}>
                Create Support Ticket
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Active Support Tickets"
          value={openTickets.length}
          icon={Ticket}
          color="brand"
          subtext="Issues currently in resolution"
        />
        <StatCard
          title="Total Conversations"
          value={conversations.length}
          icon={MessageSquare}
          color="purple"
          subtext="AI & agent chat sessions"
        />
        <StatCard
          title="Resolved Inquiries"
          value={resolvedTickets.length}
          icon={Bot}
          color="emerald"
          subtext="Successfully answered"
        />
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Tickets Preview */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 glass-panel">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400">
                <Ticket className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-base">Your Active Tickets</h3>
            </div>
            <Link to="/tickets" className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {openTickets.length > 0 ? (
              openTickets.slice(0, 3).map((t) => (
                <div
                  key={t._id}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-brand-400">{t.ticketNumber}</span>
                      <TicketStatusBadge status={t.status} />
                      <PriorityBadge priority={t.priority} />
                    </div>
                    <p className="text-xs font-semibold text-white truncate">{t.title}</p>
                    <p className="text-[11px] text-slate-400">{formatDate(t.createdAt)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-6 text-center">You have no open tickets.</p>
            )}
          </div>
        </div>

        {/* Recent Conversations Preview */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 glass-panel">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-base">Recent AI & Agent Chats</h3>
            </div>
            <Link to="/conversations" className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {conversations.length > 0 ? (
              conversations.slice(0, 3).map((c) => (
                <Link
                  key={c._id}
                  to={`/chat?id=${c._id}`}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between gap-3 transition-colors block"
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
                        {c.mode === 'human' ? 'HUMAN AGENT' : 'AI ASSISTANT'}
                      </span>
                      <span className="text-[11px] text-slate-400">{formatDate(c.updatedAt)}</span>
                    </div>
                    <p className="text-xs font-semibold text-white truncate">{c.title || 'Support Chat'}</p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-6 text-center">No recent conversations.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
