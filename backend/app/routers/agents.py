from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/agents", tags=["Agents"])

class AgentStatusUpdate(BaseModel):
    status: str

@router.get("", response_model=List[schemas.AgentResponse])
def get_agents(db: Session = Depends(get_db)):
    agents = db.query(models.Agent).all()
    results = []
    for agent in agents:
        active_count = db.query(models.Ticket).filter(
            models.Ticket.assigned_agent_id == agent.id,
            models.Ticket.status.in_(["open", "in_progress"])
        ).count()
        agent_data = schemas.AgentResponse(
            id=agent.id,
            name=agent.name,
            email=agent.email,
            department=agent.department,
            skills=agent.skills or "",
            tier=agent.tier,
            status=agent.status,
            max_active_tickets=agent.max_active_tickets,
            csat_score=agent.csat_score,
            avatar_color=agent.avatar_color,
            active_tickets_count=active_count
        )
        results.append(agent_data)
    return results


@router.patch("/{agent_id}/status", response_model=schemas.AgentResponse)
def update_agent_status(agent_id: str, update_in: AgentStatusUpdate, db: Session = Depends(get_db)):
    agent = db.query(models.Agent).filter(models.Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    agent.status = update_in.status
    db.commit()
    db.refresh(agent)

    active_count = db.query(models.Ticket).filter(
        models.Ticket.assigned_agent_id == agent.id,
        models.Ticket.status.in_(["open", "in_progress"])
    ).count()

    return schemas.AgentResponse(
        id=agent.id,
        name=agent.name,
        email=agent.email,
        department=agent.department,
        skills=agent.skills or "",
        tier=agent.tier,
        status=agent.status,
        max_active_tickets=agent.max_active_tickets,
        csat_score=agent.csat_score,
        avatar_color=agent.avatar_color,
        active_tickets_count=active_count
    )

