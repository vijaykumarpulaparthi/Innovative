import os
import tempfile
from typing import List
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from sqlalchemy.orm import Session


from app.core.database import get_db
from app.core.security import verify_api_key, get_current_user_simple
from app.models.user import User
from app.services.pdf import extract_transactions_from_pdf
from app.schemas.transaction import Transaction as TransactionSchema


router = APIRouter()


@router.post("/bank-statement", response_model=List[TransactionSchema])
async def upload_bank_statement(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_simple),
    api_key: str = Depends(verify_api_key)
):
    """
    Upload and process a bank statement PDF.
    """
    if not file.filename.endswith('.pdf'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are allowed"
        )
   
    # Save the uploaded file to a temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp:
        temp_path = temp.name
        content = await file.read()
        temp.write(content)
   
    try:
        # Extract transactions from the PDF
        transactions = extract_transactions_from_pdf(temp_path, current_user.id, db)
        return transactions
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing PDF: {str(e)}"
        )
    finally:
        # Clean up the temporary file
        if os.path.exists(temp_path):
            os.unlink(temp_path)
