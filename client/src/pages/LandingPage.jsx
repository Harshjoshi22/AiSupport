import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import {
  Bot,
  Sparkles,
  Shield,
  Headphones,
  Zap,
  ArrowRight,
  Database,
  Layers,
  MessageSquare,
  CheckCircle2,
  Lock,
  Crown,
  Building2,
  Globe,
  Key,
} from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated, role, login } = useAuth();
  const navigate = useNavigate();

  const handleQuickLogin = async (email, password) => {
    try {
      const user = await login({ email, password });
      if (user.role === 'OWNER' || user.role === 'ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'AGENT') navigate('/agent/dashboard');
      else navigate('/customer/dashboard');
    } catch (e) {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-500/25">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-white text-lg tracking-tight">AI SupportHub</span>
              <span className="text-[10px] uppercase font-bold text-brand-400 block -mt-1 tracking-wider">
                Multi-Tenant Enterprise SaaS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to={
                  role === 'OWNER' || role === 'ADMIN'
                    ? '/admin/dashboard'
                    : role === 'AGENT'
                    ? '/agent/dashboard'
                    : '/customer/dashboard'
                }
              >
                <Button variant="primary" size="sm" icon={ArrowRight}>
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Get Started Free
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28">
          {/* Subtle glowing ambient lights */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-500/15 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-950/80 border border-brand-500/30 text-brand-400 text-xs font-semibold shadow-inner">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Tenant RAG AI Support Platform with Agent Marketplace</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
              Transform Customer Support with{' '}
              <span className="text-gradient">Zero-Hallucination</span> AI.
            </h1>

            <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Create company workspaces, upload knowledge documents, discover top support agents in a global talent directory, and onboard customers through unique company support links.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link to="/register?mode=company">
                <Button variant="primary" size="lg" icon={Building2} className="px-6 py-3 text-sm font-bold">
                  Create Company Workspace
                </Button>
              </Link>
              <Link to="/register?mode=agent">
                <Button variant="secondary" size="lg" icon={Globe} className="px-6 py-3 text-sm font-bold">
                  Join as Support Agent
                </Button>
              </Link>
            </div>

            {/* Demo Organization Showcase Box */}
            <div className="pt-10 max-w-4xl mx-auto">
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl glass-panel text-left space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
                      S
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-white">SkillUp Academy Workspace</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                          Preloaded Demo Workspace
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Customer Support Link: <span className="font-mono text-brand-400">/support/skillup-academy</span> • Admin Join Key: <span className="font-mono text-purple-400 font-bold">SKILL-92FK-XP81</span>
                      </p>
                    </div>
                  </div>

                  <Link to="/support/skillup-academy" target="_blank">
                    <Button variant="outline" size="sm" icon={ArrowRight} className="text-xs">
                      Open Customer Portal
                    </Button>
                  </Link>
                </div>

                {/* 1-Click Quick Demo Role Logins */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    ⚡ 1-Click Instant Demo Logins (Development Mode)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    {/* Owner */}
                    <button
                      onClick={() => handleQuickLogin('owner@skillupacademy.dev', 'Password123!')}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 transition-all text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                          <Crown className="w-3 h-3" /> OWNER
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-amber-400 transition-colors" />
                      </div>
                      <p className="text-xs font-bold text-white mt-1">Company Owner</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Full governance & team</p>
                    </button>

                    {/* Admin */}
                    <button
                      onClick={() => handleQuickLogin('admin@skillupacademy.dev', 'Password123!')}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-850 transition-all text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-purple-400 flex items-center gap-1">
                          <Shield className="w-3 h-3" /> ADMIN
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-purple-400 transition-colors" />
                      </div>
                      <p className="text-xs font-bold text-white mt-1">Admin Portal</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Knowledge & operations</p>
                    </button>

                    {/* Agent */}
                    <button
                      onClick={() => handleQuickLogin('agent.priya@skillupacademy.dev', 'Password123!')}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-brand-500/50 hover:bg-slate-850 transition-all text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-brand-400 flex items-center gap-1">
                          <Headphones className="w-3 h-3" /> AGENT
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-brand-400 transition-colors" />
                      </div>
                      <p className="text-xs font-bold text-white mt-1">Support Agent</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Tickets & knowledge</p>
                    </button>

                    {/* Customer */}
                    <button
                      onClick={() => handleQuickLogin('customer.aarav@gmail.com', 'Password123!')}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 transition-all text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                          <Bot className="w-3 h-3" /> CUSTOMER
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                      </div>
                      <p className="text-xs font-bold text-white mt-1">Customer Portal</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">AI chat & ticket center</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-16 bg-slate-900/40 border-t border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Enterprise Multi-Tenant AI Support Architecture
              </h2>
              <p className="text-sm text-slate-400">
                Built specifically for multi-tenant isolation, independent support talent marketplace, and RAG knowledge retrieval.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 glass-panel">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Tenant-Isolated RAG Vector Search</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every knowledge document and chunk is strictly scoped by organization ID. AI retrievals never cross tenant boundaries, ensuring total data privacy.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 glass-panel">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Global Talent Directory</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Independent agents register and appear in the global directory. Companies invite top agents who receive instant read-only access to company knowledge upon acceptance.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 glass-panel">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Owner Admin Join Key Governance</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Company owners generate secure hashed Admin Join Keys and explicitly review and approve or decline incoming administrator access requests.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 bg-slate-950 text-center text-xs text-slate-500">
        <p>© 2026 AI SupportHub SaaS. Multi-Tenant AI Customer Support Platform.</p>
      </footer>
    </div>
  );
};
