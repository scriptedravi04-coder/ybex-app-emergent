"""Ybex - India's Most Transparent Influencer Marketplace - Backend API"""
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, Query, UploadFile, File, Header
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import jwt
import bcrypt
import httpx
import requests
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get('JWT_SECRET', 'dev-secret')
JWT_ALG = 'HS256'

app = FastAPI(title="Ybex API")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# =================== Helpers ===================
def now_utc():
    return datetime.now(timezone.utc)

def iso(dt: datetime) -> str:
    return dt.isoformat()

def new_id(prefix: str = "id") -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"

def create_jwt(user_id: str) -> str:
    payload = {"user_id": user_id, "exp": now_utc() + timedelta(days=7)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False


async def get_user_from_token(token: str) -> Optional[dict]:
    """Resolve a user from either JWT or session_token."""
    if not token:
        return None
    # Try JWT
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
        uid = payload.get("user_id")
        if uid:
            user = await db.users.find_one({"user_id": uid}, {"_id": 0, "password_hash": 0})
            if user:
                return user
    except Exception:
        pass
    # Try session_token (Emergent OAuth)
    sess = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if sess:
        expires_at = sess.get("expires_at")
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at)
        if expires_at and (expires_at.tzinfo is None):
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at and expires_at < now_utc():
            return None
        user = await db.users.find_one({"user_id": sess["user_id"]}, {"_id": 0, "password_hash": 0})
        return user
    return None


async def auth_required(request: Request) -> dict:
    # Try cookie first
    token = request.cookies.get("session_token")
    if not token:
        ah = request.headers.get("Authorization") or ""
        if ah.startswith("Bearer "):
            token = ah[7:]
    user = await get_user_from_token(token) if token else None
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user


async def optional_user(request: Request) -> Optional[dict]:
    """Resolve the current user if present, else None (no error)."""
    token = request.cookies.get("session_token")
    if not token:
        ah = request.headers.get("Authorization") or ""
        if ah.startswith("Bearer "):
            token = ah[7:]
    if not token:
        return None
    try:
        return await get_user_from_token(token)
    except Exception:
        return None


# =================== Platform Fee Engine ===================
# All percentages are admin-controlled and applied SERVER-SIDE so the
# markup/deduction stays invisible to brands, agencies, and creators.
DEFAULT_SETTINGS = {
    "brand_markup_pct": 2.0,       # added to creator rates shown to brands
    "creator_deduction_pct": 2.0,  # deducted from budgets/payouts shown to creators
    "agency_markup_pct": 5.0,      # added to creator rates shown to agencies
    "agency_deduction_pct": 5.0,   # deducted from agency-side payouts
}


async def get_settings() -> dict:
    s = await db.platform_settings.find_one({"_id": "global"}) or {}
    out = dict(DEFAULT_SETTINGS)
    for k in DEFAULT_SETTINGS:
        v = s.get(k)
        if isinstance(v, (int, float)):
            out[k] = float(v)
    return out


def markup_for_role(role: Optional[str], settings: dict) -> float:
    """Percentage added to creator rates for the viewing role."""
    if role == "brand":
        return settings["brand_markup_pct"]
    if role == "talent_manager":
        return settings["agency_markup_pct"]
    return 0.0  # creators see their own real rates; admins see real data


def deduction_for_role(role: Optional[str], settings: dict) -> float:
    """Percentage deducted from budgets/payouts shown to the viewing role."""
    if role == "creator":
        return settings["creator_deduction_pct"]
    if role == "talent_manager":
        return settings["agency_deduction_pct"]
    return 0.0


def _apply_pct(value, pct: float, direction: int) -> Any:
    """direction +1 = markup, -1 = deduction."""
    if not isinstance(value, (int, float)) or not pct:
        return value
    factor = 1 + (direction * pct / 100.0)
    return int(round(value * factor))


def transform_rate_card(rc: Optional[dict], pct: float) -> dict:
    if not rc or not pct:
        return rc or {}
    return {k: _apply_pct(v, pct, 1) for k, v in rc.items()}


