# Login/Register Microservice - Phase 1 Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Structure](#database-structure)
4. [Multi-Tenant Workflow](#multi-tenant-workflow)
5. [API Design](#api-design)
6. [Access Keys](#access-keys)
7. [Security Considerations](#security-considerations)
8. [Task Breakdown](#task-breakdown)

---

## 1. Overview

This microservice provides a **secure login and registration system** for multiple clients. Key features:

- Multi-tenant support with **per-client user tables**.
- Centralized **Tokens** and **Audit Logs** tables.
- Optional **custom fields** storage.
- Scalable for multiple industries: AI/ML, E-commerce, SaaS.
- Provides **API access keys** for client integration.

---

## 2. Architecture

      +----------------+
      |  Client App    |
      +----------------+
             |
      Signup / Login Request
             v
    +---------------------+
    | Auth Microservice   |
    +---------------------+
    | Validate Input      |
    | Hash Password       |
    | Create User Record  |
    | Generate Access Key |
    | Store custom_fields?|
    | Generate Tokens     |
    | Log Audit           |
    +---------------------+
             |
    /---------------------\
   /                       \
Store in client users table Store custom fields in service DB
| |
v v
+----------------+ +----------------+
| users_<client> | | centralized DB |
+----------------+ | tokens/audit |
+----------------+


---

## 3. Database Structure

### 3.1 Per-Client Users Table

| Field           | Type       | Notes                         |
|-----------------|-----------|-------------------------------|
| user_id         | UUID      | Primary Key                   |
| email           | String    | Unique per client             |
| password_hash   | String    | Hashed password               |
| custom_fields   | JSON      | Optional, flexible fields     |
| created_at      | Timestamp |                               |
| updated_at      | Timestamp |                               |

> Table Name: `users_<clientId>`

### 3.2 Centralized Tokens Table

| Field           | Type       | Notes                               |
|-----------------|-----------|-------------------------------------|
| token_id        | UUID      | Primary Key                          |
| user_id         | UUID      | Foreign key to users_<clientId>     |
| client_id       | UUID      | Client identifier                    |
| refresh_token   | String    |                                     |
| expires_at      | Timestamp |                                     |
| created_at      | Timestamp |                                     |

### 3.3 Centralized Audit Logs Table

| Field           | Type       | Notes                               |
|-----------------|-----------|-------------------------------------|
| audit_id        | UUID      | Primary Key                          |
| user_id         | UUID      | Foreign key to users_<clientId>     |
| client_id       | UUID      | Client identifier                    |
| action          | Enum      | signup / login / logout              |
| status          | Enum      | success / failed                     |
| ip_address      | String    |                                     |
| user_agent      | String    | Optional                             |
| timestamp       | Timestamp |                                     |

---

## 4. Multi-Tenant Workflow

1. New client registers → assign `client_id`.
2. Create `users_<clientId>` table for that client.
3. Users sign up/login → stored in client-specific table.
4. Tokens and audit logs stored in centralized tables with `user_id` + `client_id`.
5. Optional `custom_fields` stored in user table if client chooses.

---

## 5. API Design (Phase 1)

### 5.1 Client Registration

POST /api/v1/clients/register
Body:
{
"client_name": "AI Platform",
"industry": "AI/ML"
}
Response:
{
"client_id": "client123",
"access_key": "xxxxxxxxxxxx",
"documentation_url": "https://docs.yourapi.com/client123
"
}


### 5.2 User Signup

POST /api/v1/<client_id>/login
Body:
{
"email": "user@example.com
",
"password": "password123"
}
Response:
{
"user_id": "uuid123",
"access_token": "jwt_token_here",
"refresh_token": "refresh_token_here"
}


---

## 6. Access Keys

- When a **client registers**, the system generates a **unique access key**.
- This key is used for **API authentication**, rate limiting, and auditing.
- API request must include header:

Authorization: Bearer <client_access_key>


- The key can also provide **links to API documentation** for that client.

---

## 7. Security Considerations

- Passwords stored as **bcrypt hashed**.  
- JWT tokens with **expiration** and refresh support.  
- **Audit logs** for every action (login/signup).  
- **Rate limiting** per client using access key.  
- Optional **email verification** for signup.  
- Multi-tenant isolation: **user tables per client**.  

---

## 8. Task Breakdown

| Task                           | Owner/Team       | Status/Notes                       |
|--------------------------------|----------------|------------------------------------|
| Client registration API         | Backend         |                                    |
| User signup/login API           | Backend         |                                    |
| Dynamic creation of user table  | Backend         |                                    |
| Token generation & storage      | Backend         | Centralized table                  |
| Audit logging                   | Backend         | Centralized table                  |
| Access key generation           | Backend         |                                    |
| MongoDB schema setup            | DB Admin        | Per-client users tables + centralized tables |
| Documentation & ER diagram      | Tech Writer     | Include workflow & API examples    |
| Security & rate limiting        | Backend         | JWT, bcrypt, access keys           |

---

### Notes:

- The `custom_fields` is optional and flexible per client.  
- All user-specific sensitive info stays in **client-specific tables**.  
- Tokens & audit logs centralized for **easy management and analytics**.  

---

