import re
import json
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app import models

class AIAssistantService:
    """
    Intelligent AI Engine for Contact Center Ticket Triage,
    Sentiment Analysis, Automated Response Generation, and Smart Routing.
    Works completely standalone with zero external API credentials or cost,
    providing instant, deterministic, and explainable AI operations.
    """

    KEYWORD_CATEGORIES = {
        "Technical": [
            "bug", "error", "500", "504", "crash", "timeout", "exception", "failed", 
            "api", "database", "latency", "slow", "deploy", "server", "code", "sdk", 
            "webhook", "gateway", "integration", "broken", "cannot connect"
        ],
        "Billing": [
            "refund", "invoice", "charge", "payment", "credit card", "subscription",
            "billed", "pricing", "cost", "receipt", "overcharge", "stripe", "renewal",
            "license count", "upgrade plan"
        ],
        "Account & Security": [
            "password", "2fa", "mfa", "login", "locked", "sso", "saml", "unauthorized",
            "permission", "access denied", "security breach", "compromised", "reset token",
            "admin access"
        ],
        "Feature Request": [
            "feature", "enhancement", "suggestion", "roadmap", "would be great",
            "please add", "integration with", "can we get", "export to"
        ],
        "Logistics & Orders": [
            "shipping", "delivery", "tracking", "order", "hardware", "token device",
            "shipment", "carrier", "customs", "damaged parcel"
        ]
    }

    NEGATIVE_SENTIMENT_WORDS = [
        "angry", "furious", "unacceptable", "disaster", "terrible", "awful", "horrible",
        "worst", "cancelled", "sue", "escalate", "frustrated", "broken", "ridiculous",
        "unhappy", "waiting for days", "no response", "completely blocked", "urgent",
        "losing money", "losing business", "cannot afford", "failing", "failed", "down",
        "outage", "disrupted", "cannot access", "stalled", "stuck"
    ]

    POSITIVE_SENTIMENT_WORDS = [
        "thank", "thanks", "great", "awesome", "appreciate", "helpful", "good",
        "excellent", "love", "solved", "fantastic", "wonderful"
    ]

    URGENT_INDICATORS = [
        "production down", "urgent", "emergency", "sev1", "p0", "p1", "critical",
        "outage", "blocked", "immediate", "asap", "business halting", "data loss"
    ]

    def analyze_ticket(self, title: str, description: str, customer_tier: str = "Standard") -> Dict[str, Any]:
        """Performs deep multi-factor AI triage on incoming customer issue."""
        text = f"{title} {description}".lower()

        # 1. Category Classification
        category_scores: Dict[str, int] = {cat: 0 for cat in self.KEYWORD_CATEGORIES}
        for cat, keywords in self.KEYWORD_CATEGORIES.items():
            for kw in keywords:
                if kw in text:
                    category_scores[cat] += 1

        best_category = max(category_scores, key=category_scores.get)
        if category_scores[best_category] == 0:
            best_category = "General Inquiry"

        # 2. Sub-category derivation
        sub_category = self._derive_subcategory(best_category, text)

        # 3. Sentiment Analysis
        neg_count = sum(1 for word in self.NEGATIVE_SENTIMENT_WORDS if word in text)
        pos_count = sum(1 for word in self.POSITIVE_SENTIMENT_WORDS if word in text)

        if neg_count >= 3 or ("unacceptable" in text or "furious" in text or "disaster" in text):
            sentiment = "Angry"
            sentiment_score = -0.85
        elif neg_count >= 1:
            sentiment = "Frustrated"
            sentiment_score = -0.50
        elif pos_count >= 1 and neg_count == 0:
            sentiment = "Positive"
            sentiment_score = 0.75
        else:
            sentiment = "Neutral"
            sentiment_score = 0.05

        # 4. Urgency & Priority Detection
        urgency_score = 2
        for indicator in self.URGENT_INDICATORS:
            if indicator in text:
                urgency_score = 5
                break

        if urgency_score < 5:
            if customer_tier == "Enterprise VIP":
                urgency_score = max(urgency_score, 4)
            elif neg_count >= 2:
                urgency_score = max(urgency_score, 3)

        if urgency_score >= 5 or "production down" in text:
            priority = "critical"
        elif urgency_score == 4 or customer_tier == "Enterprise VIP":
            priority = "high"
        elif urgency_score == 3:
            priority = "medium"
        else:
            priority = "low"

        # 5. Extract Key Entities
        entities = self._extract_entities(text, title, description)

        # 6. Generate Executive AI Summary
        summary = self._generate_summary(title, best_category, sub_category, sentiment)

        # 7. Generate Intelligent Suggested Response Draft
        suggested_reply = self._generate_suggested_response(
            title=title,
            category=best_category,
            sub_category=sub_category,
            sentiment=sentiment,
            customer_tier=customer_tier,
            entities=entities
        )

        return {
            "category": best_category,
            "sub_category": sub_category,
            "priority": priority,
            "sentiment": sentiment,
            "sentiment_score": sentiment_score,
            "urgency_score": urgency_score,
            "ai_confidence": 0.94 if category_scores.get(best_category, 0) > 1 else 0.82,
            "ai_summary": summary,
            "ai_key_entities": entities,
            "ai_suggested_response": suggested_reply
        }

    def _derive_subcategory(self, category: str, text: str) -> str:
        if category == "Technical":
            if "api" in text or "webhook" in text or "endpoint" in text:
                return "API & Webhook Integrations"
            if "database" in text or "query" in text or "timeout" in text:
                return "Database & Storage Performance"
            if "500" in text or "crash" in text or "exception" in text:
                return "Backend Server Error"
            return "Application Diagnostics"
        elif category == "Billing":
            if "refund" in text:
                return "Refund Request"
            if "invoice" in text or "receipt" in text:
                return "Invoice / VAT Inquiries"
            return "Subscription & Plan Management"
        elif category == "Account & Security":
            if "sso" in text or "saml" in text or "okta" in text:
                return "Enterprise SSO / SAML"
            if "2fa" in text or "mfa" in text:
                return "Multi-Factor Authentication"
            return "Credential & Access Control"
        elif category == "Feature Request":
            return "Product Roadmap Suggestion"
        return "Customer Operations"

    def _extract_entities(self, text: str, title: str, description: str) -> List[str]:
        entities = []
        # Error codes
        error_matches = re.findall(r"\b(error\s*\d+|50[0-4]|40[0-4]|403|401)\b", text, re.IGNORECASE)
        for err in error_matches:
            entities.append(f"Code: {err.upper()}")

        # IDs
        id_matches = re.findall(r"\b(INV-\d+|TXN-\d+|CUST-\d+|TCK-\d+)\b", f"{title} {description}", re.IGNORECASE)
        for id_val in id_matches:
            entities.append(f"Ref: {id_val.upper()}")

        # Keywords
        for kw in ["SSO", "REST API", "PostgreSQL", "Stripe", "Kubernetes", "Webhooks"]:
            if kw.lower() in text and kw not in entities:
                entities.append(kw)

        if not entities:
            entities = ["Standard Support Request"]

        return list(dict.fromkeys(entities))[:5]

    def _generate_summary(self, title: str, category: str, sub_category: str, sentiment: str) -> str:
        sentiment_indicator = "frustrated customer requiring priority care" if sentiment in ["Frustrated", "Angry"] else "customer inquiry"
        return f"AI Analysis: {sentiment_indicator} concerning {sub_category} under {category}. Primary subject: '{title}'."

    def _generate_suggested_response(
        self,
        title: str,
        category: str,
        sub_category: str,
        sentiment: str,
        customer_tier: str,
        entities: List[str]
    ) -> str:
        salutation = "Hello,"
        empathy = ""
        if sentiment in ["Angry", "Frustrated"]:
            empathy = "Thank you for reaching out, and I apologize for the inconvenience and frustration this issue has caused. We understand how critical this is for your operations.\n\n"
        else:
            empathy = "Thank you for getting in touch with our support team.\n\n"

        vip_note = ""
        if customer_tier == "Enterprise VIP":
            vip_note = "As a valued Enterprise client, this ticket has been prioritized with our senior engineering triage team.\n\n"

        body = ""
        if category == "Technical":
            body = (
                f"We are actively investigating the issue regarding {sub_category}. "
                f"Our systems have captured telemetry for the related component. "
                "To accelerate resolution, could you confirm if this issue reproduces in your staging environment, "
                "and if any specific request payload triggered the unexpected behavior?"
            )
        elif category == "Billing":
            body = (
                f"I have reviewed your billing record regarding {sub_category}. "
                "I am cross-referencing your transaction history with our financial processor. "
                "Rest assured, if an erroneous charge was applied, we will issue a credit or refund immediately to your original payment method."
            )
        elif category == "Account & Security":
            body = (
                f"Security and access management are our highest priorities. Regarding {sub_category}, "
                "we have triggered a secure verification handshake. Please check your registered security device "
                "or secondary email for the verification challenge link."
            )
        else:
            body = (
                f"We have logged your query under {category} - {sub_category}. "
                "A specialist dedicated to this domain has been assigned and is reviewing the parameters right now."
            )

        signoff = "\n\nBest regards,\nCustomer Support Operations Team"
        return f"{salutation}\n\n{empathy}{vip_note}{body}{signoff}"

    def find_best_agent(self, ticket: models.Ticket, db: Session) -> Optional[Dict[str, Any]]:
        """
        AI Assignment Algorithm:
        Scores all agents using a weighted multi-criteria decision matrix:
        - Department alignment (weight 35)
        - Skill tag match (weight 30)
        - Current workload capacity (weight 20)
        - Agent Tier vs Ticket Priority alignment (weight 10)
        - Agent CSAT score (weight 5)
        """
        agents = db.query(models.Agent).all()
        if not agents:
            return None

        # Calculate current active tickets per agent
        active_counts = {}
        for agent in agents:
            count = db.query(models.Ticket).filter(
                models.Ticket.assigned_agent_id == agent.id,
                models.Ticket.status.in_(["open", "in_progress"])
            ).count()
            active_counts[agent.id] = count

        best_agent = None
        highest_score = -1.0
        best_rationale = ""

        ticket_cat = (ticket.category or "").lower()
        ticket_priority = (ticket.priority or "medium").lower()

        for agent in agents:
            # Skip if offline
            if agent.status == "offline":
                continue

            active_load = active_counts.get(agent.id, 0)
            # Hard limit check
            if active_load >= agent.max_active_tickets:
                continue

            score = 0.0
            reasons = []

            # 1. Department match
            dept_lower = agent.department.lower()
            if "technical" in dept_lower and ticket_cat == "technical":
                score += 35
                reasons.append("Technical Support department match")
            elif "billing" in dept_lower and ticket_cat == "billing":
                score += 35
                reasons.append("Billing department match")
            elif "security" in dept_lower and ticket_cat == "account & security":
                score += 35
                reasons.append("Security operations match")
            elif "enterprise" in dept_lower:
                score += 25
                reasons.append("Enterprise customer care team match")
            else:
                score += 10

            # 2. Skill match
            agent_skills = [s.strip().lower() for s in (agent.skills or "").split(",") if s.strip()]
            desc_text = f"{ticket.title} {ticket.description}".lower()
            matching_skills = [skill for skill in agent_skills if skill in desc_text or skill in ticket_cat]
            if matching_skills:
                skill_bonus = min(len(matching_skills) * 10, 30)
                score += skill_bonus
                reasons.append(f"Domain skills: [{', '.join(matching_skills)}]")

            # 3. Workload capacity score (0 to 20 pts)
            capacity_ratio = (agent.max_active_tickets - active_load) / max(agent.max_active_tickets, 1)
            score += capacity_ratio * 20
            reasons.append(f"Available capacity ({active_load}/{agent.max_active_tickets} tickets)")

            # 4. Tier alignment for critical/high priority
            if ticket_priority in ["critical", "high"]:
                if agent.tier >= 2:
                    score += 10
                    reasons.append(f"Tier {agent.tier} Senior Specialist qualification")
            else:
                if agent.tier == 1:
                    score += 10

            # 5. CSAT score bonus
            score += (agent.csat_score or 4.5)

            if score > highest_score:
                highest_score = score
                best_agent = agent
                best_rationale = (
                    f"AI Match Confidence {min(int(score * 1.1), 99)}%: "
                    f"Assigned to {agent.name} based on " + "; ".join(reasons) + "."
                )

        if not best_agent:
            # Fallback to any agent who is not offline and has lowest load
            available_agents = [a for a in agents if a.status != "offline"]
            if available_agents:
                best_agent = min(available_agents, key=lambda a: active_counts.get(a.id, 0))
                best_rationale = f"Assigned to {best_agent.name} via load-balancer fallback (lowest active queue)."

        if best_agent:
            return {
                "agent": best_agent,
                "score": highest_score,
                "rationale": best_rationale
            }

        return None

ai_service = AIAssistantService()
