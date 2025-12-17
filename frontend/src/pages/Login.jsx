import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import { useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { sanitizeEmail, sanitizePassword } from '@/utils/sanitize'
import { loginUser, refreshToken } from '@/api'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const passwordInputRef = useRef(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
  })

  const onSubmit = async (data) => {
    setLoading(true)
    setMessage('')

    // Sanitize all inputs
    const loginCredentials = {
      email: sanitizeEmail(data.email),
      password: sanitizePassword(data.password),
    }

    try {
      // Step 1: Login and get access token
      const loginResponse = await loginUser(loginCredentials)
      
      if (!loginResponse.success || !loginResponse.data) {
        throw new Error(loginResponse.message || 'Login failed')
      }

      // Extract access token from response
      const accessToken = loginResponse.data.tokens?.accessToken
      if (!accessToken) {
        throw new Error('Access token not received from login')
      }

      // Extract user data
      const userData = loginResponse.data.client
      if (!userData) {
        throw new Error('User data not received from login')
      }

      // Step 2: Call refresh token API with access token
      let refreshTokenValue = accessToken // Fallback to access token if refresh fails
      try {
        const refreshResponse = await refreshToken(accessToken)
        
        // Extract refresh token from response
        // Adjust this based on your actual refresh token API response structure
        if (refreshResponse.data?.token || refreshResponse.token) {
          refreshTokenValue = refreshResponse.data?.token || refreshResponse.token
        } else if (refreshResponse.data?.accessToken || refreshResponse.accessToken) {
          refreshTokenValue = refreshResponse.data?.accessToken || refreshResponse.accessToken
        }
      } catch (refreshError) {
        console.warn('Refresh token API call failed, using access token:', refreshError)
        // Continue with access token if refresh fails
      }

      // Step 3: Store token and user data
      login(refreshTokenValue, userData)
      
      // Handle success response
      setMessage(loginResponse.message || 'Login successful!')
      
      // Navigate to dashboard
      setTimeout(() => {
        navigate('/dashboard', { replace: true })
      }, 500)
    } catch (error) {
      // Handle error response
      setMessage(error.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 items-center justify-center p-12">
        <div className="w-full max-w-md text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
          <p className="text-lg opacity-90 mb-8">
            Sign in to access your account and continue your journey with us.
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <div className="w-full h-64 bg-white/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-48 h-48 text-white/80"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Login</CardTitle>
            <CardDescription>
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {message && (
              <div
                className={`mb-4 p-3 rounded-md text-sm ${
                  message.includes('success') || message.includes('Success')
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {message}
              </div>
            )}
            <form 
              onSubmit={handleSubmit(onSubmit)} 
              className="space-y-4" 
              autoComplete="off"
              data-form-type="other"
              data-lpignore="true"
              data-1p-ignore="true"
              data-dashlane-ignore="true"
              data-bitwarden-ignore="true"
            >
              {/* Hidden dummy fields to trick password managers - placed BEFORE real fields */}
              <input
                type="text"
                name="fake-username"
                autoComplete="username"
                style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none', height: 0, width: 0 }}
                tabIndex={-1}
                readOnly
                aria-hidden="true"
                value=""
              />
              <input
                type="password"
                name="fake-password"
                autoComplete="current-password"
                style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none', height: 0, width: 0 }}
                tabIndex={-1}
                readOnly
                aria-hidden="true"
                value=""
              />
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email-field"
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="off"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-dashlane-ignore="true"
                  data-bitwarden-ignore="true"
                  data-form-type="other"
                  readOnly
                  onFocus={(e) => {
                    e.target.removeAttribute('readonly')
                  }}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                    onChange: (e) => {
                      e.target.value = sanitizeEmail(e.target.value)
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password-field"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="new-password"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-dashlane-ignore="true"
                  data-bitwarden-ignore="true"
                  data-form-type="other"
                  ref={passwordInputRef}
                  readOnly
                  onFocus={(e) => {
                    e.target.removeAttribute('readonly')
                    e.target.setAttribute('autocomplete', 'new-password')
                    e.target.setAttribute('data-lpignore', 'true')
                  }}
                  onMouseEnter={(e) => {
                    e.target.setAttribute('autocomplete', 'new-password')
                  }}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 1,
                      message: 'Password is required',
                    },
                    onChange: (e) => {
                      e.target.value = sanitizePassword(e.target.value)
                    },
                  })}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link to="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
