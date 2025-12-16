# Authentication API Documentation

## Overview
Secure client authentication API with user registration and login, JWT-based authentication, rate limiting, and comprehensive security measures.

## Base URL
```
http://localhost:5002/api/auth
```

## Endpoints

### 1. Register
**POST** `/api/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "full_name": "John Doe",
  "position_title": "Software Engineer",
  "email_address": "john.doe@example.com",
  "phone_no": "+1234567890",
  "industry": "Technology",
  "password": "SecurePass123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "full_name": "John Doe",
    "position_title": "Software Engineer",
    "email_address": "john.doe@example.com",
    "phone_no": "+1234567890",
    "industry": "Technology",
    "is_email_verified": false,
    "created_at": "2024-01-01T12:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Validation error (missing or invalid fields)
- `409` - User with this email already exists
- `429` - Too many registration attempts (rate limited)

**Rate Limit:** 5 attempts per hour per IP

**Validation Rules:**
- `full_name`: Required, 2-255 characters, letters and spaces only
- `position_title`: Required, 2-255 characters
- `email_address`: Required, valid email format, max 255 characters, unique
- `phone_no`: Required, 10-20 characters, valid phone format
- `industry`: Required, 2-255 characters
- `password`: Required, min 8 characters, must contain uppercase, lowercase, and number

**Security Features:**
- Password is automatically hashed using bcrypt (12 salt rounds)
- Email address is normalized (lowercase, trimmed)
- UUID is automatically generated as user ID
- Rate limiting prevents spam registrations

---

### 2. Login
**POST** `/api/auth/login`

Authenticate user and receive access token. After login, use the access token to call the refresh token endpoint to get a refresh token.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123"
}
```

**Note:** The `email` field accepts the user's email address (stored as `email_address` in database).

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "full_name": "John Doe",
      "position_title": "Software Engineer",
      "email_address": "john.doe@example.com",
      "phone_no": "+1234567890",
      "industry": "Technology",
      "is_email_verified": true
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "accessTokenExpiry": "2024-01-01T12:15:00.000Z"
    }
  }
}
```

**Important:** The login endpoint returns only the `accessToken`. To get a `refreshToken`, call the refresh token endpoint using the `accessToken` received from login.

**Error Responses:**
- `400` - Validation error
- `401` - Invalid credentials or email not verified
- `429` - Too many login attempts (rate limited)

**Rate Limit:** 5 attempts per 15 minutes per IP

**Security Features:**
- Password validation (min 8 chars, uppercase, lowercase, number)
- Email validation
- Rate limiting to prevent brute force attacks
- Bcrypt password hashing verification

---

### 3. Refresh Token
**POST** `/api/auth/refresh`

Get a new access token and refresh token using a valid access token. This endpoint should be called after login to obtain the refresh token, and can be used to refresh both tokens when needed.

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

**Error Responses:**
- `400` - Validation error
- `401` - Invalid or expired access token
- `429` - Too many refresh attempts (rate limited)

**Rate Limit:** 10 attempts per 15 minutes per IP

**Flow:**
1. After login, you receive an `accessToken`
2. Call this endpoint with the `accessToken` to get a new `refreshToken`
3. Save the `refreshToken` locally for future use
4. Use the `refreshToken` to call protected APIs (Bearer token in Authorization header)
5. Use the `refreshToken` for logout operations

---

### 4. Logout
**POST** `/api/auth/logout`

Revoke refresh token and logout user.

**Headers:**
```
Authorization: Bearer <access_token>
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
- `400` - Validation error
- `401` - Invalid or missing access token
- `500` - Server error

**Authentication:** Required (Bearer token)

---

## Security Features

### 1. Password Security
- Passwords are hashed using bcrypt with 12 salt rounds
- Passwords must meet complexity requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number

### 2. Token Security
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Refresh tokens are hashed before storage in database
- Old refresh tokens are revoked when new tokens are generated
- Tokens include issuer and audience claims
- Login returns only access token; refresh token must be obtained via refresh endpoint

### 3. Rate Limiting
- Login endpoint: 5 attempts per 15 minutes
- Refresh token endpoint: 10 attempts per 15 minutes
- Prevents brute force and token abuse attacks

### 4. Input Validation
- Email format validation
- Password strength validation
- Request body validation using express-validator

### 5. Security Headers
- Helmet.js for security headers
- CORS protection
- Request size limits (10MB)

### 6. Error Handling
- Generic error messages to prevent information leakage
- Consistent error response format
- No sensitive data in error responses

## Usage Examples

### cURL Examples

**Register:**
```bash
curl -X POST http://localhost:5002/api/auth/register \
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

**Login:**
```bash
curl -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

**Refresh Token:**
```bash
curl -X POST http://localhost:5002/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "accessToken": "your_access_token_here"
  }'
```

**Logout:**
```bash
curl -X POST http://localhost:5002/api/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_access_token_here" \
  -d '{
    "refreshToken": "your_refresh_token_here"
  }'
```

### JavaScript/Node.js Example

```javascript
// Register
const registerResponse = await fetch('http://localhost:5002/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    full_name: 'John Doe',
    position_title: 'Software Engineer',
    email_address: 'john.doe@example.com',
    phone_no: '+1234567890',
    industry: 'Technology',
    password: 'SecurePass123'
  })
});

const registerData = await registerResponse.json();
console.log('User registered:', registerData.data);

// Login
const loginResponse = await fetch('http://localhost:5002/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123'
  })
});

const loginData = await loginResponse.json();
const { accessToken } = loginData.data.tokens;

// Get refresh token using access token
const refreshResponse = await fetch('http://localhost:5002/api/auth/refresh', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    accessToken: accessToken
  })
});

const refreshData = await refreshResponse.json();
const { refreshToken } = refreshData.data;

// Save refreshToken locally for future use
localStorage.setItem('refreshToken', refreshToken);

// Use refreshToken for authenticated requests
const protectedResponse = await fetch('http://localhost:5002/api/protected', {
  headers: {
    'Authorization': `Bearer ${refreshToken}`
  }
});
```

## Environment Variables

Create a `.env` file with the following variables:

```env
PORT=5002
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/auth-service
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
BCRYPT_SALT_ROUNDS=12
CORS_ORIGIN=http://localhost:3000
```

## Notes

1. **Email Verification:** The login endpoint checks if the email is verified. If `is_email_verified` is false, login will fail.

2. **Token Flow:** 
   - Login returns only `accessToken`
   - Call refresh endpoint with `accessToken` to get a new `refreshToken`
   - Save `refreshToken` locally for protected API calls and logout
   - Use `refreshToken` in Authorization header (Bearer token) to call protected APIs
   - Use `refreshToken` for logout endpoint

3. **Token Storage:** Store refresh tokens securely (httpOnly cookies recommended for web apps). Never store tokens in localStorage for production.

4. **HTTPS:** Always use HTTPS in production to protect tokens in transit.

5. **Token Rotation:** Each refresh operation revokes all previous refresh tokens for security.

6. **Error Messages:** Error messages are intentionally generic to prevent information leakage to attackers.

