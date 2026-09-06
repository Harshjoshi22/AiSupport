import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { useSocket } from '../../hooks/useSocket';
import { adminService } from '../../services/admin.service';
import { StatCard } from '../../components/common/StatCard';
import { ActivityFeed } from '../../components/dashboard/ActivityFeed';
import { CategoryChart } from '../../components/dashboard/CategoryChart';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import {
  Users,
  UserCheck,
  Ticket,
  Bot,
  Headphones,
  BookOpen,
  CheckCircle,
  Crown,
  Shield,
  Link as LinkIcon,
  Copy,
  ExternalLink,
  Key,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user, isOwner } = useAuth();
  const { success } = useToast();
  const { socket } = useSocket();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const org = user?.organization;
  const slug = org?.slug || 'skillup-academy';
  const supportUrl = `${window.location.origin}/support/${slug}`;
  const adminKey = org?.adminJoinKeyDisplay || 'SKILL-92FK-XP81';

  const fetchAnalytics = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await adminService.getAnalytics();
      setAnalytics(res.analytics);
    } catch (err) {
      console.error('Error fetching admin analytics', err);
    } finally {
      if (showLoading) setLoading(false);
      else setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(true);
  }, []);

  // Real-time socket sync for Admin Dashboard
  useEffect(() => {
    if (!socket) return;

    const handleRealtimeUpdate = () => {
      fetchAnalytics(false);
    };

    socket.on('new_ticket', handleRealtimeUpdate);
    socket.on('ticket_updated', handleRealtimeUpdate);
    socket.on('ticket_status_changed', handleRealtimeUpdate);
    socket.on('conversation_escalated', handleRealtimeUpdate);
    socket.on('conversation_resolved', handleRealtimeUpdate);
    socket.on('agent_joined', handleRealtimeUpdate);
    socket.on('agent_left', handleRealtimeUpdate);

    return () => {
      socket.off('new_ticket', handleRealtimeUpdate);
      socket.off('ticket_updated', handleRealtimeUpdate);
      socket.off('ticket_status_changed', handleRealtimeUpdate);
      socket.off('conversation_escalated', handleRealtimeUpdate);
      socket.off('conversation_resolved', handleRealtimeUpdate);
      socket.off('agent_joined', handleRealtimeUpdate);
      socket.off('agent_left', handleRealtimeUpdate);
    };
  }, [socket]);

  const handleCopySupportLink = () => {
    navigator.clipboard.writeText(supportUrl);
    setCopiedLink(true);
    success('Company Support Link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyAdminKey = () => {
    navigator.clipboard.writeText(adminKey);
    setCopiedKey(true);
    success('Admin Join Key copied to clipboard!');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" text="Loading Organization Analytics..." />
      </div>
    );
  }

  const { metrics, categoryDistribution, priorityDistribution, recentTickets, recentConversations } = analytics || {};

  return (
    <div className="space-y-8">
      {/* Header with Company Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {org?.name || 'Company'} Support Hub
            </h2>
            {isOwner ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold">
                <Crown className="w-3 h-3 text-amber-400" /> Owner View
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-bold">
                <Shield className="w-3 h-3" /> Admin View
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise Multi-Tenant AI Support Platform • Performance Overview
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/agents">
            <Button variant="secondary" size="sm" icon={UserCheck}>
              Manage Support Agents
            </Button>
          </Link>
          <Link to="/admin/knowledge">
            <Button variant="primary" size="sm" icon={BookOpen}>
              Knowledge Base
            </Button>
          </Link>
        </div>
      </div>

      {/* CUSTOMER SUPPORT LINK & ONBOARDING BANNER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Support Link Box */}
        <div className={`p-6 rounded-3xl bg-gradient-to-r from-brand-950/40 via-slate-900 to-slate-900 border border-brand-500/20 shadow-2xl glass-card space-y-3 ${isOwner ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-brand-400">
              <LinkIcon className="w-4 h-4" />
              <span>Public Customer Support Portal Link</span>
            </div>
            <a
              href={`/support/${slug}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
            >
              <span>Preview Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <p className="text-xs text-slate-300">
            Share this dedicated URL with your customers to give them instant access to your company's AI support and human agent escalation:
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
            <div className="w-full flex-1 px-3.5 py-2 rounded-xl bg-slate-950/90 border border-slate-800 text-xs font-mono text-slate-200 select-all overflow-x-auto">
              {supportUrl}
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={Copy}
              onClick={handleCopySupportLink}
              className="w-full sm:w-auto shrink-0"
            >
              {copiedLink ? 'Copied!' : 'Copy Link'}
            </Button>
          </div>
        </div>

        {/* Owner Admin Join Key Card */}
        {isOwner && (
          <div className="lg:col-span-4 p-6 rounded-3xl bg-slate-900/90 border border-purple-500/20 shadow-2xl glass-panel space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400">
                <Key className="w-4 h-4" />
                <span>Admin Join Key</span>
              </div>
              <Link to="/admin/team" className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1">
                <span>Team</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <p className="text-[11px] text-slate-400 leading-snug">
              Give this key to teammates requesting Admin access to {org?.name}:
            </p>

            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-purple-300 text-center tracking-wider">
                {adminKey}
              </div>
              <Button variant="ghost" size="sm" icon={Copy} onClick={handleCopyAdminKey} title="Copy Key" />
            </div>
          </div>
        )}
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Customers"
          value={metrics?.totalCustomers || 0}
          icon={Users}
          color="brand"
          change="+12%"
        />
        <StatCard
          title="Active Support Agents"
          value={metrics?.totalAgents || 0}
          icon={UserCheck}
          color="purple"
        />
        <StatCard
          title="Open Support Tickets"
          value={metrics?.openTickets || 0}
          icon={Ticket}
          color="amber"
        />
        <StatCard
          title="Resolved Tickets"
          value={metrics?.resolvedTickets || 0}
          icon={CheckCircle}
          color="emerald"
          change="+18%"
        />
      </div>

      {/* AI Resolution Efficiency */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="AI-Resolved Dialogues"
          value={metrics?.aiResolvedConversations || 0}
          icon={Bot}
          color="brand"
          subtext="Resolved autonomously without human intervention"
        />
        <StatCard
          title="Human Escalations"
          value={metrics?.escalatedConversations || 0}
          icon={Headphones}
          color="rose"
          subtext="Transferred to live agent queue"
        />
        <StatCard
          title="Knowledge Documents"
          value={metrics?.totalDocuments || 0}
          icon={BookOpen}
          color="emerald"
          subtext="Vector indexed RAG articles & FAQs"
        />
      </div>

     
    </div>
  );
};
