"""
End-to-End Verification Test for AI Customer Support & Contact Center.
Validates:
1. AI Multi-Factor Triage & Sentiment Analysis
2. Smart Agent Matching Decision Matrix
3. Workload Capacity Balancing
4. Ticket Lifecycle & Conversation Messages
5. Supervisor Analytics Generation
"""
import sys
from app.database import SessionLocal, Base, engine
from app import models, schemas
from app.routers import seed
from app.ai_service import ai_service
from app.routers.tickets import create_ticket, assign_ticket, add_ticket_message, update_ticket
from app.routers.analytics import get_analytics

def run_tests():
    print(">>> 1. Initializing DB and Synthetic Test Data...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed.reset_and_seed(db)
    
    agents = db.query(models.Agent).all()
    print(f"  [PASS] Seeded {len(agents)} synthetic agents.")
    assert len(agents) >= 5, "Expected at least 5 agents"

    print(">>> 2. Testing AI Triage on Frustrated Sev-1 Incident...")
    ticket_payload = schemas.TicketCreate(
        title="CRITICAL: Database connection timeout in production cluster",
        description="Our main PostgreSQL database is failing all queries with timeout 504. All customer logins are down and we are losing business!",
        customer_name="Customer Jordan Lee",
        customer_email="jordan.lee@example.com",
        channel="phone_call"
    )
    new_ticket = create_ticket(ticket_payload, db)
    print(f"  Ticket Created: ID={new_ticket.id}")
    print(f"  AI Category: {new_ticket.category} / {new_ticket.sub_category}")
    print(f"  AI Priority: {new_ticket.priority}")
    print(f"  AI Sentiment: {new_ticket.sentiment} (Score: {new_ticket.sentiment_score})")
    print(f"  AI Urgency: {new_ticket.urgency_score}/5")
    print(f"  Auto-assigned: {new_ticket.auto_assigned} to Agent {new_ticket.assigned_agent_id}")
    print(f"  AI Rationale: {new_ticket.assignment_rationale}")

    assert new_ticket.category == "Technical", f"Expected Technical, got {new_ticket.category}"
    assert new_ticket.priority == "critical", f"Expected critical, got {new_ticket.priority}"
    assert new_ticket.sentiment in ["Frustrated", "Angry"], f"Expected negative sentiment, got {new_ticket.sentiment}"
    assert new_ticket.assigned_agent_id is not None, "Expected auto-assigned agent"

    print(">>> 3. Testing Workload Balancing Adaptation...")
    # Mark the assigned agent as busy/max capacity
    first_agent = db.query(models.Agent).filter(models.Agent.id == new_ticket.assigned_agent_id).first()
    first_agent.status = "busy"
    db.commit()

    # Create another technical ticket
    ticket_payload_2 = schemas.TicketCreate(
        title="Bug in REST API Webhook response code",
        description="We noticed intermittent 500 error on the webhook handler endpoint.",
        customer_name="Customer Dana Brooks",
        customer_email="dana.brooks@example.org",
        channel="email"
    )
    second_ticket = create_ticket(ticket_payload_2, db)
    print(f"  Second Ticket Created: ID={second_ticket.id}")
    print(f"  Assigned to: {second_ticket.assigned_agent_id} (Expected different agent due to load balance)")
    print(f"  Rationale: {second_ticket.assignment_rationale}")
    assert second_ticket.assigned_agent_id != first_agent.id, "Expected load balancer to assign alternative available agent"

    print(">>> 4. Testing Conversation Messages & Reply...")
    msg_in = schemas.TicketMessageCreate(
        sender_type="agent",
        sender_name="Agent Alex Rivera",
        content="We have escalated this to Tier 3 Infrastructure and identified the failed connection pool. Restoring now."
    )
    msg = add_ticket_message(new_ticket.id, msg_in, db)
    print(f"  Message added: {msg.content[:50]}... from {msg.sender_name}")

    # Resolve ticket
    update_in = schemas.TicketUpdate(status="resolved")
    resolved_ticket = update_ticket(new_ticket.id, update_in, db)
    print(f"  Ticket Status: {resolved_ticket.status} (Resolved at: {resolved_ticket.resolved_at})")
    assert resolved_ticket.status == "resolved"

    print(">>> 5. Testing Supervisor Analytics Generation...")
    analytics_data = get_analytics(db)
    print(f"  Total Tickets: {analytics_data.total_tickets}")
    print(f"  Open Tickets: {analytics_data.open_tickets}")
    print(f"  Resolved Tickets: {analytics_data.resolved_tickets}")
    print(f"  Critical Tickets: {analytics_data.critical_tickets}")
    print(f"  Sentiment Distribution: {analytics_data.sentiment_distribution}")
    print(f"  Category Distribution: {analytics_data.category_distribution}")
    assert analytics_data.total_tickets >= 6, "Expected at least 6 total tickets"

    db.close()
    print("\n✅ ALL END-TO-END VERIFICATION CHECKS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
