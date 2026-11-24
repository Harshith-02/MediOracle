# MediOracle Core Workflows

## 1. Shift Lifecycle Workflow
```
[DRAFT] ──> [POSTED] ──> [OFFERED] ──> [ACCEPTED] ──> [CONFIRMED] ──> [IN_PROGRESS] ──> [COMPLETED]
                                                                                              │
                                                                                              v
                                                                                       [TIMESHEET LOCKED]
```
- Every state transition validates eligibility, updates DB state, and records an immutable `AuditEvent`.

## 2. Intelligent Explainable Matching Workflow
1. Facility posts shift requirement.
2. AI Matching Engine queries eligible candidates.
3. Evaluates 6 key factors: Distance, Availability, Specialty, Credentials, Rating/Reliability, and Rate compatibility.
4. Produces score percentage (e.g. `94.5%`), confidence score (`96%`), distance (`8.2 km`), positive points (`✓`), and warnings (`⚠`).
5. Facility reviews candidates or executes AI score override with mandatory audit reason.
6. 1-Click offer sent to top candidate.

## 3. Compliance & Three-Stage Eligibility Workflow
Eligibility revalidated at 3 critical stages:
1. **Offer Generation**: Verifies role qualification & active NMBI PIN.
2. **Confirmation**: Verifies working-time weekly hour caps (48h cap) and minimum rest periods.
3. **Shift Start**: Verifies GPS location within ward geofence.

*Automatic Restriction*: Expired mandatory credentials trigger status change to `NON_COMPLIANT`, restrict active assignments, and notify operations.

## 4. Timekeeping & Locked Timesheet Workflow
1. Professional clocks in at facility via mobile portal -> GPS geofence status verified.
2. Professional takes break -> Clock events recorded.
3. Professional clocks out -> Digital Timesheet draft generated.
4. Ward leader reviews hours and signs digitally.
5. Timesheet state changes to `LOCKED`.
6. *Financial Lock Rule*: Approved hours cannot be directly edited. Changes post-approval require an explicit adjustment entry.

## 5. Billing, Payment & Duplicate Safeguard Workflow
1. Facility invoice auto-generated from locked timesheets (includes subtotal + VAT 23%).
2. SEPA Instant Transfer payout initiated.
3. System verifies unique payment identifier (`PAY-{invoice_id}-{date}`).
4. If payment already exists, system blocks duplicate processing and flags 409 Conflict.
5. Payment recorded and invoice status updated to `PAID`.
