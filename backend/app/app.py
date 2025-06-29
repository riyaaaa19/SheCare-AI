from fastapi import FastAPI, HTTPException, Depends, status, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import List, Optional
import os
import json
from dotenv import load_dotenv
from .models import User, PCOSCheck, CycleEntry, JournalEntry, Recommendation
from .database import SessionLocal, engine
from . import models

# Load .env
env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=env_path)

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="SheCare AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY", "shecare_secret_key_2024")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

# --- Pydantic Schemas ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    age: Optional[int] = None
    weight: Optional[int] = None
    cycle_length: Optional[int] = None
    bio: Optional[str] = None

class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    age: Optional[int] = None
    weight: Optional[int] = None
    cycle_length: Optional[int] = None
    bio: Optional[str] = None

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    age: Optional[int] = None
    weight: Optional[int] = None
    cycle_length: Optional[int] = None
    bio: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None

class PCOSCheckIn(BaseModel):
    age: int
    weight: int
    symptoms: List[str]

class PCOSCheckOut(BaseModel):
    id: int
    date: datetime
    age: int
    weight: int
    answers: List[str]
    risk: str
    tips: Optional[List[str]] = None

    class Config:
        from_attributes = True

class CycleEntryIn(BaseModel):
    start_date: datetime
    end_date: Optional[datetime] = None
    notes: Optional[str] = None

class CycleEntryOut(BaseModel):
    id: int
    start_date: datetime
    end_date: Optional[datetime] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class JournalEntryIn(BaseModel):
    date: Optional[datetime] = None
    mood: str
    text: str

class JournalEntryOut(BaseModel):
    id: int
    date: datetime
    mood: str
    text: str

    class Config:
        from_attributes = True

class RecommendationOut(BaseModel):
    id: int
    type: str
    text: str
    date: datetime

    class Config:
        from_attributes = True

# --- Dependencies ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    if "user_id" in to_encode:
        to_encode["sub"] = str(to_encode.pop("user_id"))
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

from fastapi.security import OAuth2PasswordBearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub") or payload.get("id")
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(user_id=int(user_id))
    except JWTError:
        raise credentials_exception
    user = get_user_by_id(db, user_id=token_data.user_id)
    if user is None:
        raise credentials_exception
    return user

