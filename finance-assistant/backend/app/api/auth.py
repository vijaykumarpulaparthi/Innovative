from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session


from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, verify_api_key
from app.models.user import User
from app.schemas.user import UserCreate, User as UserSchema


router = APIRouter()


@router.post("/register", response_model=UserSchema)
def register(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key)
):
    """
    Register a new user (requires API key).
    """
    # Check if user already exists
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
   
    # Create new user
    db_user = User(
        email=user_in.email,
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        hashed_password=get_password_hash(user_in.password),
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.post("/validate-api-key")
def validate_api_key(api_key: str = Depends(verify_api_key)):
    """
    Validate API key endpoint.
    """
    return {"message": "API key is valid", "status": "authenticated"}
