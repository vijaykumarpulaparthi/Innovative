# Finance Assistant Backend

FastAPI backend with LangChain and LangGraph integration for Finance Assistant application.

## Setup Instructions

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
```bash
# Windows
venv\Scripts\activate

# Linux/macOS
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the application:
```bash
uvicorn app.main:app --reload
```

## Project Structure

The FastAPI application is structured as follows:

```
app/
├── __init__.py
├── main.py                  # Main FastAPI application
├── api/                     # API endpoints
│   ├── __init__.py
│   ├── auth.py              # Authentication endpoints
│   ├── finance.py           # Finance data endpoints
│   ├── upload.py            # File upload endpoints
│   └── chat.py              # AI chat endpoints
├── core/                    # Core application components
│   ├── __init__.py
│   ├── config.py            # Application configuration
│   ├── security.py          # Security utilities
│   └── database.py          # Database connection
├── models/                  # Database models
│   ├── __init__.py
│   ├── user.py              # User model
│   ├── transaction.py       # Financial transaction model
│   └── ...
├── schemas/                 # Pydantic schemas
│   ├── __init__.py
│   ├── user.py              # User schemas
│   ├── transaction.py       # Transaction schemas
│   └── ...
├── services/                # Application services
│   ├── __init__.py
│   ├── auth.py              # Authentication service
│   ├── pdf.py               # PDF processing service
│   └── chat.py              # AI chat service
└── utils/                   # Utility functions
    ├── __init__.py
    └── helpers.py           # Helper functions
```

## Key Components

1. **Authentication API**: Handles user registration, login, and token management
2. **Finance API**: Retrieves and processes financial data
3. **Upload API**: Handles bank statement PDF uploads and extraction
4. **Chat API**: Provides AI-powered financial assistance using LangChain and LangGraph
5. **Database Models**: Define SQL Server database schema
6. **Services**: Implement core business logic

## Database

The application uses SQL Server as the database. The connection is configured in `app/core/database.py`.
