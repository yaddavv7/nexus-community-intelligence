from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from database import get_db
from models import Notification

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("")
def get_notifications(db: Session = Depends(get_db)):
    return db.query(Notification).order_by(desc(Notification.created_at)).limit(20).all()

@router.post("/{notification_id}/read")
def mark_read(notification_id: int, db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"status": "success"}

@router.post("/read-all")
def mark_all_read(db: Session = Depends(get_db)):
    db.query(Notification).update({Notification.is_read: True})
    db.commit()
    return {"status": "all marked read"}
