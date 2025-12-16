import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

// Storage keys
const TOKEN_KEY = 'token'
const USER_KEY = 'user'

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Check if user is authenticated on mount
    const token = localStorage.getItem(TOKEN_KEY)
    const userData = localStorage.getItem(USER_KEY)
    
    setIsAuthenticated(!!token)
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
    setLoading(false)
  }, [])

  const login = (token, userData) => {
    localStorage.setItem(TOKEN_KEY, token)
    setIsAuthenticated(true)
    
    if (userData) {
      localStorage.setItem(USER_KEY, JSON.stringify(userData))
      setUser(userData)
    }
  }

  const logout = async () => {
    try {
      // Call logout API to invalidate token on server
      const { logoutUser } = await import('@/api')
      await logoutUser()
    } catch (error) {
      // Even if API call fails, continue with local logout
      console.error('Logout API error:', error)
    } finally {
      // Always clear local storage and state
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      setIsAuthenticated(false)
      setUser(null)
    }
  }

  const updateUser = (userData) => {
    if (userData) {
      localStorage.setItem(USER_KEY, JSON.stringify(userData))
      setUser(userData)
    }
  }

  const value = {
    isAuthenticated,
    loading,
    user,
    login,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

