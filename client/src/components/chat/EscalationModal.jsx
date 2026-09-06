import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Headphones, AlertTriangle } from 'lucide-react';

export const EscalationModal = ({ isOpen, onClose, onEscalate, loading }) => {
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onEscalate(reason);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request Human Support Agent">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-brand-950/40 border border-brand-500/20 text-brand-200 text-sm">
          <Headphones className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-white">Escalate this conversation to our support team</p>
            <p className="mt-1 text-slate-300 text-xs leading-relaxed">
              A support ticket will be automatically created with an AI summary of your conversation, and a SkillUp Academy human agent will join this chat.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Why do you need human assistance? (Optional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="e.g., Payment was deducted via UPI but course is still locked..."
            className="w-full rounded-xl bg-slate-900 border border-slate-700 p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading} icon={Headphones}>
            Confirm Escalation
          </Button>
        </div>
      </form>
    </Modal>
  );
};
