from typing import List, Dict, Any, Optional
import os
from datetime import datetime

from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import END, StateGraph

from app.models.transaction import Transaction
from app.core.config import settings

# Configure the OpenAI client based on settings
def get_llm():
    """
    Get LLM based on configuration.
    """
    if settings.OPENAI_API_TYPE == "azure":
        return ChatOpenAI(
            model="gpt-4",
            temperature=0.7,
            api_key=settings.OPENAI_API_KEY,
            api_base=settings.OPENAI_API_BASE,
            api_version=settings.OPENAI_API_VERSION,
            api_type="azure"
        )
    else:
        return ChatOpenAI(
            model="gpt-4",
            temperature=0.7,
            api_key=settings.OPENAI_API_KEY
        )

# Create a state graph for the conversation
def create_conversation_graph():
    """
    Create a LangGraph conversation graph.
    """
    # Define the state
    class ConversationState(dict):
        user_id: str
        message: str
        transactions: List[Dict[str, Any]]
        context: Optional[Dict[str, Any]] = None
        response: Optional[str] = None
    
    # Define nodes
    def add_context(state):
        """Add financial context to the state."""
        transactions = state["transactions"]
        
        # Calculate financial metrics
        total_income = sum(t["amount"] for t in transactions if t["transaction_type"] == "income")
        total_expense = sum(t["amount"] for t in transactions if t["transaction_type"] == "expense")
        total_investment = sum(t["amount"] for t in transactions if t["transaction_type"] == "investment")
        
        # Group expenses by category
        expense_by_category = {}
        for t in transactions:
            if t["transaction_type"] == "expense":
                category = t["category"] or "Uncategorized"
                if category in expense_by_category:
                    expense_by_category[category] += t["amount"]
                else:
                    expense_by_category[category] = t["amount"]
        
        # Add context to state
        state["context"] = {
            "total_income": total_income,
            "total_expense": total_expense,
            "total_investment": total_investment,
            "net_savings": total_income - total_expense - total_investment,
            "expense_by_category": expense_by_category
        }
        
        return state
    
    def generate_response(state):
        """Generate a response using the LLM."""
        llm = get_llm()
        
        # Create system message with financial context
        context = state["context"]
        current_date = datetime.now().strftime("%B %d, %Y")
        
        system_message = f"""
        You are a helpful financial assistant. Today is {current_date}.
        
        The user has the following financial information:
        - Total Income: ${context['total_income']:.2f}
        - Total Expenses: ${context['total_expense']:.2f}
        - Total Investments: ${context['total_investment']:.2f}
        - Net Savings: ${context['net_savings']:.2f}
        
        Expense Breakdown by Category:
        {' '.join([f'- {cat}: ${amount:.2f}' for cat, amount in context['expense_by_category'].items()])}
        
        Provide helpful, concise financial advice and answer questions based on this data.
        Be professional but friendly. Keep responses under 3 paragraphs.
        """
        
        messages = [
            SystemMessage(content=system_message),
            HumanMessage(content=state["message"])
        ]
        
        response = llm.invoke(messages)
        state["response"] = response.content
        
        return state
    
    # Create the graph
    workflow = StateGraph(ConversationState)
    
    # Add nodes
    workflow.add_node("add_context", add_context)
    workflow.add_node("generate_response", generate_response)
    
    # Define edges
    workflow.add_edge("add_context", "generate_response")
    workflow.add_edge("generate_response", END)
    
    # Set entry point
    workflow.set_entry_point("add_context")
    
    return workflow.compile()

# Initialize the conversation graph
conversation_graph = create_conversation_graph()

async def generate_chat_response(user_id: int, message: str, transactions: List[Transaction]) -> str:
    """
    Generate a response to a user message using LangChain and LangGraph.
    
    Args:
        user_id: User ID
        message: User message
        transactions: List of user transactions
        
    Returns:
        Generated response
    """
    # Convert transactions to dictionaries
    transaction_dicts = []
    for t in transactions:
        transaction_dicts.append({
            "date": t.date.isoformat(),
            "description": t.description,
            "amount": t.amount,
            "category": t.category,
            "transaction_type": t.transaction_type,
            "source": t.source
        })
    
    # Create initial state
    initial_state = {
        "user_id": str(user_id),
        "message": message,
        "transactions": transaction_dicts
    }
    
    # Run the conversation graph
    result = conversation_graph.invoke(initial_state)
    
    return result["response"]
