from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import random
import asyncio
import csv
import io
import resend

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'default-secret')
JWT_ALGORITHM = "HS256"

# Resend Email Config
resend.api_key = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

# ============= PRICING =============
PRICING = {
    "age_5_6": {"monthly": 1.00, "yearly": 5.00, "name": "Ages 5-6", "age_min": 5, "age_max": 6},
    "age_7": {"monthly": 2.00, "yearly": 7.00, "name": "Age 7", "age_min": 7, "age_max": 7},
    "age_8": {"monthly": 3.00, "yearly": 10.00, "name": "Age 8", "age_min": 8, "age_max": 8},
    "age_9": {"monthly": 4.00, "yearly": 13.00, "name": "Age 9", "age_min": 9, "age_max": 9},
    "age_10": {"monthly": 5.00, "yearly": 15.00, "name": "Age 10", "age_min": 10, "age_max": 10},
    "age_11": {"monthly": 6.00, "yearly": 18.00, "name": "Age 11", "age_min": 11, "age_max": 11},
    "age_12": {"monthly": 7.00, "yearly": 21.00, "name": "Age 12", "age_min": 12, "age_max": 12},
    "age_13": {"monthly": 8.00, "yearly": 24.00, "name": "Age 13", "age_min": 13, "age_max": 13},
    "age_14": {"monthly": 9.00, "yearly": 27.00, "name": "Age 14", "age_min": 14, "age_max": 14},
}

# ============= MODELS =============
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ChildCreate(BaseModel):
    name: str
    age: int

class ChildUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None

class SubscriptionCreate(BaseModel):
    child_id: str
    plan_type: str  # monthly or yearly
    age_category: str  # age_5_6, age_7, etc.

class LessonCreate(BaseModel):
    title: str
    description: str
    age_category: str
    module_type: str  # counting, numbers, addition, shapes
    content: dict
    is_free: bool = False

class ManualPaymentCreate(BaseModel):
    child_id: str
    plan_type: str
    age_category: str
    reference_number: str

class MistakeRecord(BaseModel):
    question_id: str
    question_text: str
    question_type: str
    user_answer: str
    correct_answer: str
    options: List[str]

class AnswerSubmission(BaseModel):
    question_id: str
    question_text: str
    question_type: str
    user_answer: str
    correct_answer: str
    options: List[str]
    is_correct: bool

# ============= AUTH HELPERS =============
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(user_id: str, email: str, is_admin: bool = False) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "is_admin": is_admin,
        "exp": datetime.now(timezone.utc) + timedelta(days=30)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_admin_user(user = Depends(get_current_user)):
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ============= AUTH ROUTES =============
@api_router.post("/auth/register")
async def register(data: UserRegister):
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "email": data.email,
        "password": hash_password(data.password),
        "name": data.name,
        "is_admin": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user)
    token = create_token(user_id, data.email)
    return {"token": token, "user": {"id": user_id, "email": data.email, "name": data.name}}

@api_router.post("/auth/login")
async def login(data: UserLogin):
    user = await db.users.find_one({"email": data.email}, {"_id": 0})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"], user["email"], user.get("is_admin", False))
    return {"token": token, "user": {"id": user["id"], "email": user["email"], "name": user["name"], "is_admin": user.get("is_admin", False)}}

@api_router.get("/auth/me")
async def get_me(user = Depends(get_current_user)):
    db_user = await db.users.find_one({"id": user["user_id"]}, {"_id": 0, "password": 0})
    return db_user