# =================== Models ===================
class SignupReq(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginReq(BaseModel):
    email: EmailStr
    password: str

class RoleUpdateReq(BaseModel):
    role: str  # creator | brand | talent_manager

class CreatorProfileReq(BaseModel):
    bio: Optional[str] = ""
    category: Optional[str] = ""
    sub_categories: Optional[List[str]] = []
    city: Optional[str] = ""
    state: Optional[str] = ""
    languages: Optional[List[str]] = []
    gender: Optional[str] = ""
    instagram: Optional[str] = ""
    youtube: Optional[str] = ""
    twitter: Optional[str] = ""
    linkedin: Optional[str] = ""
    followers_instagram: Optional[int] = 0
    followers_youtube: Optional[int] = 0
    rate_card: Optional[Dict[str, int]] = {}  # {"reel": 5000, "story": 2000, "yt_video": 25000}
    barter: Optional[str] = "cash_only"  # cash_only | barter_ok | partial_barter
    payment_terms: Optional[str] = "within_30_days"
    portfolio: Optional[List[str]] = []
    past_brands: Optional[List[str]] = []
    photo: Optional[str] = ""
    creator_type: Optional[str] = "influencer"
    work_mode: Optional[str] = "active"

class BrandProfileReq(BaseModel):
    company_name: str
    industry: str
    team_size: Optional[str] = ""
    website: Optional[str] = ""
    description: Optional[str] = ""
    logo: Optional[str] = ""

class CampaignReq(BaseModel):
    title: str
    description: str
    budget_min: int
    budget_max: int
    deliverables: List[str]
    categories: List[str]
    platforms: List[str]
    deadline: Optional[str] = ""
    language: Optional[str] = "Hindi"

class CollabReq(BaseModel):
    creator_id: str
    deliverable: str
    proposed_amount: int
    message: str

class WaveReq(BaseModel):
    creator_id: str
    message: Optional[str] = ""

class CampaignApplyReq(BaseModel):
    campaign_id: str
    proposed_amount: int
    pitch: str

class SettingsReq(BaseModel):
    brand_markup_pct: Optional[float] = None
    creator_deduction_pct: Optional[float] = None
    agency_markup_pct: Optional[float] = None
    agency_deduction_pct: Optional[float] = None

class ReportReq(BaseModel):
    type: str               # content_violation | fake_engagement | payment_dispute | spam | other
    severity: str = "medium"  # low | medium | high | critical
    target: str             # e.g. "Post #123", "@handle", "Campaign #456"
    description: Optional[str] = ""

class VerificationDecisionReq(BaseModel):
    note: Optional[str] = ""


# =================== Auth Endpoints ===================
@api.post("/auth/signup")
async def signup(req: SignupReq, response: Response):
    existing = await db.users.find_one({"email": req.email.lower()}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = new_id("user")
    user = {
        "user_id": user_id,
        "email": req.email.lower(),
        "name": req.name,
        "password_hash": hash_password(req.password),
        "role": None,
        "picture": "",
        "auth_method": "email",
        "created_at": iso(now_utc()),
        "onboarded": False,
    }
    await db.users.insert_one(user)
    token = create_jwt(user_id)
    response.set_cookie("session_token", token, httponly=True, secure=True, samesite="none", max_age=7*24*3600, path="/")
    safe_user = {k: v for k, v in user.items() if k not in ("password_hash", "_id")}
    return {"token": token, "user": safe_user}


@api.post("/auth/login")
async def login(req: LoginReq, response: Response):
    user = await db.users.find_one({"email": req.email.lower()})
    if not user or not user.get("password_hash") or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_jwt(user["user_id"])
    response.set_cookie("session_token", token, httponly=True, secure=True, samesite="none", max_age=7*24*3600, path="/")
    user.pop("_id", None)
    user.pop("password_hash", None)
    return {"token": token, "user": user}


@api.post("/auth/session")
async def process_session(request: Request, response: Response):
    """Exchange Emergent OAuth session_id for a session_token."""
    body = await request.json()
    session_id = body.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    # REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    async with httpx.AsyncClient(timeout=10) as hc:
        r = await hc.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id},
        )
        if r.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session_id")
        data = r.json()

    email = data["email"].lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        user_id = existing["user_id"]
        await db.users.update_one({"user_id": user_id}, {"$set": {"picture": data.get("picture", existing.get("picture", ""))}})
    else:
        user_id = new_id("user")
        await db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": data.get("name", ""),
            "picture": data.get("picture", ""),
            "role": None,
            "auth_method": "google",
            "created_at": iso(now_utc()),
            "onboarded": False,
        })

    session_token = data["session_token"]
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": iso(now_utc() + timedelta(days=7)),
        "created_at": iso(now_utc()),
    })
    response.set_cookie("session_token", session_token, httponly=True, secure=True, samesite="none", max_age=7*24*3600, path="/")
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
    return {"user": user}


@api.get("/auth/me")
async def me(request: Request):
    user = await auth_required(request)
    return user


