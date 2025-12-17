# Service Auth API - Authentication Flow

## Complete Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICE AUTH API FLOW                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────┐
│   CLIENT    │
└──────┬──────┘
       │
       │ Step 1: Register/Login
       │ ┌─────────────────────────────────────┐
       ├─► POST /api/v1/service/auth/register  │
       │   or                                  │
       ├─► POST /api/v1/service/auth/login     │
       │                                        │
       │ Headers:                               │
       │   Authorization: AccessKey <key>       │
       │                                        │
       │ Body:                                  │
       │   { email, password, ... }            │
       └─────────────────────────────────────┘
       │
       │ Response: { accessToken }
       │
       ▼
┌─────────────────┐
│  ACCESS TOKEN   │ ◄─── Store this temporarily
└────────┬────────┘
         │
         │ Step 2: Get Refresh Token
         │ ┌─────────────────────────────────────┐
         ├─► POST /api/v1/service/auth/refresh-  │
         │        token                           │
         │                                        │
         │ Headers:                               │
         │   Authorization: AccessKey <key>       │
         │                                        │
         │ Body:                                  │
         │   { accessToken }                     │
         └─────────────────────────────────────┘
         │
         │ Response: { refreshToken }
         │
         ▼
┌──────────────────┐
│  REFRESH TOKEN   │ ◄─── Store this securely
└────────┬─────────┘
         │
         │ Step 3: Access Protected APIs
         │ ┌─────────────────────────────────────┐
         ├─► POST /api/v1/service/auth/profile  │
         │   (or any protected endpoint)        │
         │                                        │
         │ Headers:                               │
         │   Authorization: AccessKey <key>      │
         │   X-Refresh-Token: <refreshToken>     │
         └─────────────────────────────────────┘
         │
         │ Response: { user data }
         │
         │
         │ Step 4: Logout (when done)
         │ ┌─────────────────────────────────────┐
         ├─► POST /api/v1/service/auth/logout   │
         │                                        │
         │ Headers:                               │
         │   Authorization: AccessKey <key>       │
         │                                        │
         │ Body:                                  │
         │   { refreshToken }                    │
         └─────────────────────────────────────┘
         │
         │ Response: { success: true }
         │
         ▼
┌──────────────────┐
│  TOKEN REVOKED   │ ◄─── Token can no longer be used
└──────────────────┘
```

## Detailed Flow Steps

### 1. Registration/Login Flow

```
┌──────────┐
│  Client  │
└────┬─────┘
     │
     │ 1. Send Request
     ├─────────────────────────────────────────────┐
     │                                             │
     │ POST /api/v1/service/auth/register          │
     │ or                                          │
     │ POST /api/v1/service/auth/login             │
     │                                             │
     │ Headers:                                    │
     │   Authorization: AccessKey <key>            │
     │                                             │
     │ Body:                                       │
     │   { email, password }                       │
     │                                             │
     ▼                                             │
┌─────────────┐                                   │
│   Server    │                                   │
│             │                                   │
│ 1. Validate │                                   │
│    AccessKey                                    │
│             │                                   │
│ 2. Verify   │                                   │
│    Credentials                                  │
│             │                                   │
│ 3. Generate │                                   │
│    AccessToken                                  │
│             │                                   │
│ 4. Generate │                                   │
│    RefreshToken                                 │
│    (store in DB)                                │
│             │                                   │
│ 5. Return   │                                   │
│    AccessToken                                  │
│    only                                         │
└─────┬───────┘                                   │
      │                                           │
      │ 2. Response                               │
      │ {                                         │
      │   accessToken: "...",                     │
      │   accessTokenExpiry: "..."                │
      │ }                                         │
      │                                           │
      └───────────────────────────────────────────┘
```

### 2. Get Refresh Token Flow

```
┌──────────┐
│  Client  │
└────┬─────┘
     │
     │ 1. Send Request
     ├─────────────────────────────────────────────┐
     │                                             │
     │ POST /api/v1/service/auth/refresh-token     │
     │                                             │
     │ Headers:                                    │
     │   Authorization: AccessKey <key>            │
     │                                             │
     │ Body:                                       │
     │   { accessToken }                          │
     │                                             │
     ▼                                             │