# ============= CHILDREN ROUTES =============
@api_router.post("/children")
async def create_child(data: ChildCreate, user = Depends(get_current_user)):
    child_id = str(uuid.uuid4())
    
    # Determine age category
    age_category = None
    if data.age in [5, 6]:
        age_category = "age_5_6"
    elif data.age == 7:
        age_category = "age_7"
    elif data.age == 8:
        age_category = "age_8"
    elif data.age == 9:
        age_category = "age_9"
    elif data.age == 10:
        age_category = "age_10"
    elif data.age == 11:
        age_category = "age_11"
    elif data.age == 12:
        age_category = "age_12"
    elif data.age == 13:
        age_category = "age_13"
    elif data.age == 14:
        age_category = "age_14"
    else:
        raise HTTPException(status_code=400, detail="Age must be between 5 and 14")
    
    child = {
        "id": child_id,
        "parent_id": user["user_id"],
        "name": data.name,
        "age": data.age,
        "age_category": age_category,
        "subscription_active": False,
        "subscription_expires": None,
        "progress": {
            "total_stars": 0,
            "counting_stars": 0,
            "numbers_stars": 0,
            "addition_stars": 0,
            "shapes_stars": 0,
            "badges": [],
            "lessons_completed": []
        },
        "streak": {
            "current_streak": 0,
            "longest_streak": 0,
            "last_practice_date": None,
            "streak_history": []
        },
        "effort_stats": {
            "total_attempts": 0,
            "total_correct": 0,
            "total_wrong": 0,
            "current_wrong_streak": 0,
            "max_wrong_streak": 0,
            "continued_after_wrong_streak": 0,
            "questions_today": 0,
            "last_question_date": None,
            "mistakes_reviewed": 0,
            "login_days": 0,
            "last_login_date": None,
            "best_day_questions": 0,
            "improvement_streak": 0
        },
        "mistakes": [],
        "achievements": [],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.children.insert_one(child)
    return {"id": child_id, "name": data.name, "age": data.age, "age_category": age_category}

@api_router.get("/children")
async def get_children(user = Depends(get_current_user)):
    children = await db.children.find({"parent_id": user["user_id"]}, {"_id": 0}).to_list(100)
    return children

@api_router.get("/children/{child_id}")
async def get_child(child_id: str, user = Depends(get_current_user)):
    child = await db.children.find_one({"id": child_id, "parent_id": user["user_id"]}, {"_id": 0})
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    return child

@api_router.put("/children/{child_id}/progress")
async def update_child_progress(child_id: str, module: str, stars: int = 1, is_correct: bool = True, user = Depends(get_current_user)):
    child = await db.children.find_one({"id": child_id, "parent_id": user["user_id"]})
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    
    progress = child.get("progress", {})
    today = datetime.now(timezone.utc).date().isoformat()
    
    # Only add stars if correct
    if is_correct and stars > 0:
        module_field = f"{module}_stars"
        if module_field in progress:
            progress[module_field] = progress.get(module_field, 0) + stars
        progress["total_stars"] = progress.get("total_stars", 0) + stars
    
    # ============ EFFORT STATS TRACKING ============
    effort_stats = child.get("effort_stats", {
        "total_attempts": 0,
        "total_correct": 0,
        "total_wrong": 0,
        "current_wrong_streak": 0,
        "max_wrong_streak": 0,
        "continued_after_wrong_streak": 0,
        "questions_today": 0,
        "last_question_date": None,
        "mistakes_reviewed": 0,
        "login_days": 0,
        "last_login_date": None,
        "best_day_questions": 0,
        "improvement_streak": 0
    })
    
    # Update attempt counts
    effort_stats["total_attempts"] = effort_stats.get("total_attempts", 0) + 1
    
    if is_correct:
        effort_stats["total_correct"] = effort_stats.get("total_correct", 0) + 1
        # Check if they continued after a wrong streak (persistence!)
        if effort_stats.get("current_wrong_streak", 0) >= 3:
            effort_stats["continued_after_wrong_streak"] = effort_stats.get("continued_after_wrong_streak", 0) + 1
        effort_stats["current_wrong_streak"] = 0
    else:
        effort_stats["total_wrong"] = effort_stats.get("total_wrong", 0) + 1
        effort_stats["current_wrong_streak"] = effort_stats.get("current_wrong_streak", 0) + 1
        if effort_stats["current_wrong_streak"] > effort_stats.get("max_wrong_streak", 0):
            effort_stats["max_wrong_streak"] = effort_stats["current_wrong_streak"]
    
    # Track daily questions
    if effort_stats.get("last_question_date") != today:
        effort_stats["questions_today"] = 1
        effort_stats["last_question_date"] = today
        # Track login days
        effort_stats["login_days"] = effort_stats.get("login_days", 0) + 1
    else:
        effort_stats["questions_today"] = effort_stats.get("questions_today", 0) + 1
    
    # Update best day record
    if effort_stats["questions_today"] > effort_stats.get("best_day_questions", 0):
        effort_stats["best_day_questions"] = effort_stats["questions_today"]
    
    # ============ STREAK TRACKING ============
    streak_data = child.get("streak", {
        "current_streak": 0,
        "longest_streak": 0,
        "last_practice_date": None,
        "streak_history": []
    })
    
    last_practice = streak_data.get("last_practice_date")
    
    if last_practice != today:
        # Check if this is a consecutive day
        if last_practice:
            last_date = datetime.fromisoformat(last_practice).date()
            today_date = datetime.now(timezone.utc).date()
            days_diff = (today_date - last_date).days
            
            if days_diff == 1:
                # Consecutive day - increment streak
                streak_data["current_streak"] = streak_data.get("current_streak", 0) + 1
            elif days_diff > 1:
                # Streak broken - reset
                streak_data["current_streak"] = 1
            # If days_diff == 0, same day - don't change streak
        else:
            # First practice ever
            streak_data["current_streak"] = 1
        
        streak_data["last_practice_date"] = today
        
        # Update longest streak
        if streak_data["current_streak"] > streak_data.get("longest_streak", 0):
            streak_data["longest_streak"] = streak_data["current_streak"]
        
        # Add to streak history (keep last 30 days)
        streak_history = streak_data.get("streak_history", [])
        if today not in streak_history:
            streak_history.append(today)
            streak_data["streak_history"] = streak_history[-30:]
    
    # ============ ACHIEVEMENT BADGES ============
    badges = progress.get("badges", [])
    achievements = child.get("achievements", [])
    total = progress.get("total_stars", 0)
    current_streak = streak_data.get("current_streak", 0)
    total_attempts = effort_stats.get("total_attempts", 0)
    continued_after_wrong = effort_stats.get("continued_after_wrong_streak", 0)
    mistakes_reviewed = effort_stats.get("mistakes_reviewed", 0)
    login_days = effort_stats.get("login_days", 0)
    
    # Star-based badges
    if total >= 1 and "first_star" not in badges:
        badges.append("first_star")
        achievements.append({"badge": "first_star", "name": "First Star", "earned_at": datetime.now(timezone.utc).isoformat()})
    if total >= 5 and "five_stars" not in badges:
        badges.append("five_stars")
        achievements.append({"badge": "five_stars", "name": "5 Stars", "earned_at": datetime.now(timezone.utc).isoformat()})
    if total >= 10 and "ten_stars" not in badges:
        badges.append("ten_stars")
        achievements.append({"badge": "ten_stars", "name": "10 Stars", "earned_at": datetime.now(timezone.utc).isoformat()})
    if total >= 20 and "twenty_stars" not in badges:
        badges.append("twenty_stars")
        achievements.append({"badge": "twenty_stars", "name": "20 Stars", "earned_at": datetime.now(timezone.utc).isoformat()})
    if total >= 50 and "fifty_stars" not in badges:
        badges.append("fifty_stars")
        achievements.append({"badge": "fifty_stars", "name": "50 Stars", "earned_at": datetime.now(timezone.utc).isoformat()})
    if total >= 100 and "century" not in badges:
        badges.append("century")
        achievements.append({"badge": "century", "name": "Century Club", "earned_at": datetime.now(timezone.utc).isoformat()})
    
    # Streak-based badges
    if current_streak >= 3 and "streak_3" not in badges:
        badges.append("streak_3")
        achievements.append({"badge": "streak_3", "name": "3-Day Streak", "earned_at": datetime.now(timezone.utc).isoformat()})
    if current_streak >= 7 and "streak_7" not in badges:
        badges.append("streak_7")
        achievements.append({"badge": "streak_7", "name": "Week Warrior", "earned_at": datetime.now(timezone.utc).isoformat()})
    if current_streak >= 14 and "streak_14" not in badges:
        badges.append("streak_14")
        achievements.append({"badge": "streak_14", "name": "2-Week Champion", "earned_at": datetime.now(timezone.utc).isoformat()})
    if current_streak >= 30 and "streak_30" not in badges:
        badges.append("streak_30")
        achievements.append({"badge": "streak_30", "name": "Monthly Master", "earned_at": datetime.now(timezone.utc).isoformat()})
    
    # ============ EFFORT-BASED BADGES (NEW!) ============
    # Brave Learner: Attempted 20 questions (regardless of right/wrong)
    if total_attempts >= 20 and "brave_learner" not in badges:
        badges.append("brave_learner")
        achievements.append({"badge": "brave_learner", "name": "Brave Learner", "earned_at": datetime.now(timezone.utc).isoformat()})
    if total_attempts >= 50 and "brave_learner_50" not in badges:
        badges.append("brave_learner_50")
        achievements.append({"badge": "brave_learner_50", "name": "Super Brave Learner", "earned_at": datetime.now(timezone.utc).isoformat()})
    if total_attempts >= 100 and "brave_learner_100" not in badges:
        badges.append("brave_learner_100")
        achievements.append({"badge": "brave_learner_100", "name": "Fearless Learner", "earned_at": datetime.now(timezone.utc).isoformat()})
    
    # Never Give Up: Continued practicing after getting 3+ wrong in a row
    if continued_after_wrong >= 1 and "never_give_up" not in badges:
        badges.append("never_give_up")
        achievements.append({"badge": "never_give_up", "name": "Never Give Up", "earned_at": datetime.now(timezone.utc).isoformat()})
    if continued_after_wrong >= 5 and "never_give_up_5" not in badges:
        badges.append("never_give_up_5")
        achievements.append({"badge": "never_give_up_5", "name": "Persistence Pro", "earned_at": datetime.now(timezone.utc).isoformat()})
    if continued_after_wrong >= 10 and "never_give_up_10" not in badges:
        badges.append("never_give_up_10")
        achievements.append({"badge": "never_give_up_10", "name": "Unstoppable Spirit", "earned_at": datetime.now(timezone.utc).isoformat()})
    
    # Mistake Master: Reviewed mistakes
    if mistakes_reviewed >= 5 and "mistake_master" not in badges:
        badges.append("mistake_master")
        achievements.append({"badge": "mistake_master", "name": "Mistake Master", "earned_at": datetime.now(timezone.utc).isoformat()})
    if mistakes_reviewed >= 15 and "mistake_master_15" not in badges:
        badges.append("mistake_master_15")
        achievements.append({"badge": "mistake_master_15", "name": "Learning Champion", "earned_at": datetime.now(timezone.utc).isoformat()})
    
    # Daily Learner: Logged in multiple days
    if login_days >= 3 and "daily_learner" not in badges:
        badges.append("daily_learner")
        achievements.append({"badge": "daily_learner", "name": "Daily Learner", "earned_at": datetime.now(timezone.utc).isoformat()})
    if login_days >= 7 and "daily_learner_7" not in badges:
        badges.append("daily_learner_7")
        achievements.append({"badge": "daily_learner_7", "name": "Weekly Regular", "earned_at": datetime.now(timezone.utc).isoformat()})
    if login_days >= 30 and "daily_learner_30" not in badges:
        badges.append("daily_learner_30")
        achievements.append({"badge": "daily_learner_30", "name": "Dedicated Student", "earned_at": datetime.now(timezone.utc).isoformat()})
    
    progress["badges"] = badges
    
    await db.children.update_one(
        {"id": child_id}, 
        {"$set": {
            "progress": progress, 
            "streak": streak_data,
            "effort_stats": effort_stats,
            "achievements": achievements
        }}
    )
    
    # Calculate progress to next badges for encouragement
    next_badge_progress = {}
    if total < 5:
        next_badge_progress["five_stars"] = {"current": total, "target": 5, "remaining": 5 - total}
    elif total < 10:
        next_badge_progress["ten_stars"] = {"current": total, "target": 10, "remaining": 10 - total}
    elif total < 20:
        next_badge_progress["twenty_stars"] = {"current": total, "target": 20, "remaining": 20 - total}
    
    if total_attempts < 20:
        next_badge_progress["brave_learner"] = {"current": total_attempts, "target": 20, "remaining": 20 - total_attempts}
    
    return {
        "progress": progress,
        "streak": streak_data,
        "effort_stats": effort_stats,
        "new_badges": [a for a in achievements if a["earned_at"].startswith(today)],
        "next_badge_progress": next_badge_progress
    }

# ============= MISTAKE TRACKING ROUTES =============
@api_router.post("/children/{child_id}/mistakes")
async def record_mistake(child_id: str, data: AnswerSubmission, user = Depends(get_current_user)):
    """Record an answer (wrong answers are saved for review)"""
    child = await db.children.find_one({"id": child_id, "parent_id": user["user_id"]})
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    
    # Only record mistakes (wrong answers)
    if not data.is_correct:
        mistake = {
            "id": str(uuid.uuid4()),
            "question_id": data.question_id,
            "question_text": data.question_text,
            "question_type": data.question_type,
            "user_answer": data.user_answer,
            "correct_answer": data.correct_answer,
            "options": data.options,
            "recorded_at": datetime.now(timezone.utc).isoformat(),
            "reviewed": False,
            "review_count": 0
        }
        
        # Add to mistakes list (keep last 50 mistakes)
        mistakes = child.get("mistakes", [])
        mistakes.append(mistake)
        mistakes = mistakes[-50:]  # Keep only last 50
        
        await db.children.update_one(
            {"id": child_id},
            {"$set": {"mistakes": mistakes}}
        )
        
        return {"recorded": True, "mistake_id": mistake["id"]}
    
    return {"recorded": False, "message": "Correct answer, not recorded as mistake"}

@api_router.get("/children/{child_id}/mistakes")
async def get_mistakes(child_id: str, user = Depends(get_current_user)):
    """Get all recorded mistakes for a child"""
    child = await db.children.find_one({"id": child_id, "parent_id": user["user_id"]}, {"_id": 0})
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    
    mistakes = child.get("mistakes", [])
    return {
        "mistakes": mistakes,
        "total_count": len(mistakes),
        "unreviewed_count": len([m for m in mistakes if not m.get("reviewed", False)])
    }

@api_router.put("/children/{child_id}/mistakes/{mistake_id}/review")
async def mark_mistake_reviewed(child_id: str, mistake_id: str, user = Depends(get_current_user)):
    """Mark a mistake as reviewed"""
    child = await db.children.find_one({"id": child_id, "parent_id": user["user_id"]})
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    
    mistakes = child.get("mistakes", [])
    found = False
    for mistake in mistakes:
        if mistake.get("id") == mistake_id:
            mistake["reviewed"] = True
            mistake["review_count"] = mistake.get("review_count", 0) + 1
            mistake["last_reviewed_at"] = datetime.now(timezone.utc).isoformat()
            found = True
            break
    
    # Update effort_stats for Mistake Master badge
    effort_stats = child.get("effort_stats", {})
    if found:
        effort_stats["mistakes_reviewed"] = effort_stats.get("mistakes_reviewed", 0) + 1
    
    await db.children.update_one(
        {"id": child_id}, 
        {"$set": {"mistakes": mistakes, "effort_stats": effort_stats}}
    )
    return {"message": "Mistake marked as reviewed", "total_reviewed": effort_stats.get("mistakes_reviewed", 0)}

@api_router.delete("/children/{child_id}/mistakes/{mistake_id}")
async def delete_mistake(child_id: str, mistake_id: str, user = Depends(get_current_user)):
    """Delete a specific mistake from the review list"""
    child = await db.children.find_one({"id": child_id, "parent_id": user["user_id"]})
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    
    mistakes = child.get("mistakes", [])
    mistakes = [m for m in mistakes if m.get("id") != mistake_id]
    
    await db.children.update_one({"id": child_id}, {"$set": {"mistakes": mistakes}})
    return {"message": "Mistake deleted"}

# ============= STREAK ROUTES =============
@api_router.get("/children/{child_id}/streak")
async def get_streak(child_id: str, user = Depends(get_current_user)):
    """Get streak data for a child"""
    child = await db.children.find_one({"id": child_id, "parent_id": user["user_id"]}, {"_id": 0})
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    
    streak = child.get("streak", {
        "current_streak": 0,
        "longest_streak": 0,
        "last_practice_date": None,
        "streak_history": []
    })
    
    # Check if streak is still valid (not broken)
    if streak.get("last_practice_date"):
        last_date = datetime.fromisoformat(streak["last_practice_date"]).date()
        today_date = datetime.now(timezone.utc).date()
        days_diff = (today_date - last_date).days
        
        if days_diff > 1:
            # Streak is broken but hasn't been reset yet
            streak["current_streak"] = 0
    
    return streak

# ============= ACHIEVEMENTS/BADGES ROUTES =============
@api_router.get("/children/{child_id}/achievements")
async def get_achievements(child_id: str, user = Depends(get_current_user)):
    """Get all achievements/badges for a child"""
    child = await db.children.find_one({"id": child_id, "parent_id": user["user_id"]}, {"_id": 0})
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    
    achievements = child.get("achievements", [])
    badges = child.get("progress", {}).get("badges", [])
    effort_stats = child.get("effort_stats", {})
    
    # Define all available badges with metadata
    all_badges = {
        # Star-based badges
        "first_star": {"name": "First Star", "icon": "⭐", "description": "Earned your first star!", "category": "stars"},
        "five_stars": {"name": "5 Stars", "icon": "🌟", "description": "Earned 5 stars!", "category": "stars"},
        "ten_stars": {"name": "10 Stars", "icon": "✨", "description": "Earned 10 stars!", "category": "stars"},
        "twenty_stars": {"name": "20 Stars", "icon": "💫", "description": "Earned 20 stars!", "category": "stars"},
        "fifty_stars": {"name": "50 Stars", "icon": "🎖️", "description": "Earned 50 stars!", "category": "stars"},
        "century": {"name": "Century Club", "icon": "🏆", "description": "Earned 100 stars!", "category": "stars"},
        
        # Streak-based badges
        "streak_3": {"name": "3-Day Streak", "icon": "🔥", "description": "Practiced 3 days in a row!", "category": "streaks"},
        "streak_7": {"name": "Week Warrior", "icon": "🔥", "description": "Practiced 7 days in a row!", "category": "streaks"},
        "streak_14": {"name": "2-Week Champion", "icon": "🔥", "description": "Practiced 14 days in a row!", "category": "streaks"},
        "streak_30": {"name": "Monthly Master", "icon": "👑", "description": "Practiced 30 days in a row!", "category": "streaks"},
        
        # Effort-based badges (NEW!)
        "brave_learner": {"name": "Brave Learner", "icon": "🦁", "description": "Attempted 20 questions! Keep trying!", "category": "effort"},
        "brave_learner_50": {"name": "Super Brave Learner", "icon": "🦁", "description": "Attempted 50 questions! Amazing effort!", "category": "effort"},
        "brave_learner_100": {"name": "Fearless Learner", "icon": "🦸", "description": "Attempted 100 questions! You're fearless!", "category": "effort"},
        "never_give_up": {"name": "Never Give Up", "icon": "💪", "description": "Kept trying after mistakes! Great spirit!", "category": "effort"},
        "never_give_up_5": {"name": "Persistence Pro", "icon": "💪", "description": "Kept going 5 times after tough moments!", "category": "effort"},
        "never_give_up_10": {"name": "Unstoppable Spirit", "icon": "🚀", "description": "Nothing can stop you! 10x resilience!", "category": "effort"},
        "mistake_master": {"name": "Mistake Master", "icon": "🔄", "description": "Reviewed 5 mistakes - learning from errors!", "category": "effort"},
        "mistake_master_15": {"name": "Learning Champion", "icon": "🏅", "description": "Reviewed 15 mistakes - true learner!", "category": "effort"},
        "daily_learner": {"name": "Daily Learner", "icon": "📚", "description": "Practiced on 3 different days!", "category": "effort"},
        "daily_learner_7": {"name": "Weekly Regular", "icon": "📅", "description": "Practiced on 7 different days!", "category": "effort"},
        "daily_learner_30": {"name": "Dedicated Student", "icon": "🎓", "description": "Practiced on 30 different days!", "category": "effort"},
        
        # Special badges
        "speed_demon": {"name": "Speed Demon", "icon": "⚡", "description": "Answered 5 questions under 5 seconds each!", "category": "special"},
        "perfect_quiz": {"name": "Perfect Quiz", "icon": "💯", "description": "Got 10/10 on a quiz!", "category": "special"},
        "math_explorer": {"name": "Math Explorer", "icon": "🧭", "description": "Tried all math modules!", "category": "special"},
    }
    
    earned_badges = []
    locked_badges = []
    
    for badge_id, badge_info in all_badges.items():
        if badge_id in badges:
            earned_at = next((a["earned_at"] for a in achievements if a.get("badge") == badge_id), None)
            earned_badges.append({**badge_info, "id": badge_id, "earned": True, "earned_at": earned_at})
        else:
            locked_badges.append({**badge_info, "id": badge_id, "earned": False})
    
    # Calculate progress towards next badges for encouragement
    total_stars = child.get("progress", {}).get("total_stars", 0)
    total_attempts = effort_stats.get("total_attempts", 0)
    mistakes_reviewed = effort_stats.get("mistakes_reviewed", 0)
    login_days = effort_stats.get("login_days", 0)
    
    progress_to_next = []
    
    # Star progress
    star_milestones = [(5, "five_stars", "5 Stars"), (10, "ten_stars", "10 Stars"), (20, "twenty_stars", "20 Stars")]
    for target, badge_id, name in star_milestones:
        if badge_id not in badges and total_stars < target:
            progress_to_next.append({
                "badge": badge_id,
                "name": name,
                "current": total_stars,
                "target": target,
                "remaining": target - total_stars,
                "percentage": round((total_stars / target) * 100)
            })
            break
    
    # Attempt progress (Brave Learner)
    if "brave_learner" not in badges and total_attempts < 20:
        progress_to_next.append({
            "badge": "brave_learner",
            "name": "Brave Learner",
            "current": total_attempts,
            "target": 20,
            "remaining": 20 - total_attempts,
            "percentage": round((total_attempts / 20) * 100)
        })
    
    # Mistake review progress
    if "mistake_master" not in badges and mistakes_reviewed < 5:
        progress_to_next.append({
            "badge": "mistake_master",
            "name": "Mistake Master",
            "current": mistakes_reviewed,
            "target": 5,
            "remaining": 5 - mistakes_reviewed,
            "percentage": round((mistakes_reviewed / 5) * 100)
        })
    
    # Login days progress
    if "daily_learner" not in badges and login_days < 3:
        progress_to_next.append({
            "badge": "daily_learner",
            "name": "Daily Learner",
            "current": login_days,
            "target": 3,
            "remaining": 3 - login_days,
            "percentage": round((login_days / 3) * 100)
        })
    
    return {
        "earned": earned_badges,
        "locked": locked_badges,
        "total_earned": len(earned_badges),
        "total_available": len(all_badges),
        "effort_stats": effort_stats,
        "progress_to_next": progress_to_next
    }

# ============= LEADERBOARD ROUTES =============
@api_router.get("/leaderboard/{age_category}")
async def get_leaderboard(age_category: str, user = Depends(get_current_user)):
    """Get leaderboard for a specific age category"""
    
    # Get all children in this age category with active subscriptions
    children = await db.children.find(
        {"age_category": age_category},
        {"_id": 0, "id": 1, "name": 1, "progress": 1, "streak": 1, "effort_stats": 1, "parent_id": 1}
    ).to_list(1000)
    
    if not children:
        return {
            "leaderboard": [],
            "user_rank": None,
            "total_participants": 0,
            "age_category": age_category
        }
    
    # Calculate scores for each child
    leaderboard_data = []
    for child in children:
        total_stars = child.get("progress", {}).get("total_stars", 0)
        current_streak = child.get("streak", {}).get("current_streak", 0)
        total_badges = len(child.get("progress", {}).get("badges", []))
        total_attempts = child.get("effort_stats", {}).get("total_attempts", 0)
        
        # Composite score: stars (weight 3) + streak days (weight 2) + badges (weight 5) + attempts (weight 0.1)
        score = (total_stars * 3) + (current_streak * 2) + (total_badges * 5) + (total_attempts * 0.1)
        
        leaderboard_data.append({
            "child_id": child["id"],
            "name": child["name"],
            "parent_id": child.get("parent_id"),
            "total_stars": total_stars,
            "current_streak": current_streak,
            "total_badges": total_badges,
            "total_attempts": total_attempts,
            "score": round(score, 1)
        })
    
    # Sort by score descending
    leaderboard_data.sort(key=lambda x: x["score"], reverse=True)
    
    # Add ranks
    for i, entry in enumerate(leaderboard_data):
        entry["rank"] = i + 1
    
    # Find user's children's ranks
    user_children = await db.children.find({"parent_id": user["user_id"], "age_category": age_category}, {"_id": 0, "id": 1}).to_list(100)
    user_child_ids = [c["id"] for c in user_children]
    
    user_ranks = []
    for entry in leaderboard_data:
        if entry["child_id"] in user_child_ids:
            user_ranks.append({
                "child_id": entry["child_id"],
                "name": entry["name"],
                "rank": entry["rank"],
                "score": entry["score"],
                "total_stars": entry["total_stars"]
            })
    
    # Only return top 50 for leaderboard display (privacy + performance)
    # But mark which ones belong to current user
    display_leaderboard = []
    for entry in leaderboard_data[:50]:
        display_entry = {
            "rank": entry["rank"],
            "name": entry["name"][:1] + "***" if entry["parent_id"] != user["user_id"] else entry["name"],  # Privacy: show only first letter for others
            "total_stars": entry["total_stars"],
            "current_streak": entry["current_streak"],
            "total_badges": entry["total_badges"],
            "score": entry["score"],
            "is_current_user": entry["child_id"] in user_child_ids
        }
        display_leaderboard.append(display_entry)
    
    return {
        "leaderboard": display_leaderboard,
        "user_ranks": user_ranks,
        "total_participants": len(leaderboard_data),
        "age_category": age_category
    }

@api_router.get("/leaderboard/global/top")
async def get_global_leaderboard(user = Depends(get_current_user)):
    """Get global top performers across all ages"""
    
    # Get all children
    children = await db.children.find(
        {},
        {"_id": 0, "id": 1, "name": 1, "age": 1, "age_category": 1, "progress": 1, "streak": 1, "effort_stats": 1, "parent_id": 1}
    ).to_list(5000)
    
    # Calculate scores
    leaderboard_data = []
    for child in children:
        total_stars = child.get("progress", {}).get("total_stars", 0)
        current_streak = child.get("streak", {}).get("current_streak", 0)
        total_badges = len(child.get("progress", {}).get("badges", []))
        
        score = (total_stars * 3) + (current_streak * 2) + (total_badges * 5)
        
        leaderboard_data.append({
            "child_id": child["id"],
            "name": child["name"],
            "age": child.get("age", 0),
            "parent_id": child.get("parent_id"),
            "total_stars": total_stars,
            "current_streak": current_streak,
            "total_badges": total_badges,
            "score": round(score, 1)
        })
    
    # Sort and rank
    leaderboard_data.sort(key=lambda x: x["score"], reverse=True)
    
    # Get user's children
    user_children = await db.children.find({"parent_id": user["user_id"]}, {"_id": 0, "id": 1}).to_list(100)
    user_child_ids = [c["id"] for c in user_children]
    
    # Top 20 global
    top_global = []
    for i, entry in enumerate(leaderboard_data[:20]):
        top_global.append({
            "rank": i + 1,
            "name": entry["name"][:1] + "***" if entry["parent_id"] != user["user_id"] else entry["name"],
            "age": entry["age"],
            "total_stars": entry["total_stars"],
            "current_streak": entry["current_streak"],
            "total_badges": entry["total_badges"],
            "score": entry["score"],
            "is_current_user": entry["child_id"] in user_child_ids
        })
    
    return {
        "top_global": top_global,
        "total_participants": len(leaderboard_data)
    }
@api_router.get("/pricing")
async def get_pricing():
    return PRICING

# ============= STRIPE PAYMENT ROUTES =============
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest

@api_router.post("/payments/create-checkout")
async def create_checkout(request: Request, data: SubscriptionCreate, user = Depends(get_current_user)):
    # Validate child belongs to user
    child = await db.children.find_one({"id": data.child_id, "parent_id": user["user_id"]})
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    
    # Get pricing
    if data.age_category not in PRICING:
        raise HTTPException(status_code=400, detail="Invalid age category")
    
    price = PRICING[data.age_category]
    amount = price["yearly"] if data.plan_type == "yearly" else price["monthly"]
    
    # Setup Stripe
    api_key = os.environ.get("STRIPE_API_KEY")
    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)
    
    # Get origin from request
    origin = request.headers.get("origin", host_url)
    success_url = f"{origin}/payment-success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin}/dashboard"
    
    checkout_request = CheckoutSessionRequest(
        amount=float(amount),
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "user_id": user["user_id"],
            "child_id": data.child_id,
            "plan_type": data.plan_type,
            "age_category": data.age_category
        }
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create payment transaction record
    transaction = {
        "id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "user_id": user["user_id"],
        "child_id": data.child_id,
        "amount": amount,
        "currency": "usd",
        "plan_type": data.plan_type,
        "age_category": data.age_category,
        "payment_method": "stripe",
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.payment_transactions.insert_one(transaction)
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/payments/status/{session_id}")
async def check_payment_status(session_id: str, user = Depends(get_current_user)):
    api_key = os.environ.get("STRIPE_API_KEY")
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url="")
    
    status = await stripe_checkout.get_checkout_status(session_id)
    
    # Update transaction if paid
    if status.payment_status == "paid":
        transaction = await db.payment_transactions.find_one({"session_id": session_id})
        if transaction and transaction.get("payment_status") != "paid":
            # Update transaction
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {"payment_status": "paid", "paid_at": datetime.now(timezone.utc).isoformat()}}
            )
            
            # Activate subscription
            expires = datetime.now(timezone.utc) + timedelta(days=365 if transaction["plan_type"] == "yearly" else 30)
            await db.children.update_one(
                {"id": transaction["child_id"]},
                {"$set": {"subscription_active": True, "subscription_expires": expires.isoformat()}}
            )
    
    return {"status": status.status, "payment_status": status.payment_status}

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    api_key = os.environ.get("STRIPE_API_KEY")
    webhook_secret = os.environ.get("STRIPE_WEBHOOK_SECRET")
    host_url = str(request.base_url).rstrip("/")
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=f"{host_url}/api/webhook/stripe", webhook_secret=webhook_secret)
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, request.headers.get("Stripe-Signature"))
        
        if webhook_response.payment_status == "paid":
            transaction = await db.payment_transactions.find_one({"session_id": webhook_response.session_id})
            if transaction and transaction.get("payment_status") != "paid":
                await db.payment_transactions.update_one(
                    {"session_id": webhook_response.session_id},
                    {"$set": {"payment_status": "paid", "paid_at": datetime.now(timezone.utc).isoformat()}}
                )
                
                expires = datetime.now(timezone.utc) + timedelta(days=365 if transaction["plan_type"] == "yearly" else 30)
                await db.children.update_one(
                    {"id": transaction["child_id"]},
                    {"$set": {"subscription_active": True, "subscription_expires": expires.isoformat()}}
                )
        
        return {"status": "ok"}
    except Exception as e:
        logging.error(f"Webhook error: {e}")
        return {"status": "error"}

