"""Seed Ybex admin panel with sample verifications, reports, and an admin user.

Run AFTER seed_data.py so the demo creators/brands exist.
"""
import asyncio
import os
import uuid
from datetime import datetime, timezone, timedelta
from pathlib import Path
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv(Path(__file__).parent / ".env")
client = AsyncIOMotorClient(os.environ["MONGO_URL"])
db = client[os.environ["DB_NAME"]]


def iso(dt):
    return dt.isoformat()


def ago(hours=0, days=0):
    return iso(datetime.now(timezone.utc) - timedelta(hours=hours, days=days))


VERIFICATIONS = [
    {"name": "Priya Sharma", "email": "priya@email.com", "kind": "creator", "category": "Fashion",
     "handle": "@priya_styles", "followers": 125000, "documents": ["id_proof.pdf", "address.pdf"],
     "status": "pending", "created_at": ago(hours=2),
     "photo": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200"},
    {"name": "TechWorld Inc.", "email": "contact@techworld.com", "kind": "brand", "category": "Technology",
     "handle": "", "followers": 0, "documents": ["gst.pdf", "incorporation.pdf"],
     "status": "pending", "created_at": ago(hours=4),
     "photo": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200"},
    {"name": "Arjun Kapoor", "email": "arjun@email.com", "kind": "creator", "category": "Tech",
     "handle": "@ArjunTech", "followers": 89000, "documents": ["pan.pdf", "channel_proof.pdf"],
     "status": "pending", "created_at": ago(hours=6),
     "photo": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200"},
    {"name": "StyleHub", "email": "brands@stylehub.in", "kind": "brand", "category": "Fashion",
     "handle": "", "followers": 0, "documents": ["gst.pdf"],
     "status": "pending", "created_at": ago(days=1),
     "photo": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200"},
    {"name": "Neha Gupta", "email": "neha@email.com", "kind": "creator", "category": "Beauty",
     "handle": "@neha_glow", "followers": 210000, "documents": ["id_proof.pdf"],
     "status": "pending", "created_at": ago(days=1),
     "photo": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200"},
    {"name": "FreshFoods Co", "email": "team@freshfoods.in", "kind": "brand", "category": "Food",
     "handle": "", "followers": 0, "documents": ["gst.pdf", "fssai.pdf"],
     "status": "approved", "created_at": ago(days=2),
     "photo": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200"},
]


REPORTS = [
    {"type": "content_violation", "severity": "high", "target": "Post #12847",
     "description": "Misleading promotional claim flagged by automated system.",
     "reported_by": "system", "reported_by_name": "System Auto-detect", "status": "open", "created_at": ago(hours=0)},
    {"type": "fake_engagement", "severity": "medium", "target": "@creator_fake",
     "description": "Suspicious follower spike and bot-like comments.",
     "reported_by": "brand", "reported_by_name": "Brand: FashionX", "status": "open", "created_at": ago(hours=2)},
    {"type": "payment_dispute", "severity": "high", "target": "Campaign #456",
     "description": "Creator claims payment not released after deliverables submitted.",
     "reported_by": "creator", "reported_by_name": "Creator: Neha G.", "status": "open", "created_at": ago(hours=4)},
    {"type": "spam", "severity": "low", "target": "@spam_account",
     "description": "Repeated unsolicited DMs to multiple brands.",
     "reported_by": "users", "reported_by_name": "Multiple Users", "status": "open", "created_at": ago(hours=6)},
    {"type": "content_violation", "severity": "critical", "target": "Post #11023",
     "description": "Reported for prohibited content. Needs urgent review.",
     "reported_by": "users", "reported_by_name": "Multiple Users", "status": "open", "created_at": ago(days=1)},
]


async def seed():
    # Admin user (login via OAuth/email with this email to get admin access)
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@ybex.demo")
    await db.users.update_one(
        {"email": admin_email},
        {"$set": {
            "user_id": "user_admin_demo", "email": admin_email, "name": "Ybex Admin",
            "role": "admin", "auth_method": "seed", "onboarded": True, "seeded": True,
            "created_at": iso(datetime.now(timezone.utc)),
        }},
        upsert=True,
    )

    await db.verifications.delete_many({"seeded": True})
    for v in VERIFICATIONS:
        await db.verifications.insert_one({
            "verification_id": f"ver_seed_{uuid.uuid4().hex[:8]}",
            "user_id": f"user_seed_{uuid.uuid4().hex[:8]}",
            "note": "", "seeded": True, **v,
        })

    await db.reports.delete_many({"seeded": True})
    for r in REPORTS:
        await db.reports.insert_one({
            "report_id": f"rep_seed_{uuid.uuid4().hex[:8]}",
            "seeded": True, **r,
        })

    # Default platform fee settings (admin can change live from the panel)
    await db.platform_settings.update_one(
        {"_id": "global"},
        {"$setOnInsert": {
            "brand_markup_pct": 2.0, "creator_deduction_pct": 2.0,
            "agency_markup_pct": 5.0, "agency_deduction_pct": 5.0,
        }},
        upsert=True,
    )

    print(f"Seeded {len(VERIFICATIONS)} verifications, {len(REPORTS)} reports, admin user '{admin_email}', and default fee settings.")


if __name__ == "__main__":
    asyncio.run(seed())
