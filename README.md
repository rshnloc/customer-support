# AI Customer Support & Contact Center 🎧🤖

A modern, production-grade **AI-Powered Customer Support & Contact Center Management System** built with **Python (FastAPI)** and **TypeScript (React + Vite + Tailwind CSS)**.

Designed with **strict data privacy and zero credential leakage** — running completely on local, explainable AI heuristics and synthetic test fixtures without requiring Docker or paid external API keys.

---

## 🌟 Key Capabilities

### 1. Intelligent Ticket Ingestion & Multi-Channel Simulator
- Ingest tickets via simulated channels: **Email**, **Live Chat**, **Phone Call Transcripts**, and **Customer Web Portal**.
- Supports 1-click synthetic emergency scenarios (Critical Sev-1 API Outages, Duplicate Billing Disputes, SSO Security Lockouts).

### 2. Multi-Factor AI Triage Engine
- **Taxonomy & Domain Classification**: Categorizes into *Technical Support*, *Billing & Subscriptions*, *Account & Security*, and *Feature Requests* with granular sub-categories (e.g., API Webhook Integrations, SAML SSO, VAT Invoicing).
- **Sentiment & Emotion Telemetry**: Analyzes customer frustration levels with a numerical sentiment score (-1.0 to +1.0) and classifications (*Angry*, *Frustrated*, *Neutral*, *Positive*).
- **Urgency Matrix (1 to 5)**: Automatically assigns priority (*Critical P0*, *High P1*, *Medium*, *Low*) based on business-impact keywords and customer subscription tiers.
- **Entity Extraction**: Recognizes HTTP error codes (e.g., 504, 403), reference IDs (e.g., `INV-8821`), and tech stack components.

### 3. Explainable Smart Agent Matching & Auto-Assignment
- Assigns tickets using an explainable multi-criteria decision matrix:
  - **Department & Domain Match** (35% weight)
  - **Skill Tag Overlap** (30% weight: matches keywords like `api`, `webhooks`, `sso`, `billing`)
  - **Workload Capacity Balancing** (20% weight: prevents overload, checks `active_tickets < max_active_tickets`)
  - **Tier Qualification** (10% weight: Tier 2/3 senior engineers reserved for Critical/High issues)
  - **Agent CSAT Score** (5% weight)
- Provides human-readable **AI Assignment Rationale** for supervisors to audit routing decisions.

### 4. AI Copilot & Automated Response Drafts
- Generates context-aware, empathetic response drafts tailored to customer sentiment and issue complexity.
- 1-click **Apply AI Suggested Response** into the agent reply composer.

### 5. Supervisor Analytics & Agent Workload Roster
- Real-time SLA compliance tracking with automatic breach detection.
- Live agent shift availability switcher (*Online*, *Busy*, *Away*, *Offline*).
- Operational dashboard displaying sentiment breakdown, domain distribution, channel mix, and agent capacity utilization percentages.

---

## 🔒 Security & Strict Privacy Compliance

- **No Docker Required**: Runs directly via standard Python 3 and Node.js.
- **Zero Credentials / No API Keys Needed**: The AI engine runs locally out-of-the-box.
- **Strictly Synthetic Test Entities**:
  - Email addresses: `@example.com` and `@example.org`
  - Phone numbers: North American reserved fictional range `+1-555-01XX`
  - Customer & Agent names: Fictional test profiles (`Customer Jordan Lee`, `Agent Alex Rivera`)
  - Zero PII, health, financial, or proprietary customer data.

---

## 📁 Project Architecture

```
customer-support/
├── backend/
│   ├── app/
│   │   ├── config.py              # Application settings & SLA thresholds
│   │   ├── database.py            # SQLite engine & session management
│   │   ├── models.py              # SQLAlchemy ORM models (Ticket, Agent, Customer, Message, Audit)
│   │   ├── schemas.py             # Pydantic v2 validation models
│   │   ├── ai_service.py          # AI Triage, Sentiment Analyzer & Smart Routing Algorithm
│   │   ├── routers/
│   │   │   ├── tickets.py         # Ticket lifecycle, triage & assignment endpoints
│   │   │   ├── agents.py          # Agent roster & shift status management
│   │   │   ├── analytics.py       # Contact center telemetry & supervisor stats
│   │   │   └── seed.py            # Synthetic test data initializer & reset endpoint
│   │   └── data/
│   │       └── test_fixtures.py   # Purely synthetic test data
│   ├── requirements.txt
│   ├── run.py                     # Backend server entrypoint (port 8000)
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx         # Navigation, SLA breach alerts & quick actions
│   │   │   ├── TicketList.tsx     # Filterable live ticket queue with sentiment tags
│   │   │   ├── TicketDetail.tsx   # Workspace conversation thread, audit trail & reply box
│   │   │   ├── AICopilotPanel.tsx # AI triage confidence, emotion meter & routing rationale
│   │   │   ├── AgentRoster.tsx    # Live agent directory & capacity meters
│   │   │   ├── AnalyticsView.tsx  # Supervisor charts & SLA breach metrics
│   │   │   └── NewTicketModal.tsx # Multi-channel ingestion simulator
│   │   ├── api.ts                 # Type-safe API client
│   │   ├── types.ts               # TypeScript data definitions
│   │   ├── App.tsx                # Master state controller
│   │   └── index.css              # Tailwind styling
│   ├── package.json
│   ├── vite.config.ts             # Dev proxy configuration to port 8000
│   └── tailwind.config.js
├── start.sh                       # Single-command startup script
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### Option 1: One-Command Startup
```bash
./start.sh
```
This starts both the FastAPI backend on `http://localhost:8000` and the Vite frontend on `http://localhost:5173`.

---

### Option 2: Run Backend & Frontend Separately

#### 1. Start Backend (Python FastAPI)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run.py
```
- API Server: `http://localhost:8000`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`

#### 2. Start Frontend (TypeScript + Vite)
```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:5173`

---

## 🧪 Testing the AI Workflows

1. **Test Multi-Channel Ingestion**: Click **"+ Ingest Ticket"** in the top navbar and pick a scenario (e.g. *Critical API Outage*). Notice how the AI instantly detects:
   - Category: `Technical`
   - Sentiment: `Frustrated` (-0.80)
   - Priority: `Critical (Sev 1)`
   - Auto-assigned to **Agent Alex Rivera** with matching `api` / `504` skills and lowest workload.
2. **Test Agent Workload Adaptation**: Navigate to **Agent Roster**, toggle Agent Alex Rivera to *Offline* or *Busy*, and ingest another technical ticket. The AI load-balancer automatically routes to the next best Tier 2 specialist (**Agent Morgan Taylor**).
3. **Audit Trail**: Open any ticket and click **"Timeline & Triage Audit"** to view timestamped evidence of automated AI triage and assignment decisions.
4. **Reset Anytime**: Click **"Reset Demo"** in the top bar to revert the SQLite database back to the clean synthetic fixtures.

