from datetime import datetime, timedelta
from typing import Optional


from fastapi import Depends, HTTPException, status, Header
from fastapi.security import APIKeyHeader
from passlib.context import CryptContext
from sqlalchemy.orm import Session


from app.core.config import settings
from app.core.database import get_db
from app.models.user import User


# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# API Key authentication
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


def verify_password(plain_password, hashed_password):
    """
    Verify if the plain password matches the hashed password.
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    """
    Hash a password using bcrypt.
    """
    return pwd_context.hash(password)


def verify_api_key(api_key: str = Depends(api_key_header)):
    """
    Verify the API key from the request header.
    """
    if api_key is None or api_key != settings.API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key"
        )
    return api_key


def get_current_user_simple(db: Session = Depends(get_db)):
    """
    Get a default user for API key authentication.
    For now, returns the first active user or creates a default one.
    """
    # Try to get the first active user
    user = db.query(User).filter(User.is_active == True).first()
   
    if user is None:
        # Create a default user if none exists
        default_user = User(
            email="api@finance-assistant.com",
            first_name="API",
            last_name="User",
            hashed_password=get_password_hash("default_password"),
            is_active=True
        )
        db.add(default_user)
        db.commit()
        db.refresh(default_user)
        return default_user
   
    return user