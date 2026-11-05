import { Ticket, Agent, AnalyticsData, TicketMessage } from './types';

const API_BASE = '/api';

export async function fetchTickets(params?: {
  status?: string;
  priority?: string;
  category?: string;
  sentiment?: string;
  agent_id?: string;
  search?: string;
}): Promise<Ticket[]> {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (val && val !== 'all') {
        query.append(key, val);
      }
    });
  }
  const res = await fetch(`${API_BASE}/tickets?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch tickets');
  return res.json();
}

export async function fetchTicketById(id: string): Promise<Ticket> {
  const res = await fetch(`${API_BASE}/tickets/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch ticket ${id}`);
  return res.json();
}

export async function createTicket(data: {
  title: string;
  description: string;
  customer_name?: string;
  customer_email?: string;
  channel: string;
  priority?: string;
  category?: string;
}): Promise<Ticket> {
  const res = await fetch(`${API_BASE}/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create ticket');
  return res.json();
}

export async function updateTicket(
  id: string,
  data: {
    status?: string;
    priority?: string;
    category?: string;
    assigned_agent_id?: string;
  }
): Promise<Ticket> {
  const res = await fetch(`${API_BASE}/tickets/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(`Failed to update ticket ${id}`);
  return res.json();
}

export async function triggerAITriage(id: string): Promise<Ticket> {
  const res = await fetch(`${API_BASE}/tickets/${id}/ai-triage`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to trigger AI triage');
  return res.json();
}

export async function assignTicket(
  id: string,
  data: { agent_id?: string; auto_assign: boolean }
): Promise<Ticket> {
  const res = await fetch(`${API_BASE}/tickets/${id}/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to assign ticket');
  return res.json();
}

export async function addTicketMessage(
  ticketId: string,
  message: { sender_type: string; sender_name: string; content: string }
): Promise<TicketMessage> {
  const res = await fetch(`${API_BASE}/tickets/${ticketId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message)
  });
  if (!res.ok) throw new Error('Failed to post message');
  return res.json();
}

export async function fetchAgents(): Promise<Agent[]> {
  const res = await fetch(`${API_BASE}/agents`);
  if (!res.ok) throw new Error('Failed to fetch agents');
  return res.json();
}

export async function updateAgentStatus(agentId: string, status: string): Promise<Agent> {
  const res = await fetch(`${API_BASE}/agents/${agentId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update agent status');
  return res.json();
}

export async function fetchAnalytics(): Promise<AnalyticsData> {
  const res = await fetch(`${API_BASE}/analytics`);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

export async function resetAndSeedData(): Promise<{ status: string; message: string }> {
  const res = await fetch(`${API_BASE}/seed`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to reset and seed data');
  return res.json();
}

