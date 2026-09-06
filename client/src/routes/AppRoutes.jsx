import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { AdminLayout } from '../layouts/AdminLayout';
import { AgentLayout } from '../layouts/AgentLayout';
import { CustomerLayout } from '../layouts/CustomerLayout';

// Public & Auth Pages
import { LandingPage } from '../pages/LandingPage';
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { SupportPortal } from '../pages/customer/SupportPortal';

// Customer Pages
import { CustomerDashboard } from '../pages/customer/CustomerDashboard';
import { CustomerChat } from '../pages/customer/Chat';
import { CustomerConversations } from '../pages/customer/Conversations';
import { CustomerTickets } from '../pages/customer/Tickets';
import { CustomerProfile } from '../pages/customer/Profile';

// Agent Pages
import { AgentDashboard } from '../pages/agent/AgentDashboard';
import { AgentInvitations } from '../pages/agent/AgentInvitations';
import { AgentKnowledge } from '../pages/agent/AgentKnowledge';
import { AgentTickets } from '../pages/agent/AgentTickets';
import { AgentConversation } from '../pages/agent/AgentConversation';
import { AgentProfile } from '../pages/agent/AgentProfile';

// Admin & Owner Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminKnowledgeBase } from '../pages/admin/KnowledgeBase';
import { AdminAgents } from '../pages/admin/Agents';
import { AdminCustomers } from '../pages/admin/Customers';
import { AdminTickets } from '../pages/admin/Tickets';
import { AdminConversations } from '../pages/admin/Conversations';
import { AdminTeam } from '../pages/admin/AdminTeam';
import { AdminSettings } from '../pages/admin/Settings';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/support/:slug" element={<SupportPortal />} />

      {/* Customer Routes (Simplified: Chat, Conversations, Profile) */}
      <Route element={<CustomerLayout />}>
        <Route path="/customer/dashboard" element={<Navigate to="/chat" replace />} />
        <Route path="/customer" element={<Navigate to="/chat" replace />} />
        <Route path="/chat" element={<CustomerChat />} />
        <Route path="/conversations" element={<CustomerConversations />} />
        <Route path="/tickets" element={<CustomerTickets />} />
        <Route path="/profile" element={<CustomerProfile />} />
      </Route>

      {/* Agent Routes */}
      <Route path="/agent" element={<AgentLayout />}>
        <Route index element={<Navigate to="/agent/dashboard" replace />} />
        <Route path="dashboard" element={<AgentDashboard />} />
        <Route path="invitations" element={<AgentInvitations />} />
        <Route path="knowledge" element={<AgentKnowledge />} />
        <Route path="tickets" element={<AgentTickets />} />
        <Route path="conversations" element={<AgentConversation />} />
        <Route path="profile" element={<AgentProfile />} />
      </Route>

      {/* Admin & Owner Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="knowledge" element={<AdminKnowledgeBase />} />
        <Route path="agents" element={<AdminAgents />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="tickets" element={<AdminTickets />} />
        <Route path="conversations" element={<AdminConversations />} />
        <Route path="team" element={<AdminTeam />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