# --- API Endpoints ---

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
    db_user = User(
        email=user.email,
        hashed_password=hashed_pw,
        full_name=user.full_name,
        age=user.age,
        weight=user.weight,
        cycle_length=user.cycle_length,
        bio=user.bio
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/auth/login", response_model=Token)
def login(data: dict = Body(...), db: Session = Depends(get_db)):
    email = data.get("email")
    password = data.get("password")
    user = db.query(User).filter(User.email == email).first()
    if not user or not pwd_context.verify(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    access_token = create_access_token(
        data={"user_id": user.id},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=UserOut)
def read_users_me(current_user: User = Depends(get_current_user)):
    return UserOut.from_orm(current_user)

@app.get("/profile", response_model=UserOut)
def get_profile(current_user: User = Depends(get_current_user)):
    return UserOut.from_orm(current_user)

@app.put("/profile", response_model=UserOut)
def update_profile(
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    for field, value in data.dict(exclude_unset=True).items():
        if field == "password" and value:
            setattr(current_user, "hashed_password", pwd_context.hash(value))
        elif field != "password":
            setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return UserOut.from_orm(current_user)

# --- Dashboard ---
@app.get("/dashboard")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    latest_cycle = db.query(CycleEntry).filter(CycleEntry.user_id == current_user.id).order_by(CycleEntry.start_date.desc()).first()
    latest_journal = db.query(JournalEntry).filter(JournalEntry.user_id == current_user.id).order_by(JournalEntry.date.desc()).first()
    latest_pcos = db.query(PCOSCheck).filter(PCOSCheck.user_id == current_user.id).order_by(PCOSCheck.date.desc()).first()

    print("DEBUG latest_cycle:", latest_cycle)
    if latest_cycle:
        print("DEBUG latest_cycle.start_date:", latest_cycle.start_date)
    print("DEBUG latest_journal:", latest_journal)
    if latest_journal:
        print("DEBUG latest_journal.mood:", latest_journal.mood)
    print("DEBUG latest_pcos:", latest_pcos)
    if latest_pcos:
        print("DEBUG latest_pcos.risk:", latest_pcos.risk)

    return {
        "cycle_day": latest_cycle.start_date.strftime("%Y-%m-%d") if latest_cycle and latest_cycle.start_date else None,
        "mood": latest_journal.mood if latest_journal and latest_journal.mood else None,
        "pcos_risk": latest_pcos.risk if latest_pcos and latest_pcos.risk else None
    }

# --- PCOS Checker ---
@app.post("/pcos-checker", response_model=PCOSCheckOut)
def pcos_checker(
    data: PCOSCheckIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Risk logic
    risk = "Low"
    if "Irregular periods" in data.symptoms and "Weight gain" in data.symptoms:
        risk = "High"
    # Example tips
    tips = []
    if risk == "High":
        tips.append("Consult a gynecologist for further evaluation.")
        tips.append("Maintain a healthy diet and exercise regularly.")
    # Store answers as JSON string
    pcos_entry = PCOSCheck(
        user_id=current_user.id,
        date=datetime.utcnow(),
        answers=json.dumps(data.symptoms),
        risk=risk,
        tips=json.dumps(tips)
    )
    db.add(pcos_entry)
    db.commit()
    db.refresh(pcos_entry)
    # Return as PCOSCheckOut
    return PCOSCheckOut(
        id=pcos_entry.id,
        date=pcos_entry.date,
        age=getattr(pcos_entry, "age", data.age),
        weight=getattr(pcos_entry, "weight", data.weight),
        answers=data.symptoms,
        risk=pcos_entry.risk,
        tips=tips
    )

@app.delete("/pcos-checker/{pcos_id}")
def delete_pcos_check(
    pcos_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entry = db.query(PCOSCheck).filter(
        PCOSCheck.id == pcos_id,
        PCOSCheck.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="PCOS check not found.")
    db.delete(entry)
    db.commit()
    return {"message": "PCOS check deleted."}

# --- Cycle Tracker ---
@app.get("/cycle-tracker", response_model=List[CycleEntryOut])
def get_cycle_entries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(CycleEntry).filter(CycleEntry.user_id == current_user.id).all()

@app.post("/cycle-tracker", response_model=CycleEntryOut)
def add_cycle_entry(
    data: CycleEntryIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entry = CycleEntry(
        user_id=current_user.id,
        start_date=data.start_date,
        end_date=data.end_date,
        notes=data.notes
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

@app.delete("/cycle-tracker/{entry_id}")
def delete_cycle_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entry = db.query(CycleEntry).filter(
        CycleEntry.id == entry_id,
        CycleEntry.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Cycle entry not found.")
    db.delete(entry)
    db.commit()
    return {"message": "Cycle entry deleted."}

# --- Journal ---
@app.get("/journal", response_model=List[JournalEntryOut])
def get_journal_entries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(JournalEntry).filter(JournalEntry.user_id == current_user.id).all()

@app.post("/journal", response_model=JournalEntryOut)
def add_journal_entry(
    data: JournalEntryIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entry = JournalEntry(
        user_id=current_user.id,
        date=data.date or datetime.utcnow(),
        mood=data.mood,
        text=data.text
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

@app.delete("/journal/{journal_id}")
def delete_journal_entry(
    journal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entry = db.query(JournalEntry).filter(
        JournalEntry.id == journal_id,
        JournalEntry.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found.")
    db.delete(entry)
    db.commit()
    return {"message": "Journal entry deleted."}

# --- Recommendations ---
@app.get("/recommendations", response_model=List[RecommendationOut])
def get_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    recs = db.query(Recommendation).filter(Recommendation.user_id == current_user.id).all()
    # If no recommendations, return demo data
    if not recs:
        demo = [
            RecommendationOut(id=1, type="Health", text="Stay hydrated and exercise regularly.", date=datetime.utcnow()),
            RecommendationOut(id=2, type="Mental", text="Practice mindfulness and journaling.", date=datetime.utcnow())
        ]
        return demo
    return [RecommendationOut.from_orm(r) for r in recs]

@app.delete("/recommendations/{rec_id}")
def delete_recommendation(
    rec_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entry = db.query(Recommendation).filter(
        Recommendation.id == rec_id,
        Recommendation.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Recommendation not found.")
    db.delete(entry)
    db.commit()
    return {"message": "Recommendation deleted."}

@app.get("/debug/cycle-tracker")
def debug_cycle_entries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entries = db.query(CycleEntry).filter(CycleEntry.user_id == current_user.id).all()
    return [CycleEntryOut.from_orm(e) for e in entries]

@app.get("/debug/pcos-checker")
def debug_pcos_checks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entries = db.query(PCOSCheck).filter(PCOSCheck.user_id == current_user.id).all()
    result = []
    for p in entries:
        result.append({
            "id": p.id,
            "date": p.date,
            "answers": json.loads(p.answers) if p.answers else [],
            "risk": p.risk,
            "tips": json.loads(p.tips) if p.tips else []
        })
    return result
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)