┌─────────────┐                                   │
│   Server    │                                   │
│             │                                   │
│ 1. Validate │                                   │
│    AccessKey                                    │
│             │                                   │
│ 2. Verify   │                                   │
│    AccessToken                                  │
│             │                                   │
│ 3. Revoke   │                                   │
│    old RefreshTokens                            │
│             │                                   │
│ 4. Generate │                                   │
│    new RefreshToken                             │
│    (store in DB)                                │
│             │                                   │
│ 5. Return   │                                   │
│    RefreshToken                                  │
│    only                                         │
└─────┬───────┘                                   │
      │                                           │
      │ 2. Response                               │
      │ {                                         │
      │   refreshToken: "...",                    │
      │   refreshTokenExpiry: "..."               │
      │ }                                         │
      │                                           │
      └───────────────────────────────────────────┘
```

### 3. Access Protected API Flow

```
┌──────────┐
│  Client  │
└────┬─────┘
     │
     │ 1. Send Request
     ├─────────────────────────────────────────────┐
     │                                             │
     │ POST /api/v1/service/auth/profile          │
     │                                             │
     │ Headers:                                    │
     │   Authorization: AccessKey <key>            │
     │   X-Refresh-Token: <refreshToken>           │
     │                                             │
     ▼                                             │
┌─────────────┐                                   │
│   Server    │                                   │
│             │                                   │
│ 1. Validate │                                   │
│    AccessKey                                    │
│             │                                   │
│ 2. Extract │                                    │
│    RefreshToken                                  │
│    from header                                  │
│             │                                   │
│ 3. Verify   │                                   │
│    RefreshToken:                                 │
│    - Valid JWT?                                 │
│    - Not expired?                               │
│    - Not revoked?                                │
│    - ClientId matches?                           │
│             │                                   │
│ 4. Extract  │                                   │
│    userId from                                  │
│    RefreshToken                                 │
│             │                                   │
│ 5. Fetch    │                                   │
│    User Data                                    │
│             │                                   │
│ 6. Return   │                                   │
│    User Profile                                 │
└─────┬───────┘                                   │
      │                                           │
      │ 2. Response                               │
      │ {                                         │
      │   user: { ... }                           │
      │ }                                         │
      │                                           │
      └───────────────────────────────────────────┘
```

### 4. Logout Flow

```
┌──────────┐
│  Client  │
└────┬─────┘
     │
     │ 1. Send Request
     ├─────────────────────────────────────────────┐
     │                                             │
     │ POST /api/v1/service/auth/logout           │
     │                                             │
     │ Headers:                                    │
     │   Authorization: AccessKey <key>            │
     │                                             │
     │ Body:                                       │
     │   { refreshToken }                          │
     │                                             │
     ▼                                             │
┌─────────────┐                                   │
│   Server    │                                   │
│             │                                   │
│ 1. Validate │                                   │
│    AccessKey                                    │
│             │                                   │
│ 2. Verify   │                                   │
│    RefreshToken                                  │
│             │                                   │
│ 3. Find     │                                   │
│    Token in DB                                  │
│             │                                   │
│ 4. Revoke   │                                   │
│    Token:                                       │
│    revoked = true                                │
│             │                                   │
│ 5. Log      │                                   │
│    Logout Event                                 │
│             │                                   │
│ 6. Return   │                                   │
│    Success                                      │
└─────┬───────┘                                   │
      │                                           │
      │ 2. Response                               │
      │ {                                         │
      │   success: true,                          │
      │   message: "Logout successful"            │
      │ }                                         │
      │                                           │
      └───────────────────────────────────────────┘
      
      ▼
┌──────────────────┐
│  Token Revoked   │
│                  │
│  - revoked: true  │
│  - Cannot be used│
│    for API calls │
└──────────────────┘
```

## Token States

### Access Token
- **Lifetime:** 15 minutes
- **Usage:** Get refresh token
- **Storage:** Temporary (client-side)
- **Revocation:** Not stored in DB (expires naturally)

### Refresh Token
- **Lifetime:** 7 days
- **Usage:** Access protected APIs
- **Storage:** Secure storage (client-side)
- **Revocation:** Stored in DB, can be revoked on logout

## Security Flow

```
┌─────────────────────────────────────────────────────────┐
│              SECURITY VALIDATION FLOW                   │
└─────────────────────────────────────────────────────────┘

Protected API Request
         │
         ▼
