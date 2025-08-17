import re
import json
import hashlib
import base64
from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy.orm import Session


from app.models.transaction import Transaction
from app.services.chat import get_llm
from langchain_core.messages import HumanMessage, SystemMessage


def sanitize_bank_statement(text: str) -> Dict[str, Any]:
    """
    Remove and encrypt sensitive information before sending to LLM.
   
    Args:
        text: Raw bank statement text
       
    Returns:
        Dictionary containing sanitized text and mappings for restoration
    """
    sanitized_text = text
    mappings = {}
   
    # 1. Remove and encrypt account numbers (keep pattern for context)
    account_pattern = r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b|\b\d{10,20}\b'
    def encrypt_account(match):
        account_num = match.group()
        # Create a hash for internal reference
        account_hash = hashlib.sha256(account_num.encode()).hexdigest()[:8]
        encrypted_ref = f"ACCT_{account_hash}"
        mappings[encrypted_ref] = account_num
        return f"****-****-****-{account_num[-4:]}"  # Show only last 4 digits
   
    sanitized_text = re.sub(account_pattern, encrypt_account, sanitized_text)
   
    # 2. Remove routing numbers
    routing_pattern = r'\b\d{9}\b'
    sanitized_text = re.sub(routing_pattern, '*********', sanitized_text)
   
    # 3. Remove Social Security Numbers
    ssn_pattern = r'\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b'
    sanitized_text = re.sub(ssn_pattern, '***-**-****', sanitized_text)
   
    # 4. Remove phone numbers
    phone_pattern = r'\b\(?[\d\s\-\(\)]{10,15}\b'
    sanitized_text = re.sub(phone_pattern, '(***) ***-****', sanitized_text)
   
    # 5. Remove email addresses
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    sanitized_text = re.sub(email_pattern, '****@****.com', sanitized_text)
   
    # 6. Remove full addresses (but keep city for context)
    # Remove street addresses but keep city/state for geographic context
    address_pattern = r'\b\d+\s+[A-Za-z0-9\s,]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Circle|Cir|Court|Ct|Place|Pl)\b'
    sanitized_text = re.sub(address_pattern, '[STREET ADDRESS REMOVED]', sanitized_text, flags=re.IGNORECASE)
   
    # 7. Remove names (common patterns) but keep business names for categorization
    # Remove full names in "First Last" format but preserve business names
    name_pattern = r'\b[A-Z][a-z]+ [A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b'
    def anonymize_name(match):
        name = match.group()
        # Don't remove if it looks like a business name (contains certain keywords)
        business_keywords = ['Bank', 'Corp', 'LLC', 'Inc', 'Company', 'Store', 'Market', 'Restaurant',
                           'Gas', 'Station', 'Pharmacy', 'Hospital', 'University', 'School', 'Hotel',
                           'Walmart', 'Amazon', 'Starbucks', 'Netflix', 'McDonald', 'Shell', 'Target',
                           'CVS', 'Kroger', 'Uber', 'Lyft', 'PayPal', 'Venmo', 'Zelle', 'Chase',
                           'Wells', 'Fargo', 'Citibank', 'BOA', 'Deposit', 'Withdrawal', 'Transfer']
        if any(keyword.lower() in name.lower() for keyword in business_keywords):
            return name  # Keep business names
        return '[NAME REMOVED]'
   
    sanitized_text = re.sub(name_pattern, anonymize_name, sanitized_text)
   
    # 8. Remove specific personal identifiers in statement headers
    # Remove "Account Holder:" lines
    sanitized_text = re.sub(r'Account Holder:?\s*[^\n\r]*', 'Account Holder: [NAME REMOVED]', sanitized_text, flags=re.IGNORECASE)
   
    # 9. Remove check numbers (but keep for transaction matching)
    check_pattern = r'\bCheck\s*#?\s*\d+\b'
    sanitized_text = re.sub(check_pattern, 'Check #****', sanitized_text, flags=re.IGNORECASE)
   
    # 10. Remove credit card numbers (different from account numbers)
    cc_pattern = r'\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b'
    sanitized_text = re.sub(cc_pattern, lambda m: f"****-****-****-{m.group()[-4:]}", sanitized_text)
   
    # 11. Fix over-sanitization of common transaction descriptions
    # Restore common merchant names that got incorrectly removed
    merchant_fixes = {
        '[NAME REMOVED] Supercenter': 'Walmart Supercenter',
        '[NAME REMOVED] Coffee': 'Starbucks Coffee',
        '[NAME REMOVED] Subscription': 'Netflix Subscription',
        '[NAME REMOVED] Restaurant': 'McDonald\'s Restaurant',
        '[NAME REMOVED] Ride': 'Uber Ride',
        '[NAME REMOVED] Store': 'Target Store',
        'Direct [NAME REMOVED]': 'Direct Deposit'
    }
   
    for incorrect, correct in merchant_fixes.items():
        sanitized_text = sanitized_text.replace(incorrect, correct)
   
    return {
        'sanitized_text': sanitized_text,
        'mappings': mappings,
        'original_length': len(text),
        'sanitized_length': len(sanitized_text)
    }


