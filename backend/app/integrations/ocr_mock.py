from typing import Dict, Any
from app.integrations.base import BaseIntegrationAdapter

class MockOCRService(BaseIntegrationAdapter):
    """
    Mock OCR Service for credential document scanning and physical timesheet photo extraction.
    """
    def get_provider_name(self) -> str:
        return "MediOracle Document OCR Sandbox (Demo)"

    def is_mock(self) -> bool:
        return True

    def extract_document_text(self, file_name: str) -> Dict[str, Any]:
        return {
            "extracted_fields": {
                "document_title": "NMBI Annual Retention Certificate 2026",
                "holder_name": "Sarah Connor, RGN",
                "pin_number": "NMBI-984210",
                "issue_date": "2026-01-01",
                "expiry_date": "2027-12-31",
                "hours_logged": 12.0
            },
            "confidence_score": 96.4,
            "verification_recommendation": "PASSED_HUMAN_REVIEW_REQUIRED",
            "disclaimer": "Demo OCR extraction - human verification required before authoritative approval."
        }

ocr_service = MockOCRService()
