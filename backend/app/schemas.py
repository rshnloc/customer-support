import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

# Agent Schemas
class AgentBase(BaseModel):
    id: str
    name: str
    email: str
    department: str
    skills: str
    tier: int
    status: str
    max_active_tickets: int
    csat_score: float
    avatar_color: str

class AgentResponse(AgentBase):
    active_tickets_count: int = 0

    class Config:
        from_attributes = True


# Customer Schemas
class CustomerBase(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    company: str
    tier: str
    location: str

class CustomerResponse(CustomerBase):
    class Config:
        from_attributes = True


# Ticket Message Schemas
class TicketMessageCreate(BaseModel):
    sender_type: str
    sender_name: str
    content: str

class TicketMessageResponse(BaseModel):
    id: int
    ticket_id: str
    sender_type: str
    sender_name: str
    content: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True


# Audit Log Schemas
class AuditLogResponse(BaseModel):
    id: int
    ticket_id: str
    action: str
    details: str
    performed_by: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True


# Ticket Schemas
class TicketCreate(BaseModel):
    title: str
    description: str
    customer_id: Optional[str] = None
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    channel: str = "email"
    priority: Optional[str] = None
    category: Optional[str] = None

class TicketUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    assigned_agent_id: Optional[str] = None

class TicketAssignRequest(BaseModel):
    agent_id: Optional[str] = None
    auto_assign: bool = False

class AITriageResult(BaseModel):
    category: str
    sub_category: str
    priority: str
    sentiment: str
    sentiment_score: float
    urgency_score: int
    ai_confidence: float
    ai_summary: str
    ai_key_entities: List[str]
    ai_suggested_response: str
    suggested_agent_id: Optional[str] = None
    assignment_rationale: str

class TicketResponse(BaseModel):
    id: str
    title: str
    description: str
    customer_id: str
    assigned_agent_id: Optional[str]
    channel: str
    status: str
    priority: str
    category: str
    sub_category: str
    created_at: datetime.datetime
    updated_at: datetime.datetime
    sla_due_at: Optional[datetime.datetime]
    sla_breached: bool
    resolved_at: Optional[datetime.datetime]

    sentiment: str
    sentiment_score: float
    urgency_score: int
    ai_confidence: float
    ai_summary: str
    ai_key_entities: str
    ai_suggested_response: str
    assignment_rationale: str
    auto_assigned: bool

    customer: Optional[CustomerResponse] = None
    assigned_agent: Optional[AgentResponse] = None
    messages: List[TicketMessageResponse] = []
    audit_logs: List[AuditLogResponse] = []

    class Config:
        from_attributes = True


# Analytics Schemas
class AnalyticsResponse(BaseModel):
    total_tickets: int
    open_tickets: int
    in_progress_tickets: int
    resolved_tickets: int
    critical_tickets: int
    sla_breached_count: int
    avg_first_response_minutes: float
    avg_resolution_hours: float
    sentiment_distribution: dict
    category_distribution: dict
    channel_distribution: dict
    agent_workload: List[dict]

