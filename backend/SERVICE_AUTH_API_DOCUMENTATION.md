# Service Auth API Documentation

## Overview
Service Auth API endpoints for user registration, login, and token management. These endpoints require an **Access Key** for authentication and are designed for server-to-server communication.

## Base URL
```
http://localhost:5002/api/v1/service/auth
```

## Authentication
All endpoints require an **Access Key** in the Authorization header:
```
Authorization: AccessKey <access_key_id>
```

**Example Access Key:** `ak_live_8iX2KMIOOZuYmlla6BUUFTvRsTkr2_E5`

---

## Updated Token Flow

### New Authentication Flow:
1. **Register/Login** → Returns only `accessToken`
2. **Refresh Token API** (using `accessToken`) → Returns only `refreshToken`
3. **Use `refreshToken`** → Access protected APIs with both:
   - `Authorization: AccessKey <access_key>`
   - `X-Refresh-Token: <refreshToken>`
4. **Logout** → Permanently revokes `refreshToken` (cannot be used again)

### Why This Flow?
- **Security**: Access tokens are short-lived (15 minutes)
- **Separation**: Clear distinction between access and refresh tokens
- **Control**: Refresh tokens can be revoked independently
- **Best Practice**: Follows OAuth 2.0 token flow patterns

---

## Endpoints

### 1. Register User
**POST** `/api/v1/service/auth/register`

Register a new user for your service.

**Headers:**
```
Authorization: AccessKey <access_key_id>
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe",
  "custom_fields": {
    "department": "Engineering",
    "role": "Developer"
  }
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "John Doe",
      "custom_fields": {
        "department": "Engineering",
        "role": "Developer"
      },
      "is_email_verified": false,
      "created_at": "2024-01-01T12:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "accessTokenExpiry": "2024-01-01T12:15:00.000Z"
    }
  }
}
```

**Note:** Only `accessToken` is returned. To get `refreshToken`, call the refresh token endpoint.

**Error Responses:**
- `400` - Validation error
- `401` - Invalid access key
- `409` - User with this email already exists
- `429` - Too many registration attempts (rate limited)

**Rate Limit:** 10 attempts per 15 minutes per IP

---

### 2. Login User
**POST** `/api/v1/service/auth/login`

Authenticate user and receive access token.

**Headers:**
```
Authorization: AccessKey <access_key_id>
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "John Doe",
      "custom_fields": {
        "department": "Engineering",
        "role": "Developer"
      },
      "is_email_verified": false
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "accessTokenExpiry": "2024-01-01T12:15:00.000Z"
    }
  }
}
```

**Important:** Only `accessToken` is returned. To get `refreshToken`, call the refresh token endpoint.

**Error Responses:**
- `400` - Validation error
- `401` - Invalid credentials or invalid access key
- `429` - Too many login attempts (rate limited)

**Rate Limit:** 20 attempts per 15 minutes per IP

---

### 3. Get Refresh Token
**POST** `/api/v1/service/auth/refresh-token`

Get a refresh token using a valid access token. This endpoint should be called after login/register to obtain the refresh token.

**Headers:**
```
Authorization: AccessKey <access_key_id>
Content-Type: application/json
```

**Request Body:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshTokenExpiry": "2024-01-08T12:00:00.000Z"
  }
}
```

**Note:** Only `refreshToken` is returned. Use this token to access protected APIs.

**Error Responses:**
- `400` - Validation error (accessToken is required)
- `401` - Invalid or expired access token
- `429` - Too many refresh attempts (rate limited)

**Flow:**
1. After login/register, you receive an `accessToken`
2. Call this endpoint with the `accessToken` to get a `refreshToken`
3. Save the `refreshToken` securely for future use
4. Use the `refreshToken` to call protected APIs (Bearer token in Authorization header)
5. Use the `refreshToken` for logout operations

---

### 4. Get User Profile
**POST** `/api/v1/service/auth/profile`

Get user profile information. **Requires both AccessKey and RefreshToken.**

**Headers:**
```
Authorization: AccessKey <access_key_id>
X-Refresh-Token: <refreshToken>
```

**Note:** No request body needed. User ID is extracted from the refresh token.

**Success Response (200):**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "custom_fields": {
      "department": "Engineering",
      "role": "Developer"
    },
    "is_email_verified": false,
    "created_at": "2024-01-01T12:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `401` - Invalid access key or invalid/revoked refresh token
- `403` - Access denied (token client mismatch)
- `404` - User not found

**Important:** This endpoint requires:
- `Authorization: AccessKey <access_key>` header
- `X-Refresh-Token: <refreshToken>` header

---

### 5. Logout User
**POST** `/api/v1/service/auth/logout`

Revoke refresh token and logout user. **After logout, the refresh token is permanently revoked and cannot be used to access any protected endpoints.**

**Headers:**
```
Authorization: AccessKey <access_key_id>
Content-Type: application/json
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Error Responses:**
- `400` - Refresh token is required
- `401` - Invalid refresh token, invalid access key, or token already revoked

**Important:** 
- After logout, the refresh token is **permanently revoked**
- Attempting to use a revoked refresh token will return `401 Unauthorized`
- You must login again to get a new access token and refresh token

