#!/usr/bin/env python3
"""
Simple Database Initialization Script
This script creates the SQLite database and tables without import issues.
"""

import os
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create SQLite database URL
DATABASE_URL = "sqlite:///./shecare.db"

# Create engine
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Create base class
Base = declarative_base()

# Define models
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    # Relationships
    pcos_checks = relationship("PCOSCheck", back_populates="user")
    cycle_entries = relationship("CycleEntry", back_populates="user")
    journal_entries = relationship("JournalEntry", back_populates="user")
    recommendations = relationship("Recommendation", back_populates="user")

class PCOSCheck(Base):
    __tablename__ = "pcos_checks"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(DateTime, default=datetime.utcnow)
    answers = Column(Text)  # Store as JSON string
    risk = Column(String)
    tips = Column(Text)  # Store as JSON string
    user = relationship("User", back_populates="pcos_checks") 

class CycleEntry(Base):
    __tablename__ = "cycle_entries"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=True)
    notes = Column(Text)
    user = relationship("User", back_populates="cycle_entries")

class JournalEntry(Base):
    __tablename__ = "journal_entries"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(DateTime, default=datetime.utcnow)
    mood = Column(String)
    text = Column(Text)
    analysis = Column(Text)
    user = relationship("User", back_populates="journal_entries")

class Recommendation(Base):
    __tablename__ = "recommendations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # null for global recs
    type = Column(String)
    text = Column(Text)
    date = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="recommendations")

def main():
    """Create all database tables"""
    print("🚀 SheCare AI Database Setup")
    print("=" * 40)
    print("Database type: SQLite")
    print()
    
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("✅ SQLite database created successfully!")
        print(f"📁 Database file: {os.path.abspath('shecare.db')}")
        print()
        print("🎉 Database setup completed successfully!")
        print("\nNext steps:")
        print("1. Start the server: python -m uvicorn main:app --reload")
        print("2. Access the API docs: http://localhost:8000/docs")
        return True
    except Exception as e:
        print(f"❌ Error creating database: {e}")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1) 