@api.post("/auth/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    response.delete_cookie("session_token", path="/")
    return {"ok": True}


@api.post("/auth/role")
async def set_role(req: RoleUpdateReq, request: Request):
    user = await auth_required(request)
    if req.role not in ["creator", "brand", "talent_manager"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    await db.users.update_one({"user_id": user["user_id"]}, {"$set": {"role": req.role}})
    return {"ok": True, "role": req.role}


async def admin_required(request: Request) -> dict:
    user = await auth_required(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return user


# =================== Admin ===================
@api.get("/admin/stats")
async def admin_stats(request: Request):
    await admin_required(request)
    return {
        "users": await db.users.count_documents({}),
        "creators": await db.creator_profiles.count_documents({}),
        "brands": await db.brand_profiles.count_documents({}),
        "campaigns": await db.campaigns.count_documents({}),
        "live_campaigns": await db.campaigns.count_documents({"status": "live"}),
        "collabs": await db.collabs.count_documents({}),
        "waves": await db.waves.count_documents({}),
        "messages": await db.chat_messages.count_documents({}),
        "pending_verifications": await db.verifications.count_documents({"status": "pending"}),
        "open_reports": await db.reports.count_documents({"status": "open"}),
        "critical_reports": await db.reports.count_documents({"status": "open", "severity": {"$in": ["high", "critical"]}}),
    }


@api.get("/admin/users")
async def admin_users(request: Request, limit: int = 100):
    await admin_required(request)
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).sort("created_at", -1).to_list(limit)
    return users


@api.get("/admin/campaigns")
async def admin_campaigns(request: Request):
    await admin_required(request)
    return await db.campaigns.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)


@api.post("/admin/users/{user_id}/ban")
async def admin_ban(user_id: str, request: Request):
    await admin_required(request)
    await db.users.update_one({"user_id": user_id}, {"$set": {"banned": True}})
    return {"ok": True}


@api.post("/admin/users/{user_id}/unban")
async def admin_unban(user_id: str, request: Request):
    await admin_required(request)
    await db.users.update_one({"user_id": user_id}, {"$set": {"banned": False}})
    return {"ok": True}


@api.delete("/admin/campaigns/{campaign_id}")
async def admin_delete_campaign(campaign_id: str, request: Request):
    await admin_required(request)
    await db.campaigns.delete_one({"campaign_id": campaign_id})
    return {"ok": True}


# ---- Fee Settings ----
@api.get("/admin/settings")
async def admin_get_settings(request: Request):
    await admin_required(request)
    return await get_settings()


@api.put("/admin/settings")
async def admin_update_settings(req: SettingsReq, request: Request):
    await admin_required(request)
    updates = {k: float(v) for k, v in req.model_dump().items() if v is not None}
    # Clamp to a sane range
    for k in list(updates):
        updates[k] = max(0.0, min(50.0, updates[k]))
    if updates:
        await db.platform_settings.update_one({"_id": "global"}, {"$set": updates}, upsert=True)
    return await get_settings()


# ---- Verifications ----
@api.get("/admin/verifications")
async def admin_verifications(request: Request, status: Optional[str] = None, kind: Optional[str] = None):
    await admin_required(request)
    q: Dict[str, Any] = {}
    if status:
        q["status"] = status
    if kind:
        q["kind"] = kind
    items = await db.verifications.find(q, {"_id": 0}).sort("created_at", -1).to_list(200)
    return items


@api.post("/admin/verifications/{verification_id}/approve")
async def admin_approve_verification(verification_id: str, req: VerificationDecisionReq, request: Request):
    admin = await admin_required(request)
    v = await db.verifications.find_one({"verification_id": verification_id}, {"_id": 0})
    if not v:
        raise HTTPException(status_code=404, detail="Not found")
    await db.verifications.update_one(
        {"verification_id": verification_id},
        {"$set": {"status": "approved", "reviewed_by": admin["user_id"], "review_note": req.note, "reviewed_at": iso(now_utc())}},
    )
    target_user = v.get("user_id")
    if target_user:
        if v.get("kind") == "brand":
            await db.brand_profiles.update_one({"user_id": target_user}, {"$set": {"verified": True}})
        else:
            await db.creator_profiles.update_one({"user_id": target_user}, {"$set": {"verified": True}})
        await db.users.update_one({"user_id": target_user}, {"$set": {"verified": True}})
        await db.notifications.insert_one({
            "notif_id": new_id("notif"), "user_id": target_user, "type": "verification",
            "message": "Your account has been verified", "read": False, "created_at": iso(now_utc()),
        })
    return {"ok": True}


@api.post("/admin/verifications/{verification_id}/reject")
async def admin_reject_verification(verification_id: str, req: VerificationDecisionReq, request: Request):
    admin = await admin_required(request)
    v = await db.verifications.find_one({"verification_id": verification_id}, {"_id": 0})
    if not v:
        raise HTTPException(status_code=404, detail="Not found")
    await db.verifications.update_one(
        {"verification_id": verification_id},
        {"$set": {"status": "rejected", "reviewed_by": admin["user_id"], "review_note": req.note, "reviewed_at": iso(now_utc())}},
    )
    if v.get("user_id"):
        await db.notifications.insert_one({
            "notif_id": new_id("notif"), "user_id": v["user_id"], "type": "verification",
            "message": f"Your verification was not approved. {req.note or ''}".strip(), "read": False, "created_at": iso(now_utc()),
        })
    return {"ok": True}


# ---- Reports ----
@api.post("/reports")
async def create_report(req: ReportReq, request: Request):
    user = await optional_user(request)
    doc = {
        "report_id": new_id("rep"),
        **req.model_dump(),
        "status": "open",
        "reported_by": (user or {}).get("user_id", "system"),
        "reported_by_name": (user or {}).get("name", "System Auto-detect"),
        "created_at": iso(now_utc()),
    }
    await db.reports.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.get("/admin/reports")
async def admin_reports(request: Request, status: Optional[str] = None):
    await admin_required(request)
    q: Dict[str, Any] = {}
    if status:
        q["status"] = status
    return await db.reports.find(q, {"_id": 0}).sort("created_at", -1).to_list(200)


@api.post("/admin/reports/{report_id}/resolve")
async def admin_resolve_report(report_id: str, request: Request):
    admin = await admin_required(request)
    await db.reports.update_one(
        {"report_id": report_id},
        {"$set": {"status": "resolved", "resolved_by": admin["user_id"], "resolved_at": iso(now_utc())}},
    )
    return {"ok": True}


class VerificationRequestReq(BaseModel):
    documents: Optional[List[str]] = []
    note: Optional[str] = ""


@api.post("/verifications/request")
async def request_verification(req: VerificationRequestReq, request: Request):
    """A creator or brand submits themselves for verification review."""
    user = await auth_required(request)
    kind = "brand" if user.get("role") == "brand" else "creator"
    existing = await db.verifications.find_one({"user_id": user["user_id"], "status": "pending"}, {"_id": 0})
    if existing:
        return {"ok": True, "already_pending": True}
    category = ""
    handle = ""
    followers = 0
    if kind == "creator":
        prof = await db.creator_profiles.find_one({"user_id": user["user_id"]}, {"_id": 0}) or {}
        category = prof.get("category", "")
        handle = prof.get("instagram") or prof.get("youtube") or ""
        followers = (prof.get("followers_instagram") or 0) + (prof.get("followers_youtube") or 0)
    else:
        prof = await db.brand_profiles.find_one({"user_id": user["user_id"]}, {"_id": 0}) or {}
        category = prof.get("industry", "")
    doc = {
        "verification_id": new_id("ver"),
        "user_id": user["user_id"],
        "name": user["name"],
        "email": user["email"],
        "photo": user.get("picture", ""),
        "kind": kind,
        "category": category,
        "handle": handle,
        "followers": followers,
        "documents": req.documents or [],
        "note": req.note,
        "status": "pending",
        "created_at": iso(now_utc()),
    }
    await db.verifications.insert_one(doc)
    doc.pop("_id", None)
    return {"ok": True, "verification": doc}


# =================== Creator Profiles ===================
def compute_engagement_score(profile: dict) -> dict:
    """Mock AI-based scoring."""
    followers = profile.get("followers_instagram", 0) + profile.get("followers_youtube", 0)
    # Deterministic pseudo-random based on user_id
    seed = sum(ord(c) for c in profile.get("user_id", "x"))
    er = round(3.5 + (seed % 70) / 10, 2)  # 3.5% - 10.5%
    fake_pct = round((seed % 15) + 2, 1)  # 2-17%
    avg_views = max(1000, int(followers * (er / 100) * 0.7))
    perf_score = max(50, min(99, int(70 + (seed % 30) - fake_pct)))
    return {
        "engagement_rate": er,
        "fake_follower_pct": fake_pct,
        "avg_views_30d": avg_views,
        "performance_score": perf_score,
    }


@api.post("/creators/profile")
async def upsert_creator_profile(req: CreatorProfileReq, request: Request):
    user = await auth_required(request)
    data = req.model_dump()
    data["user_id"] = user["user_id"]
    data["name"] = user["name"]
    data["email"] = user["email"]
    data["picture"] = data.get("photo") or user.get("picture", "")
    data["updated_at"] = iso(now_utc())
    data.update(compute_engagement_score({**data, "user_id": user["user_id"]}))
    await db.creator_profiles.update_one(
        {"user_id": user["user_id"]},
        {"$set": data, "$setOnInsert": {"created_at": iso(now_utc()), "profile_views": 0}},
        upsert=True,
    )
    await db.users.update_one({"user_id": user["user_id"]}, {"$set": {"onboarded": True}})
    return {"ok": True}


@api.get("/creators")
async def list_creators(
    q: Optional[str] = None,
    category: Optional[str] = None,
    city: Optional[str] = None,
    platform: Optional[str] = None,
    min_followers: Optional[int] = None,
    max_followers: Optional[int] = None,
    max_budget: Optional[int] = None,
    min_engagement: Optional[float] = None,
    language: Optional[str] = None,
    gender: Optional[str] = None,
    barter: Optional[str] = None,
    creator_type: Optional[str] = None,
    sort_by: Optional[str] = "performance",
    limit: int = 60,
    request: Request = None,
):
    query: Dict[str, Any] = {}
    if q:
        query["name"] = {"$regex": q, "$options": "i"}
    if category:
        query["category"] = category
    if city:
        query["city"] = city
    if language:
        query["languages"] = language
    if gender:
        query["gender"] = gender
    if barter:
        query["barter"] = barter
    if creator_type:
        query["creator_type"] = creator_type
    if min_engagement is not None:
        query["engagement_rate"] = {"$gte": min_engagement}

    creators = await db.creator_profiles.find(query, {"_id": 0}).to_list(500)

    # Role-aware hidden markup on creator rates
    viewer = await optional_user(request) if request else None
    settings = await get_settings()
    pct = markup_for_role((viewer or {}).get("role"), settings)

    # Post filters
    def total_followers(c):
        return (c.get("followers_instagram") or 0) + (c.get("followers_youtube") or 0)

    def min_rate(c):
        rc = c.get("rate_card") or {}
        vals = [v for v in rc.values() if isinstance(v, (int, float))]
        return min(vals) if vals else 0

    out = []
    for c in creators:
        if pct:
            c["rate_card"] = transform_rate_card(c.get("rate_card"), pct)
        tf = total_followers(c)
        if min_followers is not None and tf < min_followers:
            continue
        if max_followers is not None and tf > max_followers:
            continue
        if max_budget is not None and min_rate(c) > max_budget:
            continue
        if platform == "instagram" and not c.get("instagram"):
            continue
        if platform == "youtube" and not c.get("youtube"):
            continue
        c["total_followers"] = tf
        c["min_rate"] = min_rate(c)
        out.append(c)

    if sort_by == "followers":
        out.sort(key=lambda x: x.get("total_followers", 0), reverse=True)
    elif sort_by == "engagement":
        out.sort(key=lambda x: x.get("engagement_rate", 0), reverse=True)
    elif sort_by == "budget":
        out.sort(key=lambda x: x.get("min_rate", 999999))
    else:
        out.sort(key=lambda x: x.get("performance_score", 0), reverse=True)

    return out[:limit]


@api.get("/creators/{user_id}")
async def get_creator(user_id: str, request: Request = None):
    c = await db.creator_profiles.find_one({"user_id": user_id}, {"_id": 0})
    if not c:
        raise HTTPException(status_code=404, detail="Creator not found")
    await db.creator_profiles.update_one({"user_id": user_id}, {"$inc": {"profile_views": 1}})
    # Apply hidden markup unless the viewer is the creator themselves or an admin
    viewer = await optional_user(request) if request else None
    if not viewer or (viewer.get("user_id") != user_id and viewer.get("role") != "admin"):
        settings = await get_settings()
        pct = markup_for_role((viewer or {}).get("role"), settings)
        if pct:
            c["rate_card"] = transform_rate_card(c.get("rate_card"), pct)
    return c


# =================== Brand Profiles ===================
@api.post("/brands/profile")
async def upsert_brand_profile(req: BrandProfileReq, request: Request):
    user = await auth_required(request)
    data = req.model_dump()
    data["user_id"] = user["user_id"]
    data["email"] = user["email"]
    data["updated_at"] = iso(now_utc())
    await db.brand_profiles.update_one(
        {"user_id": user["user_id"]},
        {"$set": data, "$setOnInsert": {"created_at": iso(now_utc()), "verified": False}},
        upsert=True,
    )
    await db.users.update_one({"user_id": user["user_id"]}, {"$set": {"onboarded": True}})
    return {"ok": True}


@api.get("/brands/me")
async def my_brand(request: Request):
    user = await auth_required(request)
    b = await db.brand_profiles.find_one({"user_id": user["user_id"]}, {"_id": 0})
    return b or {}


# =================== Campaigns ===================
@api.post("/campaigns")
async def post_campaign(req: CampaignReq, request: Request):
    user = await auth_required(request)
    if user.get("role") != "brand":
        raise HTTPException(status_code=403, detail="Only brands can post campaigns")
    brand = await db.brand_profiles.find_one({"user_id": user["user_id"]}, {"_id": 0})
    cid = new_id("camp")
    doc = {
        "campaign_id": cid,
        "brand_user_id": user["user_id"],
        "brand_name": brand.get("company_name", user["name"]) if brand else user["name"],
        "brand_logo": brand.get("logo", "") if brand else "",
        **req.model_dump(),
        "status": "live",
        "applicants": [],
        "created_at": iso(now_utc()),
    }
    await db.campaigns.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.get("/campaigns")
async def list_campaigns(category: Optional[str] = None, platform: Optional[str] = None, mine: Optional[bool] = False, request: Request = None):
    query: Dict[str, Any] = {}
    viewer = await optional_user(request) if request else None
    if mine and viewer:
        query["brand_user_id"] = viewer["user_id"]
    if category:
        query["categories"] = category
    if platform:
        query["platforms"] = platform
    items = await db.campaigns.find(query, {"_id": 0}).sort("created_at", -1).to_list(200)
    # Creators/agencies see budgets net of the hidden platform deduction
    settings = await get_settings()
    ded = deduction_for_role((viewer or {}).get("role"), settings)
    if ded:
        for it in items:
            if it.get("brand_user_id") != (viewer or {}).get("user_id"):
                it["budget_min"] = _apply_pct(it.get("budget_min"), ded, -1)
                it["budget_max"] = _apply_pct(it.get("budget_max"), ded, -1)
    return items


@api.get("/campaigns/{campaign_id}")
async def get_campaign(campaign_id: str, request: Request = None):
    c = await db.campaigns.find_one({"campaign_id": campaign_id}, {"_id": 0})
    if not c:
        raise HTTPException(status_code=404, detail="Not found")
    viewer = await optional_user(request) if request else None
    if not viewer or (c.get("brand_user_id") != viewer.get("user_id") and viewer.get("role") != "admin"):
        settings = await get_settings()
        ded = deduction_for_role((viewer or {}).get("role"), settings)
        if ded:
            c["budget_min"] = _apply_pct(c.get("budget_min"), ded, -1)
            c["budget_max"] = _apply_pct(c.get("budget_max"), ded, -1)
    return c


@api.post("/campaigns/apply")
async def apply_campaign(req: CampaignApplyReq, request: Request):
    user = await auth_required(request)
    if user.get("role") != "creator":
        raise HTTPException(status_code=403, detail="Only creators can apply")
    camp = await db.campaigns.find_one({"campaign_id": req.campaign_id})
    if not camp:
        raise HTTPException(status_code=404, detail="Campaign not found")
    application = {
        "application_id": new_id("app"),
        "creator_user_id": user["user_id"],
        "creator_name": user["name"],
        "proposed_amount": req.proposed_amount,
        "pitch": req.pitch,
        "status": "pending",
        "applied_at": iso(now_utc()),
    }
    await db.campaigns.update_one({"campaign_id": req.campaign_id}, {"$push": {"applicants": application}})
    await db.notifications.insert_one({
        "notif_id": new_id("notif"),
        "user_id": camp["brand_user_id"],
        "type": "campaign_application",
        "message": f"{user['name']} applied to '{camp['title']}'",
        "read": False,
        "created_at": iso(now_utc()),
    })
    return {"ok": True}


# =================== Collabs / Waves ===================
@api.post("/collabs/wave")
async def wave(req: WaveReq, request: Request):
    user = await auth_required(request)
    wid = new_id("wave")
    await db.waves.insert_one({
        "wave_id": wid,
        "from_user_id": user["user_id"],
        "from_name": user["name"],
        "to_user_id": req.creator_id,
        "message": req.message,
        "status": "pending",
        "created_at": iso(now_utc()),
    })
    await db.notifications.insert_one({
        "notif_id": new_id("notif"),
        "user_id": req.creator_id,
        "type": "wave",
        "message": f"{user['name']} waved at you",
        "read": False,
        "created_at": iso(now_utc()),
    })
    return {"ok": True}


@api.post("/collabs/request")
async def collab_request(req: CollabReq, request: Request):
    user = await auth_required(request)
    cid = new_id("collab")
    await db.collabs.insert_one({
        "collab_id": cid,
        "from_user_id": user["user_id"],
        "from_name": user["name"],
        "to_user_id": req.creator_id,
        "deliverable": req.deliverable,
        "proposed_amount": req.proposed_amount,
        "message": req.message,
        "status": "pending",
        "created_at": iso(now_utc()),
    })
    await db.notifications.insert_one({
        "notif_id": new_id("notif"),
        "user_id": req.creator_id,
        "type": "collab_request",
        "message": f"{user['name']} sent a collab request (₹{req.proposed_amount:,})",
        "read": False,
        "created_at": iso(now_utc()),
    })
    return {"ok": True}


@api.get("/collabs")
async def list_collabs(request: Request):
    user = await auth_required(request)
    sent = await db.collabs.find({"from_user_id": user["user_id"]}, {"_id": 0}).to_list(100)
    received = await db.collabs.find({"to_user_id": user["user_id"]}, {"_id": 0}).to_list(100)
    waves_sent = await db.waves.find({"from_user_id": user["user_id"]}, {"_id": 0}).to_list(100)
    waves_received = await db.waves.find({"to_user_id": user["user_id"]}, {"_id": 0}).to_list(100)
    return {"sent": sent, "received": received, "waves_sent": waves_sent, "waves_received": waves_received}


@api.post("/collabs/{collab_id}/action")
async def collab_action(collab_id: str, action: str, request: Request):
    user = await auth_required(request)
    if action not in ["accept", "decline"]:
        raise HTTPException(status_code=400, detail="Invalid action")
    status = "accepted" if action == "accept" else "declined"
    await db.collabs.update_one({"collab_id": collab_id, "to_user_id": user["user_id"]}, {"$set": {"status": status}})
    return {"ok": True}


# =================== Performance / Leaderboard ===================
@api.get("/leaderboard")
async def leaderboard(category: Optional[str] = None, city: Optional[str] = None, limit: int = 25):
    q: Dict[str, Any] = {}
    if category:
        q["category"] = category
    if city:
        q["city"] = city
    rows = await db.creator_profiles.find(q, {"_id": 0}).to_list(500)
    rows.sort(key=lambda x: x.get("performance_score", 0), reverse=True)
    return rows[:limit]


# =================== Notifications ===================
@api.get("/notifications")
async def list_notifications(request: Request):
    user = await auth_required(request)
    items = await db.notifications.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return items


@api.post("/notifications/read-all")
async def mark_all_read(request: Request):
    user = await auth_required(request)
    await db.notifications.update_many({"user_id": user["user_id"]}, {"$set": {"read": True}})
    return {"ok": True}


# =================== Dashboard Stats ===================
@api.get("/dashboard/stats")
async def dashboard_stats(request: Request):
    user = await auth_required(request)
    role = user.get("role")
    if role == "creator":
        prof = await db.creator_profiles.find_one({"user_id": user["user_id"]}, {"_id": 0}) or {}
        waves = await db.waves.count_documents({"to_user_id": user["user_id"]})
        collabs = await db.collabs.count_documents({"to_user_id": user["user_id"]})
        return {
            "profile_views": prof.get("profile_views", 0),
            "waves": waves,
            "collab_requests": collabs,
            "performance_score": prof.get("performance_score", 0),
            "engagement_rate": prof.get("engagement_rate", 0),
        }
    else:
        campaigns = await db.campaigns.count_documents({"brand_user_id": user["user_id"]})
        sent_collabs = await db.collabs.count_documents({"from_user_id": user["user_id"]})
        sent_waves = await db.waves.count_documents({"from_user_id": user["user_id"]})
        return {
            "campaigns": campaigns,
            "collabs_sent": sent_collabs,
            "waves_sent": sent_waves,
            "connections": sent_collabs,
        }


# =================== Object Storage ===================
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "ybex"
storage_key = None


def init_storage():
    global storage_key
    if storage_key:
        return storage_key
    try:
        resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
        resp.raise_for_status()
        storage_key = resp.json()["storage_key"]
        return storage_key
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
        return None


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    if not key:
        raise HTTPException(status_code=500, detail="Storage unavailable")
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120
    )
    if resp.status_code == 403:
        global storage_key
        storage_key = None
        return put_object(path, data, content_type)
    resp.raise_for_status()
    return resp.json()


