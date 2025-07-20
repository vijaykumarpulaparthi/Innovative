from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class TransactionBase(BaseModel):
    """
    Base transaction schema.
    """
    date: datetime
    description: str = Field(..., max_length=255)
    amount: float
    category: Optional[str] = Field(None, max_length=100)
    transaction_type: str = Field(..., max_length=50)  # 'expense', 'income', 'investment'
    source: str = Field(..., max_length=100)  # 'manual', 'bank_statement'

class TransactionCreate(TransactionBase):
    """
    Transaction creation schema.
    """
    pass

class TransactionUpdate(BaseModel):
    """
    Transaction update schema.
    """
    date: Optional[datetime] = None
    description: Optional[str] = Field(None, max_length=255)
    amount: Optional[float] = None
    category: Optional[str] = Field(None, max_length=100)
    transaction_type: Optional[str] = Field(None, max_length=50)
    source: Optional[str] = Field(None, max_length=100)

class TransactionInDBBase(TransactionBase):
    """
    Base schema for transaction in database.
    """
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class Transaction(TransactionInDBBase):
    """
    Transaction response schema.
    """
    pass
