import os
from typing import List, Dict, Any, Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
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
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database Settings
    DATABASE_SERVER: str = os.environ.get("DATABASE_SERVER", "localhost")
    DATABASE_PORT: str = os.environ.get("DATABASE_PORT", "1433")
    DATABASE_USER: str = os.environ.get("DATABASE_USER", "sa")
    DATABASE_PASSWORD: str = os.environ.get("DATABASE_PASSWORD", "YourStrong@Passw0rd")
    DATABASE_NAME: str = os.environ.get("DATABASE_NAME", "finance_assistant")
    DATABASE_URI: str = f"mssql+pymssql://{DATABASE_USER}:{DATABASE_PASSWORD}@{DATABASE_SERVER}:{DATABASE_PORT}/{DATABASE_NAME}"
    
    # Azure Settings (for production)
    AZURE_STORAGE_CONNECTION_STRING: Optional[str] = os.environ.get("AZURE_STORAGE_CONNECTION_STRING")
    AZURE_STORAGE_CONTAINER_NAME: str = os.environ.get("AZURE_STORAGE_CONTAINER_NAME", "bank-statements")
    
    # OpenAI Settings
    OPENAI_API_KEY: Optional[str] = os.environ.get("OPENAI_API_KEY")
    OPENAI_API_BASE: Optional[str] = os.environ.get("OPENAI_API_BASE")  # For Azure OpenAI
    OPENAI_API_VERSION: Optional[str] = os.environ.get("OPENAI_API_VERSION")  # For Azure OpenAI
    OPENAI_API_TYPE: Optional[str] = os.environ.get("OPENAI_API_TYPE", "open_ai")  # open_ai or azure
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
