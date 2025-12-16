# MongoDB Schema & Flow – Multi-Client Login/Register Microservice

## Table of Contents
1. [Overview](#overview)
2. [Database Structure](#database-structure)
3. [Workflow](#workflow)
4. [API Flow](#api-flow)
5. [Security Considerations](#security-considerations)

---

## 1. Overview

- Each client who registers on the portal can choose to store their users in **our MongoDB**.  
- Each client will get a **dedicated collection** for their users.  
- **Tokens** and **audit logs** are centralized but include `client_id` for traceability.  
- Flexible schema: `custom_fields` stored in JSON format for per-client optional fields.  

---

## 2. Database Structure

### 2.1 Clients Collection
Stores the registered clients (companies/organizations).

```json
{
  "_id": "client123",
  "client_name": "AI Platform",
  "email": "contact@aiplatform.com",
  "password_hash": "hashed_password",
  "industry": "AI/ML",
  "access_key": "api-key-xyz",
  "created_at": ISODate("2025-12-12T10:00:00Z"),
  "updated_at": ISODate("2025-12-12T10:00:00Z")
}
Collection Name: clients

2.2 Per-Client Users Collections

Each client has a separate collection: users_<clientId>

Example: users_client123

{
  "_id": "uuid-user-1",
  "email": "user@example.com",
  "password_hash": "hashed_password",
  "name": "John Doe",
  "custom_fields": {
    "department": "ML",
    "role": "Admin"
  },
  "is_email_verified": false,
  "created_at": ISODate("2025-12-12T10:05:00Z"),
  "updated_at": ISODate("2025-12-12T10:05:00Z")
}


custom_fields allows storing dynamic client-specific data.

Each client’s users are isolated in their collection.

2.3 Centralized Tokens Collection
{
  "_id": "uuid-token-1",
  "user_id": "uuid-user-1",
  "client_id": "client123",
  "access_token": "jwt-token",
  "refresh_token": "refresh-token",
  "expires_at": ISODate("2025-12-12T12:00:00Z"),
  "created_at": ISODate("2025-12-12T10:10:00Z")
}


Collection Name: tokens

Tracks authentication tokens across all clients.

2.4 Centralized Audit Logs Collection
{
  "_id": "uuid-audit-1",
  "user_id": "uuid-user-1",
  "client_id": "client123",
  "action": "login",
  "status": "success",
  "ip_address": "192.168.1.10",
  "user_agent": "Mozilla/5.0",
  "timestamp": ISODate("2025-12-12T10:15:00Z")
}


Collection Name: audit_logs

Centralized for easy analytics and monitoring.

3. Workflow
Client Portal
     |
  [Register Client]
     |
     v
+-----------------------------+
| Store client info in clients|
| Generate client_id & API Key|
+-----------------------------+
     |
     v
[Client chooses to use our DB]
     |
+-----------------------------+
| Create collection:          |
| users_<clientId>            |
+-----------------------------+
     |
  [Client registers users]
     |
     v
+-----------------------------+
| Store users in users_<clientId> |
| Generate JWT tokens          |
| Log action in audit_logs     |
+-----------------------------+


Users table/collection is per-client

Tokens and audit logs are centralized

4. API Flow

Client Registration

Create client in clients collection

Generate client_id and access_key

User Signup (for client users)

Insert user in users_<clientId> collection

Optionally store custom_fields

User Login

Find user in users_<clientId>

Generate JWT token

Log activity in audit_logs

Token Management

All JWTs stored in tokens with client_id

5. Security Considerations

Password hashing: bcrypt or Argon2

JWT tokens: signed, short-lived, refresh tokens stored in tokens

Rate limiting: per client using access_key

Custom fields: sanitized JSON only, no direct execution

Audit logging: all actions tracked with client ID


---

✅ **Next Steps to Implement This:**

1. Create `clients` collection.  
2. On client registration, **dynamically create `users_<clientId>` collection** in MongoDB.  
3. Use **centralized `tokens` and `audit_logs`** collections.  
4. Implement **API endpoints**:  
   - Client Register/Login  
   - User Signup/Login  
   - Token & Audit logging  
