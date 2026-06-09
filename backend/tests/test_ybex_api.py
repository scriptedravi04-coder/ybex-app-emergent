"""Ybex Backend API tests - covers all critical endpoints."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://trending-hub-61.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


def _email(prefix="TEST"):
    return f"{prefix}_{uuid.uuid4().hex[:10]}@ybex.demo"


# ---------- Health ----------
def test_root_health():
    r = requests.get(f"{API}/", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert data.get("app") == "Ybex"
    assert data.get("status") == "running"


# ---------- Auth ----------
@pytest.fixture(scope="session")
def creator_session():
    s = requests.Session()
    email = _email("CREATOR")
    r = s.post(f"{API}/auth/signup", json={"name": "Test Creator", "email": email, "password": "password123"}, timeout=15)
    assert r.status_code == 200, r.text
    body = r.json()
    assert "token" in body and "user" in body
    assert "_id" not in body["user"] and "password_hash" not in body["user"]
    token = body["token"]
    s.headers.update({"Authorization": f"Bearer {token}"})
    # Set role
    rr = s.post(f"{API}/auth/role", json={"role": "creator"}, timeout=15)
    assert rr.status_code == 200
    assert rr.json().get("role") == "creator"
    return {"session": s, "user": body["user"], "token": token, "email": email}


@pytest.fixture(scope="session")
def brand_session():
    """Use existing seeded brand t3@ybex.demo / password123"""
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": "t3@ybex.demo", "password": "password123"}, timeout=15)
    if r.status_code != 200:
        # fallback: create new
        email = _email("BRAND")
        r = s.post(f"{API}/auth/signup", json={"name": "Test Brand", "email": email, "password": "password123"}, timeout=15)
        assert r.status_code == 200, r.text
        token = r.json()["token"]
        s.headers.update({"Authorization": f"Bearer {token}"})
        s.post(f"{API}/auth/role", json={"role": "brand"}, timeout=15)
        # create brand profile
        s.post(f"{API}/brands/profile", json={"company_name": "TestCo", "industry": "Fashion"}, timeout=15)
    else:
        token = r.json()["token"]
        s.headers.update({"Authorization": f"Bearer {token}"})
    return {"session": s, "token": token}


def test_signup_no_id_leak():
    s = requests.Session()
    r = s.post(f"{API}/auth/signup", json={"name": "X", "email": _email(), "password": "password123"}, timeout=15)
    assert r.status_code == 200
    body = r.json()
    assert "token" in body
    assert "_id" not in body["user"]
    assert "password_hash" not in body["user"]
    assert body["user"]["role"] is None
    assert body["user"]["onboarded"] is False


def test_login_invalid():
    r = requests.post(f"{API}/auth/login", json={"email": "nope@nope.com", "password": "wrong"}, timeout=15)
    assert r.status_code == 401


def test_login_valid_seeded_brand():
    r = requests.post(f"{API}/auth/login", json={"email": "t3@ybex.demo", "password": "password123"}, timeout=15)
    assert r.status_code == 200, r.text
    assert "token" in r.json()


def test_auth_me_without_token():
    r = requests.get(f"{API}/auth/me", timeout=15)
    assert r.status_code == 401


def test_auth_me_with_token(creator_session):
    s = creator_session["session"]
    r = s.get(f"{API}/auth/me", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert data["email"].lower() == creator_session["email"].lower()
    assert data["role"] == "creator"


# ---------- Creator profile ----------
def test_create_creator_profile(creator_session):
    s = creator_session["session"]
    payload = {
        "bio": "Test bio",
        "category": "Fashion",
        "city": "Mumbai",
        "languages": ["Hindi", "English"],
        "instagram": "@testcreator",
        "youtube": "",
        "followers_instagram": 50000,
        "followers_youtube": 10000,
        "rate_card": {"reel": 5000, "story": 2000},
        "photo": "https://example.com/p.jpg",
    }
    r = s.post(f"{API}/creators/profile", json=payload, timeout=15)
    assert r.status_code == 200, r.text

    # Verify via /auth/me
    me = s.get(f"{API}/auth/me", timeout=15).json()
    assert me["onboarded"] is True

    # Verify via list creators (find own)
    lst = requests.get(f"{API}/creators", timeout=15).json()
    found = next((c for c in lst if c["user_id"] == creator_session["user"]["user_id"]), None)
    assert found is not None
    assert "engagement_rate" in found and found["engagement_rate"] > 0
    assert "performance_score" in found and found["performance_score"] > 0
    assert found["category"] == "Fashion"


def test_list_creators_seeded():
    r = requests.get(f"{API}/creators?limit=100", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) >= 25
    sample = data[0]
    assert "rate_card" in sample
    assert "performance_score" in sample
    assert "engagement_rate" in sample


def test_list_creators_filters():
    r = requests.get(f"{API}/creators?category=Fashion&city=Mumbai", timeout=15)
    assert r.status_code == 200
    data = r.json()
    for c in data:
        assert c.get("category") == "Fashion"
        assert c.get("city") == "Mumbai"

    r2 = requests.get(f"{API}/creators?min_engagement=5", timeout=15)
    assert r2.status_code == 200
    for c in r2.json():
        assert c.get("engagement_rate", 0) >= 5


def test_get_creator_by_id_increments_views():
    lst = requests.get(f"{API}/creators?limit=10", timeout=15).json()
    assert len(lst) > 0
    cid = lst[0]["user_id"]
    before = lst[0].get("profile_views", 0)
    r = requests.get(f"{API}/creators/{cid}", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert data["user_id"] == cid
    # Re-fetch
    r2 = requests.get(f"{API}/creators/{cid}", timeout=15).json()
    assert r2.get("profile_views", 0) > before


def test_get_creator_404():
    r = requests.get(f"{API}/creators/nonexistent_id_xxxxx", timeout=15)
    assert r.status_code == 404


# ---------- Brand profile ----------
def test_brand_profile(brand_session):
    s = brand_session["session"]
    r = s.post(f"{API}/brands/profile", json={"company_name": "TestCo Updated", "industry": "Fashion"}, timeout=15)
    assert r.status_code == 200
    me = s.get(f"{API}/brands/me", timeout=15).json()
    assert me.get("company_name") == "TestCo Updated"


# ---------- Campaigns ----------
def test_post_campaign_only_brand(creator_session):
    s = creator_session["session"]
    r = s.post(f"{API}/campaigns", json={
        "title": "X", "description": "Y", "budget_min": 100, "budget_max": 500,
        "deliverables": ["reel"], "categories": ["Fashion"], "platforms": ["instagram"]
    }, timeout=15)
    assert r.status_code == 403


def test_post_and_get_campaign(brand_session):
    s = brand_session["session"]
    payload = {
        "title": "TEST_Campaign_" + uuid.uuid4().hex[:6],
        "description": "Test campaign desc",
        "budget_min": 5000, "budget_max": 15000,
        "deliverables": ["reel", "story"],
        "categories": ["Fashion"],
        "platforms": ["instagram"],
        "deadline": "2026-12-31",
        "language": "Hindi",
    }
    r = s.post(f"{API}/campaigns", json=payload, timeout=15)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["title"] == payload["title"]
    cid = body["campaign_id"]
    # GET specific
    r2 = requests.get(f"{API}/campaigns/{cid}", timeout=15)
    assert r2.status_code == 200
    assert r2.json()["campaign_id"] == cid
    # List
    lst = requests.get(f"{API}/campaigns", timeout=15).json()
    assert any(c["campaign_id"] == cid for c in lst)
    return cid


def test_campaign_apply_creator(creator_session, brand_session):
    # First brand creates campaign
    bs = brand_session["session"]
    cres = bs.post(f"{API}/campaigns", json={
        "title": "ApplyTest", "description": "d", "budget_min": 1, "budget_max": 10,
        "deliverables": ["reel"], "categories": ["Fashion"], "platforms": ["instagram"]
    }, timeout=15)
    assert cres.status_code == 200
    cid = cres.json()["campaign_id"]
    # Creator applies
    cs = creator_session["session"]
    r = cs.post(f"{API}/campaigns/apply", json={
        "campaign_id": cid, "proposed_amount": 5000, "pitch": "I'm great"
    }, timeout=15)
    assert r.status_code == 200
    # Confirm applicant added
    c = requests.get(f"{API}/campaigns/{cid}", timeout=15).json()
    assert any(a["creator_user_id"] == creator_session["user"]["user_id"] for a in c.get("applicants", []))


def test_list_seeded_campaigns():
    r = requests.get(f"{API}/campaigns", timeout=15)
    assert r.status_code == 200
    items = r.json()
    assert isinstance(items, list)
    # Should have at least 5 seeded
    assert len(items) >= 5


# ---------- Collabs / Waves ----------
def test_wave(brand_session, creator_session):
    s = brand_session["session"]
    r = s.post(f"{API}/collabs/wave", json={
        "creator_id": creator_session["user"]["user_id"], "message": "Hi"
    }, timeout=15)
    assert r.status_code == 200
    # Check creator gets notif
    cs = creator_session["session"]
    notifs = cs.get(f"{API}/notifications", timeout=15).json()
    assert any(n.get("type") == "wave" for n in notifs)


def test_collab_request_and_action(brand_session, creator_session):
    s = brand_session["session"]
    r = s.post(f"{API}/collabs/request", json={
        "creator_id": creator_session["user"]["user_id"],
        "deliverable": "reel",
        "proposed_amount": 10000,
        "message": "Collab pls"
    }, timeout=15)
    assert r.status_code == 200
    # creator views received
    cs = creator_session["session"]
    cdata = cs.get(f"{API}/collabs", timeout=15).json()
    assert "received" in cdata and len(cdata["received"]) >= 1
    collab_id = cdata["received"][0]["collab_id"]
    # accept (uses query string for action)
    ar = cs.post(f"{API}/collabs/{collab_id}/action?action=accept", timeout=15)
    assert ar.status_code == 200


# ---------- Leaderboard ----------
def test_leaderboard_sorted():
    r = requests.get(f"{API}/leaderboard", timeout=15)
    assert r.status_code == 200
    rows = r.json()
    assert len(rows) > 0
    scores = [c.get("performance_score", 0) for c in rows]
    assert scores == sorted(scores, reverse=True)


# ---------- Notifications ----------
def test_notifications_mark_read(creator_session):
    s = creator_session["session"]
    r = s.get(f"{API}/notifications", timeout=15)
    assert r.status_code == 200
    pr = s.post(f"{API}/notifications/read-all", timeout=15)
    assert pr.status_code == 200
    after = s.get(f"{API}/notifications", timeout=15).json()
    assert all(n.get("read") is True for n in after)


# ---------- Dashboard ----------
def test_dashboard_stats_creator(creator_session):
    s = creator_session["session"]
    r = s.get(f"{API}/dashboard/stats", timeout=15)
    assert r.status_code == 200
    d = r.json()
    for k in ["profile_views", "waves", "collab_requests", "performance_score", "engagement_rate"]:
        assert k in d


def test_dashboard_stats_brand(brand_session):
    s = brand_session["session"]
    r = s.get(f"{API}/dashboard/stats", timeout=15)
    assert r.status_code == 200
    d = r.json()
    for k in ["campaigns", "collabs_sent", "waves_sent"]:
        assert k in d



# ---------- Iteration 2: File upload ----------
def test_upload_and_get_file(creator_session):
    s = creator_session["session"]
    # 1x1 PNG bytes
    png = (b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06"
           b"\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\rIDATx\x9cc\xf8\xcf\xc0\x00\x00\x00\x03\x00\x01"
           b"\xa3\x18T\x9a\x00\x00\x00\x00IEND\xaeB`\x82")
    files = {"file": ("test.png", png, "image/png")}
    # Don't send Content-Type from session headers (multipart needs boundary). Use a fresh request with token.
    headers = {"Authorization": s.headers.get("Authorization")}
    r = requests.post(f"{API}/upload", files=files, headers=headers, timeout=60)
    assert r.status_code == 200, r.text
    body = r.json()
    assert "file_id" in body and "url" in body and "path" in body
    fid = body["file_id"]
    # GET file
    r2 = requests.get(f"{API}/files/{fid}", timeout=30)
    assert r2.status_code == 200
    assert r2.headers.get("content-type", "").startswith("image/")
    assert len(r2.content) > 0


def test_upload_unsupported_type(creator_session):
    s = creator_session["session"]
    headers = {"Authorization": s.headers.get("Authorization")}
    files = {"file": ("test.exe", b"MZ\x90\x00", "application/octet-stream")}
    r = requests.post(f"{API}/upload", files=files, headers=headers, timeout=30)
    assert r.status_code == 400


def test_file_404():
    r = requests.get(f"{API}/files/nonexistent_xxxxxxxx", timeout=15)
    assert r.status_code == 404


# ---------- Iteration 2: Chat ----------
def test_chat_send_and_thread(creator_session, brand_session):
    bs = brand_session["session"]
    cs = creator_session["session"]
    creator_id = creator_session["user"]["user_id"]
    # brand → creator
    r = bs.post(f"{API}/chat/send", json={"to_user_id": creator_id, "text": "Hello from brand"}, timeout=15)
    assert r.status_code == 200, r.text
    msg = r.json()
    assert msg["text"] == "Hello from brand"
    assert msg["to_user_id"] == creator_id
    assert "thread_id" in msg

    # creator fetches thread with brand
    me_brand = bs.get(f"{API}/auth/me", timeout=15).json()
    brand_uid = me_brand["user_id"]
    r2 = cs.get(f"{API}/chat/{brand_uid}", timeout=15)
    assert r2.status_code == 200
    msgs = r2.json()
    assert len(msgs) >= 1
    assert any(m["text"] == "Hello from brand" for m in msgs)
    # asc sort
    ts = [m["created_at"] for m in msgs]
    assert ts == sorted(ts)

    # creator replies
    import time as _t
    _t.sleep(0.05)
    r3 = cs.post(f"{API}/chat/send", json={"to_user_id": brand_uid, "text": "Hi back"}, timeout=15)
    assert r3.status_code == 200

    # since param – fetch new messages only
    last_at = msgs[-1]["created_at"]
    r4 = cs.get(f"{API}/chat/{brand_uid}?since={last_at}", timeout=15)
    assert r4.status_code == 200
    new_msgs = r4.json()
    # At least the 'Hi back' should now be visible (its ts > last_at)
    assert any(m.get("text") == "Hi back" and m["created_at"] >= last_at for m in new_msgs)

    # creator gets chat notif from brand
    notifs = cs.get(f"{API}/notifications", timeout=15).json()
    assert any(n.get("type") == "chat" for n in notifs)


def test_chat_threads_list(brand_session):
    bs = brand_session["session"]
    r = bs.get(f"{API}/chat/threads/list", timeout=15)
    assert r.status_code == 200
    threads = r.json()
    assert isinstance(threads, list)
    if threads:
        t = threads[0]
        assert "last_text" in t and "last_at" in t and "other_user_id" in t


# ---------- Iteration 2: ROI / Close campaign ----------
def test_close_campaign_and_performance(brand_session, creator_session):
    bs = brand_session["session"]
    cs = creator_session["session"]
    creator_id = creator_session["user"]["user_id"]

    # 1) brand creates campaign
    payload = {
        "title": "TEST_ROI_" + uuid.uuid4().hex[:6],
        "description": "ROI test",
        "budget_min": 5000, "budget_max": 15000,
        "deliverables": ["reel"], "categories": ["Fashion"], "platforms": ["instagram"]
    }
    cr = bs.post(f"{API}/campaigns", json=payload, timeout=15)
    assert cr.status_code == 200
    cid = cr.json()["campaign_id"]

    # 2) creator applies
    ar = cs.post(f"{API}/campaigns/apply", json={"campaign_id": cid, "proposed_amount": 10000, "pitch": "p"}, timeout=15)
    assert ar.status_code == 200

    # 3) fetch app id and mark accepted via direct mongo? No — we test the path with application_id param
    camp = requests.get(f"{API}/campaigns/{cid}", timeout=15).json()
    applicants = camp.get("applicants", [])
    app_target = next((a for a in applicants if a["creator_user_id"] == creator_id), None)
    assert app_target is not None
    application_id = app_target["application_id"]

    # 4) brand closes campaign with explicit application_id
    body = {
        "actual_views": 80000,
        "actual_engagement_rate": 6.5,
        "on_time": True,
        "content_quality": 5,
        "brand_rating": 4
    }
    r = bs.post(f"{API}/campaigns/{cid}/close?application_id={application_id}", json=body, timeout=15)
    assert r.status_code == 200, r.text
    res = r.json()
    assert res["campaign_id"] == cid
    assert res["creator_user_id"] == creator_id
    assert 40 <= res["performance_score"] <= 99
    assert res["cpv"] > 0
    assert res["roi_score"] > 0

    # 5) Verify campaign marked closed
    camp2 = requests.get(f"{API}/campaigns/{cid}", timeout=15).json()
    assert camp2.get("status") == "closed"
    assert "performance" in camp2

    # 6) Performance history endpoint
    pr = requests.get(f"{API}/performance/{creator_id}", timeout=15)
    assert pr.status_code == 200
    rows = pr.json()
    assert isinstance(rows, list)
    assert any(row["campaign_id"] == cid for row in rows)

    # 7) Creator gets performance_score notif
    notifs = cs.get(f"{API}/notifications", timeout=15).json()
    assert any(n.get("type") == "performance_score" for n in notifs)


def test_close_campaign_no_accepted_app(brand_session):
    bs = brand_session["session"]
    payload = {
        "title": "TEST_ROI_NA_" + uuid.uuid4().hex[:6],
        "description": "no apps",
        "budget_min": 1, "budget_max": 2,
        "deliverables": ["reel"], "categories": ["Fashion"], "platforms": ["instagram"]
    }
    cr = bs.post(f"{API}/campaigns", json=payload, timeout=15)
    cid = cr.json()["campaign_id"]
    r = bs.post(f"{API}/campaigns/{cid}/close", json={
        "actual_views": 1000, "actual_engagement_rate": 5.0, "on_time": True,
        "content_quality": 4, "brand_rating": 4
    }, timeout=15)
    assert r.status_code == 400
