from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

app = FastAPI(
    title="Finance Assistant API",
    description="Backend API for Finance Assistant application",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint for health check.
    """
    return {"message": "Finance Assistant API is running"}

# Import and include API routers
from app.api.auth import router as auth_router
from app.api.finance import router as finance_router
from app.api.upload import router as upload_router
from app.api.chat import router as chat_router

app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(finance_router, prefix="/api/finance", tags=["Finance"])
app.include_router(upload_router, prefix="/api/upload", tags=["Upload"])
app.include_router(chat_router, prefix="/api/chat", tags=["Chat"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
