from fastapi import FastAPI, HTTPException, Depends, status, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
import json
from typing import List, Optional
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database setup
DATABASE_URL = "sqlite:///./shecare.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    pcos_checks = relationship("PCOSCheck", back_populates="user")
    cycle_entries = relationship("CycleEntry", back_populates="user")
    journal_entries = relationship("JournalEntry", back_populates="user")
    recommendations = relationship("Recommendation", back_populates="user")

class PCOSCheck(Base):
    __tablename__ = "pcos_checks"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(DateTime, default=datetime.utcnow)
    answers = Column(Text)
    risk = Column(String)
    tips = Column(Text)
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
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    type = Column(String)
    text = Column(Text)
    date = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="recommendations")

# Create tables
Base.metadata.create_all(bind=engine)

# FastAPI app
app = FastAPI(title="SheCare AI API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = os.getenv("SECRET_KEY", "shecare_secret_key_2024")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 1 week

# Pydantic models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str = None

class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str = None
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: int = None

class UserUpdate(BaseModel):
    full_name: str = None
    email: EmailStr = None
    password: str = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class PCOSCheckOut(BaseModel):
    id: int
    date: datetime
    answers: dict
    risk: str
    tips: List[str]
    
    class Config:
        from_attributes = True

class CycleEntryIn(BaseModel):
    start_date: datetime
    end_date: datetime = None
    notes: str = None

class CycleEntryOut(BaseModel):
    id: int
    start_date: datetime
    end_date: Optional[datetime] = None
    notes: Optional[str] = None
    
    class Config:
        from_attributes = True

class JournalEntryIn(BaseModel):
    date: datetime = None
    mood: str
    text: str
    analysis: str = None

class JournalEntryOut(BaseModel):
    id: int
    date: datetime
    mood: str
    text: str
    analysis: Optional[str] = None
    
    class Config:
        from_attributes = True

class RecommendationOut(BaseModel):
    id: int
    type: str
    text: str
    date: datetime
    
    class Config:
        from_attributes = True

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Utility functions
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(user_id=user_id)
    except JWTError:
        raise credentials_exception
    user = get_user_by_id(db, user_id=token_data.user_id)
    if user is None:
        raise credentials_exception
    return user

# API Endpoints
@app.get("/")
def read_root():
    return {"message": "Welcome to SheCare AI API", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "connected"}

@app.post("/auth/signup", response_model=UserOut)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered.")
    hashed_pw = pwd_context.hash(user.password)
    db_user = User(email=user.email, hashed_password=hashed_pw, full_name=user.full_name)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/auth/login", response_model=Token)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not pwd_context.verify(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=UserOut)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.get("/dashboard")
def dashboard(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.full_name or current_user.email.split("@")[0],
        "cycleDay": "-",
        "mood": "-",
        "pcosRisk": "-"
    }

# PCOS Checker endpoints
TIPS = {
    "Low": [
        "Maintain a balanced diet and regular exercise.",
        "Continue tracking your cycle and symptoms.",
        "Schedule regular checkups with your doctor."
    ],
    "Moderate": [
        "Consider consulting a gynecologist for further evaluation.",
        "Adopt a healthy lifestyle: balanced diet, exercise, stress management.",
        "Monitor symptoms and menstrual cycle closely."
    ],
    "High": [
        "Consult a healthcare provider for a detailed diagnosis and management plan.",
        "Discuss possible treatments and lifestyle changes.",
        "Seek support for emotional well-being if needed."
    ]
}

@app.post("/pcos-checker", response_model=PCOSCheckOut)
def create_pcos_check(
    form: dict = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    answers = form
    symptoms = answers.get("symptoms", [])
    if len(symptoms) > 3:
        risk = "High"
    elif len(symptoms) > 1:
        risk = "Moderate"
    else:
        risk = "Low"
    tips = TIPS[risk]
    db_check = PCOSCheck(
        user_id=current_user.id,
        answers=json.dumps(answers),
        risk=risk,
        tips=json.dumps(tips)
    )
    db.add(db_check)
    db.commit()
    db.refresh(db_check)
    return PCOSCheckOut(
        id=db_check.id,
        date=db_check.date,
        answers=json.loads(db_check.answers),
        risk=db_check.risk,
        tips=json.loads(db_check.tips)
    )

@app.get("/pcos-checker", response_model=List[PCOSCheckOut])
def get_pcos_checks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    checks = db.query(PCOSCheck).filter(PCOSCheck.user_id == current_user.id).order_by(PCOSCheck.date.desc()).all()
    return [
        PCOSCheckOut(
            id=chk.id,
            date=chk.date,
            answers=json.loads(chk.answers),
            risk=chk.risk,
            tips=json.loads(chk.tips)
        ) for chk in checks
    ]

# Cycle Tracker endpoints
@app.post("/cycle-tracker", response_model=CycleEntryOut)
def add_cycle_entry(
    entry: CycleEntryIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_entry = CycleEntry(
        user_id=current_user.id,
        start_date=entry.start_date,
        end_date=entry.end_date,
        notes=entry.notes
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

@app.get("/cycle-tracker", response_model=List[CycleEntryOut])
def get_cycle_entries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entries = db.query(CycleEntry).filter(CycleEntry.user_id == current_user.id).order_by(CycleEntry.start_date.desc()).all()
    return entries

# Journal endpoints
@app.post("/journal", response_model=JournalEntryOut)
def add_journal_entry(
    entry: JournalEntryIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_entry = JournalEntry(
        user_id=current_user.id,
        date=entry.date or datetime.utcnow(),
        mood=entry.mood,
        text=entry.text,
        analysis=entry.analysis
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

@app.get("/journal", response_model=List[JournalEntryOut])
def get_journal_entries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entries = db.query(JournalEntry).filter(JournalEntry.user_id == current_user.id).order_by(JournalEntry.date.desc()).all()
    return entries

# Chatbot endpoint
@app.post("/chatbot")
def chatbot():
    return {"message": "Chatbot feature coming soon!"}

# Recommendations endpoint
@app.get("/recommendations", response_model=List[RecommendationOut])
def get_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_recs = db.query(Recommendation).filter(Recommendation.user_id == current_user.id).all()
    global_recs = db.query(Recommendation).filter(Recommendation.user_id == None).all()
    return user_recs + global_recs

# Admin endpoints
@app.get("/admin/analytics")
def admin_analytics():
    return {"message": "Admin analytics coming soon!"}

@app.get("/admin/tips")
def admin_tips():
    return {"message": "Admin tips management coming soon!"}

@app.get("/admin/logs")
def admin_logs():
    return {"message": "Admin logs coming soon!"}

# Profile management
@app.get("/profile", response_model=UserOut)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@app.put("/profile", response_model=UserOut)
def update_profile(
    update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if update.full_name is not None:
        current_user.full_name = update.full_name
    if update.email is not None:
        existing = db.query(User).filter(User.email == update.email, User.id != current_user.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered.")
        current_user.email = update.email
    if update.password is not None:
        current_user.hashed_password = pwd_context.hash(update.password)
    
    db.commit()
    db.refresh(current_user)
    return current_user

@app.delete("/profile")
def delete_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db.delete(current_user)
    db.commit()
    return {"message": "Profile deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 