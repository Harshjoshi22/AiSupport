import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { KNOWLEDGE_CATEGORIES } from '../../utils/constants';
import { BookOpen } from 'lucide-react';

export const AddKnowledgeModal = ({ isOpen, onClose, onSave, loading }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'General',
    rawContent: '',
    sourceType: 'manual',
    tags: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.rawContent) return;

    onSave({
      ...formData,
      tags: formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Knowledge Base Article" maxWidth="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Article Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g. SkillUp Academy 7-Day Refund Policy & Terms"
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
              className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-brand-500"
            >
              {KNOWLEDGE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
              Article Type
            </label>
            <select
              value={formData.sourceType}
              onChange={(e) => setFormData({ ...formData, sourceType: e.target.value })}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-sm text-slate-100 focus:ring-2 focus:ring-brand-500"
            >
              <option value="manual">Documentation / Article</option>
              <option value="faq">Frequently Asked Question (FAQ)</option>
            </select>
          </div>
        </div>

        <Input
          label="Search Tags (comma separated)"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="refund, billing, policy, guarantee"
        />

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
            Knowledge Content / Policy Text
          </label>
          <textarea
            value={formData.rawContent}
            onChange={(e) => setFormData({ ...formData, rawContent: e.target.value })}
            rows={8}
            placeholder="Write clear, factual information that the AI will use to answer customer questions..."
            required
            className="w-full rounded-xl bg-slate-900 border border-slate-700 p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono text-xs leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading} icon={BookOpen}>
            Save & Index Article
          </Button>
        </div>
      </form>
    </Modal>
  );
};
