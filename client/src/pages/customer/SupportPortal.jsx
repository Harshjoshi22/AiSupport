import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Bot,
  Sparkles,
  Building2,
  Mail,
  Lock,
  User,
  Clock,
  ShieldCheck,
  Headphones,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const SupportPortal = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { login, registerCustomer, isAuthenticated, user } = useAuth();
  const { success, error: toastError } = useToast();

  const [org, setOrg] = useState(null);
  const [loadingOrg, setLoadingOrg] = useState(true);
  const [activeTab, setActiveTab] = useState('register'); // 'login' | 'register'
  const [authLoading, setAuthLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        setLoadingOrg(true);
        const res = await axios.get(`/api/organizations/public/${slug}`);
        setOrg(res.data.organization);
      } catch (err) {
        console.error('Failed to load organization support portal', err);
        setOrg(null);
      } finally {
        setLoadingOrg(false);
      }
    };

    if (slug) fetchOrg();
  }, [slug]);

  // If already authenticated customer for this org, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && user?.role === 'CUSTOMER' && org && user?.organizationId === org._id) {
      navigate('/customer/dashboard');
    }
  }, [isAuthenticated, user, org, navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      await registerCustomer({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        organizationSlug: slug,
      });
      success(`Welcome to ${org.name} AI Support!`);
      navigate('/customer/dashboard');
    } catch (err) {
      toastError(err.response?.data?.message || 'Registration failed. Please check your details.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const loggedUser = await login({
        email: formData.email,
        password: formData.password,
        organizationSlug: slug,
      });
      success(`Welcome back, ${loggedUser.name}!`);
      if (loggedUser.role === 'ADMIN' || loggedUser.role === 'OWNER') {
        navigate('/admin/dashboard');
      } else if (loggedUser.role === 'AGENT') {
        navigate('/agent/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Login failed. Invalid credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  if (loadingOrg) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading Company Support Portal..." />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-rose-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">Company Support Hub Not Found</h1>
        <p className="text-sm text-slate-400 max-w-md mt-2">
          The support link <span className="text-brand-400 font-mono">/support/{slug}</span> does not match any registered company workspace.
        </p>
        <Link to="/" className="mt-6">
          <Button variant="primary" size="md">
            Return to AI SupportHub Home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-brand-500 selection:text-white relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {org.logo ? (
              <img src={org.logo} alt={org.name} className="w-10 h-10 rounded-xl object-cover border border-slate-700 shadow-md" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-500/25">
                <Building2 className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <span className="font-extrabold text-white text-lg tracking-tight">{org.name}</span>
              <span className="text-[10px] uppercase font-bold text-brand-400 block -mt-1 tracking-wider">
                Official AI Support Center
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Zero-Hallucination AI Verified</span>
          </div>
        </div>
      </header>

      {/* Main Support Hub Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
        {/* Left Col: Company Details & Features */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-950/80 border border-brand-500/30 text-brand-400 text-xs font-semibold shadow-inner">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant 24/7 AI Customer Assistance</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            How can <span className="text-gradient">{org.name}</span> assist you today?
          </h1>

          <p className="text-base text-slate-300 leading-relaxed max-w-xl">
            {org.description ||
              `Get instant, accurate answers about ${org.name}'s services, policies, and troubleshooting guides, or connect directly with a live human support specialist.`}
          </p>

          {/* Quick Stats / Info Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Bot className="w-4 h-4 text-brand-400" />
                <span>AI Knowledge Engine</span>
              </div>
              <p className="text-xs text-slate-400">
                Grounding answers directly from {org.name}'s official knowledge base.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Headphones className="w-4 h-4 text-indigo-400" />
                <span>Live Agent Escalation</span>
              </div>
              <p className="text-xs text-slate-400">
                Seamless transition to human engineers whenever you need tailored help.
              </p>
            </div>
          </div>

          {org.settings?.supportEmail && (
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{org.settings.supportEmail}</span>
              </div>
              {org.settings?.businessHours && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{org.settings.businessHours}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Col: Customer Access Card (Login & Register) */}
        <div className="lg:col-span-5">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl glass-panel space-y-6">
            {/* Tabs */}
            <div className="flex rounded-2xl bg-slate-950 p-1 border border-slate-800">
              <button
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'register'
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'login'
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
            </div>

            {/* Register Form */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">Join {org.name} Support</h3>
                  <p className="text-xs text-slate-400">
                    Create your customer account to start chatting with AI and creating tickets.
                  </p>
                </div>

                <Input
                  label="Full Name"
                  type="text"
                  icon={User}
                  placeholder="Aarav Patel"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />

                <Input
                  label="Email Address"
                  type="email"
                  icon={Mail}
                  placeholder="aarav@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />

                <Input
                  label="Password (min 6 characters)"
                  type="password"
                  icon={Lock}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={authLoading}
                  className="w-full mt-2"
                >
                  Create Support Account
                </Button>
              </form>
            )}

            {/* Login Form */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">Sign In to Support Hub</h3>
                  <p className="text-xs text-slate-400">
                    Access your active conversations and support tickets for {org.name}.
                  </p>
                </div>

                <Input
                  label="Email Address"
                  type="email"
                  icon={Mail}
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />

                <Input
                  label="Password"
                  type="password"
                  icon={Lock}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={authLoading}
                  className="w-full mt-2"
                >
                  Sign In to Support
                </Button>
              </form>
            )}

            <div className="pt-2 border-t border-slate-800 text-center">
              <p className="text-[11px] text-slate-400">
                Are you a company owner or support agent?{' '}
                <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold">
                  Staff Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