def get_object(path: str):
    key = init_storage()
    if not key:
        raise HTTPException(status_code=500, detail="Storage unavailable")
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


MIME_TYPES = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png", "gif": "image/gif", "webp": "image/webp"}


@api.post("/upload")
async def upload(file: UploadFile = File(...), request: Request = None):
    user = await auth_required(request)
    ext = (file.filename.split(".")[-1] if "." in (file.filename or "") else "bin").lower()
    if ext not in MIME_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported file type")
    file_id = uuid.uuid4().hex
    path = f"{APP_NAME}/uploads/{user['user_id']}/{file_id}.{ext}"
    data = await file.read()
    if len(data) > 8 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 8MB)")
    content_type = MIME_TYPES.get(ext, "application/octet-stream")
    result = put_object(path, data, content_type)
    doc = {
        "file_id": file_id,
        "user_id": user["user_id"],
        "storage_path": result["path"],
        "original_filename": file.filename,
        "content_type": content_type,
        "size": result["size"],
        "is_deleted": False,
        "created_at": iso(now_utc()),
    }
    await db.files.insert_one(doc)
    backend_url = os.environ.get("BACKEND_PUBLIC_URL", "")
    return {"file_id": file_id, "url": f"/api/files/{file_id}", "path": result["path"]}


