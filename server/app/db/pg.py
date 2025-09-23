# db.py
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status

# Load environment variables
load_dotenv()

database_url = os.environ.get("DATABASE_URL")
if not database_url:
    raise ValueError("DATABASE_URL environment variable is not set.")

# Optional debug logging
DB_ECHO = os.environ.get("DB_ECHO", "false").lower() == "true"

# Create the SQLAlchemy engine (single instance)
engine = create_engine(database_url, echo=DB_ECHO)

# Session factory
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

# Base class for models
Base = declarative_base()


# Dependency function to use in FastAPI routes
from typing import Generator

def get_db() -> Generator[Session, None, None]:
    """
    Provide a transactional scope around a series of operations.
    Use in FastAPI route: db: Session = Depends(get_db)
    """
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )
    finally:
        db.close()