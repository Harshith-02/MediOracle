# MediOracle System Architecture

## Overview
MediOracle is designed as a modular monorepo following strict separation of concerns:
`API Layer → Service Layer → Repository / AI Engines → SQLAlchemy ORM → Database`.

```
                  +-----------------------------------+
                  |          React Frontend           |
                  |  (Vite + TypeScript + Tailwind)   |
                  +-----------------+-----------------+
                                    | REST (JSON / JWT)
                                    v
                  +-----------------+-----------------+
                  |          FastAPI Backend          |
                  |     (API Router / Dependencies)   |
                  +--------+----------------+---------+
                           |                |
             +-------------+                +-------------+
             |                                            |
             v                                            v
  +----------+----------+                      +----------+----------+
  |  AI & Match Engine  |                      | Core Domain Services|
  | (Deterministic/Rules|                      | (Shift, Time, Pay,  |
  |   & Forecasting)    |                      |  Audit, Compliance) |
  +----------+----------+                      +----------+----------+
             |                                            |
             +---------------------+----------------------+
                                   |
                                   v
                  +----------------+------------------+
                  |         SQLAlchemy 2.0 ORM        |
                  |  (PostgreSQL / SQLite Fallback)   |
                  +----------------+------------------+
                                   |
                                   v
                  +----------------+------------------+
                  |    Immutable Audit Event Log      |
                  +-----------------------------------+
```

---

## 1. Frontend Architecture
- **State Management**: Zustand store (`authStore.ts`) handles JWT authentication, current user context, active role switching, and 1-click demo account switcher.
- **Data Fetching**: Axios client with request interceptor for JWT authorization header and automatic 401 token invalidation.
- **Component System**: Modular UI components (`MetricCard`, `StatusBadge`, `Header`, `Sidebar`, `Modal`).

## 2. Backend Architecture
- **FastAPI Routing**: Versioned routes (`/api/v1/...`) separated by domain: `auth`, `facilities`, `shifts`, `matching`, `compliance`, `timekeeping`, `finance`, `analytics`, `support`, `audit`, `integrations`.
- **Role-Based Access Control**: `rbac.py` enforces backend role checks (`FACILITY`, `PROFESSIONAL`, `ADMIN`, `COMPLIANCE`, `PAYROLL`) and cross-facility data isolation.
- **Data Models**: SQLAlchemy ORM models with soft-deletion, timestamps, status enums, foreign keys, and indexes.

## 3. Intelligent Match Scoring Algorithm
- Multi-factor formula:
  $$\text{Score} = (0.25 \times \text{Specialty}) + (0.20 \times \text{Distance}) + (0.20 \times \text{Availability}) + (0.15 \times \text{Credentials}) + (0.10 \times \text{Rating}) + (0.10 \times \text{Rate})$$
- Generates confidence score, factor breakdown, positive points (`✓`), and warnings (`⚠`).

## 4. Integration Abstractions
- Abstract adapters (`BaseIntegrationAdapter`) with sandbox implementations:
  - `MockNMBIVerificationService` (Nursing board lookup)
  - `MockOCRService` (Document & timesheet photo OCR)
  - `MockMapsService` (Geocoding & commute route calculation)
  - `MockPaymentGatewayService` (SEPA instant transfer & duplicate payment safeguards)