@api.get("/files/{file_id}")
async def get_file(file_id: str):
    record = await db.files.find_one({"file_id": file_id, "is_deleted": False}, {"_id": 0})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    data, content_type = get_object(record["storage_path"])
    return Response(content=data, media_type=record.get("content_type", content_type))


# =================== ROI Calculator + Auto Performance Scoring ===================
class CloseCampaignReq(BaseModel):
    actual_views: int
    actual_engagement_rate: float
    on_time: bool = True
    content_quality: int = 4  # 1-5
    brand_rating: int = 4  # 1-5


@api.post("/campaigns/{campaign_id}/close")
async def close_campaign(campaign_id: str, req: CloseCampaignReq, request: Request, application_id: Optional[str] = None):
    """Close a campaign with one accepted application & compute performance score for the creator."""
    user = await auth_required(request)
    camp = await db.campaigns.find_one({"campaign_id": campaign_id, "brand_user_id": user["user_id"]}, {"_id": 0})
    if not camp:
        raise HTTPException(status_code=404, detail="Campaign not found or not yours")

    applicants = camp.get("applicants", [])
    target = None
    for a in applicants:
        if (application_id and a.get("application_id") == application_id) or (not application_id and a.get("status") == "accepted"):
            target = a
            break
    if not target:
        raise HTTPException(status_code=400, detail="No accepted application found")

    paid = target.get("proposed_amount", 0)
    avg_budget = (camp.get("budget_min", 0) + camp.get("budget_max", 0)) // 2 or 1
    promised_views = max(1, paid * 5)  # rough estimate (1 view per ₹0.2)
    view_ratio = min(1.5, req.actual_views / promised_views)
    cpv = paid / max(1, req.actual_views)
    roi_score = round(((1 / max(0.01, cpv)) * 10), 2)

    # Performance score formula
    score = int(
        view_ratio * 30
        + min(req.actual_engagement_rate, 12) * 3
        + (10 if req.on_time else 0)
        + req.content_quality * 4
        + req.brand_rating * 4
    )
    score = max(40, min(99, score))

    result = {
        "campaign_id": campaign_id,
        "creator_user_id": target["creator_user_id"],
        "paid": paid,
        "actual_views": req.actual_views,
        "actual_engagement_rate": req.actual_engagement_rate,
        "cpv": round(cpv, 3),
        "roi_score": roi_score,
        "performance_score": score,
        "closed_at": iso(now_utc()),
    }
    await db.campaign_performance.insert_one(dict(result))
    result.pop("_id", None)
    await db.campaigns.update_one({"campaign_id": campaign_id}, {"$set": {"status": "closed", "performance": result}})

    # Update creator's overall performance score (weighted avg)
    creator = await db.creator_profiles.find_one({"user_id": target["creator_user_id"]}, {"_id": 0})
    if creator:
        prev = creator.get("performance_score", 70)
        new_score = int(prev * 0.7 + score * 0.3)
        await db.creator_profiles.update_one({"user_id": target["creator_user_id"]}, {"$set": {"performance_score": new_score}})

    await db.notifications.insert_one({
        "notif_id": new_id("notif"),
        "user_id": target["creator_user_id"],
        "type": "performance_score",
        "message": f"Your performance score: {score}/100 for '{camp['title']}'",
        "read": False,
        "created_at": iso(now_utc()),
    })
    return result


