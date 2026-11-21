from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from typing import List, Optional
from datetime import datetime
import random

from database import get_db
from models import Incident, IncidentUpdate, IncidentConfirmation, DuplicateSuggestion, AuditLog, Notification
from schemas import IncidentCreate, IncidentResponse, IncidentStatusUpdate, IncidentPriorityUpdate, IncidentConfirmationCreate
from services.priority_engine import calculate_priority_score
from services.ai_engine import analyze_incident
from services.duplicate_detector import evaluate_duplicate_pair
from services.weather_service import CURRENT_SCENARIO

router = APIRouter(prefix="/incidents", tags=["incidents"])

@router.get("", response_model=List[IncidentResponse])
def get_incidents(
    category: Optional[str] = None,
    status: Optional[str] = None,
    locality: Optional[str] = None,
    search: Optional[str] = None,
    severity: Optional[int] = None,
    min_priority: Optional[float] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Incident)

    if category and category != "All":
        query = query.filter(Incident.category == category)
    if status and status != "All":
        query = query.filter(Incident.status == status)
    if locality and locality != "All":
        query = query.filter(Incident.locality_name.ilike(f"%{locality}%"))
    if severity:
        query = query.filter(Incident.severity == severity)
    if min_priority:
        query = query.filter(Incident.priority_score >= min_priority)
    if search:
        s = f"%{search.lower()}%"
        query = query.filter(
            or_(
                Incident.title.ilike(s),
                Incident.description.ilike(s),
                Incident.locality_name.ilike(s),
                Incident.reference_no.ilike(s)
            )
        )
    
    return query.order_by(desc(Incident.priority_score), desc(Incident.created_at)).all()

