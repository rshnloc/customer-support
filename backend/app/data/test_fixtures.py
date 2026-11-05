"""
Synthetic demo fixtures for AI Customer Support & Contact Center.
ALL data below is strictly artificial test data:
- Fictional names
- example.com / example.org test domains
- +1-555-01XX reserved fictional North American phone numbers
- Fictional company names and addresses
Zero real PII, credentials, or internal proprietary data.
"""

TEST_AGENTS = [
    {
        "id": "AGT-101",
        "name": "Agent Alex Rivera",
        "email": "alex.rivera@example.com",
        "department": "Technical Support",
        "skills": "api,webhooks,database,python,rest,500,latency",
        "tier": 3,
        "status": "available",
        "max_active_tickets": 5,
        "csat_score": 4.9,
        "avatar_color": "#2563EB"  # Blue
    },
    {
        "id": "AGT-102",
        "name": "Agent Casey Parker",
        "email": "casey.parker@example.com",
        "department": "Billing & Subscriptions",
        "skills": "billing,refund,invoice,charge,stripe,pricing,subscription",
        "tier": 2,
        "status": "available",
        "max_active_tickets": 5,
        "csat_score": 4.8,
        "avatar_color": "#059669"  # Emerald
    },
    {
        "id": "AGT-103",
        "name": "Agent Jamie Chen",
        "email": "jamie.chen@example.com",
        "department": "Account & Security",
        "skills": "password,2fa,mfa,sso,saml,security,access,unauthorized",
        "tier": 3,
        "status": "busy",
        "max_active_tickets": 4,
        "csat_score": 4.95,
        "avatar_color": "#7C3AED"  # Purple
    },
    {
        "id": "AGT-104",
        "name": "Agent Morgan Taylor",
        "email": "morgan.taylor@example.com",
        "department": "Technical Support",
        "skills": "cloud,deploy,kubernetes,docker,server,linux,timeout",
        "tier": 2,
        "status": "available",
        "max_active_tickets": 5,
        "csat_score": 4.7,
        "avatar_color": "#D97706"  # Amber
    },
    {
        "id": "AGT-105",
        "name": "Agent Taylor Vance",
        "email": "taylor.vance@example.com",
        "department": "Enterprise Success",
        "skills": "enterprise,vip,sla,escalation,general,feature",
        "tier": 1,
        "status": "available",
        "max_active_tickets": 6,
        "csat_score": 4.85,
        "avatar_color": "#E11D48"  # Rose
    }
]

TEST_CUSTOMERS = [
    {
        "id": "CUST-501",
        "name": "Customer Jordan Lee",
        "email": "jordan.lee@example.com",
        "phone": "+1-555-0101",
        "company": "Acme Cloud Logistics (Test Account)",
        "tier": "Enterprise VIP",
        "location": "100 Testway Blvd, Metropolis, CA 94000"
    },
    {
        "id": "CUST-502",
        "name": "Customer Dana Brooks",
        "email": "dana.brooks@example.org",
        "phone": "+1-555-0102",
        "company": "Vertex Test Labs",
        "tier": "Pro",
        "location": "200 Mock Plaza, Austin, TX 78701"
    },
    {
        "id": "CUST-503",
        "name": "Customer Sam Rivera",
        "email": "sam.rivera@example.com",
        "phone": "+1-555-0103",
        "company": "Horizon Fictional Systems",
        "tier": "Standard",
        "location": "300 Example Ave, Seattle, WA 98101"
    },
    {
        "id": "CUST-504",
        "name": "Customer Riley Bennett",
        "email": "riley.bennett@example.org",
        "phone": "+1-555-0104",
        "company": "Omni Global Sandbox",
        "tier": "Enterprise VIP",
        "location": "400 Sample Road, New York, NY 10001"
    }
]

