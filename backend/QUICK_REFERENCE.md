# Service Auth API - Quick Reference Guide

## 🔑 Access Key
```
ak_live_8iX2KMIOOZuYmlla6BUUFTvRsTkr2_E5
```

## 📋 Base URL
```
http://localhost:5002/api/v1/service/auth
```

## 🔄 Token Flow

```
Register/Login → accessToken
     ↓
Refresh Token API (with accessToken) → refreshToken
     ↓
Use refreshToken → Access Protected APIs
```

---

## 🚀 Quick Start

### 1. Register User
```bash
curl -X POST http://localhost:5002/api/v1/service/auth/register \
  -H "Authorization: AccessKey ak_live_8iX2KMIOOZuYmlla6BUUFTvRsTkr2_E5" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "name": "John Doe"
  }'
```

**Response:** `{ "tokens": { "accessToken": "..." } }`

---

### 2. Login User
```bash
curl -X POST http://localhost:5002/api/v1/service/auth/login \
  -H "Authorization: AccessKey ak_live_8iX2KMIOOZuYmlla6BUUFTvRsTkr2_E5" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

**Response:** `{ "tokens": { "accessToken": "..." } }`

---

### 3. Get Refresh Token
```bash
curl -X POST http://localhost:5002/api/v1/service/auth/refresh-token \
  -H "Authorization: AccessKey ak_live_8iX2KMIOOZuYmlla6BUUFTvRsTkr2_E5" \
  -H "Content-Type: application/json" \
  -d '{
    "accessToken": "YOUR_ACCESS_TOKEN_HERE"
  }'
```

**Response:** `{ "data": { "refreshToken": "..." } }`

---

### 4. Use Refresh Token for Protected APIs
```bash
curl -X GET http://localhost:5002/api/protected-endpoint \
  -H "Authorization: Bearer YOUR_REFRESH_TOKEN_HERE"
```

---

### 5. Logout
```bash
curl -X POST http://localhost:5002/api/v1/service/auth/logout \
  -H "Authorization: AccessKey ak_live_8iX2KMIOOZuYmlla6BUUFTvRsTkr2_E5" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
  }'
```

---

## 📝 Endpoints Summary

| Endpoint | Method | Returns | Requires |
|----------|--------|---------|----------|
| `/register` | POST | `accessToken` | Access Key |
| `/login` | POST | `accessToken` | Access Key |
| `/refresh-token` | POST | `refreshToken` | Access Key + `accessToken` |
| `/profile` | POST | User data | Access Key |
| `/logout` | POST | Success message | Access Key + `refreshToken` |

---

## 🎯 Key Points

✅ **Register/Login** → Returns only `accessToken`  
✅ **Refresh Token API** → Accepts `accessToken`, returns `refreshToken`  
✅ **Protected APIs** → Use `refreshToken` in `Authorization: Bearer` header  
✅ **All endpoints** → Require `AccessKey` in Authorization header  

---

## 🧪 Testing

```bash
# Use Node.js 22
nvm use 22

# Run test script
node test-service-auth.js
```

---

## 📚 Documentation Files

- **Complete API Docs:** `SERVICE_AUTH_API_DOCUMENTATION.md`
- **Changes Summary:** `CHANGES_SUMMARY.md`
- **Test Script:** `test-service-auth.js`

---

## ⚠️ Important Notes

1. **Access Token** expires in **15 minutes**
2. **Refresh Token** expires in **7 days**
3. Always use **HTTPS** in production
4. Store tokens **securely** (never in localStorage for production)
5. **Access Key** must be included in all requests

---

## 🔒 Security

- Tokens are hashed before storage
- Old refresh tokens are revoked on new token generation
- Rate limiting prevents brute force attacks
- All authentication events are logged
