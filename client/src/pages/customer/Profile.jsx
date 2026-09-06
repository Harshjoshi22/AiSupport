import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/auth.service';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { User, Mail, Lock, Building, Save } from 'lucide-react';

export const CustomerProfile = () => {
  const { user, updateUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    avatar: user?.avatar || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await authService.updateProfile({
        name: formData.name,
        password: formData.password || undefined,
        avatar: formData.avatar,
      });

      updateUser(res.user);
      success('Profile updated successfully');
      setFormData((prev) => ({ ...prev, password: '' }));
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Your Profile</h2>
        <p className="text-xs text-slate-400 mt-1">Manage your account credentials and personal details</p>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 glass-panel shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl font-bold text-brand-400 overflow-hidden">
              {formData.avatar ? (
                <img src={formData.avatar} alt={formData.name} className="w-full h-full object-cover" />
              ) : (
                formData.name.charAt(0)
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{user?.name}</h3>
              <p className="text-xs text-slate-400">{user?.email}</p>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-brand-950 text-brand-400 border border-brand-500/30 mt-1 inline-block">
                {user?.role} Account
              </span>
            </div>
          </div>

          <Input
            label="Full Name"
            icon={User}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Email Address"
            icon={Mail}
            value={formData.email}
            disabled
            helperText="Contact your organization administrator to update email address"
          />

          <Input
            label="Avatar Image URL (Optional)"
            type="url"
            value={formData.avatar}
            onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
            placeholder="https://images.unsplash.com/..."
          />

          <Input
            label="New Password (Leave blank to keep current)"
            type="password"
            icon={Lock}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••"
          />

          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <Button type="submit" variant="primary" loading={loading} icon={Save}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
