from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserBase(BaseModel):
    email: str
    full_name: str
    role: str = "citizen"
    locality: Optional[str] = "Kochi Central"
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True

class IncidentCreate(BaseModel):
    title: str
    description: str
    category: str
    severity: Optional[int] = 3
    urgency: Optional[str] = "medium"
    latitude: float
    longitude: float
    locality_name: str
    landmark: Optional[str] = None
    address: Optional[str] = None
    photo_url: Optional[str] = None
    is_anonymous: Optional[bool] = False
    language: Optional[str] = "en"
    voice_transcript: Optional[str] = None

class IncidentStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None
    photo_url: Optional[str] = None
    assigned_department: Optional[str] = None
    assigned_to: Optional[str] = None

class IncidentPriorityUpdate(BaseModel):
    priority_score: float
    reason: Optional[str] = None

class IncidentConfirmationCreate(BaseModel):
    notes: Optional[str] = None
    photo_url: Optional[str] = None
    still_present: bool = True

class IncidentResponse(BaseModel):
    id: int
    reference_no: str
    title: str
    description: str
    category: str
    severity: int
    urgency: str
    status: str
    latitude: float
    longitude: float
    locality_name: str
    landmark: Optional[str]
    address: Optional[str]
    photo_url: Optional[str]
    completion_photo_url: Optional[str]
    reporter_id: Optional[int]
    reporter_name: Optional[str]
    is_anonymous: bool
    language: str
    voice_transcript: Optional[str]
    assigned_department: Optional[str]
    assigned_to: Optional[str]
    confirmations_count: int
    evidence_count: int
    ai_confidence: Optional[float]
    ai_reasoning: Optional[str]
    ai_recommendations: Optional[Dict[str, Any]]
    priority_score: float
    priority_breakdown: Optional[Dict[str, Any]]
    duplicate_of_id: Optional[int]
    is_demo: bool
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime]

    class Config:
        from_attributes = True

class AIClassifyRequest(BaseModel):
    description: str
    title: Optional[str] = None
    image_url: Optional[str] = None
    language: Optional[str] = "en"

class AIClassifyResponse(BaseModel):
    category: str
    likely_issue_type: str
    severity: int
    urgency: str
    suggested_title: str
    confidence: float
    supporting_observations: List[str]
    recommended_verification_steps: List[str]
    suggested_department: str
    expected_impact: str
    is_simulated_ai: bool = False

class DuplicateMergeRequest(BaseModel):
    primary_incident_id: int
    duplicate_incident_id: int
    action: str = "merge" # merge or reject

class WeatherScenarioRequest(BaseModel):
    scenario: str # "monsoon_heavy", "moderate_rain", "clear_sky"
    rainfall_mm: float
