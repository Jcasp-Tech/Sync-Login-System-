# Token & Data Storage Summary

## Quick Answer

**All data is stored in `localStorage`** (browser's local storage), NOT in session storage.

## Storage Details

### Location
- **Storage Type**: `localStorage` (persistent browser storage)
- **Persistence**: Data remains even after browser is closed
- **Scope**: Available across all tabs/windows of the same domain

### What's Stored

1. **Token** (Key: `'token'`)
   - Stores the authentication/refresh token
   - Used for all authenticated API requests
   - Automatically added to Authorization header

2. **User Data** (Key: `'user'`)
   - Stores user information as JSON string
   - Contains: `id`, `full_name`, `email_address`, `position_title`, `phone_no`, `industry`, `is_email_verified`

### Where It's Implemented

**File**: `src/contexts/AuthContext.jsx`

```javascript
const TOKEN_KEY = 'token'      // localStorage key for token
const USER_KEY = 'user'         // localStorage key for user data

// Storing
localStorage.setItem(TOKEN_KEY, token)
localStorage.setItem(USER_KEY, JSON.stringify(userData))

// Retrieving
const token = localStorage.getItem(TOKEN_KEY)
const userData = JSON.parse(localStorage.getItem(USER_KEY))
```

**File**: `src/api/service.js`

```javascript
// Token is automatically retrieved and added to API requests
const token = localStorage.getItem('token')
if (token) {
  headers['Authorization'] = `Bearer ${token}`
}
```

## How to Access

### In React Components:
```javascript
import { useAuth } from '@/contexts/AuthContext'

const { user, isAuthenticated } = useAuth()
console.log(user?.full_name)  // Access user data
```

### Directly:
```javascript
// Get token
const token = localStorage.getItem('token')

// Get user data
const userData = JSON.parse(localStorage.getItem('user') || 'null')
```

## View in Browser

1. Open Developer Tools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Expand **Local Storage**
4. Select your domain
5. You'll see:
   - `token`: Your authentication token
   - `user`: JSON string with user information

## Clear Storage

### Programmatically:
```javascript
localStorage.removeItem('token')
localStorage.removeItem('user')
```

### Via Browser:
- Right-click on localStorage items → Delete
- Or use `localStorage.clear()` to clear everything

