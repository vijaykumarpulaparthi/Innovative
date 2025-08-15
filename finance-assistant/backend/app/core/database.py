from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker


from app.core.config import settings


# Create SQLAlchemy engine
engine = create_engine(settings.DATABASE_URI)


# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Create Base class for database models
Base = declarative_base()


def create_tables():
    """
    Create all database tables.
    """
    # Import all models to ensure they're registered with SQLAlchemy
    from app.models import user, transaction
   
    # Create all tables
    Base.metadata.create_all(bind=engine)


def init_db():
    """
    Initialize the database by creating all tables.
    """
    create_tables()


# Dependency to get database session
def get_db():
    """
    Dependency for getting database session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()