def extract_transactions_from_pdf(pdf_path: str, user_id: int, db: Session) -> List[Transaction]:
    """
    Extract transactions from a bank statement PDF file using LLM for intelligent parsing.
   
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
       
        # Sanitize the text before sending to LLM
        sanitization_result = sanitize_bank_statement(text)
        sanitized_text = sanitization_result['sanitized_text']
       
        print(f"Data sanitization complete:")
        print(f"Original text length: {sanitization_result['original_length']} characters")
        print(f"Sanitized text length: {sanitization_result['sanitized_length']} characters")
        print(f"Encrypted {len(sanitization_result['mappings'])} account references")
       
        # Use LLM to parse the sanitized document
        transactions_data = parse_transactions_with_llm(sanitized_text)
       
        # Convert LLM output to Transaction objects
        transactions = []
       
        for transaction_data in transactions_data:
            try:
                # Parse date from LLM output
                if isinstance(transaction_data.get('date'), str):
                    # Try multiple date formats
                    date_formats = ['%Y-%m-%d', '%m/%d/%Y', '%d/%m/%Y', '%Y-%m-%d %H:%M:%S']
                    date = None
                    for fmt in date_formats:
                        try:
                            date = datetime.strptime(transaction_data['date'].split()[0], fmt)
                            break
                        except ValueError:
                            continue
                   
                    if date is None:
                        # Fallback to current date if parsing fails
                        date = datetime.now()
                else:
                    date = datetime.now()
               
                # Create transaction object
                db_transaction = Transaction(
                    user_id=user_id,
                    date=date,
                    description=transaction_data.get('description', 'Unknown Transaction'),
                    amount=abs(float(transaction_data.get('amount', 0))),
                    category=transaction_data.get('category', 'Uncategorized'),
                    transaction_type=transaction_data.get('transaction_type', 'expense'),
                    source='bank_statement'
                )
               
                # Add to session
                db.add(db_transaction)
                transactions.append(db_transaction)
               
            except Exception as e:
                print(f"Error processing transaction: {transaction_data}, Error: {str(e)}")
                continue
       
        # Commit all transactions
        if transactions:
            db.commit()
           
            # Refresh all transactions to get their IDs
            for transaction in transactions:
                db.refresh(transaction)
            for transaction in transactions:
                db.refresh(transaction)
       
        return transactions
   
    except Exception as e:
        # Rollback the session in case of error
        db.rollback()
        # Re-raise the exception
        raise Exception(f"Error extracting transactions from PDF: {str(e)}")


def parse_transactions_with_llm(document_text: str) -> List[Dict[str, Any]]:
    """
    Use LLM to parse bank statement text and extract transaction data.
   
    Args:
        document_text: Raw text extracted from the PDF
       
    Returns:
        List of transaction dictionaries
    """
    try:
        llm = get_llm()
       
        system_message = """
        You are an expert financial data extraction specialist. Your task is to analyze bank statement text and extract individual transactions with detailed categorization.


        Extract each transaction and return a JSON array with the following format:
        [
            {
                "date": "YYYY-MM-DD",
                "description": "Transaction description",
                "amount": 123.45,
                "transaction_type": "income|expense|investment",
                "category": "Food & Dining|Transportation|Shopping|Entertainment|Healthcare|Utilities|Groceries|Gas|ATM|Transfer|Salary|Investment|Insurance|Education|Travel|Other"
            }
        ]


        Guidelines:
        1. Parse dates accurately and convert to YYYY-MM-DD format
        2. Extract clean, meaningful descriptions
        3. Determine if it's income, expense, or investment
        4. Categorize intelligently based on merchant names and descriptions
        5. Use positive numbers for amounts (we'll handle debit/credit logic)
        6. Skip headers, footers, balances, and non-transaction data
        7. Only include actual financial transactions


        Common categories to use:
        - Food & Dining: restaurants, cafes, food delivery
        - Transportation: gas, parking, uber, public transport
        - Shopping: retail stores, online shopping, clothing
        - Groceries: supermarkets, grocery stores
        - Entertainment: movies, games, subscriptions
        - Healthcare: medical, pharmacy, insurance
        - Utilities: electricity, water, internet, phone
        - ATM: cash withdrawals
        - Transfer: bank transfers, payments
        - Salary: paycheck, wages
        - Investment: stocks, bonds, retirement
        - Education: tuition, books, courses
        - Travel: hotels, flights, vacation
        - Other: miscellaneous expenses


        Return only valid JSON array, no explanations or additional text.
        """
       
        human_message = f"""
        Please analyze this bank statement text and extract all transactions:


        {document_text[:4000]}  # Limit text to avoid token limits
        """
       
        messages = [
            SystemMessage(content=system_message),
            HumanMessage(content=human_message)
        ]
       
        response = llm.invoke(messages)
       
        # Parse the JSON response
        try:
            # Clean the response to extract JSON
            response_text = response.content.strip()
           
            # Find JSON array in the response
            start_idx = response_text.find('[')
            end_idx = response_text.rfind(']') + 1
           
            if start_idx != -1 and end_idx != 0:
                json_text = response_text[start_idx:end_idx]
                transactions_data = json.loads(json_text)
               
                # Validate the structure
                if isinstance(transactions_data, list):
                    return transactions_data
                else:
                    print("LLM response is not a list")
                    return []
            else:
                print("No JSON array found in LLM response")
                return []
               
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON from LLM response: {str(e)}")
            print(f"LLM Response: {response.content}")
            return []
   
    except Exception as e:
        print(f"Error calling LLM for transaction parsing: {str(e)}")
        return []