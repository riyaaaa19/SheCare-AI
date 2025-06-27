#!/usr/bin/env python3
"""
Database Setup Script for SheCare AI
This script helps you set up and initialize your database.
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def setup_sqlite():
    """Setup SQLite database (default)"""
    print("Setting up SQLite database...")
    
    # Import here to avoid circular imports
    try:
        from database import engine
        from models import Base
    except ImportError:
        # Try absolute imports if relative imports fail
        sys.path.append(os.path.dirname(os.path.abspath(__file__)))
        from database import engine
        from models import Base
    
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ SQLite database created successfully!")
        return True
    except Exception as e:
        print(f"❌ Error creating SQLite database: {e}")
        return False

def setup_postgresql():
    """Setup PostgreSQL database"""
    print("Setting up PostgreSQL database...")
    
    try:
        import psycopg2
    except ImportError:
        print("❌ psycopg2 not installed. Install it with: pip install psycopg2-binary")
        return False
    
    # Get PostgreSQL configuration
    host = os.getenv("POSTGRES_HOST", "localhost")
    port = os.getenv("POSTGRES_PORT", "5432")
    user = os.getenv("POSTGRES_USER", "shecare_user")
    password = os.getenv("POSTGRES_PASSWORD", "shecare_password")
    db_name = os.getenv("POSTGRES_DB", "shecare_db")
    
    # Create connection string
    connection_string = f"postgresql://{user}:{password}@{host}:{port}/{db_name}"
    
    try:
        # Test connection
        engine = create_engine(connection_string)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        
        # Create tables
        sys.path.append(os.path.dirname(os.path.abspath(__file__)))
        from models import Base
        Base.metadata.create_all(bind=engine)
        print("✅ PostgreSQL database setup successfully!")
        return True
        
    except OperationalError as e:
        print(f"❌ PostgreSQL connection failed: {e}")
        print("\nTo fix this:")
        print("1. Make sure PostgreSQL is installed and running")
        print("2. Create the database: CREATE DATABASE shecare_db;")
        print("3. Create the user: CREATE USER shecare_user WITH PASSWORD 'shecare_password';")
        print("4. Grant privileges: GRANT ALL PRIVILEGES ON DATABASE shecare_db TO shecare_user;")
        return False
    except Exception as e:
        print(f"❌ Error setting up PostgreSQL: {e}")
        return False

def setup_mysql():
    """Setup MySQL database"""
    print("Setting up MySQL database...")
    
    try:
        import pymysql
    except ImportError:
        print("❌ pymysql not installed. Install it with: pip install pymysql")
        return False
    
    # Get MySQL configuration
    host = os.getenv("MYSQL_HOST", "localhost")
    port = os.getenv("MYSQL_PORT", "3306")
    user = os.getenv("MYSQL_USER", "shecare_user")
    password = os.getenv("MYSQL_PASSWORD", "shecare_password")
    db_name = os.getenv("MYSQL_DB", "shecare_db")
    
    # Create connection string
    connection_string = f"mysql+pymysql://{user}:{password}@{host}:{port}/{db_name}"
    
    try:
        # Test connection
        engine = create_engine(connection_string)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        
        # Create tables
        sys.path.append(os.path.dirname(os.path.abspath(__file__)))
        from models import Base
        Base.metadata.create_all(bind=engine)
        print("✅ MySQL database setup successfully!")
        return True
        
    except OperationalError as e:
        print(f"❌ MySQL connection failed: {e}")
        print("\nTo fix this:")
        print("1. Make sure MySQL is installed and running")
        print("2. Create the database: CREATE DATABASE shecare_db;")
        print("3. Create the user: CREATE USER 'shecare_user'@'localhost' IDENTIFIED BY 'shecare_password';")
        print("4. Grant privileges: GRANT ALL PRIVILEGES ON shecare_db.* TO 'shecare_user'@'localhost';")
        print("5. Flush privileges: FLUSH PRIVILEGES;")
        return False
    except Exception as e:
        print(f"❌ Error setting up MySQL: {e}")
        return False

def main():
    """Main setup function"""
    print("🚀 SheCare AI Database Setup")
    print("=" * 40)
    
    # Get database type from environment, default to sqlite
    db_type = os.getenv("DATABASE_TYPE", "sqlite").lower()
    
    print(f"Database type: {db_type}")
    print()
    
    if db_type == "sqlite":
        success = setup_sqlite()
    elif db_type == "postgresql":
        success = setup_postgresql()
    elif db_type == "mysql":
        success = setup_mysql()
    else:
        print(f"❌ Unknown database type: {db_type}")
        print("Supported types: sqlite, postgresql, mysql")
        return False
    
    if success:
        print("\n🎉 Database setup completed successfully!")
        print("\nNext steps:")
        print("1. Start the server: python -m uvicorn main:app --reload")
        print("2. Access the API docs: http://localhost:8000/docs")
    else:
        print("\n❌ Database setup failed!")
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 