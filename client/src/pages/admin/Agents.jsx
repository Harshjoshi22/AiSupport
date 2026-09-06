import React, { useState, useEffect } from 'react';
import { agentService } from '../../services/agent.service';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';
import {
  UserCheck,
  Search,
  UserPlus,
  Trash2,
  Star,
  Globe,
  Briefcase,
  Languages,
  DollarSign,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  Send,
  Eye,
  ShieldAlert,
} from 'lucide-react';

export const AdminAgents = () => {
  const { success, error: toastError } = useToast();

  // Tab State
  const [activeTab, setActiveTab] = useState('my-agents'); // 'my-agents' | 'find-agents'

  // Section 1: My Company's Agents
  const [companyAgents, setCompanyAgents] = useState([]);
  const [loadingCompanyAgents, setLoadingCompanyAgents] = useState(true);

  // Section 2: Global Directory of Available Agents
  const [availableAgents, setAvailableAgents] = useState([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('all');

  // Modals
  const [agentToRemove, setAgentToRemove] = useState(null);
  const [removing, setRemoving] = useState(false);

  const [selectedAgentProfile, setSelectedAgentProfile] = useState(null);
  const [invitingId, setInvitingId] = useState(null);

  const fetchCompanyAgents = async () => {
    setLoadingCompanyAgents(true);
    try {
      const res = await agentService.getCompanyAgents();
      setCompanyAgents(res.agents || []);
    } catch (err) {
      console.error('Failed to load company agents', err);
    } finally {
      setLoadingCompanyAgents(false);
    }
  };

  const fetchAvailableAgents = async () => {
    setLoadingAvailable(true);
    try {
      const res = await agentService.getAvailableAgents({
        search: searchQuery || undefined,
        skill: selectedSkill !== 'all' ? selectedSkill : undefined,
      });
      setAvailableAgents(res.agents || []);
    } catch (err) {
      console.error('Failed to load available agents', err);
    } finally {
      setLoadingAvailable(false);
    }
  };

  useEffect(() => {
    fetchCompanyAgents();
  }, []);

  useEffect(() => {
    if (activeTab === 'find-agents') {
      fetchAvailableAgents();
    }
  }, [activeTab, selectedSkill]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAvailableAgents();
  };

  const handleInviteAgent = async (agent) => {
    setInvitingId(agent._id);
    try {
      await agentService.inviteAgent(agent._id);
      success(`Invitation sent to ${agent.name}! They will appear in your team once accepted.`);
      fetchAvailableAgents();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setInvitingId(null);
    }
  };

  const handleConfirmRemoveAgent = async () => {
    if (!agentToRemove) return;
    setRemoving(true);
    try {
      await agentService.removeAgent(agentToRemove._id);
      success(`${agentToRemove.name} has been removed and returned to the Global Directory.`);
      setAgentToRemove(null);
      fetchCompanyAgents();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to remove agent');
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Support Agents Hub</h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage your company's support agents or discover available talent from the Global Directory
          </p>
        </div>

        {/* Section Tabs */}
        <div className="flex rounded-2xl bg-slate-900 p-1 border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('my-agents')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'my-agents'
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
              }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>My Company's Agents ({companyAgents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('find-agents')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'find-agents'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
              }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Find Support Agents</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: MY COMPANY'S AGENTS */}
      {/* ========================================================================= */}
      {activeTab === 'my-agents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Active Support Team Members
            </h3>
            <span className="text-xs text-slate-400">
              Agents actively assigned to handle customer tickets & live dialogues
            </span>
          </div>

          {loadingCompanyAgents ? (
            <div className="py-16 flex justify-center">
              <LoadingSpinner size="md" text="Loading company agents..." />
            </div>
          ) : companyAgents.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <UserCheck className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">No Support Agents in Company Yet</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Your company does not currently have any active support agents. Browse the Global Talent Directory to invite top agents.
              </p>
              <Button
                variant="primary"
                size="sm"
                icon={Globe}
                onClick={() => setActiveTab('find-agents')}
              >
                Find & Invite Support Agents
              </Button>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl glass-panel">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                    <tr>
                      <th className="p-4">Agent Name</th>
                      <th className="p-4">Specialization / Skills</th>
                      <th className="p-4">Active Tickets</th>
                      <th className="p-4">Resolved Tickets</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {companyAgents.map((agent) => (
                      <tr key={agent._id} className="hover:bg-slate-850/50 transition-colors">
                        <td className="p-4 font-semibold text-white">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-brand-950 border border-brand-500/30 text-brand-400 font-bold flex items-center justify-center overflow-hidden">
                              {agent.avatar ? (
                                <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
                              ) : (
                                agent.name.charAt(0)
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-white text-xs">{agent.name}</p>
                              <p className="text-[11px] text-slate-400 font-mono">{agent.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 max-w-xs">
                          <div className="flex flex-wrap gap-1">
                            {agent.skills && agent.skills.length > 0 ? (
                              agent.skills.slice(0, 3).map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-[10px]"
                                >
                                  {skill}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-500 italic">General Support</span>
                            )}
                            {agent.skills && agent.skills.length > 3 && (
                              <span className="text-[10px] text-slate-400">+{agent.skills.length - 3}</span>
                            )}
                          </div>
                        </td>

                        <td className="p-4 font-bold text-amber-400">
                          {agent.activeTickets || 0} tickets
                        </td>

                        <td className="p-4 font-bold text-emerald-400">
                          {agent.resolvedTickets || 0} tickets
                        </td>

                        <td className="p-4">
                          <Badge variant="success" size="sm">
                            ACTIVE
                          </Badge>
                        </td>

                        <td className="p-4 text-right">
                          <Button
                            variant="danger"
                            size="sm"
                            icon={Trash2}
                            onClick={() => setAgentToRemove(agent)}
                            className="text-[11px] py-1"
                          >
                            Remove Agent
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: FIND SUPPORT AGENTS (GLOBAL TALENT DIRECTORY) */}
      {/* ========================================================================= */}
      {activeTab === 'find-agents' && (
        <div className="space-y-5">
          {/* Search & Filter Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 glass-panel flex flex-col sm:flex-row items-center justify-between gap-3">
            <form onSubmit={handleSearchSubmit} className="flex-1 w-full sm:w-auto relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search agents by name, skills, or expertise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </form>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="w-full sm:w-48 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Specializations</option>
                <option value="MERN">MERN Stack</option>
                <option value="React">React / Frontend</option>
                <option value="Node">Node.js / Backend</option>
                <option value="Python">Python & AI</option>
                <option value="Java">Java & Spring</option>
                <option value="Customer Care">Customer Care</option>
              </select>

              <Button variant="primary" size="sm" onClick={fetchAvailableAgents} loading={loadingAvailable}>
                Filter
              </Button>
            </div>
          </div>

          {/* Directory Grid */}
          {loadingAvailable ? (
            <div className="py-20 flex justify-center">
              <LoadingSpinner size="md" text="Searching global agent directory..." />
            </div>
          ) : availableAgents.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 space-y-2">
              <Globe className="w-8 h-8 text-slate-500 mx-auto" />
              <h4 className="text-base font-bold text-white">No Available Agents Found</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No independent agents currently match your filter query. Try clearing your search parameters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {availableAgents.map((agent) => (
                <div
                  key={agent._id}
                  className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 shadow-xl transition-all glass-panel flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-950 border border-indigo-500/30 text-indigo-400 font-bold text-lg flex items-center justify-center overflow-hidden">
                          {agent.avatar ? (
                            <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
                          ) : (
                            agent.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{agent.name}</h4>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                            AVAILABLE
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{agent.rating ? agent.rating.toFixed(1) : '5.0'}</span>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {agent.bio || 'Professional technical support specialist available for company onboarding.'}
                    </p>

                    {/* Meta info */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                        <span>{agent.experience || '2+ years'}</span>
                      </div>
                      {agent.hourlyRate > 0 && (
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                          <span>${agent.hourlyRate}/hr</span>
                        </div>
                      )}
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {agent.skills && agent.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-indigo-950/60 border border-indigo-500/20 text-indigo-300 text-[10px] font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Eye}
                      onClick={() => setSelectedAgentProfile(agent)}
                      className="flex-1 text-xs"
                    >
                      View Profile
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Send}
                      loading={invitingId === agent._id}
                      onClick={() => handleInviteAgent(agent)}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-xs"
                    >
                      Invite Agent
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW AGENT PROFILE */}
      {/* ========================================================================= */}
      <Modal
        isOpen={Boolean(selectedAgentProfile)}
        onClose={() => setSelectedAgentProfile(null)}
        title="Agent Professional Profile"
      >
        {selectedAgentProfile && (
          <div className="space-y-5 text-slate-200">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
              <div className="w-14 h-14 rounded-2xl bg-indigo-950 border border-indigo-500/30 text-indigo-400 font-bold text-xl flex items-center justify-center overflow-hidden">
                {selectedAgentProfile.avatar ? (
                  <img src={selectedAgentProfile.avatar} alt={selectedAgentProfile.name} className="w-full h-full object-cover" />
                ) : (
                  selectedAgentProfile.name.charAt(0)
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">{selectedAgentProfile.name}</h3>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-emerald-400 font-semibold">Status: AVAILABLE</span>
                  <span>•</span>
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {selectedAgentProfile.rating || 5.0} Rating
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Professional Bio</h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                {selectedAgentProfile.bio || 'No bio provided.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 block font-medium">Experience:</span>
                <span className="text-white font-bold">{selectedAgentProfile.experience || '1 year'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 block font-medium">Languages:</span>
                <span className="text-white font-bold">
                  {selectedAgentProfile.languages?.join(', ') || 'English'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Technical Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedAgentProfile.skills?.map((s, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-xs">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setSelectedAgentProfile(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Send}
                loading={invitingId === selectedAgentProfile._id}
                onClick={() => {
                  handleInviteAgent(selectedAgentProfile);
                  setSelectedAgentProfile(null);
                }}
                className="bg-indigo-600 hover:bg-indigo-500"
              >
                Send Company Invitation
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: CONFIRM REMOVE AGENT */}
      {/* ========================================================================= */}
      <Modal
        isOpen={Boolean(agentToRemove)}
        onClose={() => setAgentToRemove(null)}
        title="Remove Agent from Company"
      >
        <div className="space-y-4 text-slate-200">
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-bold text-rose-300">Revoke Company Access</p>
              <p className="text-slate-300 leading-relaxed">
                Removing <span className="font-bold text-white">{agentToRemove?.name}</span> will immediately revoke their access to your company Knowledge Base, tickets, conversations, and customer records.
              </p>
              <p className="text-slate-400">
                The agent will become <span className="font-bold text-emerald-400">AVAILABLE</span> again in the Global Directory.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setAgentToRemove(null)} disabled={removing}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={removing}
              icon={Trash2}
              onClick={handleConfirmRemoveAgent}
            >
              Confirm Removal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
