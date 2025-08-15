import os
from pathlib import Path
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
# from pydantic_settings import BaseSettings


class Settings():
    """
    Application settings.
    """
   
    # API Settings
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "Finance Assistant"
   
    # CORS Settings
    CORS_ORIGINS: List[str] = ["http://localhost:4200"]  # Angular default port
   
    # Security Settings
    SECRET_KEY: str = os.environ.get("SECRET_KEY", "your-secret-key-for-development")
    API_KEY: str = os.environ.get("API_KEY", "finance-assistant-api-key-123")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
   
    # Database Settings
    DATABASE_SERVER: str = os.environ.get("DATABASE_SERVER")
    DATABASE_PORT: str = os.environ.get("DATABASE_PORT")
    DATABASE_NAME: str = os.environ.get("DATABASE_NAME")
    # For Windows Authentication with pyodbc
    DATABASE_URI: str = f"mssql+pyodbc://@{DATABASE_SERVER}/{DATABASE_NAME}?driver=ODBC+Driver+17+for+SQL+Server&trusted_connection=yes"
   
    # Azure Settings (for production)
    AZURE_STORAGE_CONNECTION_STRING: Optional[str] = os.environ.get("AZURE_STORAGE_CONNECTION_STRING")
    AZURE_STORAGE_CONTAINER_NAME: str = os.environ.get("AZURE_STORAGE_CONTAINER_NAME", "bank-statements")


    deployment_name = os.environ.get("AZURE_OPENAI_DEPLOYMENT_NAME")
    azure_endpoint = os.environ.get("AZURE_OPENAI_ENDPOINT")
    api_key = os.environ.get("AZURE_OPENAI_KEY")
    api_version = os.environ.get("AZURE_OPENAI_API_VERSION")


    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()