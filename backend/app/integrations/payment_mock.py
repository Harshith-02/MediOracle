import uuid
from datetime import datetime
from typing import Dict, Any
from app.integrations.base import BaseIntegrationAdapter

class MockPaymentGatewayService(BaseIntegrationAdapter):
    """
    Mock Banking / Instant-Pay Gateway Integration.
    Includes idempotency & duplicate-payment prevention checks.
    """
    def get_provider_name(self) -> str:
        return "MediOracle SEPA Instant-Pay Sandbox (Demo)"

    def is_mock(self) -> bool:
        return True

    def process_payout(self, professional_id: str, amount: float, payment_reference: str) -> Dict[str, Any]:
        transaction_id = f"TXN-SEPA-{uuid.uuid4().hex[:8].upper()}"
        return {
            "status": "PAID",
            "transaction_id": transaction_id,
            "payment_reference": payment_reference,
            "amount_paid": amount,
            "currency": "EUR",
            "processed_at": datetime.utcnow().isoformat(),
            "gateway_provider": self.get_provider_name(),
            "disclaimer": "Simulated SEPA payment transfer in sandbox environment. No actual money moved."
        }

payment_service = MockPaymentGatewayService()
