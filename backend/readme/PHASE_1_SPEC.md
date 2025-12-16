# Phase 1 - Secure Authentication Service (MVP)

## Project Name
Secure Multi-Method Authentication Service – Phase 1 (MVP)

## Objective
Build a secure, modular, and scalable login and registration service as the foundation for multi-method authentication (OTP, OAuth, MFA) and future multi-tenant SaaS.

---

## Phase 1 Deliverables

1. **User Registration**
   - Email + Password registration
   - Strong password validation
   - Password hashing (Argon2id / bcrypt)
   - Optional: Email verification stub

2. **User Login**
   - Email + Password login
   - JWT-based authentication
   - Refresh token mechanism
   - Session management (minimal)

3. **Security Features**
   - Rate limiting per IP and per user
   - Brute-force attack prevention
   - User enumeration protection
   - Token rotation & validation
   - Basic login audit logging

4. **API Endpoints**
   - POST /register
   - POST /login
   - POST /refresh-token
   - POST /logout

5. **Architecture Preparedness**
   - Modular structure for future OTP, MFA, OAuth
   - DB schema ready for multi-login support
   - Clear separation of authentication, token, and user logic

6. **Excluded from Phase 1**
   - OTP/MFA login
   - OAuth login
   - Multi-tenant configuration
   - Device management
   - Fraud detection

---

## Success Criteria
- Users can register and log in securely
- JWT tokens issued and verified correctly
- Rate limiting works as expected
- Modular code structure allows easy extension

---

## Architecture Diagram

Frontend (Web/Mobile App)
|
v
Authentication API Service
|
v
User Database
|
v
users
|
v
tokens
|
v
audit_logs



- Modular design allows OTP, OAuth, MFA modules to plug in later
- Stateless API design for scalability
- Token validation and rotation handled in Auth Service

---

## API Documentation

| Endpoint          | Method | Description             | Request Body                     | Response                                    | Notes |
|------------------|--------|-------------------------|---------------------------------|--------------------------------------------|-------|
| /register         | POST   | Register a new user     | {email, password, name}          | {success, message}                          | Password hashed, optional email verification |
| /login            | POST   | Login user              | {email, password}                | {access_token, refresh_token, expires_in}  | JWT issued; rate limited |
| /refresh-token    | POST   | Refresh JWT token       | {refresh_token}                  | {access_token, refresh_token, expires_in}  | Refresh token rotated |
| /logout           | POST   | Logout user             | {access_token}                   | {success, message}                          | Optional: revoke refresh token |

---

## Database Schema

### Users Table
| Column           | Type        | Description |
|-----------------|------------|-------------|
| id               | UUID       | Primary key |
| email            | VARCHAR    | Unique, login identifier |
| password_hash    | VARCHAR    | Hashed password |
| name             | VARCHAR    | Optional |
| is_email_verified| BOOLEAN    | Default false |
| created_at       | TIMESTAMP  | Auto |
| updated_at       | TIMESTAMP  | Auto |

### Tokens Table
| Column        | Type      | Description |
|---------------|-----------|-------------|
| id            | UUID      | Primary key |
| user_id       | UUID      | FK → Users |
| token_type    | ENUM      | Access / Refresh |
| token_hash    | VARCHAR   | Hashed token (for refresh) |
| expires_at    | TIMESTAMP | Expiration time |
| created_at    | TIMESTAMP | Auto |
| revoked       | BOOLEAN   | Default false |

### Audit Logs Table
| Column       | Type      | Description |
|--------------|-----------|-------------|
| id           | UUID      | Primary key |
| user_id      | UUID      | Nullable (failed attempts) |
| action       | ENUM      | REGISTER / LOGIN / LOGOUT / FAILED_LOGIN |
| ip_address   | VARCHAR   | Client IP |
| user_agent   | VARCHAR   | Optional |
| created_at   | TIMESTAMP | Auto |

---

## Task Breakdown

### Backend Team
- Setup project structure
- Implement `/register`, `/login`, `/refresh-token`, `/logout`
- Implement password hashing
- Token storage & rotation
- Rate limiting
- Audit logging

### Database Team
- Create users, tokens, audit_logs tables
- Setup migrations

### DevOps/Infrastructure
- Configure environment variables
- Setup HTTPS
- Deploy database securely
- Logging & monitoring

### Frontend Team
- Registration form
- Login form
- JWT storage & refresh logic
- Error handling

### QA Team
- Test registration & login flows
- Test rate-limits & brute force prevention
- Test token expiry & refresh
- Test audit logging
- Verify security compliance

---

## Phase 1 Completion Criteria
- Users can register and login securely
- JWT tokens work with refresh
- Rate limiting and brute-force prevention functional
- Audit logs capture all login/register events
- Modular backend ready for Phase 2
