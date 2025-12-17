# Changes Summary - Service Auth API Token Flow

## Date: December 2024

## Overview
Updated the Service Auth API token flow to implement a more secure authentication pattern where:
- **Register/Login** endpoints return only `accessToken`
- **Refresh Token** endpoint accepts `accessToken` and returns only `refreshToken`
- **Refresh Token** is used to access protected APIs

---

## Changes Made

### 1. Register Endpoint (`/api/v1/service/auth/register`)
**File:** `src/services/userService.js`

**Before:**
```javascript
tokens: {
  accessToken,
  refreshToken,  // ❌ Removed
  accessTokenExpiry,
  refreshTokenExpiry  // ❌ Removed
}
```

**After:**
```javascript
tokens: {
  accessToken,
  accessTokenExpiry
}
```

**Note:** Refresh token is still generated and stored in database, but not returned in response.

---

### 2. Login Endpoint (`/api/v1/service/auth/login`)
**File:** `src/services/userService.js`

**Status:** ✅ Already updated (returns only `accessToken`)

**Response:**
```javascript
tokens: {
  accessToken,
  accessTokenExpiry
}
```

---

### 3. Refresh Token Endpoint (`/api/v1/service/auth/refresh-token`)
**Files Modified:**
- `src/services/userService.js` - `refreshAccessToken()` function
- `src/controllers/userController.js` - `refreshToken()` controller
- `src/middlewares/validationMiddleware.js` - `validateServiceRefreshToken()` validation

**Before:**
- Accepted: `refreshToken` in request body
- Returned: Both `accessToken` and `refreshToken`

**After:**
- Accepts: `accessToken` in request body
- Returns: Only `refreshToken`

**Code Changes:**

**Service (`userService.js`):**
```javascript
// Before
const refreshAccessToken = async (clientId, refreshToken) => {
  // Verified refresh token
  // Returned both accessToken and refreshToken
}

// After
const refreshAccessToken = async (clientId, accessToken) => {
  // Verifies access token
  // Returns only refreshToken
}
```

**Controller (`userController.js`):**
```javascript
// Before
const { refreshToken } = req.body;

// After
const { accessToken } = req.body;
```

**Validation (`validationMiddleware.js`):**
```javascript
// Before
const validateServiceRefreshToken = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
];

// After
const validateServiceRefreshToken = [
  body('accessToken')
    .notEmpty()
    .withMessage('Access token is required')
];
```

---

### 4. Auth Middleware Enhancement
**File:** `src/middlewares/authMiddleware.js`

**Enhancement:** Added `clientId` validation when checking refresh tokens for service users.

**Code Added:**
```javascript
// If clientId is present in token (for service users), include it in the query
if (decoded.clientId) {
  tokenQuery.client_id = decoded.clientId;
}
```

---

## New Authentication Flow

### Previous Flow:
1. Register/Login → Returns both `accessToken` and `refreshToken`
2. Use `refreshToken` → Access protected APIs
3. Refresh Token API → Accepts `refreshToken`, returns new tokens

### New Flow:
1. **Register/Login** → Returns only `accessToken`
2. **Refresh Token API** (using `accessToken`) → Returns only `refreshToken`
3. **Use `refreshToken`** → Access protected APIs via `Authorization: Bearer <refreshToken>`
4. **Logout** → Revokes `refreshToken`

---

## Benefits of New Flow

1. **Security**: 
   - Access tokens are short-lived (15 minutes)
   - Clear separation between access and refresh tokens
   - Refresh tokens can be revoked independently

2. **Best Practices**:
   - Follows OAuth 2.0 token flow patterns
   - Reduces token exposure in responses
   - Better control over token lifecycle

3. **Flexibility**:
   - Can revoke refresh tokens without affecting access tokens
   - Easier to implement token rotation
   - Better audit trail

---

## Testing

### Test Script Created
**File:** `test-service-auth.js`

**Features:**
- Tests all service auth endpoints
- Verifies token flow
- Checks error cases
- Uses provided access key: `ak_live_8iX2KMIOOZuYmlla6BUUFTvRsTkr2_E5`
- Requires Node.js 22

