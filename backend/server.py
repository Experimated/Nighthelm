from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")


# ─── Models ───────────────────────────────────────────────────────────────────

class Recipient(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    relationship: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class RecipientCreate(BaseModel):
    name: str
    email: str
    relationship: str


class ScheduledMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    recipient_email: str
    recipient_name: str
    subject: str
    body: str
    scheduled_for: str
    status: str = "scheduled"
    sender_mode: str = "simulation"
    reply_to_email: Optional[str] = None
    sent_at: Optional[str] = None
    cancelled_at: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ScheduledMessageCreate(BaseModel):
    recipient_email: str
    recipient_name: str
    subject: str
    body: str
    scheduled_for: str
    status: str = "scheduled"
    sender_mode: str = "simulation"
    reply_to_email: Optional[str] = None


class UsedReason(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    recipient_id: str
    reason_type: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class UsedReasonCreate(BaseModel):
    recipient_id: str
    reason_type: str


class GenerateExcusesRequest(BaseModel):
    reason: str
    recipient_type: str


class AnalyzeMessageRequest(BaseModel):
    text: str
    recipient_type: str = "colleague"


# ─── Recipients ───────────────────────────────────────────────────────────────

@api_router.get("/recipients", response_model=List[Recipient])
async def get_recipients():
    docs = await db.recipients.find({}, {"_id": 0}).to_list(100)
    return docs


@api_router.post("/recipients", response_model=Recipient)
async def create_recipient(data: RecipientCreate):
    recipient = Recipient(**data.model_dump())
    await db.recipients.insert_one(recipient.model_dump())
    return recipient


@api_router.put("/recipients/{recipient_id}", response_model=Recipient)
async def update_recipient(recipient_id: str, data: RecipientCreate):
    result = await db.recipients.update_one(
        {"id": recipient_id},
        {"$set": data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Recipient not found")
    doc = await db.recipients.find_one({"id": recipient_id}, {"_id": 0})
    return doc


@api_router.delete("/recipients/{recipient_id}")
async def delete_recipient(recipient_id: str):
    result = await db.recipients.delete_one({"id": recipient_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Recipient not found")
    await db.used_reasons.delete_many({"recipient_id": recipient_id})
    return {"message": "Deleted"}


# ─── Messages ─────────────────────────────────────────────────────────────────

@api_router.get("/messages", response_model=List[ScheduledMessage])
async def get_messages():
    docs = await db.messages.find(
        {"status": {"$in": ["scheduled", "pending", "sent"]}}, {"_id": 0}
    ).to_list(200)
    return docs


@api_router.post("/messages", response_model=ScheduledMessage)
async def create_message(data: ScheduledMessageCreate):
    message = ScheduledMessage(**data.model_dump())
    await db.messages.insert_one(message.model_dump())
    return message


@api_router.delete("/messages")
async def cancel_all_messages():
    now = datetime.now(timezone.utc).isoformat()
    await db.messages.update_many(
        {"status": {"$in": ["scheduled", "pending"]}},
        {"$set": {"status": "cancelled", "cancelled_at": now}}
    )
    return {"message": "All cancelled"}


@api_router.delete("/messages/{message_id}")
async def cancel_message(message_id: str, permanent: bool = False):
    if permanent:
        result = await db.messages.delete_one({"id": message_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Message not found")
        return {"message": "Deleted"}
    result = await db.messages.update_one(
        {"id": message_id},
        {"$set": {"status": "cancelled", "cancelled_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"message": "Cancelled"}


# ─── Used Reasons ─────────────────────────────────────────────────────────────

@api_router.get("/used-reasons/{recipient_id}", response_model=List[UsedReason])
async def get_used_reasons(recipient_id: str):
    docs = await db.used_reasons.find({"recipient_id": recipient_id}, {"_id": 0}).to_list(100)
    return docs


@api_router.post("/used-reasons", response_model=UsedReason)
async def add_used_reason(data: UsedReasonCreate):
    existing = await db.used_reasons.find_one({
        "recipient_id": data.recipient_id,
        "reason_type": data.reason_type
    })
    if existing:
        existing.pop("_id", None)
        return existing
    reason = UsedReason(**data.model_dump())
    await db.used_reasons.insert_one(reason.model_dump())
    return reason


# ─── AI Endpoints ─────────────────────────────────────────────────────────────

from ai_service import generate_excuses, analyze_message


@api_router.post("/ai/excuses")
async def ai_generate_excuses(data: GenerateExcusesRequest):
    excuses = await generate_excuses(data.reason, data.recipient_type)
    return {"excuses": excuses}


@api_router.post("/ai/analyze")
async def ai_analyze_message(data: AnalyzeMessageRequest):
    result = await analyze_message(data.text, data.recipient_type)
    return result


# ─── Health ───────────────────────────────────────────────────────────────────

@api_router.get("/")
async def root():
    return {"message": "NightHelm API running"}


# ─── Settings ─────────────────────────────────────────────────────────────────

class SenderSettings(BaseModel):
    sender_name: str = ""
    sender_email: str = ""


@api_router.get("/settings")
async def get_settings():
    doc = await db.app_settings.find_one({"key": "sender"}, {"_id": 0})
    if not doc:
        return {"sender_name": "", "sender_email": ""}
    return {"sender_name": doc.get("sender_name", ""), "sender_email": doc.get("sender_email", "")}


@api_router.put("/settings")
async def update_settings(data: SenderSettings):
    await db.app_settings.update_one(
        {"key": "sender"},
        {"$set": {"key": "sender", "sender_name": data.sender_name, "sender_email": data.sender_email}},
        upsert=True,
    )
    doc = await db.app_settings.find_one({"key": "sender"}, {"_id": 0})
    return {"sender_name": doc.get("sender_name", ""), "sender_email": doc.get("sender_email", "")}


# ─── App setup ────────────────────────────────────────────────────────────────

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
