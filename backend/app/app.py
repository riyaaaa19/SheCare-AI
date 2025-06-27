from fastapi import FastAPI, HTTPException, Depends, status, Body, APIRouter, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import json
from typing import List, Optional
import os
from dotenv import load_dotenv
from .models import User, PCOSCheck, CycleEntry, JournalEntry, Recommendation
from .database import SessionLocal, engine
from . import models
import requests

# Absolute path to .env
env_path = os.path.join(os.path.dirname(__file__), ".env")
print("Looking for .env at:", env_path)
load_dotenv(dotenv_path=env_path)

# Ensure tables are created using the correct Base
models.Base.metadata.create_all(bind=engine)

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
    age: int = None
    weight: int = None
    cycle_length: int = None
    bio: str = None
    
    class Config:
        from_attributes = True

class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str = None
    age: int = None
    weight: int = None
    cycle_length: int = None
    bio: str = None
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    
    class Config:
        from_attributes = True

class TokenData(BaseModel):
    user_id: int = None
    
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    full_name: str = None
    email: EmailStr = None
    password: str = None
    age: int = None
    weight: int = None
    cycle_length: int = None
    bio: str = None
    
    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    
    class Config:
        from_attributes = True

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
    
    class Config:
        from_attributes = True

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
    
    class Config:
        from_attributes = True

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
    if "user_id" in to_encode:
        to_encode["sub"] = str(to_encode.pop("user_id"))
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
        user_id: int = payload.get("sub") or payload.get("id")
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
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not pwd_context.verify(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    access_token = create_access_token(
        data={"user_id": user.id},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=UserOut)
def read_users_me(current_user: User = Depends(get_current_user)):
    return UserOut.from_orm(current_user)

@app.get("/dashboard")
def dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Get last cycle entry
    last_cycle = db.query(CycleEntry).filter(CycleEntry.user_id == current_user.id).order_by(CycleEntry.start_date.desc()).first()
    if last_cycle:
        cycle_day = (datetime.utcnow().date() - last_cycle.start_date.date()).days + 1
    else:
        cycle_day = "-"
    # Get last mood
    last_journal = db.query(JournalEntry).filter(JournalEntry.user_id == current_user.id).order_by(JournalEntry.date.desc()).first()
    mood = last_journal.mood if last_journal else "-"
    # Get last PCOS risk
    last_pcos = db.query(PCOSCheck).filter(PCOSCheck.user_id == current_user.id).order_by(PCOSCheck.date.desc()).first()
    pcos_risk = last_pcos.risk if last_pcos else "-"
    return {
        "id": current_user.id,
        "name": current_user.full_name or current_user.email.split("@")[0],
        "cycleDay": cycle_day,
        "mood": mood,
        "pcosRisk": pcos_risk
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
    entries = db.query(CycleEntry).filter(
        CycleEntry.user_id == current_user.id,
        CycleEntry.deleted == False
    ).order_by(CycleEntry.start_date.desc()).all()
    return entries

@app.delete("/cycle-tracker/{entry_id}")
def delete_cycle_entry(entry_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    entry = db.query(CycleEntry).filter(CycleEntry.id == entry_id, CycleEntry.user_id == current_user.id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Cycle entry not found")
    entry.deleted = True
    db.commit()
    return {"message": "Cycle entry soft-deleted"}

@app.get("/dev/cycle-tracker")
def get_all_cycle_entries(db: Session = Depends(get_db)):
    entries = db.query(CycleEntry).order_by(CycleEntry.start_date.desc()).all()
    return [
        {
            "id": e.id,
            "user_id": e.user_id,
            "start_date": e.start_date,
            "end_date": e.end_date,
            "notes": e.notes,
            "deleted": e.deleted
        } for e in entries
    ]

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
    entries = db.query(JournalEntry).filter(
        JournalEntry.user_id == current_user.id,
        JournalEntry.deleted == False
    ).order_by(JournalEntry.date.desc()).all()
    return entries

@app.get("/dev/journal")
def get_all_journal_entries(db: Session = Depends(get_db)):
    entries = db.query(JournalEntry).order_by(JournalEntry.date.desc()).all()
    return [
        {
            "id": e.id,
            "user_id": e.user_id,
            "date": e.date,
            "mood": e.mood,
            "text": e.text,
            "deleted": e.deleted
        } for e in entries
    ]

@app.delete("/journal/{entry_id}")
def delete_journal_entry(entry_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    entry = db.query(JournalEntry).filter(JournalEntry.id == entry_id, JournalEntry.user_id == current_user.id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    entry.deleted = True
    db.commit()
    return {"message": "Journal entry soft-deleted"}

# Recommendations endpoint
@app.get("/recommendations", response_model=List[RecommendationOut])
def get_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    recs = []

    # Cycle analysis (only one cycle recommendation per response)
    cycles = db.query(CycleEntry).filter(CycleEntry.user_id == current_user.id).order_by(CycleEntry.start_date).all()
    if cycles and len(cycles) > 1 and not any(r.type == "cycle" for r in recs):
        cycle_lengths = [
            (cycles[i].start_date - cycles[i-1].start_date).days
            for i in range(1, len(cycles))
        ]
        avg_length = sum(cycle_lengths) / len(cycle_lengths)
        cycle_rec_added = False
        if avg_length < 25:
            recs.append(RecommendationOut(
                id=0, type="cycle", text="🩺 Your cycles are shorter than average. Consider consulting a gynecologist.", date=datetime.utcnow()
            ))
            cycle_rec_added = True
        elif avg_length > 35 and not cycle_rec_added:
            recs.append(RecommendationOut(
                id=1, type="cycle", text="📆 Your cycles are longer than average. Track ovulation and consult a doctor if cycles are very irregular.", date=datetime.utcnow()
            ))
            cycle_rec_added = True
        elif max(cycle_lengths) - min(cycle_lengths) > 7 and not cycle_rec_added:
            recs.append(RecommendationOut(
                id=8, type="cycle", text="🔄 Your cycle length varies significantly. Consider tracking for possible irregularities.", date=datetime.utcnow()
            ))
            cycle_rec_added = True
        elif 25 <= avg_length <= 35 and not cycle_rec_added:
            recs.append(RecommendationOut(
                id=9, type="cycle", text="📆 Your cycles are within the normal range.", date=datetime.utcnow()
            ))
            cycle_rec_added = True

    # Mood analysis
    journals = db.query(JournalEntry).filter(JournalEntry.user_id == current_user.id).all()
    negative_moods = [j for j in journals if j.mood and j.mood.lower() in ["sad", "stressed", "anxious"]]
    if len(negative_moods) > 3 and not any(r.type == "mood" for r in recs):
        recs.append(RecommendationOut(
            id=2, type="mood", text="😊 You've reported frequent stress – try journaling, meditation, and relaxing activities.", date=datetime.utcnow()
        ))
    if len(negative_moods) > 3 and not any(r.type == "support" for r in recs):
        recs.append(RecommendationOut(
            id=7, type="support", text="💬 You've reported feeling down several times. Consider self-care or talking to a professional.", date=datetime.utcnow()
        ))
    if len(negative_moods) > 7 and not any(r.type == "support" for r in recs):
        recs.append(RecommendationOut(
            id=17, type="support", text="🤝 If you're feeling down often, consider reaching out to a mental health professional for support.", date=datetime.utcnow()
        ))

    # Hydration & Nutrition
    symptom_texts = [j.text.lower() for j in journals if j.text]
    if any("headache" in t or "fatigue" in t or "cramp" in t for t in symptom_texts) and not any(r.type == "wellness" for r in recs):
        recs.append(RecommendationOut(
            id=3, type="wellness", text="🥗💧 You've reported headaches, fatigue, or cramps. Make sure you're staying hydrated and eating balanced meals.", date=datetime.utcnow()
        ))

    # Sleep & Rest
    if any("tired" in t or "sleep" in t or "rest" in t for t in symptom_texts) and not any(r.type == "rest" for r in recs):
        recs.append(RecommendationOut(
            id=6, type="rest", text="😴 You've mentioned tiredness or sleep. Prioritize rest and good sleep hygiene for better well-being.", date=datetime.utcnow()
        ))

    # Regular Logging
    now = datetime.utcnow()
    last_cycle = db.query(CycleEntry).filter(CycleEntry.user_id == current_user.id).order_by(CycleEntry.start_date.desc()).first()
    last_journal = db.query(JournalEntry).filter(JournalEntry.user_id == current_user.id).order_by(JournalEntry.date.desc()).first()
    if (not last_cycle or (now - last_cycle.start_date).days > 14) or (not last_journal or (now - last_journal.date).days > 14):
        recs.append(RecommendationOut(
            id=4, type="engagement", text="✍️ It's been a while since your last log. Regular tracking helps you spot patterns and trends!", date=datetime.utcnow()
        ))

    # Positive Reinforcement
    recent_journals = [j for j in journals if (now - j.date).days <= 30]
    if len(recent_journals) > 10:
        recs.append(RecommendationOut(
            id=5, type="motivation", text="🌟 Great job keeping track of your health! Consistent logging leads to better insights.", date=datetime.utcnow()
        ))

    # PCOS Risk Recommendation
    pcos_check = db.query(PCOSCheck).filter(PCOSCheck.user_id == current_user.id).order_by(PCOSCheck.date.desc()).first()
    if pcos_check and not any(r.type == "pcos" for r in recs):
        recs.append(RecommendationOut(
            id=100, type="pcos", text="🧬 Maintain a healthy diet, exercise regularly, and consult a gynecologist if concerned.", date=datetime.utcnow()
        ))

    # PMS Symptoms Recommendation
    if journals:
        pms_journals = [j for j in journals if "bloating" in (j.text or "") or "craving" in (j.text or "")]
        if pms_journals and not any(r.type == "symptom" for r in recs):
            recs.append(RecommendationOut(
                id=103, type="symptom", text="🍫 Bloating or cravings detected – avoid sugar/caffeine and drink more water before your period.", date=datetime.utcnow()
            ))

    # Hydration Recommendation
    hydration_journals = [j for j in journals if "water" in (j.text or "") or "hydration" in (j.text or "")]
    if journals and (not hydration_journals or (now - max(j.date for j in hydration_journals)).days > 2) and not any(r.type == "hydration" for r in recs):
        recs.append(RecommendationOut(
            id=104, type="hydration", text="💧 Aim for 6–8 glasses of water daily!", date=datetime.utcnow()
        ))

    # Default recommendation if none personalized
    if not recs:
        recs.append(RecommendationOut(
            id=99, type="general", text="📈 Log your cycle, mood, and symptoms to unlock personalized insights!", date=datetime.utcnow()
        ))

    return recs

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
    if update.age is not None:
        current_user.age = update.age
    if update.weight is not None:
        current_user.weight = update.weight
    if update.cycle_length is not None:
        current_user.cycle_length = update.cycle_length
    if update.bio is not None:
        current_user.bio = update.bio
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

# Temporary admin endpoint to view all users (for development only)
@app.get("/dev/users")
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [
        {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
        } for user in users
    ]

@app.post("/chatbot")
async def chatbot(request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Chatbot endpoint using Google Gemini Generative AI.
    Expects JSON: {"message": "user's question"}
    Returns: {"response": "AI reply"}
    """
    try:
        data = await request.json()
        user_message = data.get("message")
        if not user_message:
            raise HTTPException(status_code=400, detail="Message is required.")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid request body.")

    # Gather recent journal and cycle context for personalization
    recent_journals = db.query(JournalEntry).filter(JournalEntry.user_id == current_user.id).order_by(JournalEntry.date.desc()).limit(3).all()
    context = "\n".join([
        f"Journal ({j.date.date()}): Mood: {j.mood}, Text: {j.text}" for j in recent_journals
    ])
    prompt = f"User context:\n{context}\n\nUser question: {user_message}\n\nRespond as a friendly women's health assistant."

    # Call Gemini API (REST)
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    if not GEMINI_API_KEY:
        return {"response": "Gemini API key not set. Please set GEMINI_API_KEY in your .env file."}

    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=" + GEMINI_API_KEY
    payload = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    try:
        resp = requests.post(url, json=payload, timeout=15)
        resp.raise_for_status()
        gemini_data = resp.json()
        ai_reply = gemini_data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "Sorry, I couldn't generate a response.")
    except Exception as e:
        return {"response": f"Failed to get AI response: {str(e)}"}

    return {"response": ai_reply}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 