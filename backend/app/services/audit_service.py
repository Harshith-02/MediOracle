from sqlalchemy.orm import Session
from app.models.audit import AuditEvent

def log_audit_event(
    db: Session,
    actor_user_id: str,
    actor_email: str,
    action: str,
    entity_name: str,
    entity_id: str,
    previous_value: dict | None = None,
    new_value: dict | None = None,
    reason: str | None = None,
    metadata_info: dict | None = None
) -> AuditEvent:
    audit_event = AuditEvent(
        actor_user_id=actor_user_id,
        actor_email=actor_email,
        action=action,
        entity_name=entity_name,
        entity_id=str(entity_id),
        previous_value=previous_value,
        new_value=new_value,
        reason=reason,
        metadata_info=metadata_info
    )
    db.add(audit_event)
    db.commit()
    db.refresh(audit_event)
    return audit_event
