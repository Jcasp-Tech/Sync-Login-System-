# Service Access Token System – Design Document

## 1. Overview
This document describes the design of a **Twilio‑like service access token system** for public clients using **Node.js, Express, and MongoDB (Mongoose)**.

The system allows clients to:
- Log in to a portal
- Manually generate service access tokens
- Use tokens for **server‑to‑server API access**
- Rotate, revoke, and regenerate tokens

Security level: **Standard JWT + Request Signing**

---

## 2. Core Concepts

### 2.1 Token Characteristics
- Long‑lived (no automatic expiry)
- Revocable
- Rotatable
- Service & action scoped
- Signed using JWT
- Verified against DB

### 2.2 Separation of Tokens
| Token Type | Purpose |
|---|---|
Portal Login Token | UI authentication only
Service Access Token | API access (this document)

---

## 3. Token Rotation Strategy

### 3.1 Why Rotation Is Required
- Token leakage protection
- Key hygiene
- Client‑controlled security

### 3.2 Rotation Rules
- Only **one active token per client per service group**
- Generating a new token automatically revokes old ones
- Old tokens become invalid immediately

### 3.3 Rotation Flow
```
Client Portal
 → Generate New Token
 → Old Token Marked Revoked
 → New Token Issued
```

### 3.4 Rotation Implementation

#### API
```
POST /portal/tokens/rotate
```

#### Backend Steps
1. Authenticate portal user
2. Revoke existing tokens
3. Generate new JWT
4. Store hashed token
5. Return token once

---

## 4. Multi‑Service Permission Model

### 4.1 Permission Structure
Instead of simple service lists, use **action‑based permissions**.

### 4.2 Permission Format (JWT Payload)
```json
{
  "services": {
    "auth": ["login", "register"],
    "profile": ["read", "update"]
  }
}
```

### 4.3 Benefits
- Fine‑grained control
- Easy expansion
- Matches Twilio capability tokens

### 4.4 Authorization Check Example
```js
if (!req.permissions.auth?.includes("login")) {
  return res.status(403).end();
}
```

---

## 5. Request Signing (Twilio‑Level Security)

### 5.1 Why Request Signing
JWT alone protects identity but not:
- Replay attacks
- Token theft abuse

Request signing ensures **each request is authentic**.

### 5.2 Signing Strategy (HMAC‑SHA256)

Client signs:
```
METHOD + URL + TIMESTAMP + BODY
```

### 5.3 Required Headers
```
Authorization: Bearer <token>
X-Timestamp: 1712345678
X-Signature: <hmac>
```

### 5.4 Signature Generation (Client)
```js
const data = method + url + timestamp + body;
const signature = crypto
  .createHmac('sha256', clientSecret)
  .update(data)
  .digest('hex');
```

### 5.5 Server Validation
1. Validate JWT
2. Validate timestamp (±5 min)
3. Recalculate signature
4. Compare signatures

---

## 6. API Contract (Swagger‑Style)

### 6.1 Generate Token
```
POST /portal/tokens
```

**Request**
```json
{
  "services": {
    "auth": ["login", "register"]
  }
}
```

**Response**
```json
{
  "token": "<access_token>",
  "token_id": "tok_123"
}
```

---

### 6.2 Rotate Token
```
POST /portal/tokens/rotate
```

**Response**
```json
{
  "token": "<new_token>",
  "rotated": true
}
```

---

### 6.3 Revoke Token
```
DELETE /portal/tokens/{tokenId}
```

**Response**
```json
{
  "revoked": true
}
```

---

### 6.4 Service API Example
```
POST /auth/login
```

**Headers**
```
Authorization: Bearer <token>
X-Timestamp: <unix>
X-Signature: <signature>
```

---

## 7. Database Schema

### Access Token Collection
```js
{
  tokenId: String,
  clientId: ObjectId,
  permissions: Object,
  tokenHash: String,
  isActive: Boolean,
  createdAt: Date,
  revokedAt: Date
}
```

---

## 8. Security Checklist

- JWT verification
- DB token lookup
- Request signature validation
- Timestamp window enforcement
- HTTPS only
- Hash tokens at rest

---

## 9. Future Enhancements

- Rate limiting
- IP allowlisting
- Audit logs
- Per‑service quotas

---

## 10. Conclusion

This design:
- Matches **Twilio‑style capability tokens**
- Supports **manual rotation & revocation**
- Provides **fine‑grained service permissions**
- Prevents replay & abuse using request signing

This is a **production‑ready foundation** for your service access platform.

