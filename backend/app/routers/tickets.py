import datetime
import json
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app import models, schemas
from app.ai_service import ai_service
from app.config import settings

router = APIRouter(prefix="/tickets", tags=["Tickets"])

@router.get("", response_model=List[schemas.TicketResponse])
def get_tickets(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
    sentiment: Optional[str] = None,
    agent_id: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Ticket)
    
    if status and status != "all":
        query = query.filter(models.Ticket.status == status)
    if priority and priority != "all":
        query = query.filter(models.Ticket.priority == priority)
    if category and category != "all":
        query = query.filter(models.Ticket.category == category)
    if sentiment and sentiment != "all":
        query = query.filter(models.Ticket.sentiment == sentiment)
    if agent_id and agent_id != "all":
        if agent_id == "unassigned":
            query = query.filter(models.Ticket.assigned_agent_id.is_(None))
        else:
            query = query.filter(models.Ticket.assigned_agent_id == agent_id)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                models.Ticket.title.ilike(search_filter),
                models.Ticket.description.ilike(search_filter),
                models.Ticket.id.ilike(search_filter)
            )
        )
    
    # Check SLA breach dynamically
    now = datetime.datetime.utcnow()
    tickets = query.order_by(models.Ticket.created_at.desc()).all()
    for t in tickets:
        if t.sla_due_at and t.status not in ["resolved", "closed"] and now > t.sla_due_at:
            t.sla_breached = True
    db.commit()

    return tickets


@router.post("", response_model=schemas.TicketResponse)
def create_ticket(ticket_in: schemas.TicketCreate, db: Session = Depends(get_db)):
    # 1. Resolve or create customer
    customer_id = ticket_in.customer_id
    customer = None
    if customer_id:
        customer = db.query(models.Customer).filter(models.Customer.id == customer_id).first()

    if not customer:
        cust_id = f"CUST-{uuid.uuid4().hex[:4].upper()}"
        customer = models.Customer(
            id=cust_id,
            name=ticket_in.customer_name or "Test Customer",
            email=ticket_in.customer_email or "test.customer@example.com",
            tier="Standard",
            company="Example Client Org",
            phone="+1-555-0199",
            location="Testville, CA (Synthetic Data)"
        )
        db.add(customer)
        db.commit()
        db.refresh(customer)
        customer_id = customer.id

    # 2. Run AI Natural Language Triage
    ai_result = ai_service.analyze_ticket(
        title=ticket_in.title,
        description=ticket_in.description,
        customer_tier=customer.tier
    )

    ticket_id = f"TCK-{uuid.uuid4().hex[:4].upper()}"
    priority = ticket_in.priority or ai_result["priority"]
    category = ticket_in.category or ai_result["category"]

    # SLA calculation based on priority
    now = datetime.datetime.utcnow()
    sla_minutes = {
        "critical": settings.SLA_MINUTES_CRITICAL,
        "high": settings.SLA_MINUTES_HIGH,
        "medium": settings.SLA_MINUTES_MEDIUM,
        "low": settings.SLA_MINUTES_LOW
    }.get(priority, settings.SLA_MINUTES_MEDIUM)
    sla_due_at = now + datetime.timedelta(minutes=sla_minutes)

    ticket = models.Ticket(
        id=ticket_id,
        title=ticket_in.title,
        description=ticket_in.description,
        customer_id=customer_id,
        channel=ticket_in.channel or "email",
        status="open",
        priority=priority,
        category=category,
        sub_category=ai_result["sub_category"],
        created_at=now,
        updated_at=now,
        sla_due_at=sla_due_at,
        sla_breached=False,
        sentiment=ai_result["sentiment"],
        sentiment_score=ai_result["sentiment_score"],
        urgency_score=ai_result["urgency_score"],
        ai_confidence=ai_result["ai_confidence"],
        ai_summary=ai_result["ai_summary"],
        ai_key_entities=json.dumps(ai_result["ai_key_entities"]),
        ai_suggested_response=ai_result["ai_suggested_response"]
    )
    db.add(ticket)
    db.commit()

    # 3. Automatic AI Smart Assignment
    assignment = ai_service.find_best_agent(ticket, db)
    if assignment:
        ticket.assigned_agent_id = assignment["agent"].id
        ticket.assignment_rationale = assignment["rationale"]
        ticket.auto_assigned = True
        
        audit_assign = models.AuditLog(
            ticket_id=ticket.id,
            action="ai_smart_assignment",
            details=assignment["rationale"],
            performed_by="AI Routing Engine"
        )
        db.add(audit_assign)

    audit_create = models.AuditLog(
        ticket_id=ticket.id,
        action="ticket_created",
        details=f"Ticket created via {ticket.channel}. AI categorized as '{ticket.category}' with {ticket.sentiment} sentiment.",
        performed_by="System"
    )
    db.add(audit_create)

    # Initial message
    init_msg = models.TicketMessage(
        ticket_id=ticket.id,
        sender_type="customer",
        sender_name=customer.name,
        content=ticket.description,
        created_at=now
    )
    db.add(init_msg)

    db.commit()
    db.refresh(ticket)
    return ticket


@router.get("/{ticket_id}", response_model=schemas.TicketResponse)
def get_ticket_detail(ticket_id: str, db: Session = Depends(get_db)):
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket


