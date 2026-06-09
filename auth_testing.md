# Auth Testing Playbook for Ybex

## Auth-Gated App Testing Playbook
Step 1: Create Test User & Session

For JWT-based:
```bash
curl -X POST "$API_URL/api/auth/signup" -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"new-tester@ybex.demo","password":"password123"}'
# Returns: { token, user }
```

For Emergent OAuth (Google):
- Use mongosh to seed a session_token + user directly:
```javascript
mongosh --eval "
use('test_database');
var userId = 'user_test_' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({
  user_id: userId, email: 'oauth-test@ybex.demo', name: 'OAuth Test',
  picture: 'https://placehold.co/150', role: 'brand', onboarded: true,
  auth_method: 'google', created_at: new Date().toISOString()
});
db.user_sessions.insertOne({
  user_id: userId, session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
  created_at: new Date().toISOString()
});
print('Session token: ' + sessionToken);
"
```

Step 2: Test Backend API
```bash
# Test auth endpoint
curl -X GET "$API_URL/api/auth/me" -H "Authorization: Bearer YOUR_TOKEN"

# Test protected endpoints
curl -X POST "$API_URL/api/auth/role" -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" -d '{"role":"brand"}'

curl -X POST "$API_URL/api/brands/profile" -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"company_name":"Test Co","industry":"D2C"}'
```

Step 3: Browser Testing
```javascript
await page.context.add_cookies([{
    "name": "session_token", "value": "YOUR_TOKEN",
    "domain": "trending-hub-61.preview.emergentagent.com",
    "path": "/", "httpOnly": true, "secure": true, "sameSite": "None"
}]);
await page.goto("https://trending-hub-61.preview.emergentagent.com/dashboard");
```

## Checklist
- [x] User document has `user_id` (custom UUID)
- [x] Session `user_id` matches user's `user_id`
- [x] All queries use `{"_id": 0}` projection
- [x] Backend uses `user_id` (not `_id` or `id`)
- [x] `/api/auth/me` returns user data
- [x] Dashboard loads without redirect on valid auth

## Success Indicators
- ✅ `/api/auth/me` returns user data with cookie OR Bearer
- ✅ Dashboard loads (not redirect to /login)
- ✅ CRUD operations work for own resources
