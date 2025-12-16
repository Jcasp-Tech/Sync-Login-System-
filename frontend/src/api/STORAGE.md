# Token and Data Storage

This document explains where and how authentication tokens and user data are stored in the application.

## Storage Location

**All data is stored in `localStorage`** (browser's local storage), not in session storage.

### Why localStorage?

- **Persistent**: Data persists even after the browser is closed
- **Available across tabs**: Same data accessible in all tabs/windows of the same origin
- **No expiration**: Data remains until explicitly removed or cleared by user

### Storage Keys

The application uses the following keys in localStorage:

1. **`token`** - Stores the authentication token (refresh token)
   - Used for all authenticated API requests
   - Automatically added to Authorization header in API calls
   - Location: `localStorage.getItem('token')`

2. **`user`** - Stores user information as JSON string
   - Contains: `id`, `full_name`, `email_address`, `position_title`, `phone_no`, `industry`, `is_email_verified`
   - Location: `localStorage.getItem('user')`
   - Format: JSON string (parsed when retrieved)

## Storage Implementation

### Where it's stored:

**File**: `src/contexts/AuthContext.jsx`

```javascript
// Storage keys
const TOKEN_KEY = 'token'
const USER_KEY = 'user'

// Storing data
localStorage.setItem(TOKEN_KEY, token)
localStorage.setItem(USER_KEY, JSON.stringify(userData))

// Retrieving data
const token = localStorage.getItem(TOKEN_KEY)
const userData = JSON.parse(localStorage.getItem(USER_KEY))
```

### When it's stored:

1. **On Login** (`src/pages/Login.jsx`):
   - After successful login API call
   - After refresh token API call
   - Token and user data are stored simultaneously

2. **On Logout** (`src/contexts/AuthContext.jsx`):
   - Both token and user data are removed from localStorage

## Token Usage

### Automatic Token Injection

**File**: `src/api/service.js`

The token is automatically retrieved from localStorage and added to all API requests:

```javascript
const getDefaultHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  }

  // Add authorization header if token exists
  const token = localStorage.getItem('token')
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}
```

This means:
- ✅ All API calls automatically include the token
- ✅ No need to manually pass token in each API call
- ✅ Token is retrieved fresh from localStorage on every request

## Accessing Stored Data

### In Components:

```javascript
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, isAuthenticated } = useAuth()
  
  // Access user data
  console.log(user?.full_name)
  console.log(user?.email_address)
}
```

### Directly from localStorage:

```javascript
// Get token
const token = localStorage.getItem('token')

// Get user data
const userData = JSON.parse(localStorage.getItem('user') || 'null')
```

## Security Considerations

⚠️ **Important Notes:**

1. **localStorage is accessible to JavaScript**: Any script running on your domain can access localStorage
2. **XSS attacks**: If your site is vulnerable to XSS, tokens can be stolen
3. **No automatic expiration**: Tokens don't expire automatically (server should handle expiration)
4. **HTTPS recommended**: Always use HTTPS in production to protect data in transit

## Clearing Storage

### Programmatically:

```javascript
// Clear token
localStorage.removeItem('token')

// Clear user data
localStorage.removeItem('user')

// Clear everything
localStorage.clear()
```

### Via Browser:

- Open Developer Tools (F12)
- Go to Application/Storage tab
- Select Local Storage
- Right-click and "Clear" or delete specific items

## Migration Notes

If you need to switch from localStorage to sessionStorage:

1. Change in `src/contexts/AuthContext.jsx`:
   ```javascript
   // Change from:
   localStorage.setItem(TOKEN_KEY, token)
   // To:
   sessionStorage.setItem(TOKEN_KEY, token)
   ```

2. Change in `src/api/service.js`:
   ```javascript
   // Change from:
   const token = localStorage.getItem('token')
   // To:
   const token = sessionStorage.getItem('token')
   ```

**Note**: sessionStorage data is cleared when the browser tab/window is closed.

