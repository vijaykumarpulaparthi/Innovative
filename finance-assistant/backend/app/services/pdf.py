import re
from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy.orm import Session

from app.models.transaction import Transaction

def extract_transactions_from_pdf(pdf_path: str, user_id: int, db: Session) -> List[Transaction]:
    """
    Extract transactions from a bank statement PDF file.
    
    Args:
        pdf_path: Path to the PDF file
        user_id: User ID
        db: Database session
        
    Returns:
        List of extracted Transaction objects
    """
    try:
        # Import necessary libraries for PDF extraction
        from pypdf import PdfReader
        from pdfminer.high_level import extract_text
        
        # Use pdfminer for text extraction
        text = extract_text(pdf_path)
        
        # Process the extracted text to identify transactions
        transactions = []
        
        # This is a simplified example - in a real implementation, you would need
        # more sophisticated parsing based on the specific bank statement format
        # For now, we'll use a simple regex pattern to extract date, description, and amount
        
        # Example pattern for matching transaction lines
        # This should be adapted based on the specific bank statement format
        pattern = r'(\d{2}/\d{2}/\d{4})\s+([^0-9$]+)\s+(\$?\d+\.\d{2})'
        
        for match in re.finditer(pattern, text):
            date_str, description, amount_str = match.groups()
            
            # Parse date
            date = datetime.strptime(date_str, '%m/%d/%Y')
            
            # Clean up description
            description = description.strip()
            
            # Parse amount
            amount = float(amount_str.replace('$', ''))
            
            # Determine transaction type based on amount
            transaction_type = 'expense' if amount < 0 else 'income'
            
            # For simplicity, use a fixed category
            # In a real implementation, you might use a categorization algorithm
            category = 'Uncategorized'
            
            # Create transaction object
            db_transaction = Transaction(
                user_id=user_id,
                date=date,
                description=description,
                amount=abs(amount),  # Store as positive value
                category=category,
                transaction_type=transaction_type,
                source='bank_statement'
            )
            
            # Add to session
            db.add(db_transaction)
            transactions.append(db_transaction)
        
        # Commit all transactions
        db.commit()
        
        # Refresh all transactions to get their IDs
        for transaction in transactions:
            db.refresh(transaction)
        
        return transactions
    
    except Exception as e:
        # Rollback the session in case of error
        db.rollback()
        # Re-raise the exception
        raise Exception(f"Error extracting transactions from PDF: {str(e)}")
