from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.user import User
from app.services.chat import generate_chat_response

router = APIRouter()

class ChatRequest(BaseModel):
    """
    Chat request schema.
    """
    message: str

class ChatResponse(BaseModel):
    """
    Chat response schema.
    """
    response: str

@router.post("/message", response_model=ChatResponse)
async def chat_message(
    chat_request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Send a message to the AI chat assistant.
    """
    try:
        # Get user's transaction data to provide context to the AI
        transactions = current_user.transactions
        
        # Generate response using LangChain
        response = await generate_chat_response(
            user_id=current_user.id,
            message=chat_request.message,
            transactions=transactions
        )
        
        return ChatResponse(response=response)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating chat response: {str(e)}"
        )
