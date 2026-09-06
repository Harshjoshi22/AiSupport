import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services/auth.service';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import {
  User,
  Mail,
  Lock,
  Star,
  Globe,
  Briefcase,
  Languages,
  DollarSign,
  Save,
  CheckCircle2,
  Sparkles,
  Building2,
} from 'lucide-react';

export const AgentProfile = () => {
  const { user, updateUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    skills: user?.skills?.join(', ') || '',
    experience: user?.experience || '2 years',
    languages: user?.languages?.join(', ') || 'English, Hindi',
    hourlyRate: user?.hourlyRate || 30,
    password: '',
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authService.updateProfile({
        name: formData.name,
        bio: formData.bio,
        skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
        experience: formData.experience,
        languages: formData.languages.split(',').map((l) => l.trim()).filter(Boolean),
        hourlyRate: Number(formData.hourlyRate) || 0,
        password: formData.password || undefined,
      });

      updateUser(res.user);
      success('Professional profile updated successfully!');
      setFormData((prev) => ({ ...prev, password: '' }));
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Agent Professional Profile</h2>
        <p className="text-xs text-slate-400 mt-1">
          Customize your bio, technical skills, languages, and rates visible in the Global Talent Directory
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card Preview */}
        <div className="md:col-span-1 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl glass-panel space-y-4 self-start">
          <div className="text-center space-y-3">
            <div className="w-20 h-20 rounded-3xl bg-indigo-950 border border-indigo-500/30 text-indigo-400 font-bold text-2xl flex items-center justify-center mx-auto overflow-hidden shadow-lg shadow-indigo-500/15">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0) || 'A'
              )}
            </div>

            <div>
              <h3 className="text-base font-bold text-white">{user?.name}</h3>
              <p className="text-xs text-slate-400 font-mono">{user?.email}</p>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 font-bold text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {user?.rating ? user.rating.toFixed(1) : '5.0'} Rating
              </span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">
                {user?.organizationId ? 'ACTIVE AT COMPANY' : 'AVAILABLE FOR HIRE'}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-2 text-xs text-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Current Workspace:</span>
              <span className="text-brand-400 font-bold">
                {user?.organization?.name || 'Independent'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Experience:</span>
              <span className="text-white font-medium">{user?.experience || '1 year'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Hourly Rate:</span>
              <span className="text-white font-medium">${user?.hourlyRate || 30}/hr</span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="md:col-span-2 p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl glass-panel">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              icon={User}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Experience Level"
                type="text"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="3 years"
                required
              />

              <Input
                label="Hourly Rate ($ USD)"
                type="number"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                placeholder="30"
              />
            </div>

            <Input
              label="Specialization & Skills (Comma-separated)"
              type="text"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              placeholder="MERN Stack, React, Node.js, REST APIs"
              required
            />

            <Input
              label="Languages Spoken"
              type="text"
              value={formData.languages}
              onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
              placeholder="English, Hindi, Spanish"
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                Professional Bio & Pitch
              </label>
              <textarea
                rows={4}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                placeholder="Briefly describe your support background and technologies you master..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>

            <Input
              label="Update Password (Leave blank to keep current)"
              type="password"
              icon={Lock}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
            />

            <div className="pt-2">
              <Button type="submit" variant="primary" size="md" loading={saving} icon={Save} className="bg-indigo-600 hover:bg-indigo-500">
                Save Profile Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
