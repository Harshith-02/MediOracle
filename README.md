# MediOracle — AI-Powered Healthcare Workforce Management Portal

**MediOracle** (Nexgile Healthcare Workforce Portal) is a full-stack, enterprise-grade AI-powered healthcare workforce management platform connecting healthcare facilities (hospitals, HSE sites, nursing homes) with qualified healthcare professionals (nurses, HCAs, social care workers, midwives, pharmacists).

The platform manages workforce demand, intelligent explainable matching, shift scheduling, credential compliance, timekeeping, billing, payroll, operational analytics, demand forecasting, and immutable event auditing.

---

## Key Features

- **Multi-Role Portal Access**: Role-based experience for `FACILITY`, `PROFESSIONAL`, `ADMIN`, `RECRUITER`, `COMPLIANCE`, `PAYROLL`, `SUPPORT`, `REGIONAL_COORDINATOR`, `BUSINESS_LEADER`.
- **Intelligent Explainable Matching Engine**: Multi-factor scoring evaluating distance, availability, qualifications, NMBI credentials, reliability rating, rate compatibility, and working-time limits with positive reasons (`✓`) and safeguard warnings (`⚠`).
- **AI Score Overrides**: Facility/Admin users can override AI recommendations with mandatory justification recorded in audit history.
- **Three-Stage Eligibility & Compliance Engine**: Active revalidation at Offer, Confirmation, and Shift Start stages. Auto-restricts shifts upon mandatory credential expiration.
- **Geofenced Timekeeping & Lockable Timesheets**: Immutable clock events (`CLOCK_IN`, `BREAK`, `CLOCK_OUT`). Digital manager signature locks timesheets to prevent unauthorized edits post-approval.
- **Billing & SEPA Payment Ledger**: Automated invoice generation with VAT 23%, instant pay processing, and duplicate payment prevention safeguards.
- **AI Demand Forecasting & What-If Simulator**: Predicts department shortages 48h in advance and simulates fill probabilities for proposed shift rate changes.
- **Immutable Audit Event History**: Logs every authentication, shift creation, offer, booking, timekeeping event, approval, payment, and AI override.
- **Integration Abstractions**: Abstract adapters for NMBI registration, Garda vetting, Google Maps geocoding, OCR timesheet scanning, and SEPA payments with clear sandbox labels.

---

## Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Lucide Icons + Custom Slate Healthcare Theme
- **State & Data**: Zustand + TanStack Query + Axios
- **Charts & Forms**: Recharts + React Router v6

### Backend
- **Framework**: Python 3.10+ + FastAPI
- **Database & ORM**: SQLAlchemy 2.0 + PostgreSQL (with SQLite fallback for instant zero-setup execution)
- **Auth & Security**: OAuth2 JWT Tokens + Passlib/Bcrypt password hashing
- **Testing**: Pytest test suite with end-to-end master acceptance workflow

---

## Quick Start & Setup

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run backend development server (starts on http://localhost:8000)
python -m uvicorn app.main:app --reload --port 8000
```
*Note: On startup, the backend automatically initializes database tables and seeds master demonstration data.*

### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run frontend development server (starts on http://localhost:3000)
npm run dev
```

### 3. Docker Compose (Alternative Production Build)
```bash
docker-compose up --build
```

---

## Pre-configured Demo Accounts

All demo accounts use password: `Password123!`

| Role | Email | Description |
| :--- | :--- | :--- |
| **FACILITY** | `facility@stjames.ie` | St. James Hospital Workforce & Ward Leader |
| **PROFESSIONAL** | `nurse.sarah@medioracle.com` | Sarah Connor, RGN ICU Nurse (94.5% Match) |
| **ADMIN** | `admin@medioracle.com` | Master Agency Operations & AI Analytics |
| **COMPLIANCE** | `compliance@medioracle.com` | Credential Review Officer (NMBI/Garda) |
| **PAYROLL** | `payroll@medioracle.com` | Payroll & Invoicing Manager |
| **SUPPORT** | `support@medioracle.com` | Help Desk & Support Case Escalations |

---

## Running Automated Tests

```bash
# Run pytest suite inside backend directory
cd backend
pytest
```

---

## Documentation Links

- [Architecture Overview](docs/ARCHITECTURE.md)
- [REST API Specification](docs/API.md)
- [Core Workflows](docs/WORKFLOWS.md)
- [End-to-End Master Demonstration Guide](docs/DEMO.md)