# ============= MANUAL PAYMENT (QR) ROUTES =============
@api_router.post("/payments/manual")
async def create_manual_payment(data: ManualPaymentCreate, user = Depends(get_current_user)):
    child = await db.children.find_one({"id": data.child_id, "parent_id": user["user_id"]})
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    
    price = PRICING.get(data.age_category)
    if not price:
        raise HTTPException(status_code=400, detail="Invalid age category")
    
    amount = price["yearly"] if data.plan_type == "yearly" else price["monthly"]
    
    transaction = {
        "id": str(uuid.uuid4()),
        "user_id": user["user_id"],
        "child_id": data.child_id,
        "amount": amount,
        "currency": "usd",
        "plan_type": data.plan_type,
        "age_category": data.age_category,
        "payment_method": "bank_qr",
        "reference_number": data.reference_number,
        "payment_status": "pending_verification",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.payment_transactions.insert_one(transaction)
    
    return {"message": "Payment submitted for verification", "transaction_id": transaction["id"]}

# ============= LESSONS ROUTES =============
@api_router.get("/lessons/{child_id}")
async def get_lessons_for_child(child_id: str, user = Depends(get_current_user)):
    # Get child to find age_category
    child = await db.children.find_one({"id": child_id, "parent_id": user["user_id"]}, {"_id": 0})
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    
    age_category = child.get("age_category", "age_5_6")
    lessons = await db.lessons.find({"age_category": age_category}, {"_id": 0}).to_list(100)
    return lessons

@api_router.get("/lessons/{age_category}/free")
async def get_free_lessons(age_category: str):
    lessons = await db.lessons.find({"age_category": age_category, "is_free": True}, {"_id": 0}).to_list(100)
    return lessons

# ============= QUESTION GENERATOR =============
def generate_question(module: str, age_category: str):
    """
    MATH CURRICULUM BY AGE (Based on educational standards):
    
    Age 5-6 (K-1): Counting 1-20, number recognition, basic shapes, addition/subtraction within 10
    Age 7 (Grade 2): Addition/subtraction within 20, skip counting, basic place value
    Age 8 (Grade 3): Addition/subtraction within 100, intro multiplication (2,5,10 tables)
    Age 9 (Grade 4): Multiplication tables 1-10, division basics, multi-digit operations
    Age 10 (Grade 5): All operations with larger numbers, intro fractions/decimals
    Age 11 (Grade 6): Fractions, decimals, percentages, ratios, negative numbers
    Age 12 (Grade 7): Pre-algebra, integers, proportions, basic geometry
    Age 13 (Grade 8): Algebra basics, linear equations, exponents, square roots
    Age 14 (Grade 9): Algebra, quadratics intro, functions, advanced geometry
    """
    
    objects = ["🍎", "🌟", "🎈", "🐻", "🌸", "🦋", "🍪", "🚗"]
    
    # ==================== COUNTING (Ages 5-7 only) ====================
    if module == "counting":
        if age_category == "age_5_6":
            count = random.randint(1, 10)
        elif age_category == "age_7":
            count = random.randint(5, 20)
        else:
            count = random.randint(10, 20)
        
        obj = random.choice(objects)
        options = [str(count)]
        while len(options) < 4:
            wrong = random.randint(max(1, count - 3), count + 3)
            if str(wrong) not in options and wrong > 0:
                options.append(str(wrong))
        random.shuffle(options)
        return {"type": "counting", "question": f"How many {obj} do you see?", "options": options, "correct_answer": str(count), "visual_data": {"object": obj, "count": count}}
    
    # ==================== NUMBER RECOGNITION (Ages 5-7 only) ====================
    elif module == "numbers":
        if age_category == "age_5_6":
            number = random.randint(1, 20)
        else:
            number = random.randint(10, 100)
        
        options = [str(number)]
        while len(options) < 4:
            offset = random.randint(1, 5)
            wrong = number + random.choice([-1, 1]) * offset
            if str(wrong) not in options and wrong > 0:
                options.append(str(wrong))
        random.shuffle(options)
        return {"type": "numbers", "question": "What number is this?", "options": options, "correct_answer": str(number), "visual_data": {"number": number}}
    
    # ==================== ADDITION ====================
    elif module == "addition":
        if age_category == "age_5_6":
            # Within 10
            a = random.randint(1, 5)
            b = random.randint(1, 5)
        elif age_category == "age_7":
            # Within 20
            a = random.randint(1, 10)
            b = random.randint(1, 10)
        elif age_category == "age_8":
            # Within 100
            a = random.randint(10, 50)
            b = random.randint(10, 50)
        elif age_category == "age_9":
            # Multi-digit
            a = random.randint(50, 200)
            b = random.randint(50, 200)
        elif age_category == "age_10":
            # Larger numbers
            a = random.randint(100, 500)
            b = random.randint(100, 500)
        elif age_category == "age_11":
            # With decimals sometimes
            a = random.randint(200, 1000)
            b = random.randint(200, 1000)
        elif age_category == "age_12":
            # Negative numbers intro
            a = random.randint(-50, 500)
            b = random.randint(100, 500)
        elif age_category == "age_13":
            # Integers
            a = random.randint(-200, 500)
            b = random.randint(-200, 500)
        else:  # age_14
            # Larger integers
            a = random.randint(-500, 1000)
            b = random.randint(-500, 1000)
        
        answer = a + b
        options = [str(answer)]
        spread = max(5, abs(answer) // 10 + 1)
        while len(options) < 4:
            offset = random.randint(1, spread)
            wrong = answer + random.choice([-1, 1]) * offset
            if str(wrong) not in options:
                options.append(str(wrong))
        random.shuffle(options)
        
        obj = random.choice(objects) if age_category in ["age_5_6", "age_7", "age_8"] else None
        sign_a = "" if a >= 0 else ""
        sign_b = "+" if b >= 0 else ""
        question_text = f"{a} + {b} = ?" if b >= 0 else f"{a} + ({b}) = ?"
        
        return {"type": "addition", "question": question_text, "options": options, "correct_answer": str(answer), "visual_data": {"a": a, "b": b, "object": obj}}
    
    # ==================== SUBTRACTION ====================
    elif module == "subtraction":
        if age_category == "age_5_6":
            a = random.randint(5, 10)
            b = random.randint(1, a - 1)
        elif age_category == "age_7":
            a = random.randint(10, 20)
            b = random.randint(1, a - 1)
        elif age_category == "age_8":
            a = random.randint(30, 100)
            b = random.randint(10, a - 1)
        elif age_category == "age_9":
            a = random.randint(100, 500)
            b = random.randint(50, a - 1)
        elif age_category == "age_10":
            a = random.randint(200, 1000)
            b = random.randint(100, a - 1)
        elif age_category == "age_11":
            a = random.randint(500, 2000)
            b = random.randint(200, a + 100)  # Can go negative
        elif age_category in ["age_12", "age_13", "age_14"]:
            a = random.randint(-200, 1000)
            b = random.randint(-200, 1000)
        else:
            a = random.randint(10, 50)
            b = random.randint(1, a - 1)
        
        answer = a - b
        options = [str(answer)]
        spread = max(3, abs(answer) // 10 + 1)
        while len(options) < 4:
            offset = random.randint(1, spread)
            wrong = answer + random.choice([-1, 1]) * offset
            if str(wrong) not in options:
                options.append(str(wrong))
        random.shuffle(options)
        
        obj = random.choice(objects) if age_category in ["age_5_6", "age_7", "age_8"] else None
        question_text = f"{a} - {b} = ?" if b >= 0 else f"{a} - ({b}) = ?"
        
        return {"type": "subtraction", "question": question_text, "options": options, "correct_answer": str(answer), "visual_data": {"a": a, "b": b, "object": obj}}
    
    # ==================== MULTIPLICATION ====================
    elif module == "multiplication":
        if age_category == "age_8":
            # Times tables: 2, 5, 10
            a = random.choice([2, 5, 10])
            b = random.randint(1, 10)
        elif age_category == "age_9":
            # Times tables: 1-10
            a = random.randint(2, 10)
            b = random.randint(2, 10)
        elif age_category == "age_10":
            # Times tables: 1-12
            a = random.randint(2, 12)
            b = random.randint(2, 12)
        elif age_category == "age_11":
            # Larger multiplication
            a = random.randint(5, 15)
            b = random.randint(5, 15)
        elif age_category == "age_12":
            # Two-digit by single digit
            a = random.randint(10, 30)
            b = random.randint(2, 12)
        elif age_category == "age_13":
            # Two-digit multiplication
            a = random.randint(10, 25)
            b = random.randint(10, 25)
        else:  # age_14
            # Challenging multiplication
            a = random.randint(12, 30)
            b = random.randint(12, 30)
        
        answer = a * b
        options = [str(answer)]
        spread = max(5, answer // 10)
        while len(options) < 4:
            offset = random.randint(1, spread)
            wrong = answer + random.choice([-1, 1]) * offset
            if str(wrong) not in options and wrong > 0:
                options.append(str(wrong))
        random.shuffle(options)
        
        return {"type": "multiplication", "question": f"{a} × {b} = ?", "options": options, "correct_answer": str(answer), "visual_data": {"a": a, "b": b, "operation": "multiply"}}
    
    # ==================== DIVISION ====================
    elif module == "division":
        if age_category == "age_9":
            # Basic division (tables 1-10)
            b = random.randint(2, 10)
            answer = random.randint(2, 10)
        elif age_category == "age_10":
            # Division with tables 1-12
            b = random.randint(2, 12)
            answer = random.randint(2, 12)
        elif age_category == "age_11":
            # Larger division
            b = random.randint(3, 15)
            answer = random.randint(5, 20)
        elif age_category == "age_12":
            # More complex
            b = random.randint(5, 20)
            answer = random.randint(5, 25)
        elif age_category == "age_13":
            # Challenging
            b = random.randint(6, 25)
            answer = random.randint(10, 30)
        else:  # age_14
            # Advanced
            b = random.randint(7, 30)
            answer = random.randint(10, 40)
        
        a = b * answer  # Ensure clean division
        options = [str(answer)]
        spread = max(3, answer // 5)
        while len(options) < 4:
            offset = random.randint(1, spread)
            wrong = answer + random.choice([-1, 1]) * offset
            if str(wrong) not in options and wrong > 0:
                options.append(str(wrong))
        random.shuffle(options)
        
        return {"type": "division", "question": f"{a} ÷ {b} = ?", "options": options, "correct_answer": str(answer), "visual_data": {"a": a, "b": b, "operation": "divide"}}
    
    # ==================== FRACTIONS (Ages 10+) ====================
    elif module == "fractions":
        if age_category in ["age_10", "age_11"]:
            # Simple fraction addition
            denom = random.choice([2, 4, 5, 10])
            num1 = random.randint(1, denom - 1)
            num2 = random.randint(1, denom - num1)
            answer_num = num1 + num2
            question_text = f"{num1}/{denom} + {num2}/{denom} = ?"
            answer = f"{answer_num}/{denom}"
            options = [answer]
            while len(options) < 4:
                wrong_num = random.randint(1, denom)
                wrong = f"{wrong_num}/{denom}"
                if wrong not in options:
                    options.append(wrong)
        else:  # age_12, 13, 14
            # Fraction multiplication or different denominators
            denom1 = random.choice([2, 3, 4, 5])
            denom2 = random.choice([2, 3, 4, 5])
            num1 = random.randint(1, denom1)
            num2 = random.randint(1, denom2)
            answer_num = num1 * num2
            answer_denom = denom1 * denom2
            question_text = f"{num1}/{denom1} × {num2}/{denom2} = ?"
            answer = f"{answer_num}/{answer_denom}"
            options = [answer]
            while len(options) < 4:
                wrong_num = random.randint(1, answer_denom)
                wrong = f"{wrong_num}/{answer_denom}"
                if wrong not in options:
                    options.append(wrong)
        
        random.shuffle(options)
        return {"type": "fractions", "question": question_text, "options": options, "correct_answer": answer, "visual_data": {"operation": "fractions"}}
    
    # ==================== PERCENTAGES (Ages 11+) ====================
    elif module == "percentages":
        if age_category == "age_11":
            # Simple percentages
            percent = random.choice([10, 20, 25, 50])
            whole = random.choice([100, 200, 50, 80])
        elif age_category == "age_12":
            percent = random.choice([10, 15, 20, 25, 30, 50])
            whole = random.randint(50, 200)
        else:  # age_13, 14
            percent = random.randint(5, 40)
            whole = random.randint(50, 500)
        
        answer = (percent * whole) // 100
        question_text = f"What is {percent}% of {whole}?"
        options = [str(answer)]
        spread = max(5, answer // 5)
        while len(options) < 4:
            offset = random.randint(1, spread)
            wrong = answer + random.choice([-1, 1]) * offset
            if str(wrong) not in options and wrong > 0:
                options.append(str(wrong))
        random.shuffle(options)
        
        return {"type": "percentages", "question": question_text, "options": options, "correct_answer": str(answer), "visual_data": {"percent": percent, "whole": whole}}
    
    # ==================== ALGEBRA (Ages 12+) ====================
    elif module == "algebra":
        if age_category == "age_12":
            # Simple: x + 5 = 12, find x
            b = random.randint(2, 10)
            answer = random.randint(2, 15)
            result = answer + b
            question_text = f"x + {b} = {result}. Find x"
        elif age_category == "age_13":
            # Medium: 2x + 3 = 15, find x
            coef = random.randint(2, 5)
            b = random.randint(1, 10)
            answer = random.randint(2, 10)
            result = coef * answer + b
            question_text = f"{coef}x + {b} = {result}. Find x"
        else:  # age_14
            # Harder: 3x - 7 = 2x + 5, find x
            coef1 = random.randint(2, 6)
            coef2 = random.randint(1, coef1 - 1)
            b1 = random.randint(-10, 10)
            answer = random.randint(2, 15)
            b2 = coef1 * answer + b1 - coef2 * answer
            question_text = f"{coef1}x + {b1} = {coef2}x + {b2}. Find x"
        
        options = [str(answer)]
        while len(options) < 4:
            wrong = answer + random.choice([-3, -2, -1, 1, 2, 3])
            if str(wrong) not in options:
                options.append(str(wrong))
        random.shuffle(options)
        
        return {"type": "algebra", "question": question_text, "options": options, "correct_answer": str(answer), "visual_data": {"operation": "algebra"}}
    
    # ==================== EXPONENTS (Ages 13+) ====================
    elif module == "exponents":
        if age_category == "age_13":
            base = random.randint(2, 5)
            exp = random.randint(2, 3)
        else:  # age_14
            base = random.randint(2, 10)
            exp = random.randint(2, 4)
        
        answer = base ** exp
        question_text = f"{base}^{exp} = ?"
        options = [str(answer)]
        spread = max(5, answer // 5)
        while len(options) < 4:
            offset = random.randint(1, spread)
            wrong = answer + random.choice([-1, 1]) * offset
            if str(wrong) not in options and wrong > 0:
                options.append(str(wrong))
        random.shuffle(options)
        
        return {"type": "exponents", "question": question_text, "options": options, "correct_answer": str(answer), "visual_data": {"base": base, "exp": exp}}
    
    # ==================== SQUARE ROOTS (Ages 13+) ====================
    elif module == "square_roots":
        if age_category == "age_13":
            answer = random.choice([2, 3, 4, 5, 6, 7, 8, 9, 10])
        else:  # age_14
            answer = random.choice([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
        
        number = answer * answer
        question_text = f"√{number} = ?"
        options = [str(answer)]
        while len(options) < 4:
            wrong = answer + random.choice([-2, -1, 1, 2])
            if str(wrong) not in options and wrong > 0:
                options.append(str(wrong))
        random.shuffle(options)
        
        return {"type": "square_roots", "question": question_text, "options": options, "correct_answer": str(answer), "visual_data": {"number": number}}
    
    # ==================== SHAPES (Ages 5-8 only) ====================
    elif module == "shapes":
        shapes = [
            {"name": "Circle", "emoji": "🔴"}, 
            {"name": "Square", "emoji": "🟦"}, 
            {"name": "Triangle", "emoji": "🔺"}, 
            {"name": "Star", "emoji": "⭐"}, 
            {"name": "Heart", "emoji": "❤️"}, 
            {"name": "Diamond", "emoji": "🔷"}
        ]
        shape = random.choice(shapes)
        options = [shape["name"]]
        other = [s["name"] for s in shapes if s["name"] != shape["name"]]
        options.extend(random.sample(other, 3))
        random.shuffle(options)
        return {"type": "shapes", "question": "What shape is this?", "options": options, "correct_answer": shape["name"], "visual_data": {"shape": shape["name"], "emoji": shape["emoji"]}}
    
    # ==================== GEOMETRY (Ages 12+) ====================
    elif module == "geometry":
        problem_type = random.choice(["area_rectangle", "area_triangle", "perimeter"])
        
        if problem_type == "area_rectangle":
            length = random.randint(5, 20)
            width = random.randint(3, 15)
            answer = length * width
            question_text = f"Area of rectangle: length={length}, width={width}"
        elif problem_type == "area_triangle":
            base = random.randint(4, 16)
            height = random.randint(4, 16)
            answer = (base * height) // 2
            question_text = f"Area of triangle: base={base}, height={height}"
        else:  # perimeter
            length = random.randint(5, 20)
            width = random.randint(3, 15)
            answer = 2 * (length + width)
            question_text = f"Perimeter of rectangle: length={length}, width={width}"
        
        options = [str(answer)]
        spread = max(5, answer // 5)
        while len(options) < 4:
            offset = random.randint(1, spread)
            wrong = answer + random.choice([-1, 1]) * offset
            if str(wrong) not in options and wrong > 0:
                options.append(str(wrong))
        random.shuffle(options)
        
        return {"type": "geometry", "question": question_text, "options": options, "correct_answer": str(answer), "visual_data": {"problem_type": problem_type}}
    
    return None

@api_router.get("/question/{module}")
async def get_question(module: str, age_category: str = "age_5_6"):
    if module == "quiz":
        # Age-appropriate quiz modules based on curriculum
        if age_category == "age_5_6":
            module = random.choice(["counting", "numbers", "addition", "shapes"])
        elif age_category == "age_7":
            module = random.choice(["counting", "addition", "subtraction", "shapes"])
        elif age_category == "age_8":
            module = random.choice(["addition", "subtraction", "multiplication", "shapes"])
        elif age_category == "age_9":
            module = random.choice(["addition", "subtraction", "multiplication", "division"])
        elif age_category == "age_10":
            module = random.choice(["addition", "subtraction", "multiplication", "division", "fractions"])
        elif age_category == "age_11":
            module = random.choice(["multiplication", "division", "fractions", "percentages"])
        elif age_category == "age_12":
            module = random.choice(["multiplication", "division", "percentages", "algebra", "geometry"])
        elif age_category == "age_13":
            module = random.choice(["algebra", "exponents", "square_roots", "geometry"])
        else:  # age_14
            module = random.choice(["algebra", "exponents", "square_roots", "geometry"])
    
    question = generate_question(module, age_category)
    if not question:
        raise HTTPException(status_code=400, detail="Invalid module")
    
    question["id"] = str(uuid.uuid4())
    return question

# ============= ADMIN ROUTES =============
@api_router.get("/admin/users")
async def admin_get_users(user = Depends(get_admin_user)):
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(1000)
    return users

@api_router.get("/admin/children")
async def admin_get_children(user = Depends(get_admin_user)):
    children = await db.children.find({}, {"_id": 0}).to_list(1000)
    return children

@api_router.get("/admin/payments")
async def admin_get_payments(user = Depends(get_admin_user)):
    payments = await db.payment_transactions.find({}, {"_id": 0}).to_list(1000)
    return payments

@api_router.put("/admin/payments/{transaction_id}/approve")
async def admin_approve_payment(transaction_id: str, user = Depends(get_admin_user)):
    transaction = await db.payment_transactions.find_one({"id": transaction_id})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    await db.payment_transactions.update_one(
        {"id": transaction_id},
        {"$set": {"payment_status": "paid", "approved_by": user["user_id"], "approved_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    expires = datetime.now(timezone.utc) + timedelta(days=365 if transaction["plan_type"] == "yearly" else 30)
    await db.children.update_one(
        {"id": transaction["child_id"]},
        {"$set": {"subscription_active": True, "subscription_expires": expires.isoformat()}}
    )
    
    # Send email notification
    try:
        parent = await db.users.find_one({"id": transaction["user_id"]}, {"_id": 0})
        child = await db.children.find_one({"id": transaction["child_id"]}, {"_id": 0})
        if parent and parent.get("email"):
            await send_payment_approved_email(
                parent["email"],
                parent.get("name", "Parent"),
                child.get("name", "Your child"),
                transaction["plan_type"],
                expires.strftime("%B %d, %Y")
            )
    except Exception as e:
        logger.error(f"Failed to send email notification: {e}")
    
    return {"message": "Payment approved"}

# Email sending function
async def send_payment_approved_email(to_email: str, parent_name: str, child_name: str, plan_type: str, expires_date: str):
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #FFD500; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: #0A0B10; margin: 0;">MathPlayKids</h1>
        </div>
        <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0;">
            <h2 style="color: #0A0B10;">Payment Approved! 🎉</h2>
            <p style="color: #333; font-size: 16px;">Hi {parent_name},</p>
            <p style="color: #333; font-size: 16px;">
                Great news! Your payment has been verified and <strong>{child_name}'s</strong> subscription is now active.
            </p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Plan:</strong> {plan_type.capitalize()}</p>
                <p style="margin: 5px 0;"><strong>Valid Until:</strong> {expires_date}</p>
            </div>
            <p style="color: #333; font-size: 16px;">
                {child_name} now has access to all lessons and games. Start learning today!
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="#" style="background-color: #0047FF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    Start Learning
                </a>
            </div>
            <p style="color: #666; font-size: 14px;">
                Thank you for choosing MathPlayKids!<br>
                The MathPlayKids Team
            </p>
        </div>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="color: #999; font-size: 12px; margin: 0;">© 2026 MathPlayKids. Making math fun!</p>
        </div>
    </div>
    """
    
    params = {
        "from": SENDER_EMAIL,
        "to": [to_email],
        "subject": f"Payment Approved - {child_name}'s Subscription is Active!",
        "html": html_content
    }
    
    try:
        await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Payment approval email sent to {to_email}")
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        raise

@api_router.post("/admin/lessons")
async def admin_create_lesson(data: LessonCreate, user = Depends(get_admin_user)):
    lesson = {
        "id": str(uuid.uuid4()),
        "title": data.title,
        "description": data.description,
        "age_category": data.age_category,
        "module_type": data.module_type,
        "content": data.content,
        "is_free": data.is_free,
        "created_by": user["user_id"],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.lessons.insert_one(lesson)
    return {"id": lesson["id"], "message": "Lesson created"}

@api_router.get("/admin/lessons")
async def admin_get_lessons(user = Depends(get_admin_user)):
    lessons = await db.lessons.find({}, {"_id": 0}).to_list(1000)
    return lessons

@api_router.get("/admin/lessons/{lesson_id}")
async def admin_get_lesson(lesson_id: str, user = Depends(get_admin_user)):
    lesson = await db.lessons.find_one({"id": lesson_id}, {"_id": 0})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson

@api_router.put("/admin/lessons/{lesson_id}")
async def admin_update_lesson(lesson_id: str, data: LessonCreate, user = Depends(get_admin_user)):
    lesson = await db.lessons.find_one({"id": lesson_id})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    update_data = {
        "title": data.title,
        "description": data.description,
        "age_category": data.age_category,
        "module_type": data.module_type,
        "content": data.content,
        "is_free": data.is_free,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.lessons.update_one({"id": lesson_id}, {"$set": update_data})
    return {"message": "Lesson updated"}

@api_router.delete("/admin/lessons/{lesson_id}")
async def admin_delete_lesson(lesson_id: str, user = Depends(get_admin_user)):
    result = await db.lessons.delete_one({"id": lesson_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return {"message": "Lesson deleted"}

# Bulk question import from CSV
@api_router.post("/admin/lessons/import-questions")
async def import_questions_csv(file: UploadFile = File(...), user = Depends(get_admin_user)):
    """
    Import questions from CSV file.
    CSV format: question,option1,option2,option3,option4,correct_answer,visual_hint
    Returns list of parsed questions to be added to a lesson.
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    
    try:
        content = await file.read()
        decoded = content.decode('utf-8')
        reader = csv.DictReader(io.StringIO(decoded))
        
        questions = []
        errors = []
        
        for i, row in enumerate(reader, start=2):  # Start at 2 since row 1 is header
            try:
                question = row.get('question', '').strip()
                option1 = row.get('option1', '').strip()
                option2 = row.get('option2', '').strip()
                option3 = row.get('option3', '').strip()
                option4 = row.get('option4', '').strip()
                correct = row.get('correct_answer', '').strip()
                hint = row.get('visual_hint', '').strip()
                
                if not question:
                    errors.append(f"Row {i}: Missing question")
                    continue
                    
                options = [option1, option2, option3, option4]
                if not all(options):
                    errors.append(f"Row {i}: Missing options")
                    continue
                    
                if correct not in options:
                    errors.append(f"Row {i}: Correct answer '{correct}' not in options")
                    continue
                
                questions.append({
                    "id": i,
                    "question": question,
                    "options": options,
                    "correct_answer": correct,
                    "visual_hint": hint
                })
            except Exception as e:
                errors.append(f"Row {i}: {str(e)}")
        
        return {
            "success": True,
            "questions": questions,
            "count": len(questions),
            "errors": errors
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")

@api_router.get("/admin/stats")
async def admin_get_stats(user = Depends(get_admin_user)):
    total_users = await db.users.count_documents({})
    total_children = await db.children.count_documents({})
    active_subs = await db.children.count_documents({"subscription_active": True})
    total_revenue = 0
    payments = await db.payment_transactions.find({"payment_status": "paid"}).to_list(10000)
    for p in payments:
        total_revenue += p.get("amount", 0)
    
    return {
        "total_users": total_users,
        "total_children": total_children,
        "active_subscriptions": active_subs,
        "total_revenue": total_revenue,
        "pending_payments": await db.payment_transactions.count_documents({"payment_status": "pending_verification"})
    }

# ============= SETUP ADMIN =============
@api_router.post("/setup/admin")
async def setup_admin():
    existing = await db.users.find_one({"email": "admin@mathplay.com"})
    if existing:
        return {"message": "Admin already exists"}
    
    admin_id = str(uuid.uuid4())
    admin = {
        "id": admin_id,
        "email": "admin@mathplay.com",
        "password": hash_password("admin123"),
        "name": "Admin",
        "is_admin": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(admin)
    return {"message": "Admin created", "email": "admin@mathplay.com", "password": "admin123"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
