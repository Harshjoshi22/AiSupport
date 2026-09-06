import React, { useState, useEffect } from 'react';
import { ticketService } from '../../services/ticket.service';
import api from '../../services/api';
import { TicketList } from '../../components/tickets/TicketList';
import { TicketDetailModal } from '../../components/tickets/TicketDetailModal';
import { CreateTicketModal } from '../../components/tickets/CreateTicketModal';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import { Ticket, Plus, Search, Filter } from 'lucide-react';

export const AdminTickets = () => {
  const { success, error: toastError } = useToast();
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await ticketService.getTickets({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        search: search || undefined,
      });
      setTickets(res.tickets || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await api.get('/users/agents');
      setAgents(res.data.agents || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchAgents();
  }, [statusFilter, priorityFilter, categoryFilter]);

  const handleCreateTicket = async (data) => {
    setIsCreating(true);
    try {
      await ticketService.createTicket(data);
      success('Ticket created successfully');
      setIsCreateOpen(false);
      fetchTickets();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to create ticket');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Organization Ticket Center</h2>
          <p className="text-xs text-slate-400 mt-1">
            Global ticket queue, status management, assignments, and AI analytics
          </p>
        </div>

        <Button variant="primary" size="md" icon={Plus} onClick={() => setIsCreateOpen(true)}>
          Create Ticket
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchTickets()}
            placeholder="Search tickets by title, customer, ticket #..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-brand-500"
        >
          <option value="all">All Statuses</option>
          <option value="OPEN">Open (AI)</option>
          <option value="HUMAN_REQUIRED">Human Required</option>
          <option value="RESOLVED">Resolved</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:ring-2 focus:ring-brand-500"
        >
          <option value="all">All Priorities</option>
          <option value="Urgent">Urgent</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* Ticket List */}
      <TicketList tickets={tickets} onSelectTicket={setSelectedTicket} loading={loading} />

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <TicketDetailModal
          isOpen={Boolean(selectedTicket)}
          onClose={() => setSelectedTicket(null)}
          ticket={selectedTicket}
          agents={agents}
          onTicketUpdated={(updated) => {
            setSelectedTicket(updated);
            fetchTickets();
          }}
        />
      )}

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreateTicket={handleCreateTicket}
        loading={isCreating}
      />
    </div>
  );
};
