from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

class UserBase(BaseModel):
    """
    Base user schema.
    """
    email: EmailStr
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)

class UserCreate(UserBase):
    """
    User creation schema.
    """
    password: str = Field(..., min_length=8)

class UserUpdate(BaseModel):
    """
    User update schema.
    """
    email: Optional[EmailStr] = None
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    password: Optional[str] = Field(None, min_length=8)
    is_active: Optional[bool] = None

class UserInDBBase(UserBase):
    """
    Base schema for user in database.
    """
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class User(UserInDBBase):
    """
    User response schema.
    """
    pass

class UserInDB(UserInDBBase):
    """
    User in database schema (includes hashed password).
    """
    hashed_password: str
