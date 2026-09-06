import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Bot, Mail, Lock, Crown, Shield, Headphones, User, ArrowRight } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(formData);
      success(`Welcome back, ${user.name}!`);

      if (user.role === 'OWNER' || user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'AGENT') {
        navigate('/agent/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (email, password) => {
    setFormData({ email, password });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-brand-500 selection:text-white">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-brand-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2 relative z-10">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <span className="font-extrabold text-2xl text-white tracking-tight">AI SupportHub</span>
        </Link>
        <h2 className="text-xl font-bold text-white tracking-tight">Sign in to your account</h2>
        <p className="text-xs text-slate-400">Multi-Tenant AI Support SaaS Platform</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/90 border border-slate-800 py-8 px-6 shadow-2xl rounded-3xl sm:px-8 glass-panel space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              icon={Mail}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="name@example.com"
              required
            />

            <Input
              label="Password"
              type="password"
              icon={Lock}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              required
            />

            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2" icon={ArrowRight}>
              Sign In
            </Button>
          </form>

          {/* Demo Logins Helper */}
          <div className="pt-4 border-t border-slate-800 space-y-2.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
              Quick Demo Logins (Click to Fill)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('owner@skillupacademy.dev', 'Password123!')}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-[11px] font-semibold text-amber-400 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Crown className="w-3.5 h-3.5" /> Company Owner
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('admin@skillupacademy.dev', 'Password123!')}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 text-[11px] font-semibold text-purple-400 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Shield className="w-3.5 h-3.5" /> Admin
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('agent.priya@skillupacademy.dev', 'Password123!')}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-brand-500/50 text-[11px] font-semibold text-brand-400 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Headphones className="w-3.5 h-3.5" /> Support Agent
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('customer.aarav@gmail.com', 'Password123!')}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-[11px] font-semibold text-emerald-400 flex items-center justify-center gap-1.5 transition-colors"
              >
                <User className="w-3.5 h-3.5" /> Customer
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-center space-y-1">
            <p className="text-xs text-slate-400">
              Need a new account?{' '}
              <Link to="/register" className="font-semibold text-brand-400 hover:text-brand-300">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
