from database import engine
from models import Base

# Create all tables
if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    print("Database and tables created.") 