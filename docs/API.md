# MediOracle API Specification

## Base URL
`http://localhost:8000/api/v1`

## OpenAPI Interactive Documentation
FastAPI automatically generates interactive Swagger UI documentation at:
`http://localhost:8000/docs`

---

## Endpoint Summary

### Authentication (`/auth`)
- `POST /auth/login`: Authenticate user and issue JWT bearer token.
- `GET /auth/me`: Get current authenticated user details and active roles.
- `GET /auth/demo-accounts`: List pre-configured demo account credentials.

### Facilities & Wards (`/facilities`)
- `GET /facilities/`: List healthcare facilities.
- `GET /facilities/{id}`: Get facility detail and risk status (`GREEN`, `YELLOW`, `RED`).
- `GET /facilities/{id}/wards`: List wards, bed capacities, acuity levels, and staffing requirements.

### Shifts & Lifecycle (`/shifts`)
- `GET /shifts/`: List open and confirmed shifts.
- `POST /shifts/`: Post new shift with role, specialty, rate, break duration, and budget allocation.
- `GET /shifts/{id}`: Get shift detail.
- `POST /shifts/{id}/apply`: Professional applies for shift.
- `POST /shifts/{id}/offer`: Facility sends 1-to-1 or broadcast shift offer to professional.
- `POST /shifts/offers/{offer_id}/accept`: Professional accepts offer -> Confirms booking (Includes race condition safeguard).

### Intelligent AI Matching Engine (`/matching`)
- `GET /matching/shifts/{id}/candidates`: Rank healthcare professionals for shift with match score breakdown, confidence score, distance, positive factors (`✓`), and warnings (`⚠`).
- `POST /matching/override`: Facility user overrides AI ranking with mandatory justification (Recorded in audit trail).

### Compliance & Verification (`/compliance`)
- `GET /compliance/credentials`: List credentials.
- `POST /compliance/credentials/upload-ocr`: Scan document photo via mock OCR parser.
- `GET /compliance/eligibility-check`: Execute Three-Stage Eligibility validation (Offer, Confirmation, Shift Start).

### Timekeeping (`/timekeeping`)
- `POST /timekeeping/clock-events`: Record immutable `CLOCK_IN`, `BREAK`, or `CLOCK_OUT` with GPS geofence validation.
- `GET /timekeeping/timesheets`: List digital timesheets.
- `POST /timekeeping/timesheets/{id}/approve`: Ward manager signs & approves timesheet -> Locks approved hours.

### Invoicing & Payments (`/finance`)
- `POST /finance/invoices/generate-from-timesheets`: Generate facility invoices from locked timesheets.
- `GET /finance/invoices`: List facility invoices.
- `POST /finance/payments/process`: Process SEPA payment (Includes duplicate payment prevention check).
- `GET /finance/reconciliation`: View timesheet -> invoice -> payment reconciliation status.

### Operational Intelligence (`/analytics`)
- `GET /analytics/facility-dashboard`: Real-time staffing metrics, fill rate, time-to-fill, budget, and shortage alerts.
- `GET /analytics/operational-analytics`: Global agency fill rate, margin %, invoice aging, and override rate.
- `GET /analytics/demand-forecast`: AI 48h workforce demand predictions.
- `GET /analytics/what-if-simulation`: What-If rate change simulator.

### Immutable Audit Trail (`/audit`)
- `GET /audit/`: List audit events with actor, action, timestamp, and entity metadata.

### Integration Status (`/integrations`)
- `GET /integrations/status`: View status of external API adapters (NMBI, Garda, Maps, OCR, SEPA).
