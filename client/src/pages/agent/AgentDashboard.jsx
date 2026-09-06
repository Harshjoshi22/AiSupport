import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { useSocket } from '../../hooks/useSocket';
import { agentService } from '../../services/agent.service';
import { ticketService } from '../../services/ticket.service';
import { chatService } from '../../services/chat.service';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { TicketStatusBadge } from '../../components/tickets/TicketStatusBadge';
import { PriorityBadge } from '../../components/tickets/PriorityBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatters';
import {
  Headphones,
  Ticket,
  MessageSquare,
  AlertTriangle,
  ArrowRight,
  Clock,
  User,
  Zap,
  CheckCircle,
  Building2,
  BookOpen,
  Mail,
  LogOut,
  Globe,
  Star,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export const AgentDashboard = () => {
  const { user, updateUser } = useAuth();
  const { success, error: toastError } = useToast();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const hasCompany = Boolean(user?.organizationId);
  const org = user?.organization;

  const fetchDashboardData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    else setRefreshing(true);

    try {
      if (hasCompany) {
        const [ticketRes, convRes, invRes] = await Promise.all([
          ticketService.getTickets(),
          chatService.getConversations({ status: 'waiting_human' }),
          agentService.getMyInvitations(),
        ]);
        setTickets(ticketRes.tickets || []);
        setConversations(convRes.conversations || []);
        setInvitations(invRes.invitations || []);
      } else {
        const invRes = await agentService.getMyInvitations();
        setInvitations(invRes.invitations || []);
      }
    } catch (err) {
      console.error('Failed to load agent dashboard data', err);
    } finally {
      if (showLoading) setLoading(false);
      else setRefreshing(false);
    }
  }, [hasCompany]);

  useEffect(() => {
    fetchDashboardData(true);
  }, [fetchDashboardData]);

  // Real-time synchronization via Socket.IO
  useEffect(() => {
    if (!socket) return;

    const handleRealtimeUpdate = () => {
      fetchDashboardData(false);
    };

    socket.on('new_ticket', handleRealtimeUpdate);
    socket.on('ticket_updated', handleRealtimeUpdate);
    socket.on('ticket_status_changed', handleRealtimeUpdate);
    socket.on('conversation_escalated', handleRealtimeUpdate);
    socket.on('conversation_resolved', handleRealtimeUpdate);
    socket.on('conversation_updated', handleRealtimeUpdate);
    socket.on('new_invitation', handleRealtimeUpdate);
    socket.on('agent_joined', handleRealtimeUpdate);
    socket.on('agent_left', handleRealtimeUpdate);
    socket.on('agent_removed', handleRealtimeUpdate);

    return () => {
      socket.off('new_ticket', handleRealtimeUpdate);
      socket.off('ticket_updated', handleRealtimeUpdate);
      socket.off('ticket_status_changed', handleRealtimeUpdate);
      socket.off('conversation_escalated', handleRealtimeUpdate);
      socket.off('conversation_resolved', handleRealtimeUpdate);
      socket.off('conversation_updated', handleRealtimeUpdate);
      socket.off('new_invitation', handleRealtimeUpdate);
      socket.off('agent_joined', handleRealtimeUpdate);
      socket.off('agent_left', handleRealtimeUpdate);
      socket.off('agent_removed', handleRealtimeUpdate);
    };
  }, [socket, fetchDashboardData]);

  const handleLeaveCompany = async () => {
    setLeaving(true);
    try {
      await agentService.leaveCompany();
      success('You have left the company and are now available in the Global Directory.');
      updateUser({ organizationId: null, organization: null, status: 'AVAILABLE' });
      setIsLeaveModalOpen(false);
      navigate('/agent/dashboard');
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to leave company');
    } finally {
      setLeaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" text="Loading Agent Workspace..." />
      </div>
    );
  }

  const pendingInvitations = invitations.filter((i) => (i.status || '').toUpperCase() === 'PENDING');
  
  // Case-insensitive status categorization
  const openTickets = tickets.filter((t) => {
    const s = (t.status || '').toUpperCase();
    return s === 'OPEN' || s === 'HUMAN_REQUIRED' || s === 'IN_PROGRESS' || s === 'WAITING_CUSTOMER';
  });

  const resolvedTickets = tickets.filter((t) => {
    const s = (t.status || '').toUpperCase();
    return s === 'RESOLVED' || s === 'CLOSED';
  });

  const highPriority = openTickets.filter((t) => {
    const p = (t.priority || '').toUpperCase();
    return p === 'HIGH' || p === 'URGENT';
  });

  const myAssignedTickets = openTickets.filter((t) => {
    const agentId = t.assignedAgentId?._id || t.assignedAgentId;
    return agentId && String(agentId) === String(user?._id);
  });

  // =========================================================================
  // STATE 1: AGENT HAS NO ACTIVE COMPANY (INDEPENDENT TALENT)
  // =========================================================================
  if (!hasCompany) {
    return (
      <div className="space-y-8">
        {/* Availability Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-950/50 via-slate-900 to-slate-900 border border-indigo-500/30 shadow-2xl glass-card relative overflow-hidden space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Status: AVAILABLE FOR HIRE
            </span>
            <span className="text-xs text-slate-400">Global Talent Directory</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            You are currently not working with a company.
          </h2>

          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Your profile is active in the Global Support Agent Directory. Companies looking for specialized support talent can discover your profile and send you direct workspace invitations.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link to="/agent/invitations">
              <Button variant="primary" size="md" icon={Mail} className="bg-indigo-600 hover:bg-indigo-500">
                View Company Invitations ({pendingInvitations.length})
              </Button>
            </Link>
            <Link to="/agent/profile">
              <Button variant="outline" size="md" icon={User}>
                Edit Public Profile
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="md"
              icon={RefreshCw}
              onClick={() => fetchDashboardData(false)}
              className={refreshing ? 'animate-spin' : ''}
              title="Refresh invitations"
            />
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard
            title="Pending Invitations"
            value={pendingInvitations.length}
            icon={Mail}
            color="indigo"
            subtext="Company invitations waiting for your acceptance"
          />
          <StatCard
            title="Agent Rating"
            value={user?.rating ? user.rating.toFixed(1) : '5.0'}
            icon={Star}
            color="amber"
            subtext="Based on verified client feedback"
          />
          <StatCard
            title="Hourly Rate"
            value={user?.hourlyRate ? `$${user.hourlyRate}/hr` : 'Negotiable'}
            icon={Zap}
            color="emerald"
            subtext="Listed in Global Directory"
          />
        </div>

        {/* Profile Preview Card */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 glass-panel space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Your Public Directory Listing
            </h3>
            <Link to="/agent/profile" className="text-xs text-indigo-400 hover:underline">
              Update Info
            </Link>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-950 border border-indigo-500/30 text-indigo-400 font-bold text-xl flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0) || 'A'
                )}
              </div>
              <div>
                <h4 className="font-bold text-white text-base">{user?.name}</h4>
                <p className="text-xs text-slate-400">{user?.email}</p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-slate-300">Experience: {user?.experience || '1 year'}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
              {user?.bio || 'No professional bio added yet. Add a bio to attract top company invites.'}
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {user?.skills && user.skills.length > 0 ? (
                user.skills.map((s, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-xs">
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500">No skills listed</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // STATE 2: AGENT HAS ACTIVE COMPANY MEMBERSHIP
  // =========================================================================
  return (
    <div className="space-y-8">
      {/* Active Company Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-950/50 via-slate-900 to-slate-900 border border-brand-500/30 shadow-2xl glass-card flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5" />
            <span>Active Company: {org?.name || 'Company Support Team'}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.name}!
          </h2>

          <p className="text-xs text-slate-300 leading-relaxed">
            You are actively handling customer inquiries, escalations, and support tickets for <span className="font-semibold text-white">{org?.name}</span> with full access to company knowledge base documents.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link to="/agent/knowledge">
              <Button variant="primary" size="sm" icon={BookOpen}>
                Access Company Knowledge Base
              </Button>
            </Link>
            <Link to="/agent/tickets">
              <Button variant="secondary" size="sm" icon={Ticket}>
                View All Tickets ({openTickets.length})
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={() => fetchDashboardData(false)}
              className={refreshing ? 'animate-spin' : ''}
              title="Refresh workspace data"
            >
              {refreshing ? 'Syncing...' : 'Refresh Data'}
            </Button>
          </div>
        </div>

        {/* Leave Company Action */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 shrink-0 self-start sm:self-auto text-center sm:text-left">
          <p className="text-[11px] text-slate-400 font-medium">Single-Company Membership:</p>
          <Button
            variant="outline"
            size="sm"
            icon={LogOut}
            onClick={() => setIsLeaveModalOpen(true)}
            className="text-rose-400 border-rose-500/30 hover:bg-rose-500/10 w-full"
          >
            Leave Company
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Escalations Waiting"
          value={conversations.length}
          icon={AlertTriangle}
          color="rose"
          subtext="Transferred from AI Assistant"
        />
        <StatCard
          title="Active Open Tickets"
          value={openTickets.length}
          icon={Ticket}
          color="brand"
          subtext={`${myAssignedTickets.length} assigned directly to you`}
        />
        <StatCard
          title="High/Urgent Priority"
          value={highPriority.length}
          icon={Zap}
          color="amber"
          subtext="Requires prompt turnaround"
        />
        <StatCard
          title="Resolved Inquiries"
          value={resolvedTickets.length}
          icon={CheckCircle}
          color="emerald"
          subtext="Successfully closed tickets"
        />
      </div>

      {/* Main Grid: Waiting Customers & Active Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Waiting Escalations (Take Over) */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 glass-panel">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Customers Waiting for Agent</h3>
                <p className="text-[11px] text-slate-400">Escalated from AI Support ({conversations.length})</p>
              </div>
            </div>
            <Link to="/agent/conversations" className="text-xs font-semibold text-brand-400 hover:text-brand-300">
              View Queue
            </Link>
          </div>

          <div className="space-y-3">
            {conversations.length > 0 ? (
              conversations.map((c) => (
                <div
                  key={c._id}
                  className="p-4 rounded-xl bg-slate-950/70 border border-rose-500/20 space-y-2.5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      {c.customerId?.name || 'Customer'}
                    </span>
                    <span className="text-[11px] text-slate-500">{formatDate(c.updatedAt)}</span>
                  </div>

                  <p className="text-xs font-bold text-white">{c.title || 'Support Inquiry'}</p>

                  <div className="flex justify-end pt-1">
                    <Link to={`/agent/conversations?id=${c._id}`}>
                      <Button variant="primary" size="sm" icon={Headphones} className="text-xs">
                        Take Over Chat
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs text-slate-400">All customer conversations are resolved or handled by AI.</p>
              </div>
            )}
          </div>
        </div>

        {/* Priority Tickets */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 glass-panel">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Ticket className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Priority Support Tickets</h3>
                <p className="text-[11px] text-slate-400">Categorized by AI Classifier ({openTickets.length} open)</p>
              </div>
            </div>
            <Link to="/agent/tickets" className="text-xs font-semibold text-brand-400 hover:text-brand-300">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {openTickets.length > 0 ? (
              openTickets.slice(0, 5).map((t) => {
                const isAssignedToMe = (t.assignedAgentId?._id || t.assignedAgentId) === user?._id;
                return (
                  <div
                    key={t._id}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold text-brand-400">{t.ticketNumber}</span>
                        <TicketStatusBadge status={t.status} />
                        <PriorityBadge priority={t.priority} />
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                          {t.category}
                        </span>
                        {isAssignedToMe && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-500/10 border border-brand-500/30 text-brand-300 font-semibold">
                            Assigned to You
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-white truncate">{t.title}</p>
                      <p className="text-[11px] text-slate-400">
                        Customer: {t.customerId?.name || 'Customer'} • {formatDate(t.createdAt)}
                      </p>
                    </div>

                    <Link to="/agent/tickets">
                      <Button variant="ghost" size="sm" icon={ArrowRight} className="shrink-0" />
                    </Link>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No open tickets in queue. All clear!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CONFIRM LEAVE COMPANY MODAL */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title={`Leave ${org?.name || 'Company'}`}
      >
        <div className="space-y-4 text-slate-200">
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-bold text-rose-300">Revoke Company Access</p>
              <p className="text-slate-300 leading-relaxed">
                Are you sure you want to leave <span className="font-bold text-white">{org?.name}</span>?
              </p>
              <p className="text-slate-400">
                You will immediately lose access to this company's Knowledge Base, tickets, and customer conversations. Your status will become <span className="font-bold text-emerald-400">AVAILABLE</span> in the Global Directory to receive new invitations.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsLeaveModalOpen(false)} disabled={leaving}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={leaving}
              icon={LogOut}
              onClick={handleLeaveCompany}
            >
              Confirm & Leave Company
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
