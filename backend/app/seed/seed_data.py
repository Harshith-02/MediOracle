from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.models.user import User
from app.models.facility import Organization, Facility, Site, Department, Ward, StaffingRequirement
from app.models.professional import ProfessionalProfile, Qualification, Credential, Availability, WorkHistory
from app.models.shift import Shift, Offer, Application, MatchScore, Booking
from app.models.timekeeping import ClockEvent, Timesheet
from app.models.finance import Budget, Invoice, InvoiceLine, Payment
from app.models.support import Notification, SupportCase
from app.models.audit import AuditEvent

def seed_initial_data(db: Session):
    # Check if already seeded
    if db.query(User).filter(User.email == "admin@medioracle.com").first():
        print("Database already contains seed data. Skipping seed execution.")
        return

    print("Seeding MediOracle master demonstration database...")

    # 1. Create Organization
    org = Organization(
        name="HSE Dublin South-East Hospital Network",
        code="HSE-DSE-01",
        billing_email="accounts@hsedublin.ie",
        country="Ireland"
    )
    db.add(org)
    db.flush()

    # 2. Create Facilities
    st_james = Facility(
        name="St. James's Hospital Dublin",
        facility_type="Hospital",
        organization_id=org.id,
        address="James Street, Dublin 8",
        city="Dublin",
        postal_code="D08 NHY1",
        latitude=53.3414,
        longitude=-6.2941,
        risk_status="YELLOW"
    )
    st_vincents = Facility(
        name="St. Vincent's University Hospital",
        facility_type="Hospital",
        organization_id=org.id,
        address="Elm Park, Dublin 4",
        city="Dublin",
        postal_code="D04 T6F4",
        latitude=53.3167,
        longitude=-6.2117,
        risk_status="GREEN"
    )
    carechoice = Facility(
        name="CareChoice Nursing & Residential Facility",
        facility_type="Nursing Home",
        organization_id=org.id,
        address="Malahide Road, Dublin 17",
        city="Dublin",
        postal_code="D17 W892",
        latitude=53.3981,
        longitude=-6.1921,
        risk_status="GREEN"
    )
    db.add_all([st_james, st_vincents, carechoice])
    db.flush()

    # 3. Create Sites & Departments & Wards for St. James
    site_main = Site(name="Main Clinical Complex", facility_id=st_james.id)
    db.add(site_main)
    db.flush()

    dep_icu = Department(name="Intensive & Critical Care Department", site_id=site_main.id)
    dep_surg = Department(name="Surgical & Post-Op Department", site_id=site_main.id)
    dep_er = Department(name="Emergency Medicine Department", site_id=site_main.id)
    db.add_all([dep_icu, dep_surg, dep_er])
    db.flush()

    ward_icu = Ward(name="St. Vincent ICU Ward", acuity_level="HIGH", bed_capacity=16, department_id=dep_icu.id)
    ward_surg = Ward(name="Cedars Surgical Ward", acuity_level="STANDARD", bed_capacity=24, department_id=dep_surg.id)
    ward_er = Ward(name="Emergency Care Unit", acuity_level="HIGH", bed_capacity=30, department_id=dep_er.id)
    db.add_all([ward_icu, ward_surg, ward_er])
    db.flush()

    # Staffing requirements
    req1 = StaffingRequirement(ward_id=ward_icu.id, role_name="Nurse", required_count=6, confirmed_count=5, shortage_count=1, shift_type="NIGHT")
    req2 = StaffingRequirement(ward_id=ward_er.id, role_name="Nurse", required_count=8, confirmed_count=6, shortage_count=2, shift_type="DAY")
    req3 = StaffingRequirement(ward_id=ward_surg.id, role_name="HCA", required_count=4, confirmed_count=4, shortage_count=0, shift_type="DAY")
    db.add_all([req1, req2, req3])

    # 4. Create Core Demo Users
    hashed_pwd = get_password_hash("Password123!")

    admin_user = User(
        email="admin@medioracle.com",
        hashed_password=hashed_pwd,
        full_name="Platform Admin",
        phone_number="+353 1 400 1000",
        is_active=True,
        is_verified=True,
        roles=["ADMIN", "RECRUITER", "BUSINESS_LEADER"],
        organization_id=org.id
    )
    facility_user = User(
        email="facility@stjames.ie",
        hashed_password=hashed_pwd,
        full_name="Dr. Mark Higgins (Ward Manager)",
        phone_number="+353 1 410 3000",
        is_active=True,
        is_verified=True,
        roles=["FACILITY"],
        facility_id=st_james.id,
        organization_id=org.id
    )
    compliance_user = User(
        email="compliance@medioracle.com",
        hashed_password=hashed_pwd,
        full_name="Aoife Brady (Compliance Officer)",
        phone_number="+353 1 400 2000",
        is_active=True,
        is_verified=True,
        roles=["COMPLIANCE"],
        organization_id=org.id
    )
    payroll_user = User(
        email="payroll@medioracle.com",
        hashed_password=hashed_pwd,
        full_name="Sean Connolly (Payroll Manager)",
        phone_number="+353 1 400 3000",
        is_active=True,
        is_verified=True,
        roles=["PAYROLL"],
        organization_id=org.id
    )
    support_user = User(
        email="support@medioracle.com",
        hashed_password=hashed_pwd,
        full_name="Sinead Brennan (Support Agent)",
        phone_number="+353 1 400 4000",
        is_active=True,
        is_verified=True,
        roles=["SUPPORT"],
        organization_id=org.id
    )
    db.add_all([admin_user, facility_user, compliance_user, payroll_user, support_user])
    db.flush()

    # 5. Create Healthcare Professionals (15 Profiles)
    prof_data = [
        ("nurse.sarah@medioracle.com", "Sarah Connor", "Nurse", "ICU", "NMBI-984210", 6, 42.0, 4.9, "FULLY_COMPLIANT", 53.3498, -6.2603),
        ("liam.obrien@medioracle.com", "Liam O'Brien", "Nurse", "Emergency", "NMBI-771239", 8, 44.0, 4.8, "FULLY_COMPLIANT", 53.3321, -6.2410),
        ("ciara.murphy@medioracle.com", "Ciara Murphy", "Nurse", "General Ward", "NMBI-652391", 4, 38.0, 4.7, "EXPIRING_SOON", 53.3512, -6.2801),
        ("patrick.walsh@medioracle.com", "Patrick Walsh", "HCA", "General Ward", None, 3, 24.0, 4.6, "FULLY_COMPLIANT", 53.3290, -6.2210),
        ("niamh.kelly@medioracle.com", "Niamh Kelly", "Nurse", "Pediatrics", "NMBI-883102", 5, 40.0, 5.0, "FULLY_COMPLIANT", 53.3610, -6.2450),
        ("aoife.byrne@medioracle.com", "Aoife Byrne", "Nurse", "ICU", "NMBI-441298", 7, 45.0, 4.9, "FULLY_COMPLIANT", 53.3100, -6.2700),
        ("sean.doyle@medioracle.com", "Sean Doyle", "Social Care Worker", "Mental Health", None, 5, 28.0, 4.5, "FULLY_COMPLIANT", 53.3700, -6.2100),
        ("siobhan.mccarthy@medioracle.com", "Siobhan McCarthy", "Midwife", "Maternity", "NMBI-332190", 9, 46.0, 4.9, "FULLY_COMPLIANT", 53.3200, -6.2900),
        ("conor.gallagher@medioracle.com", "Conor Gallagher", "Nurse", "Emergency", "NMBI-112930", 2, 36.0, 4.3, "NON_COMPLIANT", 53.3800, -6.2500),
        ("maeve.higgins@medioracle.com", "Maeve Higgins", "HCA", "Geriatrics", None, 4, 25.0, 4.8, "FULLY_COMPLIANT", 53.3300, -6.2000),
        ("eoin.ryan@medioracle.com", "Eoin Ryan", "Pharmacist", "Pharmacy", "PSI-99210", 10, 55.0, 5.0, "FULLY_COMPLIANT", 53.3400, -6.2300),
        ("sinead.walsh@medioracle.com", "Sinead Walsh", "Nurse", "ICU", "NMBI-554120", 3, 39.0, 4.7, "FULLY_COMPLIANT", 53.3500, -6.2700),
        ("cormac.oneill@medioracle.com", "Cormac O'Neill", "HCA", "Surgical", None, 2, 23.0, 4.4, "FULLY_COMPLIANT", 53.3150, -6.2250),
        ("fiona.brady@medioracle.com", "Fiona Brady", "Nurse", "General Ward", "NMBI-223140", 5, 37.0, 4.6, "FULLY_COMPLIANT", 53.3650, -6.2850),
        ("declan.sullivan@medioracle.com", "Declan Sullivan", "Nurse", "Theatre", "NMBI-991245", 11, 48.0, 4.9, "FULLY_COMPLIANT", 53.3050, -6.2550)
    ]

    profs = []
    for email, name, role, spec, pin, exp, rate, rating, comp, lat, lon in prof_data:
        u = User(
            email=email,
            hashed_password=hashed_pwd,
            full_name=name,
            phone_number=f"+353 87 {exp}00 {lat:.0f}",
            is_active=True,
            is_verified=True,
            roles=["PROFESSIONAL"],
            organization_id=org.id
        )
        db.add(u)
        db.flush()

        p = ProfessionalProfile(
            user_id=u.id,
            role_title=role,
            specialty=spec,
            nmbi_pin=pin,
            garda_vetting_ref=f"GV-2026-{exp}892",
            years_experience=exp,
            hourly_rate_min=rate,
            rating_average=rating,
            total_shifts_completed=exp * 12,
            reliability_score=98.5 if comp != "NON_COMPLIANT" else 72.0,
            compliance_status=comp,
            address=f"{exp * 3} Grand Canal Dock",
            city="Dublin",
            latitude=lat,
            longitude=lon,
            max_commute_km=35.0
        )
        db.add(p)
        db.flush()
        profs.append(p)

        # Credentials
        cred_nmbi = Credential(
            professional_id=p.id,
            credential_type="NMBI_PIN" if pin else "GARDA_VETTING",
            issuer="Nursing & Midwifery Board of Ireland" if pin else "An Garda Siochana National Vetting Bureau",
            document_ref=f"DOC-{p.id[:6].upper()}",
            verification_status="VERIFIED" if comp == "FULLY_COMPLIANT" else comp,
            issue_date=datetime.utcnow() - timedelta(days=300),
            expiry_date=datetime.utcnow() + timedelta(days=60 if comp == "EXPIRING_SOON" else ( -10 if comp == "NON_COMPLIANT" else 400))
        )
        db.add(cred_nmbi)

    db.flush()

    # 6. Create 20+ Shifts Across States
    now = datetime.utcnow()
    sarah = profs[0] # Sarah Connor ICU Nurse

    # Shift 1: The Master ICU Shift for Section 92 Demo Workflow!
    icu_shift = Shift(
        facility_id=st_james.id,
        ward_id=ward_icu.id,
        role_required="Nurse",
        specialty_required="ICU",
        start_time=now + timedelta(days=1, hours=7), # Tomorrow 07:00
        end_time=now + timedelta(days=1, hours=19),  # Tomorrow 19:00
        break_duration_minutes=30,
        hourly_rate=45.0,
        incentive_bonus=5.0,
        total_budget_allocated=545.0,
        acuity_level="HIGH",
        required_skills=["Ventilator Management", "Central Line Care", "ECG Analysis"],
        required_credentials=["NMBI_PIN", "BLS", "ACLS"],
        notes="High priority ICU coverage required for post-cardiac surgery patient ratio.",
        status="POSTED"
    )
    db.add(icu_shift)
    db.flush()

    # Create matching score record for Sarah on Master Shift
    match_sarah = MatchScore(
        shift_id=icu_shift.id,
        professional_id=sarah.id,
        overall_score=94.5,
        confidence_score=96.0,
        factor_breakdown={
            "specialty_match": 100.0,
            "distance_commute": 90.0,
            "availability": 95.0,
            "credentials": 100.0,
            "rating_reliability": 98.0,
            "rate_compatibility": 100.0
        },
        reasons=[
            "✓ Fully available for 12h day window",
            "✓ Specialty matched: ICU Nurse (RGN)",
            "✓ Required NMBI & ACLS credentials verified",
            "✓ Ideal commute: 8.2 km from St. James Hospital",
            "✓ Exceptional reliability rating: 4.9/5.0 stars"
        ],
        warnings=["⚠ Near weekly working hours threshold (36h/48h cap)"]
    )
    db.add(match_sarah)

    # Add 19 additional realistic shifts
    statuses = ["POSTED", "OFFERED", "CONFIRMED", "COMPLETED", "POSTED", "POSTED", "CONFIRMED", "COMPLETED"]
    roles = [("Nurse", "Emergency"), ("HCA", "General Ward"), ("Nurse", "Pediatrics"), ("Social Care Worker", "Mental Health")]
    
    for i in range(2, 22):
        r_role, r_spec = roles[i % len(roles)]
        s_status = statuses[i % len(statuses)]
        f_target = st_james if i % 2 == 0 else st_vincents
        w_target = ward_er if r_spec == "Emergency" else ward_surg
        
        st_date = now + timedelta(days=(i - 10), hours=8)
        en_date = st_date + timedelta(hours=12)
        
        sh = Shift(
            facility_id=f_target.id,
            ward_id=w_target.id,
            role_required=r_role,
            specialty_required=r_spec,
            start_time=st_date,
            end_time=en_date,
            break_duration_minutes=30,
            hourly_rate=38.0 + (i % 5) * 2.0,
            incentive_bonus=0.0 if i % 3 != 0 else 3.0,
            total_budget_allocated=(12 * 38.0) + 10.0,
            acuity_level="STANDARD",
            required_skills=["Patient Assessment", "Medication Admin"],
            required_credentials=["NMBI_PIN" if r_role == "Nurse" else "GARDA_VETTING"],
            status=s_status
        )
        db.add(sh)
        db.flush()

        if s_status in ["CONFIRMED", "COMPLETED"]:
            p_assigned = profs[i % len(profs)]
            bk = Booking(shift_id=sh.id, professional_id=p_assigned.id, confirmed_at=now - timedelta(days=2), status="CONFIRMED")
            db.add(bk)

            if s_status == "COMPLETED":
                ts = Timesheet(
                    shift_id=sh.id,
                    professional_id=p_assigned.id,
                    facility_id=f_target.id,
                    clock_in_time=st_date,
                    clock_out_time=en_date,
                    total_break_minutes=30,
                    total_hours_worked=11.5,
                    overtime_hours=0.0,
                    hourly_rate=sh.hourly_rate,
                    incentive_amount=sh.incentive_bonus,
                    total_gross_pay=(11.5 * sh.hourly_rate) + sh.incentive_bonus,
                    approval_state="LOCKED" if i % 2 == 0 else "SUBMITTED",
                    approved_at=now if i % 2 == 0 else None,
                    approved_by_user_id=facility_user.id if i % 2 == 0 else None
                )
                db.add(ts)

    # 7. Add Notifications
    n1 = Notification(user_id=sarah.user_id, title="New High Match Shift Offer", body="St. James Hospital posted an ICU Nurse shift matching 94.5% of your profile.", category="OFFER")
    n2 = Notification(user_id=facility_user.id, title="Staffing Shortage Warning", body="Emergency Care Unit requires 2 additional day shift nurses for tomorrow.", category="SYSTEM")
    db.add_all([n1, n2])

    # 8. Add Audit Events
    a1 = AuditEvent(actor_user_id=admin_user.id, actor_email=admin_user.email, action="SYSTEM_INITIALIZED", entity_name="System", entity_id="MEDIORACLE_SYS", new_value={"version": "1.0.0"})
    a2 = AuditEvent(actor_user_id=facility_user.id, actor_email=facility_user.email, action="SHIFT_CREATED", entity_name="Shift", entity_id=icu_shift.id, new_value={"role": "Nurse", "ward": "St. Vincent ICU"})
    db.add_all([a1, a2])

    db.commit()
    print("MediOracle master demonstration database successfully seeded!")
