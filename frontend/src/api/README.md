# API Directory Structure

This directory contains all API-related functionality in a structured and maintainable way.

## File Structure

```
src/api/
├── endpoint.js    # All API endpoint definitions
├── config.js      # API configuration (base URL, version, etc.)
├── service.js     # Core API request functions (GET, POST, PUT, DELETE)
├── auth.js        # Authentication-specific API functions
├── index.js       # Main export file - import everything from here
└── README.md      # This file
```

## Usage

### Import API Functions

```javascript
// Import specific functions
import { registerUser, loginUser } from '@/api'

// Import endpoints
import { AUTH_ENDPOINTS } from '@/api'

// Import service functions
import { post, get, apiRequest } from '@/api'
```

### Example: Using Auth APIs

```javascript
import { registerUser, loginUser } from '@/api'

// Register
const userData = {
  full_name: 'John Doe',
  position_title: 'Software Engineer',
  email_address: 'john.doe@example.com',
  phone_no: '+1234567890',
  industry: 'Technology',
  password: 'SecurePass123'
}

try {
  const response = await registerUser(userData)
  console.log('Success:', response)
} catch (error) {
  console.error('Error:', error.message)
}

// Login
const credentials = {
  email: 'john.doe@example.com',
  password: 'SecurePass123'
}

try {
  const response = await loginUser(credentials)
  const token = response.token || response.data?.token
  // Store token
} catch (error) {
  console.error('Error:', error.message)
}
```

### Example: Making Custom API Calls

```javascript
import { post, get, apiRequest } from '@/api'
import { USER_ENDPOINTS } from '@/api'

// Using helper functions
const data = await get(USER_ENDPOINTS.PROFILE)
const result = await post('/custom/endpoint', { key: 'value' })

// Using generic apiRequest
const response = await apiRequest('/custom/endpoint', {
  method: 'PUT',
  body: { key: 'value' }
})
```

## Configuration

Edit `config.js` to change the API base URL:

```javascript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:5002',  // Change this
  API_VERSION: '/api/v1',
}
```

## Adding New Endpoints

1. Add endpoint to `endpoint.js`:
```javascript
export const NEW_ENDPOINTS = {
  LIST: '/client/new/list',
  CREATE: '/client/new/create',
}
```

2. Create a new module file (e.g., `new.js`) with API functions:
```javascript
import { post, get } from './service'
import { NEW_ENDPOINTS } from './endpoint'

export async function getNewList() {
  return get(NEW_ENDPOINTS.LIST)
}

export async function createNew(data) {
  return post(NEW_ENDPOINTS.CREATE, data)
}
```

3. Export from `index.js`:
```javascript
export * from './new'
```

## Features

- ✅ Centralized endpoint management
- ✅ Automatic token injection for authenticated requests
- ✅ Consistent error handling
- ✅ Easy to extend with new API modules
- ✅ Type-safe and developer-friendly