@api.get("/performance/{creator_id}")
async def get_creator_performance(creator_id: str):
    rows = await db.campaign_performance.find({"creator_user_id": creator_id}, {"_id": 0}).to_list(50)
    return rows


# =================== Chat (Polling) ===================
class ChatMsgReq(BaseModel):
    to_user_id: str
    text: str


def _thread_id(a: str, b: str) -> str:
    return "_".join(sorted([a, b]))


@api.post("/chat/send")
async def chat_send(req: ChatMsgReq, request: Request):
    user = await auth_required(request)
    tid = _thread_id(user["user_id"], req.to_user_id)
    msg = {
        "message_id": new_id("msg"),
        "thread_id": tid,
        "from_user_id": user["user_id"],
        "from_name": user["name"],
        "to_user_id": req.to_user_id,
        "text": req.text,
        "read": False,
        "created_at": iso(now_utc()),
    }
    await db.chat_messages.insert_one(msg)
    await db.notifications.insert_one({
        "notif_id": new_id("notif"),
        "user_id": req.to_user_id,
        "type": "chat",
        "message": f"{user['name']}: {req.text[:60]}",
        "read": False,
        "created_at": iso(now_utc()),
    })
    msg.pop("_id", None)
    return msg


@api.get("/chat/{other_user_id}")
async def chat_thread(other_user_id: str, request: Request, since: Optional[str] = None):
    user = await auth_required(request)
    tid = _thread_id(user["user_id"], other_user_id)
    query = {"thread_id": tid}
    if since:
        query["created_at"] = {"$gt": since}
    msgs = await db.chat_messages.find(query, {"_id": 0}).sort("created_at", 1).to_list(500)
    # Mark received as read
    await db.chat_messages.update_many({"thread_id": tid, "to_user_id": user["user_id"], "read": False}, {"$set": {"read": True}})
    return msgs


