from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime, JSON, Boolean
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Rate(BaseModel):
    __tablename__ = "rates"
    
    facility_id = Column(String, ForeignKey("facilities.id"), nullable=False)
    role_name = Column(String, nullable=False)
    specialty = Column(String, nullable=False)
    base_rate = Column(Float, nullable=False)
    max_rate_cap = Column(Float, nullable=False)

class Incentive(BaseModel):
    __tablename__ = "incentives"
    
    shift_id = Column(String, ForeignKey("shifts.id"), nullable=False)
    suggested_bonus = Column(Float, nullable=False)
    reason = Column(String, nullable=False)
    status = Column(String, default="SUGGESTED") # SUGGESTED, ACCEPTED, REJECTED

class Budget(BaseModel):
    __tablename__ = "budgets"
    
    facility_id = Column(String, ForeignKey("facilities.id"), nullable=False)
    department_name = Column(String, nullable=False)
    monthly_budget = Column(Float, nullable=False)
    spent_to_date = Column(Float, default=0.0)
    projected_spend = Column(Float, default=0.0)
    month_year = Column(String, nullable=False) # "2026-09"
    
    facility = relationship("Facility", back_populates="budgets")

class Invoice(BaseModel):
    __tablename__ = "invoices"
    
    facility_id = Column(String, ForeignKey("facilities.id"), nullable=False)
    invoice_number = Column(String, unique=True, index=True, nullable=False)
    issue_date = Column(DateTime, nullable=False)
    due_date = Column(DateTime, nullable=False)
    
    subtotal_amount = Column(Float, nullable=False)
    tax_amount = Column(Float, default=0.0) # VAT 23%
    total_amount = Column(Float, nullable=False)
    paid_amount = Column(Float, default=0.0)
    
    status = Column(String, default="ISSUED", index=True) # DRAFT, ISSUED, PARTIALLY_PAID, PAID, OVERDUE, DISPUTED, VOID
    
    lines = relationship("InvoiceLine", back_populates="invoice")
    payments = relationship("Payment", back_populates="invoice")

class InvoiceLine(BaseModel):
    __tablename__ = "invoice_lines"
    
    invoice_id = Column(String, ForeignKey("invoices.id"), nullable=False)
    timesheet_id = Column(String, ForeignKey("timesheets.id"), nullable=False)
    description = Column(String, nullable=False)
    hours = Column(Float, nullable=False)
    rate = Column(Float, nullable=False)
    line_total = Column(Float, nullable=False)
    
    invoice = relationship("Invoice", back_populates="lines")

class Payment(BaseModel):
    __tablename__ = "payments"
    
    invoice_id = Column(String, ForeignKey("invoices.id"), nullable=True)
    professional_id = Column(String, ForeignKey("professional_profiles.id"), nullable=True)
    
    payment_identifier = Column(String, unique=True, nullable=False) # Safeguard against double payment
    amount = Column(Float, nullable=False)
    payment_method = Column(String, default="MOCK_SEPA_TRANSFER") # MOCK_SEPA_TRANSFER, MOCK_INSTANT_PAY
    status = Column(String, default="PROCESSING") # PENDING, APPROVED, SCHEDULED, PROCESSING, PAID, DISPUTED, FAILED
    processed_at = Column(DateTime, nullable=True)
    
    invoice = relationship("Invoice", back_populates="payments")

class Adjustment(BaseModel):
    __tablename__ = "adjustments"
    
    timesheet_id = Column(String, ForeignKey("timesheets.id"), nullable=False)
    previous_amount = Column(Float, nullable=False)
    new_amount = Column(Float, nullable=False)
    reason = Column(String, nullable=False)
    adjusted_by_user_id = Column(String, ForeignKey("users.id"), nullable=False)

class Dispute(BaseModel):
    __tablename__ = "disputes"
    
    entity_type = Column(String, nullable=False) # TIMESHEET, INVOICE, PAYMENT
    entity_id = Column(String, nullable=False)
    submitted_by_user_id = Column(String, ForeignKey("users.id"), nullable=False)
    reason = Column(String, nullable=False)
    status = Column(String, default="OPEN") # OPEN, IN_MEDIATION, RESOLVED, REJECTED
    resolution_notes = Column(String, nullable=True)
