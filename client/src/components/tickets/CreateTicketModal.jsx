import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { TICKET_CATEGORIES, TICKET_PRIORITIES } from '../../utils/constants';
import { Sparkles, Ticket } from 'lucide-react';

export const CreateTicketModal = ({ isOpen, onClose, onCreateTicket, loading }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    priority: 'Medium',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;
    onCreateTicket(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Support Ticket">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2 p-3 rounded-xl bg-brand-950/40 border border-brand-500/20 text-xs text-brand-300">
          <Sparkles className="w-4 h-4 text-brand-400 shrink-0" />
          <span>AI will automatically analyze, summarize, and prioritize your ticket.</span>
        </div>

        <Input
          label="Ticket Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g. Cannot access MERN course video lectures"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {TICKET_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {TICKET_PRIORITIES.map((pri) => (
                <option key={pri} value={pri}>
                  {pri}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
            Issue Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            placeholder="Please describe your issue in detail, including error messages or transaction details..."
            required
            className="w-full rounded-xl bg-slate-900 border border-slate-700 p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading} icon={Ticket}>
            Submit Ticket
          </Button>
        </div>
      </form>
    </Modal>
  );
};
