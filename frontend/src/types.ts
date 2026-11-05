export interface Agent {
  id: string;
  name: string;
  email: string;
  department: string;
  skills: string;
  tier: number;
  status: 'available' | 'busy' | 'away' | 'offline';
  max_active_tickets: number;
  csat_score: number;
  avatar_color: string;
  active_tickets_count: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  tier: string;
  location: string;
}

export interface TicketMessage {
  id: number;
  ticket_id: string;
  sender_type: 'customer' | 'agent' | 'system' | 'ai_copilot';
  sender_name: string;
  content: string;
  created_at: string;
}

export interface AuditLog {
  id: number;
  ticket_id: string;
  action: string;
  details: string;
  performed_by: string;
  created_at: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  customer_id: string;
  assigned_agent_id: string | null;
  channel: 'email' | 'live_chat' | 'phone_call' | 'portal';
  status: 'open' | 'in_progress' | 'pending_customer' | 'resolved' | 'closed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  sub_category: string;
  created_at: string;
  updated_at: string;
  sla_due_at: string | null;
  sla_breached: boolean;
  resolved_at: string | null;

  sentiment: 'Positive' | 'Neutral' | 'Frustrated' | 'Angry';
  sentiment_score: number;
  urgency_score: number;
  ai_confidence: number;
  ai_summary: string;
  ai_key_entities: string; // JSON string
  ai_suggested_response: string;
  assignment_rationale: string;
  auto_assigned: boolean;

  customer?: Customer;
  assigned_agent?: Agent;
  messages: TicketMessage[];
  audit_logs: AuditLog[];
}

export interface AnalyticsData {
  total_tickets: number;
  open_tickets: number;
  in_progress_tickets: number;
  resolved_tickets: number;
  critical_tickets: number;
  sla_breached_count: number;
  avg_first_response_minutes: number;
  avg_resolution_hours: number;
  sentiment_distribution: Record<string, number>;
  category_distribution: Record<string, number>;
  channel_distribution: Record<string, number>;
  agent_workload: {
    agent_id: string;
    name: string;
    department: string;
    status: string;
    active_tickets: number;
    max_active_tickets: number;
    utilization_pct: number;
    csat_score: number;
  }[];
}

