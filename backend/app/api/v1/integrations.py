from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/status")
def get_integrations_status(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return [
        {
            "id": "int-1",
            "name": "NMBI Licensing Board API Adapter",
            "service_type": "REGULATORY_VERIFICATION",
            "is_mocked": True,
            "status": "HEALTHY_SANDBOX",
            "last_sync": datetime.utcnow().isoformat(),
            "disclaimer": "Demo verification sandbox - simulated registry lookup."
        },
        {
            "id": "int-2",
            "name": "Garda Vetting National Bureau Adapter",
            "service_type": "BACKGROUND_CHECK",
            "is_mocked": True,
            "status": "HEALTHY_SANDBOX",
            "last_sync": datetime.utcnow().isoformat(),
            "disclaimer": "Demo verification sandbox."
        },
        {
            "id": "int-3",
            "name": "Google Maps & Route Geocoding Adapter",
            "service_type": "GEOCODING_MAPS",
            "is_mocked": True,
            "status": "HEALTHY_SANDBOX",
            "last_sync": datetime.utcnow().isoformat(),
            "disclaimer": "Simulated route distance provider."
        },
        {
            "id": "int-4",
            "name": "MediOracle Document OCR Extraction Adapter",
            "service_type": "OCR_TIMESHEET_SCAN",
            "is_mocked": True,
            "status": "HEALTHY_SANDBOX",
            "last_sync": datetime.utcnow().isoformat(),
            "disclaimer": "Simulated OCR parser."
        },
        {
            "id": "int-5",
            "name": "SEPA Instant-Pay Banking Adapter",
            "service_type": "PAYMENT_GATEWAY",
            "is_mocked": True,
            "status": "HEALTHY_SANDBOX",
            "last_sync": datetime.utcnow().isoformat(),
            "disclaimer": "Simulated payment provider. No real money moved."
        }
    ]
