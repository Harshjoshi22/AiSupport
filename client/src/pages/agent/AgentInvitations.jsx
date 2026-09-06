import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { agentService } from '../../services/agent.service';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatters';
import {
  Mail,
  Building2,
  Check,
  X,
  Clock,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const AgentInvitations = () => {
  const { user, updateUser } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const hasCompany = Boolean(user?.organizationId);

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const res = await agentService.getMyInvitations();
      setInvitations(res.invitations || []);
    } catch (err) {
      console.error('Failed to load invitations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleAccept = async (invitation) => {
    if (hasCompany) {
      toastError('You are already working with another company. Leave your current company before accepting a new invitation.');
      return;
    }

    setActionLoadingId(invitation._id);
    try {
      const res = await agentService.acceptInvitation(invitation._id);
      success(`Congratulations! You have joined ${invitation.organizationId?.name}!`);
      updateUser({
        organizationId: res.organization?._id,
        organization: res.organization,
        status: 'ACTIVE',
      });
      navigate('/agent/dashboard');
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to accept invitation');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDecline = async (invitationId) => {
    setActionLoadingId(invitationId);
    try {
      await agentService.declineInvitation(invitationId);
      success('Invitation declined.');
      fetchInvitations();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to decline invitation');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" text="Loading Company Invitations..." />
      </div>
    );
  }

  const pendingInvites = invitations.filter((i) => i.status === 'PENDING');
  const pastInvites = invitations.filter((i) => i.status !== 'PENDING');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Company Invitations Inbox</h2>
          <p className="text-xs text-slate-400 mt-1">
            Review and respond to support workspace invitations from verified companies
          </p>
        </div>

        {hasCompany && (
          <div className="flex items-center gap-2 p-2.5 px-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              Active with <strong>{user?.organization?.name}</strong>. (Leave company to accept new invites)
            </span>
          </div>
        )}
      </div>

      {/* Pending Invitations Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Pending Invitations ({pendingInvites.length})</h3>
          </div>
        </div>

        {pendingInvites.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 space-y-2">
            <Mail className="w-8 h-8 text-slate-500 mx-auto" />
            <h4 className="text-base font-bold text-white">No Pending Company Invitations</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Your profile is visible in the Global Talent Directory. As companies look for support specialists, invitations will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {pendingInvites.map((inv) => (
              <div
                key={inv._id}
                className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 shadow-xl glass-panel space-y-4 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    {inv.organizationId?.logo ? (
                      <img
                        src={inv.organizationId.logo}
                        alt={inv.organizationId.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-700 shadow-md"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-indigo-950 border border-indigo-500/30 text-indigo-400 font-bold text-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-white text-base">{inv.organizationId?.name}</h4>
                      <p className="text-xs text-slate-400">
                        Invited by <span className="text-slate-200">{inv.invitedBy?.name || 'Administrator'}</span>
                      </p>
                    </div>
                  </div>

                  <Badge variant="warning" size="sm">
                    PENDING
                  </Badge>
                </div>

                <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                  {inv.organizationId?.description || 'Inviting you to join our specialized customer support team.'}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Received {formatDate(inv.createdAt)}</span>
                  </div>
                  {inv.organizationId?.settings?.supportEmail && (
                    <span className="text-[11px] font-mono text-slate-500">
                      {inv.organizationId.settings.supportEmail}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                  <Button
                    variant="danger"
                    size="sm"
                    icon={X}
                    loading={actionLoadingId === inv._id}
                    onClick={() => handleDecline(inv._id)}
                    className="flex-1 text-xs"
                  >
                    Decline
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Check}
                    loading={actionLoadingId === inv._id}
                    onClick={() => handleAccept(inv)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-xs"
                  >
                    Accept & Join Company
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Invitations History */}
      {pastInvites.length > 0 && (
        <div className="space-y-4 pt-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Invitation History
          </h3>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl glass-panel">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="p-4">Company</th>
                    <th className="p-4">Invited By</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {pastInvites.map((inv) => (
                    <tr key={inv._id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="p-4 font-semibold text-white">
                        {inv.organizationId?.name || 'Company Workspace'}
                      </td>
                      <td className="p-4 text-slate-400">{inv.invitedBy?.name || 'Admin'}</td>
                      <td className="p-4 text-slate-400">{formatDate(inv.createdAt)}</td>
                      <td className="p-4 text-right">
                        <Badge
                          variant={
                            inv.status === 'ACCEPTED'
                              ? 'success'
                              : inv.status === 'DECLINED'
                              ? 'danger'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {inv.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
