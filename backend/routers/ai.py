from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from database import get_db
from models import Incident, DuplicateSuggestion, AuditLog
from schemas import AIClassifyRequest, AIClassifyResponse, DuplicateMergeRequest
from services.ai_engine import analyze_incident
from services.summary_generator import generate_community_summary
from services.risk_engine import evaluate_locality_risks
from services.weather_service import CURRENT_SCENARIO

router = APIRouter(prefix="/ai", tags=["ai"])

@router.post("/classify", response_model=AIClassifyResponse)
async def classify_text(req: AIClassifyRequest):
    result = await analyze_incident(req.description, req.title or "", req.image_url)
    return result

@router.get("/duplicates")
def get_duplicates(db: Session = Depends(get_db)):
    suggestions = db.query(DuplicateSuggestion).filter(DuplicateSuggestion.status == "suggested").all()
    results = []
    for s in suggestions:
        inc1 = db.query(Incident).filter(Incident.id == s.primary_incident_id).first()
        inc2 = db.query(Incident).filter(Incident.id == s.duplicate_incident_id).first()
        if inc1 and inc2:
            results.append({
                "id": s.id,
                "primary_incident": inc1,
                "duplicate_incident": inc2,
                "similarity_score": s.similarity_score,
                "distance_meters": s.distance_meters,
                "reason": s.reason,
                "status": s.status,
                "created_at": s.created_at
            })
    return results

@router.post("/duplicates/resolve")
def resolve_duplicate(req: DuplicateMergeRequest, db: Session = Depends(get_db)):
    dup_entry = db.query(DuplicateSuggestion).filter(
        DuplicateSuggestion.primary_incident_id == req.primary_incident_id,
        DuplicateSuggestion.duplicate_incident_id == req.duplicate_incident_id
    ).first()

    if not dup_entry:
        raise HTTPException(status_code=404, detail="Duplicate suggestion not found.")

    if req.action == "merge":
        dup_entry.status = "merged"
        # Mark secondary incident as duplicate
        secondary = db.query(Incident).filter(Incident.id == req.duplicate_incident_id).first()
        primary = db.query(Incident).filter(Incident.id == req.primary_incident_id).first()
        if secondary and primary:
            secondary.status = "duplicate"
            secondary.duplicate_of_id = primary.id
            primary.confirmations_count += secondary.confirmations_count or 1
            primary.evidence_count += secondary.evidence_count or 0

            # Audit log
            audit = AuditLog(
                user_name="Administrator",
                user_role="admin",
                action="DUPLICATE_MERGE",
                entity_type="INCIDENT",
                entity_id=primary.reference_no,
                details=f"Merged duplicate report {secondary.reference_no} into primary incident {primary.reference_no}."
            )
            db.add(audit)
    else:
        dup_entry.status = "rejected"

    db.commit()
    return {"message": f"Duplicate suggestion marked as {dup_entry.status}"}

@router.get("/summary")
def get_ai_summary(db: Session = Depends(get_db)):
    incidents = db.query(Incident).all()
    risks = evaluate_locality_risks(incidents, CURRENT_SCENARIO)
    summary = generate_community_summary(incidents, risks)
    return summary
