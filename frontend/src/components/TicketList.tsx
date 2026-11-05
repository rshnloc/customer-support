import React from 'react';
import { Ticket, Agent } from '../types';
import { 
  Search, 
  Mail, 
  MessageSquare, 
  PhoneCall, 
  Globe, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  UserCheck,
  UserX,
  Flame
} from 'lucide-react';

interface TicketListProps {
  tickets: Ticket[];
  agents: Agent[];
  selectedTicketId: string | null;
  onSelectTicket: (ticketId: string) => void;
  filters: {
    status: string;
    priority: string;
    category: string;
    sentiment: string;
    agent_id: string;
    search: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
}

export const TicketList: React.FC<TicketListProps> = ({
  tickets,
  agents,
  selectedTicketId,
  onSelectTicket,
  filters,
  setFilters
}) => {
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="w-3.5 h-3.5 text-blue-400" />;
      case 'live_chat':
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />;
      case 'phone_call':
        return <PhoneCall className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Globe className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <Flame className="w-3 h-3 mr-1 text-rose-400 animate-pulse" />
            CRITICAL
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-orange-500/20 text-orange-300 border border-orange-500/30">
            HIGH
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-700 text-slate-300 border border-slate-600">
            LOW
          </span>
        );
    }
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'Angry':
        return (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-800">
            😠 Angry
          </span>
        );
      case 'Frustrated':
        return (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800">
            😟 Frustrated
          </span>
        );
      case 'Positive':
        return (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800">
            😊 Positive
          </span>
        );
      default:
        return (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            😐 Neutral
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return (
          <span className="flex items-center text-[11px] text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5"></span>
            Open
          </span>
        );
      case 'in_progress':
        return (
          <span className="flex items-center text-[11px] text-blue-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-1.5"></span>
            In Progress
          </span>
        );
      case 'resolved':
      case 'closed':
        return (
          <span className="flex items-center text-[11px] text-emerald-400">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Resolved
          </span>
        );
      default:
        return <span className="text-[11px] text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800">
      {/* Search & Filter Header */}
      <div className="p-4 border-b border-slate-800 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search tickets, IDs, error codes..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Status: All</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Priority: All</option>
            <option value="critical">Critical (P0)</option>
            <option value="high">High (P1)</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Category: All</option>
            <option value="Technical">Technical</option>
            <option value="Billing">Billing</option>
            <option value="Account & Security">Security & SSO</option>
            <option value="Feature Request">Feature Request</option>
          </select>

          <select
            value={filters.agent_id}
            onChange={(e) => setFilters({ ...filters, agent_id: e.target.value })}
            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Agent: All</option>
            <option value="unassigned">Unassigned Only</option>
            {agents.map((ag) => (
              <option key={ag.id} value={ag.id}>
                {ag.name.replace('Agent ', '')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ticket List Queue */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
        {tickets.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No tickets match your filters.
          </div>
        ) : (
          tickets.map((ticket) => {
            const isSelected = ticket.id === selectedTicketId;
            return (
              <div
                key={ticket.id}
                onClick={() => onSelectTicket(ticket.id)}
                className={`p-3.5 cursor-pointer transition-all border-l-4 ${
                  isSelected
                    ? 'bg-slate-800/90 border-indigo-500 shadow-inner'
                    : 'bg-slate-900/40 hover:bg-slate-800/50 border-transparent'
                }`}
              >
                {/* Meta Row: ID, Priority, Channel, Sentiment */}
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[11px] font-mono font-medium text-slate-400">
                      {ticket.id}
                    </span>
                    <span title={`Channel: ${ticket.channel}`} className="p-1 rounded bg-slate-800/80">
                      {getChannelIcon(ticket.channel)}
                    </span>
                    {getPriorityBadge(ticket.priority)}
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {getSentimentBadge(ticket.sentiment)}
                    {getStatusBadge(ticket.status)}
                  </div>
                </div>

                {/* Ticket Title */}
                <h4 className="text-xs font-medium text-slate-100 line-clamp-2 leading-relaxed mb-1.5">
                  {ticket.title}
                </h4>

                {/* Customer Details & Sub-category */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                  <span className="truncate max-w-[180px]">
                    {ticket.customer?.name || 'Customer'}
                    {ticket.customer?.tier === 'Enterprise VIP' && (
                      <span className="ml-1 text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                        VIP
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {ticket.category}
                  </span>
                </div>

                {/* Footer: Assignment & SLA */}
                <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-800/60">
                  <div className="flex items-center space-x-1.5">
                    {ticket.assigned_agent ? (
                      <div className="flex items-center space-x-1 text-slate-300">
                        <span
                          className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                          style={{ backgroundColor: ticket.assigned_agent.avatar_color }}
                        >
                          {ticket.assigned_agent.name.charAt(6)}
                        </span>
                        <span className="text-[10px] text-slate-300 truncate max-w-[120px]">
                          {ticket.assigned_agent.name}
                        </span>
                        {ticket.auto_assigned && (
                          <span title="Auto-assigned by AI">
                            <Sparkles className="w-3 h-3 text-indigo-400" />
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] text-rose-400 flex items-center">
                        <UserX className="w-3 h-3 mr-1" />
                        Unassigned
                      </span>
                    )}
                  </div>

                  {/* SLA Warning */}
                  {ticket.sla_breached ? (
                    <span className="text-[10px] font-semibold text-rose-400 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      SLA Breached
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      SLA Active
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
