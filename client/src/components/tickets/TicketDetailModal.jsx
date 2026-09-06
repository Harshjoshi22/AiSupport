import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { TicketStatusBadge } from './TicketStatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';
import { ticketService } from '../../services/ticket.service';
import { useToast } from '../../context/ToastContext';
import {
  Sparkles,
  Bot,
  User,
  Clock,
  Send,
  MessageSquare,
  CheckCircle,
  FileText,
  Copy,
} from 'lucide-react';

export const TicketDetailModal = ({
  isOpen,
  onClose,
  ticket,
  onTicketUpdated,
  agents = [],
}) => {
  const { role, isCustomer, user } = useAuth();
  const { success, error: toastError } = useToast();

  const [status, setStatus] = useState(ticket?.status || 'open');
  const [priority, setPriority] = useState(ticket?.priority || 'Medium');
  const [assignedAgentId, setAssignedAgentId] = useState(ticket?.assignedAgentId?._id || '');
  const [newNote, setNewNote] = useState('');
  const [suggestedReply, setSuggestedReply] = useState('');
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  if (!ticket) return null;

  const handleUpdateStatus = async () => {
    setSavingStatus(true);
    try {
      const res = await ticketService.updateTicket(ticket._id, {
        status,
        priority,
        assignedAgentId: assignedAgentId || null,
      });
      success('Ticket updated successfully');
      if (onTicketUpdated) onTicketUpdated(res.ticket);
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to update ticket');
    } finally {
      setSavingStatus(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      const res = await ticketService.addInternalNote(ticket._id, newNote.trim());
      success('Internal note added');
      setNewNote('');
      if (onTicketUpdated) {
        onTicketUpdated({ ...ticket, internalNotes: res.internalNotes });
      }
    } catch (err) {
      toastError('Failed to add internal note');
    }
  };

  const handleGenerateSuggestion = async () => {
    setLoadingSuggestion(true);
    try {
      const res = await ticketService.getSuggestedReply(ticket._id);
      setSuggestedReply(res.suggestedReply);
      success('AI reply generated. You can review and edit before sending.');
    } catch (err) {
      toastError('Could not generate AI suggested reply');
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const handleCopySuggestion = () => {
    navigator.clipboard.writeText(suggestedReply);
    success('Reply copied to clipboard!');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Ticket #${ticket.ticketNumber}`} maxWidth="max-w-4xl">
      <div className="space-y-6">
        {/* Header Summary */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-bold text-white">{ticket.title}</h4>
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-500" />
                {ticket.customerId?.name || 'Customer'} ({ticket.customerId?.email})
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {formatDate(ticket.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TicketStatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
        </div>

        {/* AI Summary Card */}
        {ticket.aiSummary && (
          <div className="p-4 rounded-xl bg-gradient-to-br from-brand-950/30 to-purple-950/20 border border-brand-500/20 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-brand-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span>AI Executive Summary & Context</span>
            </div>

            <p className="text-sm font-semibold text-white leading-relaxed">
              {ticket.aiSummary.shortSummary}
            </p>

            {ticket.aiSummary.keyDetails && ticket.aiSummary.keyDetails.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-300">Key Context Points:</p>
                <ul className="list-disc list-inside text-xs text-slate-400 space-y-0.5 pl-1">
                  {ticket.aiSummary.keyDetails.map((detail, idx) => (
                    <li key={idx}>{detail}</li>
                  ))}
                </ul>
              </div>
            )}

            {ticket.aiSummary.suggestedAction && (
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                <span className="font-bold text-brand-300">Recommended Agent Action: </span>
                {ticket.aiSummary.suggestedAction}
              </div>
            )}
          </div>
        )}

        {/* Description */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Issue Description</label>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
            {ticket.description}
          </div>
        </div>

        {/* Agent & Admin Controls */}
        {!isCustomer && (
          <div className="space-y-6 pt-4 border-t border-slate-800">
            {/* Status & Priority Modifiers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-brand-500"
                >
                  <option value="OPEN">Open (AI)</option>
                  <option value="HUMAN_REQUIRED">Human Required</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-brand-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Assigned Agent</label>
                <select
                  value={assignedAgentId}
                  onChange={(e) => setAssignedAgentId(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Unassigned</option>
                  {agents.map((ag) => (
                    <option key={ag._id} value={ag._id}>
                      {ag.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="primary" size="sm" onClick={handleUpdateStatus} loading={savingStatus}>
                Save Changes
              </Button>
            </div>

            {/* AI Suggested Reply Generator */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>AI Copilot Suggested Reply</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateSuggestion}
                  loading={loadingSuggestion}
                  icon={Sparkles}
                >
                  {suggestedReply ? 'Regenerate Draft' : 'Generate AI Reply'}
                </Button>
              </div>

              {suggestedReply && (
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-slate-950 border border-purple-500/20 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {suggestedReply}
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="secondary" size="sm" onClick={handleCopySuggestion} icon={Copy}>
                      Copy Reply
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Internal Notes */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Internal Team Notes
              </label>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {ticket.internalNotes && ticket.internalNotes.length > 0 ? (
                  ticket.internalNotes.map((n, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="font-semibold text-slate-300">
                          {n.authorId?.name || 'Support Agent'}
                        </span>
                        <span>{formatDate(n.createdAt)}</span>
                      </div>
                      <p className="text-slate-200">{n.note}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">No internal notes yet.</p>
                )}
              </div>

              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add an internal note visible only to agents..."
                  className="flex-1 rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-brand-500"
                />
                <Button type="submit" variant="secondary" size="sm" disabled={!newNote.trim()}>
                  Add Note
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
