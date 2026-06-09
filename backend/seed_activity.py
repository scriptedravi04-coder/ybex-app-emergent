"""Add demo activity to make the app feel alive — applications, waves, collabs, notifications."""
import asyncio
import os
import uuid
import random
from datetime import datetime, timezone, timedelta
from pathlib import Path
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv(Path(__file__).parent / ".env")
client = AsyncIOMotorClient(os.environ["MONGO_URL"])
db = client[os.environ["DB_NAME"]]


def iso(dt):
    return dt.isoformat()


def new_id(prefix):
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


async def seed_activity():
    # Reset demo activity
    await db.waves.delete_many({"seeded": True})
    await db.collabs.delete_many({"seeded": True})
    await db.notifications.delete_many({"seeded": True})

    creators = await db.creator_profiles.find({"seeded": True}, {"_id": 0}).to_list(100)
    brand = await db.users.find_one({"user_id": "user_seed_brand_demo"}, {"_id": 0})
    campaigns = await db.campaigns.find({"seeded": True}, {"_id": 0}).to_list(20)

    if not creators or not brand:
        print("Run seed_data.py first")
        return

    # 1) Add applications to campaigns (8-12 per campaign)
    for camp in campaigns:
        n_apps = random.randint(6, 12)
        applicants = []
        for c in random.sample(creators, min(n_apps, len(creators))):
            rate = next(iter((c.get("rate_card") or {"reel": 10000}).values()))
            applicants.append({
                "application_id": new_id("app"),
                "creator_user_id": c["user_id"],
                "creator_name": c["name"],
                "creator_photo": c.get("photo", ""),
                "proposed_amount": int(rate * random.uniform(0.85, 1.15)),
                "pitch": random.choice([
                    "Loved your brief. I can deliver in 48hrs with great engagement.",
                    "I've done similar content with great results. Would love to collab!",
                    "My audience demographics match your target. Quick turnaround guaranteed.",
                    "Authentic content creator — no template work. Let's build something memorable.",
                ]),
                "status": random.choice(["pending", "pending", "pending", "accepted"]),
                "applied_at": iso(datetime.now(timezone.utc) - timedelta(hours=random.randint(1, 72))),
            })
        await db.campaigns.update_one({"campaign_id": camp["campaign_id"]}, {"$set": {"applicants": applicants}})

    # 2) Add waves & collab requests from demo brand to creators
    brand_user_id = brand["user_id"]
    for c in random.sample(creators, 12):
        await db.waves.insert_one({
            "wave_id": new_id("wave"),
            "from_user_id": brand_user_id,
            "from_name": brand["name"],
            "to_user_id": c["user_id"],
            "message": "Hey, would love to explore a collab!",
            "status": random.choice(["pending", "pending", "accepted"]),
            "created_at": iso(datetime.now(timezone.utc) - timedelta(hours=random.randint(1, 120))),
            "seeded": True,
        })

    for c in random.sample(creators, 8):
        rate = next(iter((c.get("rate_card") or {"reel": 10000}).values()))
        await db.collabs.insert_one({
            "collab_id": new_id("collab"),
            "from_user_id": brand_user_id,
            "from_name": brand["name"],
            "to_user_id": c["user_id"],
            "deliverable": random.choice(["reel", "story", "yt_video"]),
            "proposed_amount": int(rate * random.uniform(0.9, 1.1)),
            "message": "We have a campaign brief that matches your style. Quick chat?",
            "status": random.choice(["pending", "pending", "accepted", "declined"]),
            "created_at": iso(datetime.now(timezone.utc) - timedelta(hours=random.randint(2, 96))),
            "seeded": True,
        })

    # 3) Add notifications for demo brand (incoming applications from creators)
    for c in random.sample(creators, 10):
        await db.notifications.insert_one({
            "notif_id": new_id("notif"),
            "user_id": brand_user_id,
            "type": random.choice(["campaign_application", "wave", "collab_request"]),
            "message": f"{c['name']} {random.choice(['applied to your campaign', 'waved at you', 'sent a collab request'])}",
            "read": random.random() > 0.6,
            "created_at": iso(datetime.now(timezone.utc) - timedelta(hours=random.randint(1, 48))),
            "seeded": True,
        })

    # 4) Boost profile views on creators
    for c in creators:
        boost = random.randint(120, 800)
        await db.creator_profiles.update_one(
            {"user_id": c["user_id"]},
            {"$set": {"profile_views": (c.get("profile_views", 0) + boost)}}
        )

    print(f"Added activity: applications, 12 waves, 8 collabs, 10 notifications, profile views boosted")


if __name__ == "__main__":
    asyncio.run(seed_activity())
