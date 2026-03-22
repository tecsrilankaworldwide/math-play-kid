from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Models
class Progress(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    total_stars: int = 0
    counting_stars: int = 0
    numbers_stars: int = 0
    addition_stars: int = 0
    shapes_stars: int = 0
    quiz_stars: int = 0
    badges: List[str] = []
    games_played: int = 0
    correct_answers: int = 0
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ProgressUpdate(BaseModel):
    module: str
    stars_earned: int = 1
    correct: bool = True

class QuizQuestion(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str  # counting, numbers, addition, subtraction, shapes
    question: str
    options: List[str]
    correct_answer: str
    visual_data: Optional[dict] = None

# Badge Definitions
BADGES = {
    "first_star": {"name": "First Star!", "requirement": 1},
    "five_stars": {"name": "Super Star!", "requirement": 5},
    "ten_stars": {"name": "Math Wizard!", "requirement": 10},
    "twenty_stars": {"name": "Genius!", "requirement": 20},
    "counting_master": {"name": "Counting Master", "requirement": "counting_5"},
    "number_expert": {"name": "Number Expert", "requirement": "numbers_5"},
    "addition_ace": {"name": "Addition Ace", "requirement": "addition_5"},
    "shape_detective": {"name": "Shape Detective", "requirement": "shapes_5"},
}

# Question Generators
def generate_counting_question():
    count = random.randint(1, 10)
    objects = ["🍎", "🌟", "🎈", "🐻", "🌸", "🦋", "🍪", "🚗"]
    obj = random.choice(objects)
    
    options = [str(count)]
    while len(options) < 4:
        wrong = random.randint(1, 12)
        if str(wrong) not in options:
            options.append(str(wrong))
    random.shuffle(options)
    
    return {
        "type": "counting",
        "question": f"How many {obj} do you see?",
        "options": options,
        "correct_answer": str(count),
        "visual_data": {"object": obj, "count": count}
    }

def generate_numbers_question():
    number = random.randint(1, 20)
    options = [str(number)]
    while len(options) < 4:
        wrong = random.randint(1, 20)
        if str(wrong) not in options:
            options.append(str(wrong))
    random.shuffle(options)
    
    return {
        "type": "numbers",
        "question": "What number is this?",
        "options": options,
        "correct_answer": str(number),
        "visual_data": {"number": number}
    }

def generate_addition_question():
    a = random.randint(1, 9)
    b = random.randint(1, 9)
    answer = a + b
    
    options = [str(answer)]
    while len(options) < 4:
        wrong = random.randint(2, 18)
        if str(wrong) not in options:
            options.append(str(wrong))
    random.shuffle(options)
    
    objects = ["🍎", "🌟", "🎈", "🐻", "🌸"]
    obj = random.choice(objects)
    
    return {
        "type": "addition",
        "question": f"{a} + {b} = ?",
        "options": options,
        "correct_answer": str(answer),
        "visual_data": {"a": a, "b": b, "object": obj}
    }

def generate_subtraction_question():
    a = random.randint(5, 15)
    b = random.randint(1, a - 1)
    answer = a - b
    
    options = [str(answer)]
    while len(options) < 4:
        wrong = random.randint(0, 14)
        if str(wrong) not in options:
            options.append(str(wrong))
    random.shuffle(options)
    
    objects = ["🍎", "🌟", "🎈", "🐻", "🌸"]
    obj = random.choice(objects)
    
    return {
        "type": "subtraction",
        "question": f"{a} - {b} = ?",
        "options": options,
        "correct_answer": str(answer),
        "visual_data": {"a": a, "b": b, "object": obj}
    }

def generate_shapes_question():
    shapes = [
        {"name": "Circle", "emoji": "🔴"},
        {"name": "Square", "emoji": "🟦"},
        {"name": "Triangle", "emoji": "🔺"},
        {"name": "Star", "emoji": "⭐"},
        {"name": "Heart", "emoji": "❤️"},
        {"name": "Diamond", "emoji": "🔷"},
    ]
    shape = random.choice(shapes)
    
    options = [shape["name"]]
    other_shapes = [s["name"] for s in shapes if s["name"] != shape["name"]]
    options.extend(random.sample(other_shapes, 3))
    random.shuffle(options)
    
    return {
        "type": "shapes",
        "question": "What shape is this?",
        "options": options,
        "correct_answer": shape["name"],
        "visual_data": {"shape": shape["name"], "emoji": shape["emoji"]}
    }

# Routes
@api_router.get("/")
async def root():
    return {"message": "MathPlay Kids API"}

@api_router.get("/progress", response_model=Progress)
async def get_progress():
    progress = await db.progress.find_one({}, {"_id": 0})
    if not progress:
        # Create default progress
        new_progress = Progress()
        await db.progress.insert_one(new_progress.model_dump())
        return new_progress
    return Progress(**progress)

@api_router.post("/progress/update", response_model=Progress)
async def update_progress(update: ProgressUpdate):
    progress = await db.progress.find_one({}, {"_id": 0})
    if not progress:
        progress = Progress().model_dump()
    
    # Update module-specific stars
    module_field = f"{update.module}_stars"
    if module_field in progress:
        progress[module_field] = progress.get(module_field, 0) + update.stars_earned
    
    # Update totals
    progress["total_stars"] = progress.get("total_stars", 0) + update.stars_earned
    progress["games_played"] = progress.get("games_played", 0) + 1
    if update.correct:
        progress["correct_answers"] = progress.get("correct_answers", 0) + 1
    
    # Check for new badges
    badges = progress.get("badges", [])
    total = progress["total_stars"]
    
    if total >= 1 and "first_star" not in badges:
        badges.append("first_star")
    if total >= 5 and "five_stars" not in badges:
        badges.append("five_stars")
    if total >= 10 and "ten_stars" not in badges:
        badges.append("ten_stars")
    if total >= 20 and "twenty_stars" not in badges:
        badges.append("twenty_stars")
    
    # Module-specific badges
    if progress.get("counting_stars", 0) >= 5 and "counting_master" not in badges:
        badges.append("counting_master")
    if progress.get("numbers_stars", 0) >= 5 and "number_expert" not in badges:
        badges.append("number_expert")
    if progress.get("addition_stars", 0) >= 5 and "addition_ace" not in badges:
        badges.append("addition_ace")
    if progress.get("shapes_stars", 0) >= 5 and "shape_detective" not in badges:
        badges.append("shape_detective")
    
    progress["badges"] = badges
    progress["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.progress.update_one({}, {"$set": progress}, upsert=True)
    return Progress(**progress)

@api_router.get("/question/{module}", response_model=QuizQuestion)
async def get_question(module: str):
    generators = {
        "counting": generate_counting_question,
        "numbers": generate_numbers_question,
        "addition": generate_addition_question,
        "subtraction": generate_subtraction_question,
        "shapes": generate_shapes_question,
    }
    
    if module not in generators and module != "quiz":
        raise HTTPException(status_code=400, detail="Invalid module")
    
    if module == "quiz":
        # Random module for quiz mode
        module = random.choice(list(generators.keys()))
    
    question_data = generators[module]()
    return QuizQuestion(id=str(uuid.uuid4()), **question_data)

@api_router.post("/reset-progress", response_model=Progress)
async def reset_progress():
    new_progress = Progress()
    await db.progress.delete_many({})
    await db.progress.insert_one(new_progress.model_dump())
    return new_progress

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