┌────────────────────┐
│ 1. AccessKey Valid? │ ──NO──► 401 Unauthorized
└─────────┬──────────┘
          │ YES
          ▼
┌────────────────────┐
│ 2. RefreshToken    │ ──NO──► 401 Unauthorized
│    Present?        │
└─────────┬──────────┘
          │ YES
          ▼
┌────────────────────┐
│ 3. RefreshToken    │ ──NO──► 401 Invalid Token
│    Valid JWT?      │
└─────────┬──────────┘
          │ YES
          ▼
┌────────────────────┐
│ 4. Token Not       │ ──NO──► 401 Expired Token
│    Expired?        │
└─────────┬──────────┘
          │ YES
          ▼
┌────────────────────┐
│ 5. ClientId         │ ──NO──► 401 Client Mismatch
│    Matches?        │
└─────────┬──────────┘
          │ YES
          ▼
┌────────────────────┐
│ 6. Token Not       │ ──NO──► 401 Revoked Token
│    Revoked?        │
└─────────┬──────────┘
          │ YES
          ▼
┌────────────────────┐
│ 7. Token Exists    │ ──NO──► 401 Token Not Found
│    in DB?          │
└─────────┬──────────┘
          │ YES
          ▼
    ┌──────────┐
    │ SUCCESS  │
    │ Access   │
    │ Granted  │
    └──────────┘
```

## Error Handling Flow

```
Request
   │
   ▼
┌──────────────┐
│ Validate     │
│ AccessKey    │
└──────┬───────┘
       │
       ├─ Invalid ──► 401: Invalid access key
       │
       ▼
┌──────────────┐
│ Validate     │
│ RefreshToken │
└──────┬───────┘
       │
       ├─ Missing ──► 401: Refresh token required
       ├─ Invalid ──► 401: Invalid token
       ├─ Expired ──► 401: Expired token
       ├─ Revoked ──► 401: Revoked token
       ├─ Wrong Client ──► 401: Client mismatch
       │
       ▼
┌──────────────┐
│ Process      │
│ Request      │
└──────┬───────┘
       │
       ├─ Error ──► 500: Server error
       │
       ▼
    Success
```

## Complete Sequence Diagram

```
Client          Server          Database
  │               │                │
  │──Register────►│                │
  │               │──Validate Key──►│
  │               │◄──Key Valid─────│
  │               │                │
  │               │──Create User───►│
  │               │◄──User Created──│
  │               │                │
  │               │──Store Token───►│
  │               │                │
  │◄─AccessToken──│                │
  │               │                │
  │──Get Refresh─►│                │
  │   (with AT)   │                │
  │               │──Verify AT─────►│
  │               │──Revoke Old────►│
  │               │──Store New─────►│
  │               │                │
  │◄─RefreshToken─│                │
  │               │                │
  │──Get Profile─►│                │
  │   (AT + RT)   │                │
  │               │──Validate RT───►│
  │               │◄──RT Valid──────│
  │               │──Get User──────►│
  │               │◄──User Data────│
  │◄─User Profile─│                │
  │               │                │
  │──Logout───────►│                │
  │   (RT)        │                │
  │               │──Revoke RT─────►│
  │               │                │
  │◄─Success──────│                │
  │               │                │
  │──Get Profile─►│                │
  │   (Revoked RT)│                │
  │               │──Check RT──────►│
  │               │◄──RT Revoked───│
  │◄─401 Error────│                │
```

## Quick Reference

### Token Flow Summary
1. **Register/Login** → Get `accessToken`
2. **Refresh Token API** → Get `refreshToken` (using `accessToken`)
3. **Protected APIs** → Use `accessToken` + `refreshToken`
4. **Logout** → Revoke `refreshToken` (permanent)

### Headers Required

**For Register/Login/Refresh/Logout:**
```
Authorization: AccessKey <access_key>
```

**For Protected APIs (Profile, etc.):**
```
Authorization: AccessKey <access_key>
X-Refresh-Token: <refreshToken>
```

### Token Lifecycle

```
AccessToken:  [Created] ──15min──► [Expired]
                    │
                    └──► Used to get RefreshToken

RefreshToken: [Created] ──7days──► [Expired]
                    │
                    ├──► Used for API calls
                    │
                    └──► [Logout] ──► [Revoked] ──► Cannot be used
```