@router.patch("/{ticket_id}", response_model=schemas.TicketResponse)
def update_ticket(ticket_id: str, update_in: schemas.TicketUpdate, db: Session = Depends(get_db)):
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    changes = []
    if update_in.status is not None and update_in.status != ticket.status:
        changes.append(f"Status changed from {ticket.status} to {update_in.status}")
        ticket.status = update_in.status
        if update_in.status in ["resolved", "closed"]:
            ticket.resolved_at = datetime.datetime.utcnow()

    if update_in.priority is not None and update_in.priority != ticket.priority:
        changes.append(f"Priority changed from {ticket.priority} to {update_in.priority}")
        ticket.priority = update_in.priority

    if update_in.category is not None and update_in.category != ticket.category:
        changes.append(f"Category changed from {ticket.category} to {update_in.category}")
        ticket.category = update_in.category

    if update_in.assigned_agent_id is not None and update_in.assigned_agent_id != ticket.assigned_agent_id:
        agent = db.query(models.Agent).filter(models.Agent.id == update_in.assigned_agent_id).first()
        agent_name = agent.name if agent else update_in.assigned_agent_id
        changes.append(f"Manually assigned to {agent_name}")
        ticket.assigned_agent_id = update_in.assigned_agent_id
        ticket.auto_assigned = False
        ticket.assignment_rationale = f"Manually assigned to {agent_name} by Contact Center Supervisor."

    ticket.updated_at = datetime.datetime.utcnow()

    if changes:
        audit = models.AuditLog(
            ticket_id=ticket.id,
            action="ticket_updated",
            details="; ".join(changes),
            performed_by="Support Agent"
        )
        db.add(audit)

    db.commit()
    db.refresh(ticket)
    return ticket


@router.post("/{ticket_id}/ai-triage", response_model=schemas.TicketResponse)
def trigger_ai_triage(ticket_id: str, db: Session = Depends(get_db)):
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    customer_tier = ticket.customer.tier if ticket.customer else "Standard"
    ai_result = ai_service.analyze_ticket(ticket.title, ticket.description, customer_tier)

    ticket.category = ai_result["category"]
    ticket.sub_category = ai_result["sub_category"]
    ticket.priority = ai_result["priority"]
    ticket.sentiment = ai_result["sentiment"]
    ticket.sentiment_score = ai_result["sentiment_score"]
    ticket.urgency_score = ai_result["urgency_score"]
    ticket.ai_confidence = ai_result["ai_confidence"]
    ticket.ai_summary = ai_result["ai_summary"]
    ticket.ai_key_entities = json.dumps(ai_result["ai_key_entities"])
    ticket.ai_suggested_response = ai_result["ai_suggested_response"]
    ticket.updated_at = datetime.datetime.utcnow()

    audit = models.AuditLog(
        ticket_id=ticket.id,
        action="ai_re_triaged",
        details=f"AI re-analyzed ticket. Confidence: {int(ticket.ai_confidence * 100)}%. Detected {ticket.sentiment} sentiment.",
        performed_by="AI Copilot"
    )
    db.add(audit)

    db.commit()
    db.refresh(ticket)
    return ticket


@router.post("/{ticket_id}/assign", response_model=schemas.TicketResponse)
def assign_ticket(ticket_id: str, req: schemas.TicketAssignRequest, db: Session = Depends(get_db)):
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if req.auto_assign:
        assignment = ai_service.find_best_agent(ticket, db)
        if not assignment:
            raise HTTPException(status_code=400, detail="No suitable available agent found for auto-assignment.")
        
        ticket.assigned_agent_id = assignment["agent"].id
        ticket.assignment_rationale = assignment["rationale"]
        ticket.auto_assigned = True
        details = assignment["rationale"]
        performed = "AI Smart Routing"
    else:
        if not req.agent_id:
            raise HTTPException(status_code=400, detail="agent_id required when auto_assign is false")
        agent = db.query(models.Agent).filter(models.Agent.id == req.agent_id).first()
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        ticket.assigned_agent_id = agent.id
        ticket.assignment_rationale = f"Manually assigned to {agent.name} by Supervisor."
        ticket.auto_assigned = False
        details = f"Manually assigned to {agent.name} ({agent.department})"
        performed = "Supervisor"

    ticket.updated_at = datetime.datetime.utcnow()
    audit = models.AuditLog(
        ticket_id=ticket.id,
        action="agent_assigned",
        details=details,
        performed_by=performed
    )
    db.add(audit)
    db.commit()
    db.refresh(ticket)
    return ticket


@router.post("/{ticket_id}/messages", response_model=schemas.TicketMessageResponse)
def add_ticket_message(
    ticket_id: str,
    msg_in: schemas.TicketMessageCreate,
    db: Session = Depends(get_db)
):
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    msg = models.TicketMessage(
        ticket_id=ticket.id,
        sender_type=msg_in.sender_type,
        sender_name=msg_in.sender_name,
        content=msg_in.content,
        created_at=datetime.datetime.utcnow()
    )
    db.add(msg)

    # If agent replied, move from open to in_progress
    if msg_in.sender_type in ["agent", "ai_copilot"] and ticket.status == "open":
        ticket.status = "in_progress"

    ticket.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(msg)
    return msg

