import React, { useState, useEffect } from 'react';
import { 
  fetchTickets, 
  fetchTicketById, 
  createTicket, 
  updateTicket, 
  triggerAITriage, 
  assignTicket, 
  addTicketMessage, 
  fetchAgents, 
  updateAgentStatus, 
  fetchAnalytics, 
  resetAndSeedData 
} from './api';
import { Ticket, Agent, AnalyticsData } from './types';
import { Navbar } from './components/Navbar';
import { TicketList } from './components/TicketList';
import { TicketDetail } from './components/TicketDetail';
import { AICopilotPanel } from './components/AICopilotPanel';
import { AgentRoster } from './components/AgentRoster';
import { AnalyticsView } from './components/AnalyticsView';
import { NewTicketModal } from './components/NewTicketModal';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'queue' | 'agents' | 'analytics'>('queue');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTriaging, setIsTriaging] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all',
    sentiment: 'all',
    agent_id: 'all',
    search: ''
  });

  // Load initial data
  const loadData = async () => {
    try {
      const [ticketData, agentData] = await Promise.all([
        fetchTickets(filters),
        fetchAgents()
      ]);
      setTickets(ticketData);
      setAgents(agentData);

      // Auto-select first ticket if none selected
      if (!selectedTicketId && ticketData.length > 0) {
        setSelectedTicketId(ticketData[0].id);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  // Load single ticket details when selected
  useEffect(() => {
    if (!selectedTicketId) return;
    fetchTicketById(selectedTicketId)
      .then((t) => setSelectedTicket(t))
      .catch((err) => console.error('Error loading ticket detail:', err));
  }, [selectedTicketId]);

  // Load analytics when analytics tab is opened
  useEffect(() => {
    if (currentTab === 'analytics') {
      setLoadingAnalytics(true);
      fetchAnalytics()
        .then((data) => setAnalytics(data))
        .catch((err) => console.error('Error loading analytics:', err))
        .finally(() => setLoadingAnalytics(false));
    }
  }, [currentTab]);

  // Handler: create ticket
  const handleCreateTicket = async (ticketData: any) => {
    const created = await createTicket(ticketData);
    await loadData();
    setSelectedTicketId(created.id);
    setSelectedTicket(created);
  };

  // Handler: update ticket status
  const handleUpdateStatus = async (status: string) => {
    if (!selectedTicketId) return;
    const updated = await updateTicket(selectedTicketId, { status });
    setSelectedTicket(updated);
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  // Handler: update priority
  const handleUpdatePriority = async (priority: string) => {
    if (!selectedTicketId) return;
    const updated = await updateTicket(selectedTicketId, { priority });
    setSelectedTicket(updated);
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  // Handler: assign agent
  const handleAssignAgent = async (agentId: string) => {
    if (!selectedTicketId) return;
    const updated = await assignTicket(selectedTicketId, {
      agent_id: agentId,
      auto_assign: false
    });
    setSelectedTicket(updated);
    await loadData();
  };

  // Handler: trigger AI smart auto-assign
  const handleAutoAssign = async () => {
    if (!selectedTicketId) return;
    const updated = await assignTicket(selectedTicketId, { auto_assign: true });
    setSelectedTicket(updated);
    await loadData();
  };

  // Handler: trigger AI re-triage
  const handleTriggerTriage = async () => {
    if (!selectedTicketId) return;
    setIsTriaging(true);
    try {
      const updated = await triggerAITriage(selectedTicketId);
      setSelectedTicket(updated);
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } finally {
      setIsTriaging(false);
    }
  };

  // Handler: send ticket message
  const handleSendMessage = async (content: string, senderType: 'agent' | 'ai_copilot') => {
    if (!selectedTicketId) return;
    await addTicketMessage(selectedTicketId, {
      sender_type: senderType,
      sender_name: 'Agent Support Desk',
      content
    });
    const refreshed = await fetchTicketById(selectedTicketId);
    setSelectedTicket(refreshed);
    setTickets((prev) => prev.map((t) => (t.id === refreshed.id ? refreshed : t)));
  };

  // Handler: update agent status
  const handleUpdateAgentStatus = async (agentId: string, status: string) => {
    await updateAgentStatus(agentId, status);
    const agentData = await fetchAgents();
    setAgents(agentData);
  };

  // Handler: reset & re-seed data
  const handleResetData = async () => {
    if (confirm('Reset contact center queue to clean synthetic demo fixtures?')) {
      await resetAndSeedData();
      await loadData();
      if (tickets.length > 0) {
        setSelectedTicketId(tickets[0].id);
      }
    }
  };

  const criticalCount = tickets.filter((t) => t.priority === 'critical').length;
  const openCount = tickets.filter((t) => t.status === 'open').length;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openNewTicketModal={() => setIsModalOpen(true)}
        onResetData={handleResetData}
        criticalCount={criticalCount}
        openCount={openCount}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 overflow-hidden flex">
        {currentTab === 'queue' && (
          <>
            {/* Left Queue Sidebar */}
            <div className="w-80 md:w-96 shrink-0 h-full">
              <TicketList
                tickets={tickets}
                agents={agents}
                selectedTicketId={selectedTicketId}
                onSelectTicket={(id) => setSelectedTicketId(id)}
                filters={filters}
                setFilters={setFilters}
              />
            </div>

            {/* Center: Ticket Detail Workspace */}
            <div className="flex-1 h-full min-w-0">
              {selectedTicket ? (
                <TicketDetail
                  ticket={selectedTicket}
                  agents={agents}
                  onUpdateStatus={handleUpdateStatus}
                  onUpdatePriority={handleUpdatePriority}
                  onAssignAgent={handleAssignAgent}
                  onSendMessage={handleSendMessage}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                  Select a ticket from the queue to open conversation & AI triage.
                </div>
              )}
            </div>

            {/* Right: AI Copilot & Triage Telemetry */}
            {selectedTicket && (
              <AICopilotPanel
                ticket={selectedTicket}
                agents={agents}
                onTriggerTriage={handleTriggerTriage}
                onAutoAssign={handleAutoAssign}
                isTriaging={isTriaging}
              />
            )}
          </>
        )}

        {currentTab === 'agents' && (
          <AgentRoster
            agents={agents}
            onUpdateAgentStatus={handleUpdateAgentStatus}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsView
            analytics={analytics}
            loading={loadingAnalytics}
          />
        )}
      </main>

      {/* Ingestion & Simulation Modal */}
      <NewTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTicket}
      />
    </div>
  );
};

export default App;

