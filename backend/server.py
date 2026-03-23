from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
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

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'default-secret')
JWT_ALGORITHM = "HS256"

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
    else:
        raise HTTPException(status_code=400, detail="Age must be between 5 and 10")
    
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
async def update_child_progress(child_id: str, module: str, stars: int = 1, user = Depends(get_current_user)):
    child = await db.children.find_one({"id": child_id, "parent_id": user["user_id"]})
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    
    progress = child.get("progress", {})
    module_field = f"{module}_stars"
    if module_field in progress:
        progress[module_field] = progress.get(module_field, 0) + stars
    progress["total_stars"] = progress.get("total_stars", 0) + stars
    
    # Check badges
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
    progress["badges"] = badges
    
    await db.children.update_one({"id": child_id}, {"$set": {"progress": progress}})
    return progress

# ============= PRICING ROUTES =============
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
    host_url = str(request.base_url).rstrip("/")
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=f"{host_url}/api/webhook/stripe")
    
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
@api_router.get("/lessons/{age_category}")
async def get_lessons(age_category: str, user = Depends(get_current_user)):
    lessons = await db.lessons.find({"age_category": age_category}, {"_id": 0}).to_list(100)
    return lessons

@api_router.get("/lessons/{age_category}/free")
async def get_free_lessons(age_category: str):
    lessons = await db.lessons.find({"age_category": age_category, "is_free": True}, {"_id": 0}).to_list(100)
    return lessons

# ============= QUESTION GENERATOR =============
def generate_question(module: str, age_category: str):
    objects = ["🍎", "🌟", "🎈", "🐻", "🌸", "🦋", "🍪", "🚗"]
    
    # Adjust difficulty based on age
    max_count = 10 if age_category == "age_5_6" else 15 if age_category in ["age_7", "age_8"] else 20
    max_add = 9 if age_category == "age_5_6" else 12 if age_category in ["age_7", "age_8"] else 15
    
    if module == "counting":
        count = random.randint(1, max_count)
        obj = random.choice(objects)
        options = [str(count)]
        while len(options) < 4:
            wrong = random.randint(1, max_count + 2)
            if str(wrong) not in options:
                options.append(str(wrong))
        random.shuffle(options)
        return {"type": "counting", "question": f"How many {obj} do you see?", "options": options, "correct_answer": str(count), "visual_data": {"object": obj, "count": count}}
    
    elif module == "numbers":
        number = random.randint(1, max_count)
        options = [str(number)]
        while len(options) < 4:
            wrong = random.randint(1, max_count)
            if str(wrong) not in options:
                options.append(str(wrong))
        random.shuffle(options)
        return {"type": "numbers", "question": "What number is this?", "options": options, "correct_answer": str(number), "visual_data": {"number": number}}
    
    elif module == "addition":
        a = random.randint(1, max_add)
        b = random.randint(1, max_add)
        answer = a + b
        options = [str(answer)]
        while len(options) < 4:
            wrong = random.randint(2, max_add * 2)
            if str(wrong) not in options:
                options.append(str(wrong))
        random.shuffle(options)
        obj = random.choice(objects)
        return {"type": "addition", "question": f"{a} + {b} = ?", "options": options, "correct_answer": str(answer), "visual_data": {"a": a, "b": b, "object": obj}}
    
    elif module == "subtraction":
        a = random.randint(5, max_add + 5)
        b = random.randint(1, a - 1)
        answer = a - b
        options = [str(answer)]
        while len(options) < 4:
            wrong = random.randint(0, max_add)
            if str(wrong) not in options:
                options.append(str(wrong))
        random.shuffle(options)
        obj = random.choice(objects)
        return {"type": "subtraction", "question": f"{a} - {b} = ?", "options": options, "correct_answer": str(answer), "visual_data": {"a": a, "b": b, "object": obj}}
    
    elif module == "shapes":
        shapes = [{"name": "Circle", "emoji": "🔴"}, {"name": "Square", "emoji": "🟦"}, {"name": "Triangle", "emoji": "🔺"}, {"name": "Star", "emoji": "⭐"}, {"name": "Heart", "emoji": "❤️"}, {"name": "Diamond", "emoji": "🔷"}]
        shape = random.choice(shapes)
        options = [shape["name"]]
        other = [s["name"] for s in shapes if s["name"] != shape["name"]]
        options.extend(random.sample(other, 3))
        random.shuffle(options)
        return {"type": "shapes", "question": "What shape is this?", "options": options, "correct_answer": shape["name"], "visual_data": {"shape": shape["name"], "emoji": shape["emoji"]}}
    
    return None

@api_router.get("/question/{module}")
async def get_question(module: str, age_category: str = "age_5_6"):
    if module == "quiz":
        module = random.choice(["counting", "numbers", "addition", "subtraction", "shapes"])
    
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
    
    return {"message": "Payment approved"}

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
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.lessons.insert_one(lesson)
    return {"id": lesson["id"], "message": "Lesson created"}

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
