from datetime import datetime
from typing import Dict, Any
from app.integrations.base import BaseIntegrationAdapter

class MockNMBIVerificationService(BaseIntegrationAdapter):
    """
    Mock Integration Adapter for NMBI Nursing & Midwifery Board of Ireland Licensing Verification.
    Sandbox simulated verification service.
    """
    def get_provider_name(self) -> str:
        return "NMBI Sandbox Verification API (Demo)"

    def is_mock(self) -> bool:
        return True

    def verify_pin(self, pin_number: str, professional_name: str) -> Dict[str, Any]:
        # Simulated lookup logic
        clean_pin = pin_number.strip().upper()
        if "EXPIRED" in clean_pin:
            return {
                "status": "EXPIRED",
                "pin": clean_pin,
                "registered_name": professional_name,
                "division": "General Nursing (RGN)",
                "expiry_date": "2024-12-31",
                "conditions": ["Registration expired"],
                "disclaimer": "Demo verification - sandbox simulated response."
            }
        return {
            "status": "VERIFIED",
            "pin": clean_pin,
            "registered_name": professional_name,
            "division": "General Nursing & Children's Nursing (RGN/RCN)",
            "expiry_date": "2027-12-31",
            "conditions": [],
            "disclaimer": "Demo verification - sandbox simulated response."
        }

nmbi_service = MockNMBIVerificationService()
