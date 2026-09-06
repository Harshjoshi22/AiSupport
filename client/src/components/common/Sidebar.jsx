import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  UserCheck,
  Ticket,
  MessageSquare,
  Settings,
  Bot,
  User,
  Shield,
  Crown,
  Mail,
  Building2,
  Sliders,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, role, isOwner, isAdmin, isAgent, isCustomer } = useAuth();

  // OWNER Navigation
  const ownerNav = [
    { name: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Knowledge Base', to: '/admin/knowledge', icon: BookOpen },
    { name: 'Support Agents', to: '/admin/agents', icon: UserCheck },
    { name: 'Customers', to: '/admin/customers', icon: Users },
    { name: 'Tickets', to: '/admin/tickets', icon: Ticket },
    { name: 'Conversations', to: '/admin/conversations', icon: MessageSquare },
    { name: 'Admins & Team', to: '/admin/team', icon: Crown },
    { name: 'Company Settings', to: '/admin/settings', icon: Settings },
  ];

  // ADMIN Navigation
  const adminNav = [
    { name: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Knowledge Base', to: '/admin/knowledge', icon: BookOpen },
    { name: 'Support Agents', to: '/admin/agents', icon: UserCheck },
    { name: 'Customers', to: '/admin/customers', icon: Users },
    { name: 'Tickets', to: '/admin/tickets', icon: Ticket },
    { name: 'Conversations', to: '/admin/conversations', icon: MessageSquare },
    { name: 'Settings', to: '/admin/settings', icon: Settings },
  ];

  // AGENT Navigation (Dynamic based on company membership)
  const agentNav = user?.organizationId
    ? [
        { name: 'Workspace Overview', to: '/agent/dashboard', icon: LayoutDashboard },
        { name: 'Company Invitations', to: '/agent/invitations', icon: Mail },
        { name: 'Company Knowledge', to: '/agent/knowledge', icon: BookOpen },
        { name: 'Support Tickets', to: '/agent/tickets', icon: Ticket },
        { name: 'Live Conversations', to: '/agent/conversations', icon: MessageSquare },
        { name: 'My Profile', to: '/agent/profile', icon: User },
      ]
    : [
        { name: 'Workspace Overview', to: '/agent/dashboard', icon: LayoutDashboard },
        { name: 'Company Invitations', to: '/agent/invitations', icon: Mail },
        { name: 'My Profile', to: '/agent/profile', icon: User },
      ];

  // CUSTOMER Navigation (Simplified)
  const customerNav = [
    { name: 'AI Support Chat', to: '/chat', icon: Bot },
    { name: 'My Conversations', to: '/conversations', icon: MessageSquare },
    { name: 'My Profile', to: '/profile', icon: User },
  ];

  let navItems = customerNav;
  let portalTitle = 'Customer Support';

  if (isOwner) {
    navItems = ownerNav;
    portalTitle = 'Owner Workspace';
  } else if (isAdmin) {
    navItems = adminNav;
    portalTitle = 'Admin Portal';
  } else if (isAgent) {
    navItems = agentNav;
    portalTitle = 'Agent Workspace';
  }

  const orgName = user?.organization?.name || (isAgent ? 'Independent Workspace' : 'AI SupportHub');

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-800 bg-slate-950 p-4 transition-transform duration-300 md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between`}
      >
        <div className="space-y-6">
          <div className="px-3 pt-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {portalTitle}
            </p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Org Status */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Workspace:</span>
            <span className="text-brand-400 font-bold truncate max-w-[120px]">{orgName}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>AI Support System Active</span>
          </div>
        </div>
      </aside>
    </>
  );
};
