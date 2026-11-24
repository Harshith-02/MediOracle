from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.models import * # Ensure all models are registered
from app.seed.seed_data import seed_initial_data

from app.api.v1.auth import router as auth_router
from app.api.v1.facilities import router as facilities_router
from app.api.v1.shifts import router as shifts_router
from app.api.v1.matching import router as matching_router
from app.api.v1.compliance import router as compliance_router
from app.api.v1.timekeeping import router as timekeeping_router
from app.api.v1.finance import router as finance_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.support import router as support_router
from app.api.v1.audit import router as audit_router
from app.api.v1.integrations import router as integrations_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="MediOracle - AI-Powered Healthcare Workforce Management Portal REST API"
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(facilities_router, prefix=f"{settings.API_V1_STR}/facilities", tags=["Facilities & Wards"])
app.include_router(shifts_router, prefix=f"{settings.API_V1_STR}/shifts", tags=["Shifts & Lifecycle"])
app.include_router(matching_router, prefix=f"{settings.API_V1_STR}/matching", tags=["Intelligent Explainable Matching Engine"])
app.include_router(compliance_router, prefix=f"{settings.API_V1_STR}/compliance", tags=["Compliance & Credentials"])
app.include_router(timekeeping_router, prefix=f"{settings.API_V1_STR}/timekeeping", tags=["Digital Timekeeping & Timesheets"])
app.include_router(finance_router, prefix=f"{settings.API_V1_STR}/finance", tags=["Billing & Payments Ledger"])
app.include_router(analytics_router, prefix=f"{settings.API_V1_STR}/analytics", tags=["Workforce Analytics & Demand AI"])
app.include_router(support_router, prefix=f"{settings.API_V1_STR}/support", tags=["Support & Knowledge Base"])
app.include_router(audit_router, prefix=f"{settings.API_V1_STR}/audit", tags=["Immutable Audit Trail"])
app.include_router(integrations_router, prefix=f"{settings.API_V1_STR}/integrations", tags=["Integration Abstractions"])

@app.on_event("startup")
def startup_event():
    # Initialize database tables
    Base.metadata.create_all(bind=engine)
    # Seed initial demonstration data
    db = SessionLocal()
    try:
        seed_initial_data(db)
    finally:
        db.close()

@app.get("/")
def root():
    return {
        "message": "Welcome to MediOracle Healthcare Workforce Management API",
        "version": settings.VERSION,
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR
    }