@router.get("/{incident_id}")
def get_incident_detail(incident_id: int, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found.")
    
    updates = db.query(IncidentUpdate).filter(IncidentUpdate.incident_id == incident_id).order_by(IncidentUpdate.created_at).all()
    confirmations = db.query(IncidentConfirmation).filter(IncidentConfirmation.incident_id == incident_id).all()
    duplicates = db.query(DuplicateSuggestion).filter(
        or_(
            DuplicateSuggestion.primary_incident_id == incident_id,
            DuplicateSuggestion.duplicate_incident_id == incident_id
        )
    ).all()

    return {
        "incident": inc,
        "updates": updates,
        "confirmations": confirmations,
        "duplicate_suggestions": duplicates
    }

@router.post("", response_model=IncidentResponse)
async def create_incident(data: IncidentCreate, reporter_id: Optional[int] = None, reporter_name: Optional[str] = None, db: Session = Depends(get_db)):
    # 1. Run AI Analysis
    ai_result = await analyze_incident(data.description, data.title, data.photo_url)
    category = data.category or ai_result["category"]
    severity = data.severity or ai_result["severity"]
    urgency = data.urgency or ai_result["urgency"]
    title = data.title if len(data.title.strip()) > 3 else ai_result["suggested_title"]

    # 2. Generate unique reference number
    rand_suffix = random.randint(1000, 9999)
    reference_no = f"NX-2026-KL-{rand_suffix}"

    # 3. Compute initial transparent priority score
    weather_hazard = CURRENT_SCENARIO.get("hazard_level", 0.2)
    p_calc = calculate_priority_score(
        severity=severity,
        urgency=urgency,
        confirmations_count=0,
        evidence_count=1 if data.photo_url else 0,
        category=category,
        weather_hazard_level=weather_hazard
    )

    new_inc = Incident(
        reference_no=reference_no,
        title=title,
        description=data.description,
        category=category,
        severity=severity,
        urgency=urgency,
        status="submitted",
        latitude=data.latitude,
        longitude=data.longitude,
        locality_name=data.locality_name,
        landmark=data.landmark,
        address=data.address,
        photo_url=data.photo_url,
        reporter_id=reporter_id,
        reporter_name=reporter_name or ("Anonymous Resident" if data.is_anonymous else "Concerned Citizen"),
        is_anonymous=data.is_anonymous or False,
        language=data.language or "en",
        voice_transcript=data.voice_transcript,
        assigned_department=ai_result.get("suggested_department"),
        confirmations_count=1,
        evidence_count=1 if data.photo_url else 0,
        ai_confidence=ai_result.get("confidence", 0.88),
        ai_reasoning=f"AI classification: {ai_result.get('likely_issue_type')}. Recommended department: {ai_result.get('suggested_department')}.",
        ai_recommendations={
            "department": ai_result.get("suggested_department"),
            "immediate_action": "Field verification and safety perimeter setup",
            "supporting_observations": ai_result.get("supporting_observations", []),
            "verification_steps": ai_result.get("recommended_verification_steps", []),
            "expected_impact": ai_result.get("expected_impact", "")
        },
        priority_score=p_calc["priority_score"],
        priority_breakdown=p_calc,
        is_demo=False
    )
    db.add(new_inc)
    db.flush()

    # Initial history update
    update = IncidentUpdate(
        incident_id=new_inc.id,
        user_name=new_inc.reporter_name,
        user_role="citizen",
        previous_status=None,
        new_status="submitted",
        notes="Citizen submitted report via NEXUS Reporting System." + (" [Voice Transcription Recorded]" if data.voice_transcript else ""),
        photo_url=data.photo_url
    )
    db.add(update)

    # 4. Run Duplicate Check against recent open incidents
    existing_incidents = db.query(Incident).filter(
        Incident.id != new_inc.id,
        Incident.status.notin_(["resolved", "closed", "rejected"])
    ).all()

    for old_inc in existing_incidents:
        dup_eval = evaluate_duplicate_pair(old_inc, new_inc)
        if dup_eval["is_candidate"]:
            dup = DuplicateSuggestion(
                primary_incident_id=old_inc.id,
                duplicate_incident_id=new_inc.id,
                similarity_score=dup_eval["similarity_score"],
                distance_meters=dup_eval["distance_meters"],
                reason=dup_eval["reason"],
                status="suggested"
            )
            db.add(dup)

    # Add audit log
    audit = AuditLog(
        user_name=new_inc.reporter_name,
        user_role="citizen",
        action="INCIDENT_SUBMIT",
        entity_type="INCIDENT",
        entity_id=reference_no,
        details=f"New report '{title}' submitted in {data.locality_name}."
    )
    db.add(audit)

    # Notification for citizen
    if reporter_id:
        notif = Notification(
            user_id=reporter_id,
            title="Report Logged Successfully",
            message=f"Incident {reference_no} has been recorded and submitted for municipal verification.",
            incident_id=new_inc.id,
            type="success"
        )
        db.add(notif)

    db.commit()
    db.refresh(new_inc)
    return new_inc

@router.patch("/{incident_id}/status")
def update_incident_status(
    incident_id: int,
    update_data: IncidentStatusUpdate,
    user_name: Optional[str] = "Municipal Administrator",
    user_role: Optional[str] = "admin",
    db: Session = Depends(get_db)
):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found.")

    prev_status = inc.status
    inc.status = update_data.status
    inc.updated_at = datetime.utcnow()

    if update_data.assigned_department:
        inc.assigned_department = update_data.assigned_department
    if update_data.assigned_to:
        inc.assigned_to = update_data.assigned_to
    if update_data.status in ["resolved", "closed"]:
        inc.resolved_at = datetime.utcnow()
        if update_data.photo_url:
            inc.completion_photo_url = update_data.photo_url

    # Add update record
    history_entry = IncidentUpdate(
        incident_id=inc.id,
        user_name=user_name,
        user_role=user_role,
        previous_status=prev_status,
        new_status=update_data.status,
        notes=update_data.notes or f"Status changed from {prev_status} to {update_data.status}.",
        photo_url=update_data.photo_url
    )
    db.add(history_entry)

    # Audit log
    audit = AuditLog(
        user_name=user_name,
        user_role=user_role,
        action=f"STATUS_CHANGE_{update_data.status.upper()}",
        entity_type="INCIDENT",
        entity_id=inc.reference_no,
        details=f"Status transitioned from {prev_status} to {update_data.status} by {user_name} ({user_role})."
    )
    db.add(audit)

    # Notify reporter if registered
    if inc.reporter_id:
        notif = Notification(
            user_id=inc.reporter_id,
            title=f"Incident Status: {update_data.status.replace('_', ' ').capitalize()}",
            message=f"Your reported incident '{inc.title}' is now {update_data.status.replace('_', ' ')}.",
            incident_id=inc.id,
            type="info" if update_data.status != "resolved" else "success"
        )
        db.add(notif)

    db.commit()
    db.refresh(inc)
    return {"message": "Status updated successfully", "incident": inc}

@router.patch("/{incident_id}/priority")
def update_incident_priority(
    incident_id: int,
    priority_data: IncidentPriorityUpdate,
    user_name: Optional[str] = "Admin",
    db: Session = Depends(get_db)
):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found.")

    inc.priority_score = priority_data.priority_score
    inc.updated_at = datetime.utcnow()
    
    audit = AuditLog(
        user_name=user_name,
        user_role="admin",
        action="PRIORITY_OVERRIDE",
        entity_type="INCIDENT",
        entity_id=inc.reference_no,
        details=f"Priority adjusted to {priority_data.priority_score}. Reason: {priority_data.reason or 'Administrative review'}."
    )
    db.add(audit)
    db.commit()
    return {"message": "Priority updated", "priority_score": inc.priority_score}

@router.post("/{incident_id}/confirm")
def confirm_incident(
    incident_id: int,
    conf_data: IncidentConfirmationCreate,
    user_name: Optional[str] = "Citizen",
    db: Session = Depends(get_db)
):
    """Citizens confirm problem is still present or upload supporting observation."""
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found.")

    conf = IncidentConfirmation(
        incident_id=incident_id,
        notes=conf_data.notes,
        photo_url=conf_data.photo_url,
        still_present=conf_data.still_present
    )
    db.add(conf)

    inc.confirmations_count += 1
    if conf_data.photo_url:
        inc.evidence_count += 1

    # Recalculate priority score with updated community confirmations
    p_calc = calculate_priority_score(
        severity=inc.severity,
        urgency=inc.urgency,
        confirmations_count=inc.confirmations_count,
        evidence_count=inc.evidence_count,
        created_at=inc.created_at,
        category=inc.category
    )
    inc.priority_score = p_calc["priority_score"]
    inc.priority_breakdown = p_calc

    db.commit()
    return {
        "message": "Community confirmation recorded",
        "confirmations_count": inc.confirmations_count,
        "priority_score": inc.priority_score
    }
