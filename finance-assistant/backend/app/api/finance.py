from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate, Transaction as TransactionSchema

router = APIRouter()

@router.post("/transactions", response_model=TransactionSchema)
def create_transaction(
    transaction_in: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new transaction for the current user.
    """
    db_transaction = Transaction(
        **transaction_in.dict(),
        user_id=current_user.id
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@router.get("/transactions", response_model=List[TransactionSchema])
def get_transactions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get transactions for the current user.
    """
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    return transactions

@router.get("/monthly-summary")
def get_monthly_summary(
    year: int,
    month: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get monthly summary of transactions for the current user.
    """
    # Get transactions for the specified month
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        extract('year', Transaction.date) == year,
        extract('month', Transaction.date) == month
    ).all()
    
    # Calculate totals
    total_income = sum(t.amount for t in transactions if t.transaction_type == 'income')
    total_expense = sum(t.amount for t in transactions if t.transaction_type == 'expense')
    total_investment = sum(t.amount for t in transactions if t.transaction_type == 'investment')
    
    # Group expenses by category
    expense_by_category = {}
    for t in transactions:
        if t.transaction_type == 'expense':
            category = t.category or 'Uncategorized'
            if category in expense_by_category:
                expense_by_category[category] += t.amount
            else:
                expense_by_category[category] = t.amount
    
    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "total_investment": total_investment,
        "net_savings": total_income - total_expense - total_investment,
        "expense_by_category": expense_by_category
    }

@router.get("/yearly-summary")
def get_yearly_summary(
    year: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get yearly summary of transactions for the current user.
    """
    # Get transactions for the specified year
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        extract('year', Transaction.date) == year
    ).all()
    
    # Group by month
    monthly_data = {i: {"income": 0, "expense": 0, "investment": 0} for i in range(1, 13)}
    
    for t in transactions:
        month = t.date.month
        if t.transaction_type == 'income':
            monthly_data[month]["income"] += t.amount
        elif t.transaction_type == 'expense':
            monthly_data[month]["expense"] += t.amount
        elif t.transaction_type == 'investment':
            monthly_data[month]["investment"] += t.amount
    
    # Calculate yearly totals
    yearly_totals = {
        "total_income": sum(data["income"] for data in monthly_data.values()),
        "total_expense": sum(data["expense"] for data in monthly_data.values()),
        "total_investment": sum(data["investment"] for data in monthly_data.values())
    }
    
    yearly_totals["net_savings"] = yearly_totals["total_income"] - yearly_totals["total_expense"] - yearly_totals["total_investment"]
    
    return {
        "monthly_data": monthly_data,
        "yearly_totals": yearly_totals
    }