**Usage:**
```bash
nvm use 22
node test-service-auth.js
```

---

## Files Modified

1. ✅ `src/services/userService.js`
   - `registerUser()` - Removed `refreshToken` from response
   - `refreshAccessToken()` - Changed to accept `accessToken`, return only `refreshToken`

2. ✅ `src/controllers/userController.js`
   - `refreshToken()` - Changed to accept `accessToken` instead of `refreshToken`

3. ✅ `src/middlewares/validationMiddleware.js`
   - `validateServiceRefreshToken()` - Changed to validate `accessToken`

4. ✅ `src/middlewares/authMiddleware.js`
   - Enhanced refresh token validation to include `clientId` check

5. ✅ `test-service-auth.js` (New)
   - Comprehensive test script for all endpoints

6. ✅ `SERVICE_AUTH_API_DOCUMENTATION.md` (New)
   - Complete API documentation

---

## API Response Examples

### Register Response (Before):
```json
{
  "tokens": {
    "accessToken": "...",
    "refreshToken": "...",  // ❌ Removed
    "accessTokenExpiry": "...",
    "refreshTokenExpiry": "..."  // ❌ Removed
  }
}
```

### Register Response (After):
```json
{
  "tokens": {
    "accessToken": "...",
    "accessTokenExpiry": "..."
  }
}
```

### Refresh Token Request (Before):
```json
{
  "refreshToken": "..."  // ❌ Changed
}
```

### Refresh Token Request (After):
```json
{
  "accessToken": "..."  // ✅ New
}
```

### Refresh Token Response (Before):
```json
{
  "accessToken": "...",  // ❌ Removed
  "refreshToken": "...",
  "accessTokenExpiry": "...",  // ❌ Removed
  "refreshTokenExpiry": "..."
}
```

### Refresh Token Response (After):
```json
{
  "refreshToken": "...",
  "refreshTokenExpiry": "..."
}
```

---

## Migration Guide

### For API Consumers:

1. **Update Register/Login Handling:**
   - Remove `refreshToken` from register/login response handling
   - Only extract `accessToken` from response

2. **Update Refresh Token Flow:**
   - Change refresh token API call to send `accessToken` instead of `refreshToken`
   - Update to extract only `refreshToken` from response

3. **Update Token Storage:**
   - Store `accessToken` separately from `refreshToken`
   - Use `accessToken` to get `refreshToken`
   - Use `refreshToken` for protected API calls

### Example Migration:

**Before:**
```javascript
// Login
const loginResponse = await login(email, password);
const { accessToken, refreshToken } = loginResponse.tokens;
localStorage.setItem('refreshToken', refreshToken);

// Use refresh token
const data = await fetch('/api/protected', {
  headers: { 'Authorization': `Bearer ${refreshToken}` }
});
```

**After:**
```javascript
// Login
const loginResponse = await login(email, password);
const { accessToken } = loginResponse.tokens;

// Get refresh token
const refreshResponse = await refreshToken(accessToken);
const { refreshToken } = refreshResponse.data;
localStorage.setItem('refreshToken', refreshToken);

// Use refresh token
const data = await fetch('/api/protected', {
  headers: { 'Authorization': `Bearer ${refreshToken}` }
});
```

---

## Verification Checklist

- [x] Register endpoint returns only `accessToken`
- [x] Login endpoint returns only `accessToken`
- [x] Refresh Token endpoint accepts `accessToken`
- [x] Refresh Token endpoint returns only `refreshToken`
- [x] Validation middleware updated
- [x] Auth middleware enhanced
- [x] Test script created
- [x] Documentation updated
- [x] No linter errors
- [x] Server restarts successfully

---

## Notes

1. **Backward Compatibility**: This is a breaking change. All API consumers must update their code.

2. **Token Storage**: Refresh tokens are still generated and stored in the database, but not returned in responses.

3. **Security**: The new flow provides better security by separating access and refresh tokens.

4. **Testing**: Use the provided test script to verify all endpoints work correctly.

---

## Support

For questions or issues:
- Check `SERVICE_AUTH_API_DOCUMENTATION.md` for API details
- Run `test-service-auth.js` to verify endpoints
- Review code changes in modified files
