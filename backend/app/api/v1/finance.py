import uuid
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.timekeeping import Timesheet
from app.models.finance import Invoice, InvoiceLine, Payment, Dispute, Adjustment
from app.schemas.invoice import InvoiceOut, PaymentProcessRequest, PaymentOut
from app.integrations.payment_mock import payment_service
from app.services.audit_service import log_audit_event

router = APIRouter()

@router.post("/invoices/generate-from-timesheets")
def generate_invoices_from_locked_timesheets(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    locked_ts = db.query(Timesheet).filter(Timesheet.approval_state == "LOCKED").all()
    if not locked_ts:
        return {"message": "No unbilled locked timesheets found", "invoices_created": 0}
        
    facility_map = {}
    for ts in locked_ts:
        facility_map.setdefault(ts.facility_id, []).append(ts)
        
    created_invoices = []
    for fac_id, ts_list in facility_map.items():
        inv_num = f"INV-MED-{uuid.uuid4().hex[:6].upper()}"
        subtotal = sum(t.total_gross_pay for t in ts_list)
        tax = round(subtotal * 0.23, 2)
        total = round(subtotal + tax, 2)
        
        inv = Invoice(
            facility_id=fac_id,
            invoice_number=inv_num,
            issue_date=datetime.utcnow(),
            due_date=datetime.utcnow() + timedelta(days=30),
            subtotal_amount=subtotal,
            tax_amount=tax,
            total_amount=total,
            paid_amount=0.0,
            status="ISSUED"
        )
        db.add(inv)
        db.flush()
        
        for t in ts_list:
            line = InvoiceLine(
                invoice_id=inv.id,
                timesheet_id=t.id,
                description=f"Shift Timesheet #{t.id[:8]} - {t.total_hours_worked} hours @ €{t.hourly_rate}/h",
                hours=t.total_hours_worked,
                rate=t.hourly_rate,
                line_total=t.total_gross_pay
            )
            db.add(line)
            
        db.commit()
        created_invoices.append(inv_num)
        
        log_audit_event(
            db=db,
            actor_user_id=current_user.id,
            actor_email=current_user.email,
            action="INVOICE_GENERATED",
            entity_name="Invoice",
            entity_id=inv.id,
            new_value={"invoice_number": inv_num, "total": total}
        )
        
    return {"message": f"Generated {len(created_invoices)} invoices", "invoice_numbers": created_invoices}

@router.get("/invoices", response_model=List[InvoiceOut])
def list_invoices(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Invoice)
    if current_user.facility_id and "FACILITY" in current_user.roles:
        query = query.filter(Invoice.facility_id == current_user.facility_id)
    return query.all()

@router.post("/payments/process", response_model=PaymentOut)
def process_payment(
    req: PaymentProcessRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Duplicate Payment Prevention Safeguard (Section 47)
    pay_id = f"PAY-{(req.invoice_id or req.professional_id)[:8]}-{uuid.uuid4().hex[:8].upper()}"
    existing_payment = db.query(Payment).filter(Payment.payment_identifier == pay_id).first()
    if existing_payment:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Duplicate payment attempt blocked. Payment reference '{pay_id}' has already been processed."
        )
        
    mock_res = payment_service.process_payout(
        professional_id=req.professional_id or "PROF_GENERAL",
        amount=req.amount,
        payment_reference=pay_id
    )
    
    payment = Payment(
        invoice_id=req.invoice_id,
        professional_id=req.professional_id,
        payment_identifier=pay_id,
        amount=req.amount,
        payment_method=req.payment_method,
        status="PAID",
        processed_at=datetime.utcnow()
    )
    
    if req.invoice_id:
        inv = db.query(Invoice).filter(Invoice.id == req.invoice_id).first()
        if inv:
            inv.paid_amount += req.amount
            if inv.paid_amount >= inv.total_amount:
                inv.status = "PAID"
            else:
                inv.status = "PARTIALLY_PAID"
                
    db.add(payment)
    db.commit()
    db.refresh(payment)
    
    log_audit_event(
        db=db,
        actor_user_id=current_user.id,
        actor_email=current_user.email,
        action="PAYMENT_PROCESSED",
        entity_name="Payment",
        entity_id=payment.id,
        new_value={"payment_identifier": pay_id, "amount": req.amount}
    )
    return payment

@router.get("/reconciliation")
def get_reconciliation_report(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    timesheets = db.query(Timesheet).all()
    invoices = db.query(Invoice).all()
    payments = db.query(Payment).all()
    
    total_timesheet_value = sum(t.total_gross_pay for t in timesheets)
    total_invoiced_value = sum(i.total_amount for i in invoices)
    total_payments_collected = sum(p.amount for p in payments)
    
    unmatched_count = max(0, len(timesheets) - len(invoices))
    
    return {
        "summary": {
            "total_timesheets_processed": len(timesheets),
            "total_timesheet_value": total_timesheet_value,
            "total_invoiced_value": total_invoiced_value,
            "total_payments_collected": total_payments_collected,
            "outstanding_uncollected_balance": round(total_invoiced_value - total_payments_collected, 2),
            "unbilled_timesheets_count": unmatched_count
        },
        "reconciliation_status": "RECONCILED" if total_invoiced_value >= total_timesheet_value else "DISCREPANCY_DETECTED"
    }
