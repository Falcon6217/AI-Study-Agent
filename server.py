"""
CogniStudy AI - Optional Python FastAPI Backend Server
Serves static frontend assets and provides optional server-side AI proxy routes.
"""

import os
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

app = FastAPI(
    title="CogniStudy AI Backend",
    description="Backend API and static server for CogniStudy AI Learning Assistant",
    version="1.0.0"
)

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AIRequest(BaseModel):
    prompt: str
    system_instruction: Optional[str] = "You are an elite study tutor."
    provider: Optional[str] = "local" # 'local', 'gemini', 'openai'
    api_key: Optional[str] = None
    model: Optional[str] = "gemini-1.5-flash"

class QuizRequest(BaseModel):
    topic: str
    num_questions: Optional[int] = 4

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "CogniStudy AI Backend",
        "version": "1.0.0"
    }

class UserRegisterRequest(BaseModel):
    id: Optional[str] = None
    name: str
    email: str
    password: str
    academic_focus: Optional[str] = "General Studies"
    avatar: Optional[str] = "🎓"
    avatar_bg: Optional[str] = "#6366f1"

class UserLoginRequest(BaseModel):
    email: str
    password: str

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    academic_focus: Optional[str] = None
    bio: Optional[str] = None
    avatar: Optional[str] = None
    avatar_bg: Optional[str] = None

import hashlib
import time

# In-memory database of users with demo scholar pre-seeded
USERS_DB: Dict[str, Dict[str, Any]] = {
    "alex.scholar@cogni.ai": {
        "id": "user_demo_01",
        "name": "Alex Chen",
        "email": "alex.scholar@cogni.ai",
        "password_hash": hashlib.sha256("Scholar2026!".encode("utf-8")).hexdigest(),
        "academic_focus": "Cognitive AI & Computer Science",
        "bio": "Passionate researcher exploring neural architectures and spaced repetition learning.",
        "avatar": "🧠",
        "avatar_bg": "#6366f1",
        "tier": "Level 4 Scholar",
        "streak": 7,
        "study_hours": 28.5,
        "joined_date": "Jan 2026"
    }
}

SESSIONS: Dict[str, str] = {} # token -> email

def hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode("utf-8")).hexdigest()

@app.post("/api/auth/register")
async def register(req: UserRegisterRequest):
    email = req.email.strip().lower()
    if email in USERS_DB:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    
    user_id = req.id or f"user_{int(time.time())}"
    user = {
        "id": user_id,
        "name": req.name.strip(),
        "email": email,
        "password_hash": hash_pw(req.password),
        "academic_focus": req.academic_focus or "General Studies",
        "bio": f"Studying {req.academic_focus or 'General Studies'} with CogniStudy AI.",
        "avatar": req.avatar or "🎓",
        "avatar_bg": req.avatar_bg or "#6366f1",
        "tier": "Level 1 Novice",
        "streak": 1,
        "study_hours": 0.5,
        "joined_date": time.strftime("%b %Y")
    }
    USERS_DB[email] = user
    token = f"token_{user_id}_{int(time.time())}"
    SESSIONS[token] = email

    safe_user = {k: v for k, v in user.items() if k != "password_hash"}
    return {"status": "success", "user": safe_user, "token": token}

@app.post("/api/auth/login")
async def login(req: UserLoginRequest):
    email = req.email.strip().lower()
    user = USERS_DB.get(email)
    if not user or user["password_hash"] != hash_pw(req.password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    token = f"token_{user['id']}_{int(time.time())}"
    SESSIONS[token] = email

    safe_user = {k: v for k, v in user.items() if k != "password_hash"}
    return {"status": "success", "user": safe_user, "token": token}

@app.get("/api/auth/me")
async def get_current_user(token: Optional[str] = None):
    if not token or token not in SESSIONS:
        raise HTTPException(status_code=401, detail="Unauthorized")
    email = SESSIONS[token]
    user = USERS_DB.get(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    safe_user = {k: v for k, v in user.items() if k != "password_hash"}
    return {"status": "success", "user": safe_user}

@app.post("/api/auth/logout")
async def logout(token: Optional[str] = None):
    if token and token in SESSIONS:
        del SESSIONS[token]
    return {"status": "success", "message": "Logged out successfully"}


# Mount static frontend root directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
app.mount("/", StaticFiles(directory=BASE_DIR, html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    print("=" * 60)
    print("🚀 Starting CogniStudy AI Server at http://localhost:8000")
    print("=" * 60)
    uvicorn.run(app, host="0.0.0.0", port=8000)
