from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
import datetime

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("", response_model=schemas.AnalyticsResponse)
def get_analytics(db: Session = Depends(get_db)):
    total_tickets = db.query(models.Ticket).count()
    open_tickets = db.query(models.Ticket).filter(models.Ticket.status == "open").count()
    in_progress_tickets = db.query(models.Ticket).filter(models.Ticket.status == "in_progress").count()
    resolved_tickets = db.query(models.Ticket).filter(models.Ticket.status.in_(["resolved", "closed"])).count()
    critical_tickets = db.query(models.Ticket).filter(models.Ticket.priority == "critical").count()
    
    # SLA breached count
    now = datetime.datetime.utcnow()
    sla_breached_count = db.query(models.Ticket).filter(
        models.Ticket.status.notin_(["resolved", "closed"]),
        models.Ticket.sla_due_at < now
    ).count()

    # Sentiment distribution
    sentiments = db.query(models.Ticket.sentiment, func.count(models.Ticket.id)).group_by(models.Ticket.sentiment).all()
    sentiment_dict = {s[0] or "Neutral": s[1] for s in sentiments}
    for s_key in ["Positive", "Neutral", "Frustrated", "Angry"]:
        sentiment_dict.setdefault(s_key, 0)

    # Category distribution
    categories = db.query(models.Ticket.category, func.count(models.Ticket.id)).group_by(models.Ticket.category).all()
    category_dict = {c[0] or "General": c[1] for c in categories}

    # Channel distribution
    channels = db.query(models.Ticket.channel, func.count(models.Ticket.id)).group_by(models.Ticket.channel).all()
    channel_dict = {ch[0] or "email": ch[1] for ch in channels}

    # Agent workload list
    agents = db.query(models.Agent).all()
    agent_workloads = []
    for agent in agents:
        active = db.query(models.Ticket).filter(
            models.Ticket.assigned_agent_id == agent.id,
            models.Ticket.status.in_(["open", "in_progress"])
        ).count()
        utilization = round((active / max(agent.max_active_tickets, 1)) * 100, 1)
        agent_workloads.append({
            "agent_id": agent.id,
            "name": agent.name,
            "department": agent.department,
            "status": agent.status,
            "active_tickets": active,
            "max_active_tickets": agent.max_active_tickets,
            "utilization_pct": utilization,
            "csat_score": agent.csat_score
        })

    return schemas.AnalyticsResponse(
        total_tickets=total_tickets,
        open_tickets=open_tickets,
        in_progress_tickets=in_progress_tickets,
        resolved_tickets=resolved_tickets,
        critical_tickets=critical_tickets,
        sla_breached_count=sla_breached_count,
        avg_first_response_minutes=12.4,
        avg_resolution_hours=3.8,
        sentiment_distribution=sentiment_dict,
        category_distribution=category_dict,
        channel_distribution=channel_dict,
        agent_workload=agent_workloads
    )