TEST_TICKETS = [
    {
        "id": "TCK-9001",
        "title": "URGENT: Production REST API returning 504 Gateway Timeout on checkout endpoints",
        "description": "Our e-commerce checkout integration has been failing continuously for the past 45 minutes with HTTP error 504. Over 1,200 transactions are currently stalled. We need an immediate engineering investigation into our dedicated cluster gateway.",
        "customer_id": "CUST-501",
        "channel": "phone_call",
        "status": "open",
        "priority": "critical",
        "category": "Technical",
        "sub_category": "API & Webhook Integrations",
        "sentiment": "Frustrated",
        "sentiment_score": -0.80,
        "urgency_score": 5,
        "ai_confidence": 0.96,
        "ai_summary": "AI Analysis: Critical Sev-1 production incident on checkout API gateway (504 timeout). Client is Enterprise VIP.",
        "ai_key_entities": '["Code: 504", "REST API", "Ref: CUST-501", "Gateway Timeout"]',
        "ai_suggested_response": "Hello Jordan,\n\nThank you for alerting us, and we sincerely apologize for the disruption to your production checkout operations. As an Enterprise VIP customer, your incident has been escalated immediately to our on-call Tier-3 Infrastructure specialists. We are currently verifying traffic routing and upstream container health on your cluster.",
        "auto_assigned": True,
        "assigned_agent_id": "AGT-101",
        "assignment_rationale": "AI Match Confidence 98%: Auto-assigned to Agent Alex Rivera based on Tier 3 Technical Support role, matching 'api' & '504' skills, and available workload capacity (0/5).",
        "sla_hours": 1
    },
    {
        "id": "TCK-9002",
        "title": "Duplicate charge on monthly corporate invoice INV-8821",
        "description": "We received our monthly billing receipt and noticed that line item 'Advanced Analytics Seats' was billed twice under invoice INV-8821. Please review our subscription account and refund the extra $450 charge to our corporate card.",
        "customer_id": "CUST-502",
        "channel": "email",
        "status": "in_progress",
        "priority": "medium",
        "category": "Billing",
        "sub_category": "Invoice / VAT Inquiries",
        "sentiment": "Neutral",
        "sentiment_score": -0.15,
        "urgency_score": 3,
        "ai_confidence": 0.92,
        "ai_summary": "AI Analysis: Customer inquiry regarding invoice INV-8821 overcharge line item. Requesting $450 credit.",
        "ai_key_entities": '["Ref: INV-8821", "Subscription", "Refund Request"]',
        "ai_suggested_response": "Hello Dana,\n\nThank you for bringing this to our attention. I have pulled up invoice INV-8821 in our billing console. I am cross-checking the seat allocation logs for the past billing cycle and will initiate a credit memo if duplicate billing occurred.",
        "auto_assigned": True,
        "assigned_agent_id": "AGT-102",
        "assignment_rationale": "AI Match Confidence 95%: Auto-assigned to Agent Casey Parker based on Billing & Subscriptions department specialty and high CSAT (4.8).",
        "sla_hours": 8
    },
    {
        "id": "TCK-9003",
        "title": "Admin locked out following mandatory SAML SSO reconfiguration",
        "description": "After rotating our Okta SAML certificate this morning, our three security administrators cannot access the administrative dashboard. Error displayed: 'SAML Assertion invalid signature - code 403'. We cannot manage employee permissions until this is resolved.",
        "customer_id": "CUST-504",
        "channel": "live_chat",
        "status": "open",
        "priority": "high",
        "category": "Account & Security",
        "sub_category": "Enterprise SSO / SAML",
        "sentiment": "Frustrated",
        "sentiment_score": -0.60,
        "urgency_score": 4,
        "ai_confidence": 0.94,
        "ai_summary": "AI Analysis: Security lockout on SAML SSO certificate rotation (Error 403). Enterprise client admins blocked.",
        "ai_key_entities": '["Code: 403", "SSO", "SAML", "Okta"]',
        "ai_suggested_response": "Hello Riley,\n\nWe understand that admin access is critical. Regarding the SAML assertion signature mismatch (403), we can temporarily provision a secure break-glass bypass token for your verified primary security officer while we update your IdP metadata certificate.",
        "auto_assigned": True,
        "assigned_agent_id": "AGT-103",
        "assignment_rationale": "AI Match Confidence 97%: Auto-assigned to Agent Jamie Chen based on Tier 3 Security credential skills (SAML, SSO, MFA).",
        "sla_hours": 3
    },
    {
        "id": "TCK-9004",
        "title": "Feature request: Automated daily export of conversation metrics to CSV / Webhook",
        "description": "Our reporting team loves the real-time analytics view. Would it be possible to add a scheduled cron or webhook trigger that sends daily CSAT and resolution metrics directly to our internal data warehouse?",
        "customer_id": "CUST-503",
        "channel": "portal",
        "status": "open",
        "priority": "low",
        "category": "Feature Request",
        "sub_category": "Product Roadmap Suggestion",
        "sentiment": "Positive",
        "sentiment_score": 0.85,
        "urgency_score": 1,
        "ai_confidence": 0.89,
        "ai_summary": "AI Analysis: Customer feedback and enhancement proposal for daily automated CSV / webhook reporting exports.",
        "ai_key_entities": '["Feature Request", "Webhooks", "CSV Export"]',
        "ai_suggested_response": "Hello Sam,\n\nThank you for the fantastic feedback! We are thrilled to hear your team is finding value in the analytics dashboard. Automated reporting exports and webhooks are currently planned in our upcoming quarter roadmap. I have linked your request to feature ticket FEAT-142.",
        "auto_assigned": True,
        "assigned_agent_id": "AGT-105",
        "assignment_rationale": "AI Match Confidence 88%: Auto-assigned to Agent Taylor Vance (Enterprise Success) for product feedback tracking.",
        "sla_hours": 24
    }
]

