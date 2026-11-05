from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import datetime

from app.database import get_db, Base, engine
from app import models
from app.data.test_fixtures import TEST_AGENTS, TEST_CUSTOMERS, TEST_TICKETS

router = APIRouter(prefix="/seed", tags=["Seed Data"])

def seed_database_if_empty(db: Session):
    """Seed synthetic test fixtures if the database is empty."""
    if db.query(models.Agent).count() > 0:
        return {"status": "already_seeded", "message": "Database already contains data."}

    # Seed Agents
    for ag in TEST_AGENTS:
        agent = models.Agent(**ag)
        db.add(agent)
    db.commit()

    # Seed Customers
    for cu in TEST_CUSTOMERS:
        cust = models.Customer(**cu)
        db.add(cust)
    db.commit()

    # Seed Tickets
    now = datetime.datetime.utcnow()
    for tk in TEST_TICKETS:
        sla_hours = tk.pop("sla_hours", 4)
        sla_due = now + datetime.timedelta(hours=sla_hours)
        ticket = models.Ticket(
            **tk,
            created_at=now - datetime.timedelta(minutes=30),
            updated_at=now - datetime.timedelta(minutes=5),
            sla_due_at=sla_due,
            sla_breached=False
        )
        db.add(ticket)
        db.commit()

        # Add initial customer message
        msg = models.TicketMessage(
            ticket_id=ticket.id,
            sender_type="customer",
            sender_name="Customer",
            content=ticket.description,
            created_at=ticket.created_at
        )
        db.add(msg)

        # Add audit logs
        audit1 = models.AuditLog(
            ticket_id=ticket.id,
            action="ticket_created",
            details=f"Ticket ingested via {ticket.channel}. AI categorized as {ticket.category}.",
            performed_by="System",
            created_at=ticket.created_at
        )
        db.add(audit1)

        if ticket.assigned_agent_id:
            audit2 = models.AuditLog(
                ticket_id=ticket.id,
                action="ai_smart_assignment",
                details=ticket.assignment_rationale,
                performed_by="AI Routing Engine",
                created_at=ticket.created_at + datetime.timedelta(seconds=2)
            )
            db.add(audit2)

        db.commit()

    return {"status": "success", "message": "Synthetic test data seeded successfully."}


@router.post("")
def reset_and_seed(db: Session = Depends(get_db)):
    """Wipes and re-seeds with pure synthetic test fixtures."""
    # Delete existing
    db.query(models.AuditLog).delete()
    db.query(models.TicketMessage).delete()
    db.query(models.Ticket).delete()
    db.query(models.Customer).delete()
    db.query(models.Agent).delete()
    db.commit()

    return seed_database_if_empty(db)

