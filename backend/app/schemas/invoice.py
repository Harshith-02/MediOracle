from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class InvoiceOut(BaseModel):
    id: str
    facility_id: str
    invoice_number: str
    issue_date: datetime
    due_date: datetime
    subtotal_amount: float
    tax_amount: float
    total_amount: float
    paid_amount: float
    status: str

    class Config:
        from_attributes = True

class PaymentProcessRequest(BaseModel):
    invoice_id: Optional[str] = None
    professional_id: Optional[str] = None
    amount: float
    payment_method: str = "MOCK_SEPA_TRANSFER"

class PaymentOut(BaseModel):
    id: str
    payment_identifier: str
    amount: float
    payment_method: str
    status: str
    processed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
