import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import {
  Bot,
  Mail,
  Lock,
  User,
  Building2,
  Sparkles,
  Shield,
  Headphones,
  Key,
  Layers,
  CheckCircle2,
  ArrowRight,
  Briefcase,
} from 'lucide-react';

export const Register = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') || 'company'; // 'company' | 'agent' | 'admin'

  const [mode, setMode] = useState(initialMode);
  const { registerCompany, registerAgent, requestAdminJoin } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [adminRequestSubmitted, setAdminRequestSubmitted] = useState(false);
  const [submittedCompanyName, setSubmittedCompanyName] = useState('');

  // Company Form State
  const [companyForm, setCompanyForm] = useState({
    companyName: '',
    name: '',
    email: '',
    password: '',
    description: '',
  });

  // Agent Form State
  const [agentForm, setAgentForm] = useState({
    name: '',
    email: '',
    password: '',
    bio: '',
    skills: 'MERN Stack, React, Node.js, Customer Support',
    experience: '3 years',
    languages: 'English, Hindi',
    hourlyRate: 30,
  });

  // Admin Join Form State
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    password: '',
    adminJoinKey: '',
  });

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await registerCompany(companyForm);
      success(`Company workspace created! Welcome, ${res.name}.`);
      navigate('/admin/dashboard');
    } catch (err) {
      toastError(err.response?.data?.message || 'Company registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleAgentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await registerAgent({
        ...agentForm,
        skills: agentForm.skills.split(',').map((s) => s.trim()).filter(Boolean),
        languages: agentForm.languages.split(',').map((l) => l.trim()).filter(Boolean),
      });
      success(`Support Agent profile created! You are now discoverable in the Global Directory.`);
      navigate('/agent/dashboard');
    } catch (err) {
      toastError(err.response?.data?.message || 'Agent registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await requestAdminJoin(adminForm);
      setSubmittedCompanyName(res.companyName || 'Company');
      setAdminRequestSubmitted(true);
      success('Admin join request submitted! Awaiting owner approval.');
    } catch (err) {
      toastError(err.response?.data?.message || 'Admin join request failed. Please check the Admin Join Key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-brand-500 selection:text-white">
      {/* Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center space-y-2 relative z-10 px-4">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <span className="font-extrabold text-2xl text-white tracking-tight">AI SupportHub</span>
        </Link>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Create your account</h2>
        <p className="text-xs text-slate-400">
          Choose your account type to access multi-tenant AI customer support
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10 px-4">
        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('company');
              setAdminRequestSubmitted(false);
            }}
            className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-xl text-xs font-bold transition-all gap-1 ${
              mode === 'company'
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Create Company</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('agent');
              setAdminRequestSubmitted(false);
            }}
            className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-xl text-xs font-bold transition-all gap-1 ${
              mode === 'agent'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Headphones className="w-4 h-4" />
            <span>Become Agent</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('admin');
              setAdminRequestSubmitted(false);
            }}
            className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-xl text-xs font-bold transition-all gap-1 ${
              mode === 'admin'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Join as Admin</span>
          </button>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 py-8 px-6 shadow-2xl rounded-3xl sm:px-8 glass-panel space-y-6">
          {/* MODE 1: CREATE COMPANY (OWNER) */}
          {mode === 'company' && (
            <form onSubmit={handleCompanySubmit} className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-brand-400" />
                  <h3 className="text-base font-bold text-white">Create Company Workspace (Owner)</h3>
                </div>
                <p className="text-xs text-slate-400">
                  You will become the Company Owner, manage Knowledge Base, AI configuration, and invite agents.
                </p>
              </div>

              <Input
                label="Company / Organization Name"
                type="text"
                icon={Building2}
                placeholder="ABC Technologies"
                value={companyForm.companyName}
                onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                required
              />

              <Input
                label="Your Full Name (Owner)"
                type="text"
                icon={User}
                placeholder="Harshit Sharma"
                value={companyForm.name}
                onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                required
              />

              <Input
                label="Work Email Address"
                type="email"
                icon={Mail}
                placeholder="owner@abctech.com"
                value={companyForm.email}
                onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                required
              />

              <Input
                label="Password (min 6 characters)"
                type="password"
                icon={Lock}
                placeholder="••••••••"
                value={companyForm.password}
                onChange={(e) => setCompanyForm({ ...companyForm, password: e.target.value })}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full mt-2"
                icon={ArrowRight}
              >
                Create Company & Launch Hub
              </Button>
            </form>
          )}

          {/* MODE 2: BECOME SUPPORT AGENT (GLOBAL DIRECTORY) */}
          {mode === 'agent' && (
            <form onSubmit={handleAgentSubmit} className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-base font-bold text-white">Register as Independent Support Agent</h3>
                </div>
                <p className="text-xs text-slate-400">
                  Appear in the global talent directory. Companies can discover and invite you to their support teams.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  type="text"
                  icon={User}
                  placeholder="Neha Gupta"
                  value={agentForm.name}
                  onChange={(e) => setAgentForm({ ...agentForm, name: e.target.value })}
                  required
                />

                <Input
                  label="Email Address"
                  type="email"
                  icon={Mail}
                  placeholder="neha@freelance.dev"
                  value={agentForm.email}
                  onChange={(e) => setAgentForm({ ...agentForm, email: e.target.value })}
                  required
                />
              </div>

              <Input
                label="Password (min 6 characters)"
                type="password"
                icon={Lock}
                placeholder="••••••••"
                value={agentForm.password}
                onChange={(e) => setAgentForm({ ...agentForm, password: e.target.value })}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Years of Experience"
                  type="text"
                  placeholder="3 years"
                  value={agentForm.experience}
                  onChange={(e) => setAgentForm({ ...agentForm, experience: e.target.value })}
                  required
                />

                <Input
                  label="Hourly Rate ($ USD)"
                  type="number"
                  placeholder="30"
                  value={agentForm.hourlyRate}
                  onChange={(e) => setAgentForm({ ...agentForm, hourlyRate: e.target.value })}
                />
              </div>

              <Input
                label="Skills (Comma-separated)"
                type="text"
                placeholder="MERN Stack, React, Node.js, MongoDB, REST APIs"
                value={agentForm.skills}
                onChange={(e) => setAgentForm({ ...agentForm, skills: e.target.value })}
                required
              />

              <Input
                label="Languages Spoken"
                type="text"
                placeholder="English, Hindi, Spanish"
                value={agentForm.languages}
                onChange={(e) => setAgentForm({ ...agentForm, languages: e.target.value })}
                required
              />

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                  Professional Bio
                </label>
                <textarea
                  rows={3}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Passionate technical customer support specialist with 3+ years experience debugging web applications..."
                  value={agentForm.bio}
                  onChange={(e) => setAgentForm({ ...agentForm, bio: e.target.value })}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500"
                icon={ArrowRight}
              >
                Join Global Agent Directory
              </Button>
            </form>
          )}

          {/* MODE 3: JOIN AS ADMIN (KEY BASED + APPROVAL) */}
          {mode === 'admin' && (
            <div>
              {adminRequestSubmitted ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Admin Request Submitted</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Your request to join <span className="text-brand-400 font-bold">{submittedCompanyName}</span> as an Administrator has been forwarded to the Company Owner for approval.
                  </p>
                  <p className="text-xs text-slate-500">
                    Once the Owner approves your request, you can log in to access the Admin Portal.
                  </p>
                  <Link to="/login" className="inline-block mt-4">
                    <Button variant="secondary" size="md">
                      Go to Sign In
                    </Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleAdminSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-400" />
                      <h3 className="text-base font-bold text-white">Join Company as Admin</h3>
                    </div>
                    <p className="text-xs text-slate-400">
                      Enter the unique Company Admin Join Key provided by your company owner.
                    </p>
                  </div>

                  <Input
                    label="Company Admin Join Key"
                    type="text"
                    icon={Key}
                    placeholder="ABCD-92FK-XP81"
                    value={adminForm.adminJoinKey}
                    onChange={(e) => setAdminForm({ ...adminForm, adminJoinKey: e.target.value.toUpperCase() })}
                    required
                  />

                  <Input
                    label="Full Name"
                    type="text"
                    icon={User}
                    placeholder="Rohit Verma"
                    value={adminForm.name}
                    onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                    required
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    icon={Mail}
                    placeholder="rohit.admin@gmail.com"
                    value={adminForm.email}
                    onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                    required
                  />

                  <Input
                    label="Password (min 6 characters)"
                    type="password"
                    icon={Lock}
                    placeholder="••••••••"
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                    required
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={loading}
                    className="w-full mt-2 bg-purple-600 hover:bg-purple-500"
                    icon={ArrowRight}
                  >
                    Submit Admin Access Request
                  </Button>
                </form>
              )}
            </div>
          )}

          {/* Customer Support Notice */}
          <div className="pt-4 border-t border-slate-800 text-center space-y-2">
            <p className="text-xs text-slate-400">
              Are you a customer seeking support?{' '}
              <span className="text-slate-300">
                Please use your company's dedicated link (e.g.{' '}
                <Link to="/support/skillup-academy" className="text-brand-400 hover:underline">
                  /support/skillup-academy
                </Link>
                )
              </span>
            </p>
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-brand-400 hover:text-brand-300">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
