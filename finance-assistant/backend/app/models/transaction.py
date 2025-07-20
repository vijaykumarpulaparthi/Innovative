from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base

class Transaction(Base):
    """
    Financial transaction database model.
    """
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(DateTime, nullable=False)
    description = Column(String(255), nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String(100), nullable=True)
    transaction_type = Column(String(50), nullable=False)  # 'expense', 'income', 'investment'
    source = Column(String(100), nullable=False)  # 'manual', 'bank_statement'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationship
    user = relationship("User", back_populates="transactions")

# Add relationship to User model
from app.models.user import User
User.transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
