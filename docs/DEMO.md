# MediOracle Master End-to-End Demonstration Guide

This guide walks through the exact 20-step demonstration scenario defined in Section 92 of the MediOracle Functional Specification.

---

## Master Scenario: St. James Hospital Emergency ICU Nurse Coverage

### Phase A: Facility Workforce Demand & AI Matching
1. **Open Portal**: Navigate to `http://localhost:3000` in browser.
2. **Login as Facility Manager**: Click **1-Click Demo Login: Facility Manager** (`facility@stjames.ie`).
3. **Inspect Facility Dashboard**: Note the **YELLOW Risk Badge**, Staffing Shortage Alerts, and Open Shifts Table.
4. **Post Shift**: Click **Post New Shift**. Fill in ICU Nurse shift for tomorrow (`07:00–19:00`, €45.00/h + €5 bonus). Click **Post Shift & Rank Candidates**.
5. **Inspect AI Match Engine**: System ranks candidates. Observe **Sarah Connor** at the top with **94.5% Overall Score**, **96% Confidence**, and **8.2 km commute**.
6. **Inspect Explainability Inspector**: Review positive factors (`✓ Specialty matched`, `✓ NMBI verified`, `✓ 4.9 star rating`) and safeguard warnings (`⚠ Near weekly hour limit`).
7. **Test AI Override (Optional)**: Click **Override AI**, enter reason *"Ward leader requested Sarah Connor based on ICU experience"*, and save. Audit event recorded.
8. **Send Offer**: Click **Send 1-Click Offer**. Notification dispatched to Sarah.

---

### Phase B: Professional Discovery & Acceptance
9. **Switch Role**: Use Header Demo Switcher to switch to **Sarah Connor** (`nurse.sarah@medioracle.com`).
10. **View Offer**: Notification banner displays 94.5% AI match shift offer from St. James Hospital ICU Ward.
11. **Accept Shift**: Click **Accept Shift**. System revalidates eligibility, confirms booking, and adds to Sarah's shift calendar.

---

### Phase C: Geofenced Timekeeping & Manager Locking
12. **Clock In**: Click **Clock IN Now**. GPS geofence verified at St. James Hospital.
13. **Clock Out**: Click **Clock OUT**. Digital timesheet draft automatically generated.
14. **Switch to Facility Manager**: Switch back to **Facility Manager** (`facility@stjames.ie`).
15. **Approve Timesheet**: Navigate to **Timesheet Approvals**. Click **Approve & Lock**. Digital manager signature applied. Status changes to **LOCKED**.

---

### Phase D: Invoicing, Payments & Operations Analytics
16. **Generate Invoice**: Navigate to **Facility Invoices**. Click **Generate Invoices from Locked Hours**. Invoice `INV-MED-...` generated with 23% VAT.
17. **Process SEPA Payment**: Click **Process SEPA Payment**. Payment identifier generated and settled in sandbox.
18. **Verify Duplicate Safeguard**: Click **Process SEPA Payment** again. Observe safety conflict alert blocking duplicate payment attempt.
19. **View Agency Operations**: Switch to **Platform Admin** (`admin@medioracle.com`). Inspect Global Fill Rate (92.8%), Demand Forecast, What-If Simulator, and Integration Adapter status.
20. **Inspect Audit Trail**: Navigate to **Immutable Audit Trail**. Verify complete audit event chain (`SHIFT_CREATED` → `OFFER_SENT` → `OFFER_ACCEPTED` → `CLOCK_IN` → `TIMESHEET_APPROVED_LOCKED` → `INVOICE_GENERATED` → `PAYMENT_PROCESSED`).

---

## Master Workflow Completed Successfully!
