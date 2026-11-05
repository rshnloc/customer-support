import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Agent(Base):
    __tablename__ = "agents"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    department = Column(String, nullable=False)
    skills = Column(String, default="")  # comma separated list of tags
    tier = Column(Integer, default=1)   # 1, 2, 3
    status = Column(String, default="available")  # available, busy, away, offline
    max_active_tickets = Column(Integer, default=5)
    csat_score = Column(Float, default=4.8)
    avatar_color = Column(String, default="#3B82F6")

    tickets = relationship("Ticket", back_populates="assigned_agent")


class Customer(Base):
    __tablename__ = "customers"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, default="+1-555-0100")
    company = Column(String, default="Example Enterprise")
    tier = Column(String, default="Standard")  # Standard, Pro, Enterprise VIP
    location = Column(String, default="San Francisco, CA (Mock Test Data)")

    tickets = relationship("Ticket", back_populates="customer")


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    customer_id = Column(String, ForeignKey("customers.id"), nullable=False)
    assigned_agent_id = Column(String, ForeignKey("agents.id"), nullable=True)
    channel = Column(String, default="email")  # email, live_chat, phone_call, portal
    status = Column(String, default="open")    # open, in_progress, pending_customer, resolved, closed
    priority = Column(String, default="medium") # critical, high, medium, low
    category = Column(String, default="Technical")
    sub_category = Column(String, default="General")
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    sla_due_at = Column(DateTime, nullable=True)
    sla_breached = Column(Boolean, default=False)
    resolved_at = Column(DateTime, nullable=True)

    # AI Intelligence Fields
    sentiment = Column(String, default="Neutral")  # Positive, Neutral, Frustrated, Angry
    sentiment_score = Column(Float, default=0.0)   # -1.0 to 1.0
    urgency_score = Column(Integer, default=3)     # 1 to 5
    ai_confidence = Column(Float, default=0.90)    # 0.0 to 1.0
    ai_summary = Column(Text, default="")
    ai_key_entities = Column(Text, default="[]")   # JSON string
    ai_suggested_response = Column(Text, default="")
    assignment_rationale = Column(Text, default="")
    auto_assigned = Column(Boolean, default=False)

    customer = relationship("Customer", back_populates="tickets")
    assigned_agent = relationship("Agent", back_populates="tickets")
    messages = relationship("TicketMessage", back_populates="ticket", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="ticket", cascade="all, delete-orphan")


class TicketMessage(Base):
    __tablename__ = "ticket_messages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    ticket_id = Column(String, ForeignKey("tickets.id"), nullable=False)
    sender_type = Column(String, nullable=False) # customer, agent, system, ai_copilot
    sender_name = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    ticket = relationship("Ticket", back_populates="messages")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    ticket_id = Column(String, ForeignKey("tickets.id"), nullable=False)
    action = Column(String, nullable=False)
    details = Column(Text, nullable=False)
    performed_by = Column(String, default="AI System")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    ticket = relationship("Ticket", back_populates="audit_logs")

