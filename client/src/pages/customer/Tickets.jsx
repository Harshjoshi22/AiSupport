import React, { useState, useEffect } from 'react';
import { ticketService } from '../../services/ticket.service';
import { TicketList } from '../../components/tickets/TicketList';
import { TicketDetailModal } from '../../components/tickets/TicketDetailModal';
import { CreateTicketModal } from '../../components/tickets/CreateTicketModal';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import { Ticket, Plus, Search, Filter } from 'lucide-react';

export const CustomerTickets = () => {
  const { success, error: toastError } = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await ticketService.getTickets({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search || undefined,
      });
      setTickets(res.tickets || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTickets();
  };

  const handleCreateTicket = async (ticketData) => {
    setIsCreating(true);
    try {
      const res = await ticketService.createTicket(ticketData);
      success('Ticket created successfully!');
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
          <h2 className="text-2xl font-bold text-white tracking-tight">Support Tickets</h2>
          <p className="text-xs text-slate-400 mt-1">Track and manage your submitted support inquiries</p>
        </div>

        <Button variant="primary" size="md" icon={Plus} onClick={() => setIsCreateOpen(true)}>
          New Ticket
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets by title, ticket #..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* List */}
      <TicketList tickets={tickets} onSelectTicket={setSelectedTicket} loading={loading} />

      {/* Detail Modal */}
      {selectedTicket && (
        <TicketDetailModal
          isOpen={Boolean(selectedTicket)}
          onClose={() => setSelectedTicket(null)}
          ticket={selectedTicket}
          onTicketUpdated={(updated) => {
            setSelectedTicket(updated);
            fetchTickets();
          }}
        />
      )}

      {/* Create Modal */}
      <CreateTicketModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreateTicket={handleCreateTicket}
        loading={isCreating}
      />
    </div>
  );
};
