import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Building, Mail, Clock, Cpu, Save, ShieldCheck } from 'lucide-react';

export const AdminSettings = () => {
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: 'SkillUp Academy',
    description: 'SkillUp Academy provides online programming and technology courses.',
    supportEmail: 'support@skillupacademy.dev',
    businessHours: 'Monday - Friday, 9:00 AM - 6:00 PM IST',
    aiModel: 'gemini-1.5-flash',
    aiTemperature: 0.2,
    autoEscalateOnNegativeSentiment: true,
  });

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const res = await api.get('/organizations/me');
        const org = res.data.organization;
        if (org) {
          setFormData({
            name: org.name || 'SkillUp Academy',
            description: org.description || '',
            supportEmail: org.settings?.supportEmail || 'support@skillupacademy.dev',
            businessHours: org.settings?.businessHours || 'Monday - Friday, 9:00 AM - 6:00 PM IST',
            aiModel: org.settings?.aiModel || 'gemini-1.5-flash',
            aiTemperature: org.settings?.aiTemperature ?? 0.2,
            autoEscalateOnNegativeSentiment: org.settings?.autoEscalateOnNegativeSentiment ?? true,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrg();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put('/organizations/me', {
        name: formData.name,
        description: formData.description,
        settings: {
          supportEmail: formData.supportEmail,
          businessHours: formData.businessHours,
          aiModel: formData.aiModel,
          aiTemperature: parseFloat(formData.aiTemperature),
          autoEscalateOnNegativeSentiment: formData.autoEscalateOnNegativeSentiment,
        },
      });

      success('Organization settings updated successfully');
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className=" fixed py-20 flex justify-center">
        <LoadingSpinner size="lg" text="Loading Organization Settings..." />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Organization & AI Settings</h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure SkillUp Academy profile, support channels, and AI copilot policies
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 glass-panel shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Org */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Building className="w-4 h-4 text-brand-400" />
              <span>General Organization Profile</span>
            </h3>

            <Input
              label="Organization Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                Company Description & Scope
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 p-3 text-xs text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Support Channels */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Mail className="w-4 h-4 text-purple-400" />
              <span>Support Channels & Business Hours</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Support Contact Email"
                type="email"
                icon={Mail}
                value={formData.supportEmail}
                onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                required
              />

              <Input
                label="Support Business Hours"
                icon={Clock}
                value={formData.businessHours}
                onChange={(e) => setFormData({ ...formData, businessHours: e.target.value })}
                required
              />
            </div>
          </div>

          {/* AI Policies */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>AI Support Engine Policies</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                  AI Model
                </label>
                <select
                  value={formData.aiModel}
                  onChange={(e) => setFormData({ ...formData, aiModel: e.target.value })}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-xs text-slate-100 focus:ring-2 focus:ring-brand-500"
                >
                  <option value="gemini-1.5-flash">Google Gemini 1.5 Flash (Recommended)</option>
                  <option value="gpt-4o-mini">OpenAI GPT-4o Mini</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                  AI Temperature (Factual Consistency)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.0"
                  max="1.0"
                  value={formData.aiTemperature}
                  onChange={(e) => setFormData({ ...formData, aiTemperature: e.target.value })}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-xs text-slate-100 focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <input
                type="checkbox"
                id="autoEscalate"
                checked={formData.autoEscalateOnNegativeSentiment}
                onChange={(e) =>
                  setFormData({ ...formData, autoEscalateOnNegativeSentiment: e.target.checked })
                }
                className="w-4 h-4 text-brand-500 rounded border-slate-700 focus:ring-brand-500"
              />
              <label htmlFor="autoEscalate" className="text-xs text-slate-300 cursor-pointer">
                <span className="font-semibold text-white block">Auto-escalate on Customer Frustration</span>
                Automatically create a support ticket and transfer chat to a human agent when user exhibits frustration or payment failure.
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <Button type="submit" variant="primary" loading={saving} icon={Save}>
              Save Settings
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
