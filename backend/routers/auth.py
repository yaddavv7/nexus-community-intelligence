from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import UserCreate, UserLogin, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_data.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    
    new_user = User(
        email=user_data.email.lower(),
        password_hash=user_data.password, # For demo mode; production uses bcrypt hash
        full_name=user_data.full_name,
        role=user_data.role if user_data.role in ["citizen", "admin", "volunteer"] else "citizen",
        locality=user_data.locality or "Kochi Central",
        phone=user_data.phone,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login")
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email.lower()).first()
    if not user or user.password_hash != login_data.password:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    return {
        "token": f"nexus-token-{user.id}-{user.role}",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "locality": user.locality,
            "phone": user.phone
        }
    }

@router.get("/quick-switch/{role}")
def quick_switch_role(role: str, db: Session = Depends(get_db)):
    """Fast role switcher for judges and demo testing."""
    if role not in ["citizen", "admin", "volunteer"]:
        raise HTTPException(status_code=400, detail="Invalid role.")
    
    user = db.query(User).filter(User.role == role).first()
    if not user:
        raise HTTPException(status_code=404, detail="Default user for role not found.")
    
    return {
        "token": f"nexus-token-{user.id}-{user.role}",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "locality": user.locality,
            "phone": user.phone
        }
    }
