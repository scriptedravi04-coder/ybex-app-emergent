"""Seed Ybex with 25 realistic Indian creators + 5 sample brand campaigns."""
import asyncio
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv(Path(__file__).parent / ".env")
client = AsyncIOMotorClient(os.environ["MONGO_URL"])
db = client[os.environ["DB_NAME"]]


def iso(dt):
    return dt.isoformat()


CREATORS = [
    {"name": "Aanya Sharma", "city": "Lucknow", "state": "Uttar Pradesh", "category": "Fashion", "languages": ["Hindi", "English"], "gender": "female", "ig": 145000, "yt": 12000, "rate": {"reel": 18000, "story": 5000, "yt_video": 45000}, "creator_type": "influencer", "barter": "barter_ok", "photo": "https://images.unsplash.com/photo-1633346683707-25c5b6ead885?w=400"},
    {"name": "Vikram Singh", "city": "Jaipur", "state": "Rajasthan", "category": "Travel", "languages": ["Hindi", "English"], "gender": "male", "ig": 89000, "yt": 156000, "rate": {"reel": 12000, "story": 3500, "yt_video": 65000}, "creator_type": "influencer", "barter": "cash_only", "photo": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400"},
    {"name": "Riya Mehta", "city": "Indore", "state": "Madhya Pradesh", "category": "Food", "languages": ["Hindi"], "gender": "female", "ig": 234000, "yt": 45000, "rate": {"reel": 25000, "story": 8000, "yt_video": 55000}, "creator_type": "influencer", "barter": "partial_barter", "photo": "https://images.unsplash.com/photo-1536766768598-e09213fdcf22?w=400"},
    {"name": "Arjun Patel", "city": "Surat", "state": "Gujarat", "category": "Tech", "languages": ["English", "Hindi", "Gujarati"], "gender": "male", "ig": 67000, "yt": 289000, "rate": {"reel": 15000, "story": 4500, "yt_video": 85000}, "creator_type": "influencer", "barter": "cash_only", "photo": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"},
    {"name": "Priya Reddy", "city": "Hyderabad", "state": "Telangana", "category": "Beauty", "languages": ["Telugu", "English"], "gender": "female", "ig": 312000, "yt": 78000, "rate": {"reel": 32000, "story": 9500, "yt_video": 72000}, "creator_type": "influencer", "barter": "barter_ok", "photo": "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400"},
    {"name": "Karan Joshi", "city": "Patna", "state": "Bihar", "category": "Comedy", "languages": ["Hindi", "Bhojpuri"], "gender": "male", "ig": 456000, "yt": 234000, "rate": {"reel": 42000, "story": 12000, "yt_video": 95000}, "creator_type": "influencer", "barter": "cash_only", "photo": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400"},
    {"name": "Sneha Iyer", "city": "Chennai", "state": "Tamil Nadu", "category": "Lifestyle", "languages": ["Tamil", "English"], "gender": "female", "ig": 178000, "yt": 23000, "rate": {"reel": 20000, "story": 6500, "yt_video": 38000}, "creator_type": "influencer", "barter": "partial_barter", "photo": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400"},
    {"name": "Rohit Verma", "city": "Kanpur", "state": "Uttar Pradesh", "category": "Finance", "languages": ["Hindi", "English"], "gender": "male", "ig": 56000, "yt": 198000, "rate": {"reel": 14000, "story": 4000, "yt_video": 68000}, "creator_type": "influencer", "barter": "cash_only", "photo": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400"},
    {"name": "Ananya Gupta", "city": "Bhopal", "state": "Madhya Pradesh", "category": "Fitness", "languages": ["Hindi", "English"], "gender": "female", "ig": 124000, "yt": 67000, "rate": {"reel": 17000, "story": 5500, "yt_video": 42000}, "creator_type": "influencer", "barter": "barter_ok", "photo": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400"},
    {"name": "Aditya Kumar", "city": "Ranchi", "state": "Jharkhand", "category": "Gaming", "languages": ["Hindi", "English"], "gender": "male", "ig": 87000, "yt": 345000, "rate": {"reel": 13000, "story": 4000, "yt_video": 90000}, "creator_type": "influencer", "barter": "cash_only", "photo": "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400"},
    {"name": "Meera Pillai", "city": "Kochi", "state": "Kerala", "category": "Education", "languages": ["Malayalam", "English"], "gender": "female", "ig": 98000, "yt": 145000, "rate": {"reel": 16000, "story": 5000, "yt_video": 58000}, "creator_type": "influencer", "barter": "partial_barter", "photo": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400"},
    {"name": "Suresh Yadav", "city": "Varanasi", "state": "Uttar Pradesh", "category": "Spiritual", "languages": ["Hindi", "Sanskrit"], "gender": "male", "ig": 267000, "yt": 412000, "rate": {"reel": 28000, "story": 8500, "yt_video": 110000}, "creator_type": "publisher", "barter": "cash_only", "photo": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400"},
    {"name": "Pooja Desai", "city": "Ahmedabad", "state": "Gujarat", "category": "Parenting", "languages": ["Gujarati", "Hindi", "English"], "gender": "female", "ig": 156000, "yt": 89000, "rate": {"reel": 19000, "story": 6000, "yt_video": 48000}, "creator_type": "influencer", "barter": "barter_ok", "photo": "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400"},
    {"name": "Manish Kapoor", "city": "Chandigarh", "state": "Punjab", "category": "Automotive", "languages": ["Punjabi", "Hindi", "English"], "gender": "male", "ig": 78000, "yt": 234000, "rate": {"reel": 15000, "story": 4500, "yt_video": 72000}, "creator_type": "influencer", "barter": "cash_only", "photo": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400"},
    {"name": "Divya Nair", "city": "Trivandrum", "state": "Kerala", "category": "Books", "languages": ["Malayalam", "English"], "gender": "female", "ig": 45000, "yt": 78000, "rate": {"reel": 9000, "story": 3000, "yt_video": 32000}, "creator_type": "influencer", "barter": "partial_barter", "photo": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400"},
    {"name": "Tarun Bhatt", "city": "Dehradun", "state": "Uttarakhand", "category": "Adventure", "languages": ["Hindi", "English"], "gender": "male", "ig": 134000, "yt": 167000, "rate": {"reel": 18000, "story": 5500, "yt_video": 62000}, "creator_type": "influencer", "barter": "barter_ok", "photo": "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=400"},
    {"name": "Kavya Menon", "city": "Bangalore", "state": "Karnataka", "category": "Tech", "languages": ["Kannada", "English"], "gender": "female", "ig": 89000, "yt": 156000, "rate": {"reel": 16000, "story": 5000, "yt_video": 65000}, "creator_type": "influencer", "barter": "cash_only", "photo": "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400"},
    {"name": "Rajat Khanna", "city": "Lucknow", "state": "Uttar Pradesh", "category": "Comedy", "languages": ["Hindi", "Urdu"], "gender": "male", "ig": 198000, "yt": 89000, "rate": {"reel": 21000, "story": 7000, "yt_video": 45000}, "creator_type": "influencer", "barter": "barter_ok", "photo": "https://images.unsplash.com/photo-1463453091185-61582044d556?w=400"},
    {"name": "Nisha Agarwal", "city": "Jaipur", "state": "Rajasthan", "category": "Home Decor", "languages": ["Hindi", "English"], "gender": "female", "ig": 167000, "yt": 56000, "rate": {"reel": 20000, "story": 6500, "yt_video": 38000}, "creator_type": "influencer", "barter": "barter_ok", "photo": "https://images.unsplash.com/photo-1517365830460-955ce3ccd263?w=400"},
    {"name": "Yash Tiwari", "city": "Nagpur", "state": "Maharashtra", "category": "Sports", "languages": ["Marathi", "Hindi"], "gender": "male", "ig": 112000, "yt": 198000, "rate": {"reel": 17000, "story": 5500, "yt_video": 68000}, "creator_type": "influencer", "barter": "cash_only", "photo": "https://images.unsplash.com/photo-1502323777036-f29e3972d82f?w=400"},
    {"name": "Ishita Banerjee", "city": "Kolkata", "state": "West Bengal", "category": "Art", "languages": ["Bengali", "English"], "gender": "female", "ig": 78000, "yt": 34000, "rate": {"reel": 13000, "story": 4000, "yt_video": 28000}, "creator_type": "influencer", "barter": "barter_ok", "photo": "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400"},
    {"name": "Akash Mishra", "city": "Allahabad", "state": "Uttar Pradesh", "category": "Music", "languages": ["Hindi", "Bhojpuri"], "gender": "male", "ig": 234000, "yt": 312000, "rate": {"reel": 26000, "story": 8000, "yt_video": 88000}, "creator_type": "influencer", "barter": "cash_only", "photo": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400"},
    {"name": "Tanvi Saxena", "city": "Pune", "state": "Maharashtra", "category": "Wellness", "languages": ["Marathi", "Hindi", "English"], "gender": "female", "ig": 145000, "yt": 67000, "rate": {"reel": 18000, "story": 6000, "yt_video": 42000}, "creator_type": "influencer", "barter": "partial_barter", "photo": "https://images.unsplash.com/photo-1438495555890-6cf24cba1cae?w=400"},
    {"name": "Devansh Rao", "city": "Vizag", "state": "Andhra Pradesh", "category": "Tech", "languages": ["Telugu", "English"], "gender": "male", "ig": 67000, "yt": 178000, "rate": {"reel": 14000, "story": 4500, "yt_video": 72000}, "creator_type": "influencer", "barter": "cash_only", "photo": "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400"},
    {"name": "Avani Joshi", "city": "Mumbai", "state": "Maharashtra", "category": "Fashion", "languages": ["Marathi", "Hindi", "English"], "gender": "female", "ig": 412000, "yt": 134000, "rate": {"reel": 45000, "story": 14000, "yt_video": 85000}, "creator_type": "celebrity", "barter": "cash_only", "photo": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400"},
]


def compute_score(seed: str, ig: int, yt: int):
    s = sum(ord(c) for c in seed)
    er = round(3.5 + (s % 70) / 10, 2)
    fake = round((s % 15) + 2, 1)
    avg = max(1000, int((ig + yt) * (er / 100) * 0.7))
    perf = max(50, min(99, int(70 + (s % 30) - fake)))
    return er, fake, avg, perf


async def seed():
    await db.creator_profiles.delete_many({"seeded": True})
    await db.users.delete_many({"seeded": True})
    await db.campaigns.delete_many({"seeded": True})

    for c in CREATORS:
        user_id = f"user_seed_{uuid.uuid4().hex[:8]}"
        er, fake, avg_views, perf = compute_score(user_id, c["ig"], c["yt"])
        email = f"{c['name'].split()[0].lower()}.{user_id[-4:]}@ybex.demo"
        await db.users.insert_one({
            "user_id": user_id, "email": email, "name": c["name"], "role": "creator",
            "picture": c["photo"], "auth_method": "seed", "onboarded": True, "seeded": True,
            "created_at": iso(datetime.now(timezone.utc)),
        })
        await db.creator_profiles.insert_one({
            "user_id": user_id, "name": c["name"], "email": email, "picture": c["photo"], "photo": c["photo"],
            "bio": f"{c['category']} creator from {c['city']}. Authentic content. Trusted by 50+ brands.",
            "category": c["category"], "sub_categories": [c["category"]],
            "city": c["city"], "state": c["state"], "languages": c["languages"], "gender": c["gender"],
            "instagram": f"@{c['name'].split()[0].lower()}_official", "youtube": f"{c['name']} Official",
            "twitter": "", "linkedin": "",
            "followers_instagram": c["ig"], "followers_youtube": c["yt"],
            "rate_card": c["rate"], "barter": c["barter"], "payment_terms": "within_30_days",
            "portfolio": [c["photo"]], "past_brands": ["Swiggy", "Zomato", "Mamaearth", "boAt"][:3],
            "creator_type": c["creator_type"], "work_mode": "active",
            "engagement_rate": er, "fake_follower_pct": fake, "avg_views_30d": avg_views,
            "performance_score": perf, "profile_views": (perf * 12),
            "seeded": True, "created_at": iso(datetime.now(timezone.utc)),
        })

    # Seed sample campaigns from a demo brand
    brand_user_id = "user_seed_brand_demo"
    await db.users.update_one(
        {"user_id": brand_user_id},
        {"$set": {"user_id": brand_user_id, "email": "demo@brand.ybex", "name": "Nova Brand Co", "role": "brand", "auth_method": "seed", "onboarded": True, "seeded": True}},
        upsert=True,
    )
    await db.brand_profiles.update_one(
        {"user_id": brand_user_id},
        {"$set": {"user_id": brand_user_id, "company_name": "Nova Brand Co", "industry": "D2C", "team_size": "10-50", "website": "https://nova.example", "description": "Modern D2C brand seeking authentic creators.", "logo": "", "seeded": True, "verified": True}},
        upsert=True,
    )
    sample_campaigns = [
        {"title": "Summer Skincare Launch", "description": "Looking for beauty creators for our SPF 50+ launch. 1 reel + 3 stories.", "budget_min": 15000, "budget_max": 40000, "deliverables": ["Instagram Reel", "Instagram Story"], "categories": ["Beauty", "Lifestyle"], "platforms": ["Instagram"], "language": "Hindi"},
        {"title": "Tech Gadget Review", "description": "New earbuds launch. Need detailed YouTube review + reel.", "budget_min": 30000, "budget_max": 90000, "deliverables": ["YouTube Video", "Instagram Reel"], "categories": ["Tech"], "platforms": ["YouTube", "Instagram"], "language": "English"},
        {"title": "Diwali Festival Sale", "description": "Festive collection promotion. Bharat creators preferred.", "budget_min": 10000, "budget_max": 25000, "deliverables": ["Instagram Reel"], "categories": ["Fashion", "Lifestyle"], "platforms": ["Instagram"], "language": "Hindi"},
        {"title": "Healthy Snack Brand", "description": "Looking for fitness/wellness creators to promote our protein bars.", "budget_min": 12000, "budget_max": 35000, "deliverables": ["Instagram Reel", "Instagram Story"], "categories": ["Fitness", "Food"], "platforms": ["Instagram"], "language": "Hindi"},
        {"title": "Regional Food Channel", "description": "Promote our regional food delivery service in Tier 2/3 cities.", "budget_min": 8000, "budget_max": 20000, "deliverables": ["Instagram Reel"], "categories": ["Food", "Comedy"], "platforms": ["Instagram"], "language": "Hindi"},
    ]
    for s in sample_campaigns:
        cid = f"camp_seed_{uuid.uuid4().hex[:8]}"
        await db.campaigns.insert_one({
            "campaign_id": cid, "brand_user_id": brand_user_id, "brand_name": "Nova Brand Co",
            "brand_logo": "", **s, "status": "live", "applicants": [],
            "deadline": "2026-04-30", "seeded": True,
            "created_at": iso(datetime.now(timezone.utc)),
        })

    print(f"Seeded {len(CREATORS)} creators and {len(sample_campaigns)} campaigns")


if __name__ == "__main__":
    asyncio.run(seed())
