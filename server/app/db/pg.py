# db.py
import os
from sqlalchemy import create_engine
from sqlalchemy_utils import database_exists, create_database
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


def ensure_database_exists():
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        raise ValueError("DATABASE_URL environment variable is not set.")
    engine = create_engine(database_url, echo=DB_ECHO)
    try:
        if not database_exists(engine.url):
            create_database(engine.url)
            print("✅ Database created")
        else:
            print("ℹ️ Database already exists")
    except Exception as e:
        print(f"❌ Error checking/creating database: {e}")
        raise
    return engine

# Call this once at app startup
engine = ensure_database_exists()

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