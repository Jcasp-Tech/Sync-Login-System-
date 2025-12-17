# API cURL Commands for Postman Testing

Base URL: `http://localhost:5002`

---

## 1. Register Client
**Endpoint:** `POST /api/v1/client/auth/register`  
**Access:** Public

```bash
curl -X POST http://localhost:5002/api/v1/client/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "position_title": "Software Engineer",
    "email_address": "john.doe@example.com",
    "phone_no": "+1234567890",
    "industry": "Technology",
    "password": "SecurePass123"
  }'
```

---

## 2. Login Client
**Endpoint:** `POST /api/v1/client/auth/login`  
**Access:** Public

```bash
curl -X POST http://localhost:5002/api/v1/client/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123"
  }'
```

---

## 3. Refresh Token
**Endpoint:** `POST /api/v1/client/auth/refresh`  
**Access:** Public

```bash
curl -X POST http://localhost:5002/api/v1/client/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "accessToken": "your_access_token_here"
  }'
```

---

## 4. Logout Client
**Endpoint:** `POST /api/v1/client/auth/logout`  
**Access:** Public (requires token validation)

```bash
curl -X POST http://localhost:5002/api/v1/client/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_access_token_here" \
  -d '{
    "refreshToken": "your_refresh_token_here"
  }'
```

---

## 5. Generate API Access Key
**Endpoint:** `POST /api/v1/client/auth/api-clients`  
**Access:** Private (requires authentication)

```bash
curl -X POST http://localhost:5002/api/v1/client/auth/api-clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_access_token_here" \
  -d '{
    "environment": "live",
    "rate_limit": 1000
  }'
```

**Note:** Replace `your_access_token_here` with the actual access token received from login.

---

## 6. List API Access Keys
**Endpoint:** `GET /api/v1/client/auth/api-clients`  
**Access:** Private (requires authentication)

```bash
curl -X GET http://localhost:5002/api/v1/client/auth/api-clients \
  -H "Authorization: Bearer your_access_token_here"
```

**Note:** 
- Replace `your_access_token_here` with the actual access token received from login
- **Returns only active access keys** for the authenticated user (filtered by `client_id`)
- Revoked/deleted keys are **not included** in the response

---

## 7. Revoke API Access Key (Permanent Delete)
**Endpoint:** `DELETE /api/v1/client/auth/api-clients/:access_key_id`  
**Access:** Private (requires authentication)

```bash
curl -X DELETE http://localhost:5002/api/v1/client/auth/api-clients/ak_live_your_key_here \
  -H "Authorization: Bearer your_access_token_here"
```

**Note:** 
- Replace `ak_live_your_key_here` with the actual access key ID you want to delete
- Replace `your_access_token_here` with the actual access token received from login
- **⚠️ This permanently deletes the record from the database** (hard delete)
- The deleted key will **not appear** in the List API response after deletion

---

## Testing Instructions for Postman

1. **Import cURL commands:**
   - Copy any cURL command above
   - In Postman, click "Import" → "Raw text" → Paste the cURL command
   - Postman will automatically convert it to a request

2. **For authenticated endpoints (5, 6, 7):**
   - First, use the Login endpoint to get your access token
   - Copy the `accessToken` from the response
   - Replace `your_access_token_here` in the Authorization header with the actual token

3. **For Refresh Token endpoint:**
   - Use the `accessToken` from the login response
   - Replace `your_access_token_here` in the request body

4. **For Logout endpoint:**
   - Use both `accessToken` (in header) and `refreshToken` (in body) from login response

---

## Quick Test Sequence

1. **Register** a new client (or use existing credentials)
2. **Login** to get access and refresh tokens
3. **Generate API Access Key** using the access token
4. **List API Access Keys** to see all your keys
5. **Refresh Token** if needed
6. **Revoke API Access Key** to delete a key
7. **Logout** when done

---

## Service Auth API Endpoints

### 1. Register User (Service Auth)
**Endpoint:** `POST /api/v1/service/auth/register`  
**Access:** Requires Access Key

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

### 2. Login User (Service Auth)
**Endpoint:** `POST /api/v1/service/auth/login`  
**Access:** Requires Access Key

```bash
curl -X POST http://localhost:5002/api/v1/service/auth/login \
  -H "Authorization: AccessKey ak_live_8iX2KMIOOZuYmlla6BUUFTvRsTkr2_E5" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

### 3. Get Refresh Token (Service Auth)
**Endpoint:** `POST /api/v1/service/auth/refresh-token`  
**Access:** Requires Access Key

```bash
curl -X POST http://localhost:5002/api/v1/service/auth/refresh-token \
  -H "Authorization: AccessKey ak_live_8iX2KMIOOZuYmlla6BUUFTvRsTkr2_E5" \
  -H "Content-Type: application/json" \
  -d '{
    "accessToken": "YOUR_ACCESS_TOKEN_HERE"
  }'
```

### 4. Get User Profile (Service Auth)
**Endpoint:** `POST /api/v1/service/auth/profile`  
**Access:** Requires Access Key + Refresh Token

```bash
curl -X POST http://localhost:5002/api/v1/service/auth/profile \
  -H "Authorization: AccessKey ak_live_8iX2KMIOOZuYmlla6BUUFTvRsTkr2_E5" \
  -H "X-Refresh-Token: YOUR_REFRESH_TOKEN_HERE"
```

**Note:** This endpoint requires both:
- `Authorization: AccessKey <access_key>` header
- `X-Refresh-Token: <refreshToken>` header

### 5. Logout User (Service Auth)
**Endpoint:** `POST /api/v1/service/auth/logout`  
**Access:** Requires Access Key

```bash
curl -X POST http://localhost:5002/api/v1/service/auth/logout \
  -H "Authorization: AccessKey ak_live_8iX2KMIOOZuYmlla6BUUFTvRsTkr2_E5" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
  }'
```
