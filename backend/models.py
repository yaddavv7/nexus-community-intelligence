import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="citizen") # citizen, admin, volunteer
    locality = Column(String(255), default="Kochi Central")
    phone = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    incidents = relationship("Incident", back_populates="reporter")

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    reference_no = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False, index=True)
    # Categories:
    # 1. Road damage and potholes
    # 2. Drainage and waterlogging
    # 3. Garbage and waste management
    # 4. Water supply problems
    # 5. Public infrastructure damage
    # 6. Electricity and street lighting
    # 7. Environmental pollution
    # 8. Public safety concerns
    # 9. Other community issues
    
    severity = Column(Integer, default=3) # 1 to 5
    urgency = Column(String(50), default="medium") # low, medium, high, critical
    status = Column(String(50), default="submitted", index=True) 
    # submitted -> under_review -> verified -> assigned -> in_progress -> resolved -> closed
    # rejected, duplicate, reopened

    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    locality_name = Column(String(255), nullable=False, index=True)
    landmark = Column(String(255), nullable=True)
    address = Column(String(500), nullable=True)

    photo_url = Column(Text, nullable=True)
    completion_photo_url = Column(Text, nullable=True)

    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    reporter_name = Column(String(255), default="Anonymous Resident")
    is_anonymous = Column(Boolean, default=False)
    language = Column(String(10), default="en") # en, ml
    voice_transcript = Column(Text, nullable=True)

    assigned_department = Column(String(100), nullable=True) # PWD, KSEB, KWA, Municipal Health, Police, etc.
    assigned_to = Column(String(255), nullable=True)

    confirmations_count = Column(Integer, default=0)
    evidence_count = Column(Integer, default=0)

    ai_confidence = Column(Float, default=0.88)
    ai_reasoning = Column(Text, nullable=True)
    ai_recommendations = Column(JSON, nullable=True)
    priority_score = Column(Float, default=50.0) # 0 to 100
    priority_breakdown = Column(JSON, nullable=True)

    duplicate_of_id = Column(Integer, ForeignKey("incidents.id"), nullable=True)
    is_demo = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    reporter = relationship("User", back_populates="incidents")
    updates = relationship("IncidentUpdate", back_populates="incident", cascade="all, delete-orphan")
    confirmations = relationship("IncidentConfirmation", back_populates="incident", cascade="all, delete-orphan")

class IncidentUpdate(Base):
    __tablename__ = "incident_updates"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user_name = Column(String(255), default="System")
    user_role = Column(String(50), default="system")
    previous_status = Column(String(50), nullable=True)
    new_status = Column(String(50), nullable=False)
    notes = Column(Text, nullable=True)
    photo_url = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    incident = relationship("Incident", back_populates="updates")

class IncidentConfirmation(Base):
    __tablename__ = "incident_confirmations"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user_ip = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    photo_url = Column(Text, nullable=True)
    still_present = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    incident = relationship("Incident", back_populates="confirmations")

class DuplicateSuggestion(Base):
    __tablename__ = "duplicate_suggestions"

    id = Column(Integer, primary_key=True, index=True)
    primary_incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    duplicate_incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    similarity_score = Column(Float, nullable=False) # 0 to 1
    distance_meters = Column(Float, nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String(50), default="suggested") # suggested, merged, rejected
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, index=True)
    locality_name = Column(String(255), nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    risk_type = Column(String(100), nullable=False) # e.g. "Flash Flood & Waterlogging Hazard", "Structural Deterioration Risk"
    risk_level = Column(String(50), default="medium") # low, medium, high, severe
    risk_score = Column(Float, default=65.0) # 0 to 100
    rainfall_mm = Column(Float, default=0.0)
    related_incidents_count = Column(Integer, default=1)
    evidence_summary = Column(Text, nullable=False)
    recommended_action = Column(Text, nullable=False)
    is_simulated = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=True)
    type = Column(String(50), default="info") # info, warning, success, priority
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    user_name = Column(String(255), default="System")
    user_role = Column(String(50), default="system")
    action = Column(String(100), nullable=False)
    entity_type = Column(String(100), nullable=False)
    entity_id = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
