import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatters';
import {
  Crown,
  Shield,
  Key,
  Copy,
  RefreshCw,
  Check,
  X,
  Trash2,
  Users,
  AlertTriangle,
  Sparkles,
  Clock,
} from 'lucide-react';

export const AdminTeam = () => {
  const { user, isOwner } = useAuth();
  const { success, error: toastError } = useToast();

  const [adminKey, setAdminKey] = useState('');
  const [requests, setRequests] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [copiedKey, setCopiedKey] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [adminToRemove, setAdminToRemove] = useState(null);
  const [removingAdmin, setRemovingAdmin] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [keyRes, requestsRes, teamRes] = await Promise.all([
        adminService.getAdminJoinKey(),
        adminService.getAdminRequests(),
        adminService.getTeam(),
      ]);
      setAdminKey(keyRes.adminJoinKey);
      setRequests(requestsRes.requests || []);
      setTeamMembers(teamRes.admins || []);
    } catch (err) {
      console.error('Failed to load admin team data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(adminKey);
    setCopiedKey(true);
    success('Admin Join Key copied to clipboard!');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRegenerateKey = async () => {
    if (!window.confirm('Are you sure you want to regenerate the Admin Join Key? Any previous keys will immediately become invalid.')) {
      return;
    }
    setRegenerating(true);
    try {
      const res = await adminService.regenerateAdminJoinKey();
      setAdminKey(res.adminJoinKey);
      success('Admin Join Key regenerated successfully!');
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to regenerate join key');
    } finally {
      setRegenerating(false);
    }
  };

  const handleApprove = async (requestId, userName) => {
    setActionLoadingId(requestId);
    try {
      await adminService.approveAdminRequest(requestId);
      success(`${userName} has been approved as an Administrator!`);
      fetchData();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to approve admin request');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (requestId, userName) => {
    setActionLoadingId(requestId);
    try {
      await adminService.rejectAdminRequest(requestId);
      success(`Admin request for ${userName} declined.`);
      fetchData();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to reject admin request');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmRemoveAdmin = async () => {
    if (!adminToRemove) return;
    setRemovingAdmin(true);
    try {
      await adminService.removeAdmin(adminToRemove._id);
      success(`${adminToRemove.name} has been removed from the administrator team.`);
      setAdminToRemove(null);
      fetchData();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to remove administrator');
    } finally {
      setRemovingAdmin(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" text="Loading Team & Admin Requests..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">Administrators & Team Governance</h2>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold">
            <Crown className="w-3 h-3 text-amber-400" /> Owner Only
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Manage company Admin Join Keys, approve incoming admin join requests, and manage administrator access.
        </p>
      </div>

      {/* 1. ADMIN JOIN KEY MANAGEMENT */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/30 shadow-2xl glass-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
              <Key className="w-4 h-4" />
              <span>Company Admin Join Key</span>
            </div>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Teammates can request Admin access by entering this key on the registration page. Each request requires your explicit Owner approval before access is granted.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            loading={regenerating}
            onClick={handleRegenerateKey}
            className="self-start sm:self-auto text-xs border-slate-700 hover:border-purple-500"
          >
            Regenerate Key
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="w-full sm:w-80 px-4 py-2.5 rounded-2xl bg-slate-950/90 border border-purple-500/40 text-center font-mono font-bold text-base text-purple-300 tracking-wider shadow-inner">
            {adminKey || 'No Key Configured'}
          </div>
          <Button
            variant="primary"
            size="md"
            icon={Copy}
            onClick={handleCopyKey}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-500"
          >
            {copiedKey ? 'Copied to Clipboard!' : 'Copy Join Key'}
          </Button>
        </div>
      </div>

      {/* 2. PENDING ADMIN JOIN REQUESTS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-bold text-white">Pending Admin Join Requests</h3>
          </div>
          <span className="text-xs text-slate-400">
            {requests.filter((r) => r.status === 'PENDING').length} awaiting your review
          </span>
        </div>

        {requests.filter((r) => r.status === 'PENDING').length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 text-slate-400 text-xs">
            No pending administrator requests at this time.
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl glass-panel">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="p-4">Candidate Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Requested Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Owner Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {requests
                    .filter((r) => r.status === 'PENDING')
                    .map((req) => (
                      <tr key={req._id} className="hover:bg-slate-850/50 transition-colors">
                        <td className="p-4 font-semibold text-white">
                          {req.userId?.name || 'Unknown Candidate'}
                        </td>
                        <td className="p-4 font-mono text-slate-400">
                          {req.userId?.email || 'N/A'}
                        </td>
                        <td className="p-4 text-slate-400">
                          {formatDate(req.requestedAt)}
                        </td>
                        <td className="p-4">
                          <Badge variant="warning" size="sm">
                            PENDING APPROVAL
                          </Badge>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <Button
                            variant="primary"
                            size="sm"
                            icon={Check}
                            loading={actionLoadingId === req._id}
                            onClick={() => handleApprove(req._id, req.userId?.name)}
                            className="bg-emerald-600 hover:bg-emerald-500 py-1 text-xs"
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            icon={X}
                            loading={actionLoadingId === req._id}
                            onClick={() => handleReject(req._id, req.userId?.name)}
                            className="py-1 text-xs"
                          >
                            Reject
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 3. ACTIVE COMPANY ADMINISTRATORS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-purple-400" />
          <h3 className="text-base font-bold text-white">Active Administrators</h3>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl glass-panel">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-4">Administrator</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role Permission</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {teamMembers.map((member) => (
                  <tr key={member._id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="p-4 font-semibold text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-500/30 text-purple-400 font-bold flex items-center justify-center">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <span className="block font-bold text-white">{member.name}</span>
                        {member.role === 'OWNER' && (
                          <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                            <Crown className="w-3 h-3" /> Workspace Creator
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4 font-mono text-slate-400">{member.email}</td>

                    <td className="p-4">
                      {member.role === 'OWNER' ? (
                        <Badge variant="purple" size="sm">
                          OWNER
                        </Badge>
                      ) : (
                        <Badge variant="brand" size="sm">
                          ADMIN
                        </Badge>
                      )}
                    </td>

                    <td className="p-4">
                      <Badge variant="success" size="sm">
                        ACTIVE
                      </Badge>
                    </td>

                    <td className="p-4 text-right">
                      {member.role === 'OWNER' ? (
                        <span className="text-slate-500 text-[11px] italic pr-2">Cannot be removed</span>
                      ) : (
                        <Button
                          variant="danger"
                          size="sm"
                          icon={Trash2}
                          onClick={() => setAdminToRemove(member)}
                          className="py-1 text-xs"
                        >
                          Remove Admin
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CONFIRM REMOVE ADMIN MODAL */}
      <Modal
        isOpen={Boolean(adminToRemove)}
        onClose={() => setAdminToRemove(null)}
        title="Remove Administrator Access"
      >
        <div className="space-y-4 text-slate-200">
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-bold text-rose-300">Revoke Administrator Privileges</p>
              <p className="text-slate-300 leading-relaxed">
                Are you sure you want to remove <span className="font-bold text-white">{adminToRemove?.name}</span>? They will immediately lose access to your company dashboard, knowledge base, tickets, and configurations.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setAdminToRemove(null)} disabled={removingAdmin}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={removingAdmin}
              icon={Trash2}
              onClick={handleConfirmRemoveAdmin}
            >
              Confirm Removal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