---

## Using Refresh Token for Protected APIs

Once you have a `refreshToken`, you can use it to access protected endpoints along with your AccessKey.

**Required Headers:**
```
Authorization: AccessKey <access_key>
X-Refresh-Token: <refreshToken>
```

**Important:** Protected endpoints require BOTH:
1. AccessKey in `Authorization` header
2. RefreshToken in `X-Refresh-Token` header

**Example:**
```javascript
const response = await fetch('http://localhost:5002/api/v1/service/auth/profile', {
  method: 'POST',
  headers: {
    'Authorization': `AccessKey ${accessKey}`,
    'X-Refresh-Token': refreshToken
  }
});
```

**Note:** After logout, the refresh token is revoked and cannot be used to access protected endpoints.

---

## Complete Flow Example

### Step 1: Register User
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

**Response:** Returns `accessToken`

### Step 2: Get Refresh Token
```bash
curl -X POST http://localhost:5002/api/v1/service/auth/refresh-token \
  -H "Authorization: AccessKey ak_live_8iX2KMIOOZuYmlla6BUUFTvRsTkr2_E5" \
  -H "Content-Type: application/json" \
  -d '{
    "accessToken": "your_access_token_here"
  }'
```

**Response:** Returns `refreshToken`

### Step 3: Use Refresh Token for Protected APIs
```bash
curl -X POST http://localhost:5002/api/v1/service/auth/profile \
  -H "Authorization: AccessKey ak_live_8iX2KMIOOZuYmlla6BUUFTvRsTkr2_E5" \
  -H "X-Refresh-Token: your_refresh_token_here"
```

### Step 4: Logout
```bash
curl -X POST http://localhost:5002/api/v1/service/auth/logout \
  -H "Authorization: AccessKey ak_live_8iX2KMIOOZuYmlla6BUUFTvRsTkr2_E5" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "your_refresh_token_here"
  }'
```

---

## Token Expiry

- **Access Token**: 15 minutes
- **Refresh Token**: 7 days

**Important:**
- Access tokens expire quickly for security
- Refresh tokens are long-lived but can be revoked
- Always store tokens securely (never in localStorage for production)
- Use HTTPS in production

---

## Security Features

1. **Token Separation**: Access and refresh tokens are separate
2. **Token Rotation**: Each refresh operation revokes old refresh tokens
3. **Token Hashing**: Refresh tokens are hashed before storage
4. **Token Revocation**: Logout permanently revokes refresh tokens
5. **Dual Authentication**: Protected APIs require both AccessKey and RefreshToken
6. **Rate Limiting**: Prevents brute force attacks
7. **Access Key Validation**: All endpoints require valid access key
8. **Audit Logging**: All authentication events are logged
9. **Client Validation**: Refresh tokens are validated against AccessKey client_id

---

## Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error message here"
}
```

**Common Error Codes:**
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid credentials, tokens, or access key)
- `404` - Not Found (resource not found)
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

---

## Testing

Use the provided test script to test all endpoints:

```bash
# Make sure you're using Node.js 22
nvm use 22

# Run the test script
node test-service-auth.js
```

The test script will:
- Test all endpoints in sequence
- Verify token flow
- Check error cases
- Provide detailed results

---

## Changes Summary

### What Changed:
1. ✅ **Register endpoint** - Now returns only `accessToken` (removed `refreshToken` from response)
2. ✅ **Login endpoint** - Returns only `accessToken` (already updated)
3. ✅ **Refresh Token endpoint** - Accepts `accessToken`, returns only `refreshToken`
4. ✅ **Profile endpoint** - Now requires both `AccessKey` and `RefreshToken` headers
5. ✅ **Logout endpoint** - Properly revokes refresh token (token cannot be used after logout)
6. ✅ **Validation middleware** - Updated to validate `accessToken` instead of `refreshToken`
7. ✅ **Auth middleware** - Enhanced to validate both `AccessKey` and `RefreshToken` for protected APIs

### Files Modified:
- `src/services/userService.js` - Updated `registerUser()`, `refreshAccessToken()`, and `logoutUser()`
- `src/controllers/userController.js` - Updated `refreshToken()` and `getProfile()` controllers
- `src/middlewares/validationMiddleware.js` - Updated `validateServiceRefreshToken()`
- `src/middlewares/accessKeyMiddleware.js` - Added `validateAccessKeyAndRefreshToken()` middleware
- `src/routes/serviceAuth/serviceAuthRoutes.js` - Updated profile route to use new middleware

---

## Flowchart

For a visual representation of the authentication flow, see:
- **Authentication Flow Diagram**: `AUTHENTICATION_FLOW.md`

This document includes:
- Complete flow diagrams
- Step-by-step process flows
- Security validation flow
- Error handling flow
- Sequence diagrams
- Token lifecycle diagrams

---

## Support

For issues or questions, please refer to:
- **API Documentation**: `API_DOCUMENTATION.md`
- **Authentication Flow**: `AUTHENTICATION_FLOW.md`
- **Test Script**: `test-service-auth.js`
- **Service Auth Routes**: `src/routes/serviceAuth/serviceAuthRoutes.js`