@api.get("/chat/threads/list")
async def list_threads(request: Request):
    user = await auth_required(request)
    uid = user["user_id"]
    threads = await db.chat_messages.aggregate([
        {"$match": {"$or": [{"from_user_id": uid}, {"to_user_id": uid}]}},
        {"$sort": {"created_at": -1}},
        {"$group": {
            "_id": "$thread_id",
            "last_text": {"$first": "$text"},
            "last_from": {"$first": "$from_user_id"},
            "last_at": {"$first": "$created_at"},
            "other_user_id": {"$first": {"$cond": [{"$eq": ["$from_user_id", uid]}, "$to_user_id", "$from_user_id"]}},
            "other_name": {"$first": {"$cond": [{"$eq": ["$from_user_id", uid]}, "$from_name", "$from_name"]}},
        }},
        {"$sort": {"last_at": -1}},
    ]).to_list(100)
    # Enrich other_name properly
    for t in threads:
        other = await db.users.find_one({"user_id": t["other_user_id"]}, {"_id": 0, "password_hash": 0})
        t["other"] = other or {"name": "Unknown"}
        t.pop("_id", None)
    return threads


# =================== Health ===================
@api.get("/")
async def root():
    return {"app": "Ybex", "status": "running"}


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


@app.on_event("startup")
async def startup_storage():
    try:
        init_storage()
        logger.info("Object storage initialized")
    except Exception as e:
        logger.warning(f"Storage init deferred: {e}")
