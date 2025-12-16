import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
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
import {
  sanitizeFullName,
  sanitizeFullNameOnSubmit,
  sanitizeEmail,
  sanitizePhone,
  sanitizePassword,
  sanitizeIndustry,
  sanitizePosition,
} from '@/utils/sanitize'
import { registerUser } from '@/api'

export default function Signup() {
  const navigate = useNavigate()
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiErrors, setApiErrors] = useState({})

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
  })

  const password = watch('password')

  // Map API field names to form field names
  const mapApiFieldToFormField = (apiField) => {
    const fieldMap = {
      'full_name': 'fullName',
      'position_title': 'position',
      'email_address': 'email',
      'phone_no': 'phoneNo',
      'industry': 'industry',
      'password': 'password',
      'confirmPassword': 'confirmPassword',
    }
    return fieldMap[apiField] || apiField
  }

  const onSubmit = async (data) => {
    setLoading(true)
    setMessage('')
    setApiErrors({}) // Clear previous API errors

    // Sanitize all inputs and map to API expected format
    // Use strict sanitization on submit
    const registrationData = {
      full_name: sanitizeFullNameOnSubmit(data.fullName),
      position_title: sanitizePosition(data.position),
      email_address: sanitizeEmail(data.email),
      phone_no: sanitizePhone(data.phoneNo),
      industry: sanitizeIndustry(data.industry),
      password: sanitizePassword(data.password),
    }

    try {
      const responseData = await registerUser(registrationData)
      
      // Handle success response
      setMessage(responseData.message || 'Registration successful!')
      
      // Navigate to login on success
      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 1500)
    } catch (error) {
      // Handle validation errors from API
      if (error.errors && Array.isArray(error.errors)) {
        const fieldErrors = {}
        error.errors.forEach((err) => {
          const formField = mapApiFieldToFormField(err.field)
          fieldErrors[formField] = err.message
        })
        setApiErrors(fieldErrors)
      }
      
      // Set general error message
      setMessage(error.message || 'Signup failed. Please check the errors below.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 items-center justify-center p-12">
        <div className="w-full max-w-md text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Join Us Today</h1>
          <p className="text-lg opacity-90 mb-8">
            Create your company account and start your journey with us. Get access to powerful tools and features.
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-100 p-4 overflow-y-auto">
        <Card className="w-full max-w-md my-8">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Company Registration</CardTitle>
            <CardDescription>
              Create your company account to get started
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  {...register('fullName', {
                    required: 'Full name is required',
                    minLength: {
                      value: 2,
                      message: 'Full name must be at least 2 characters',
                    },
                    // Allow spaces during typing, only sanitize dangerous characters
                    onChange: (e) => {
                      // Only remove dangerous characters, keep spaces
                      e.target.value = e.target.value
                        .replace(/[<>]/g, '')
                        .replace(/[&"']/g, '')
                        .replace(/\s{2,}/g, ' ') // Only prevent multiple consecutive spaces
                    },
                  })}
                />
                {(errors.fullName || apiErrors.fullName) && (
                  <p className="text-xs text-destructive">
                    {errors.fullName?.message || apiErrors.fullName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">
                  Position/Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="position"
                  type="text"
                  placeholder="CEO, Owner, Director, etc."
                  {...register('position', {
                    required: 'Position/Title is required',
                    minLength: {
                      value: 2,
                      message: 'Position must be at least 2 characters',
                    },
                    onChange: (e) => {
                      e.target.value = sanitizePosition(e.target.value)
                    },
                  })}
                />
                {(errors.position || apiErrors.position) && (
                  <p className="text-xs text-destructive">
                    {errors.position?.message || apiErrors.position}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                    onChange: (e) => {
                      // Remove spaces immediately in email (critical field)
                      e.target.value = sanitizeEmail(e.target.value)
                    },
                  })}
                />
                {(errors.email || apiErrors.email) && (
                  <p className="text-xs text-destructive">
                    {errors.email?.message || apiErrors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNo">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phoneNo"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  {...register('phoneNo', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[\d+\-() ]+$/,
                      message: 'Invalid phone number format',
                    },
                    onChange: (e) => {
                      e.target.value = sanitizePhone(e.target.value)
                    },
                  })}
                />
                {(errors.phoneNo || apiErrors.phoneNo) && (
                  <p className="text-xs text-destructive">
                    {errors.phoneNo?.message || apiErrors.phoneNo}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">
                  Industry <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="industry"
                  type="text"
                  placeholder="e.g., Technology, Finance, Healthcare"
                  {...register('industry', {
                    required: 'Industry is required',
                    minLength: {
                      value: 2,
                      message: 'Industry must be at least 2 characters',
                    },
                    onChange: (e) => {
                      e.target.value = sanitizeIndustry(e.target.value)
                    },
                  })}
                />
                {(errors.industry || apiErrors.industry) && (
                  <p className="text-xs text-destructive">
                    {errors.industry?.message || apiErrors.industry}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                    onChange: (e) => {
                      e.target.value = sanitizePassword(e.target.value)
                    },
                  })}
                />
                {(errors.password || apiErrors.password) && (
                  <p className="text-xs text-destructive">
                    {errors.password?.message || apiErrors.password}
                  </p>
                )}
                {!errors.password && !apiErrors.password && (
                  <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters long with uppercase, lowercase, and number
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirm Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === password || 'Passwords do not match',
                    onChange: (e) => {
                      // Remove spaces immediately in password (critical field)
                      e.target.value = sanitizePassword(e.target.value)
                    },
                  })}
                />
                {(errors.confirmPassword || apiErrors.confirmPassword) && (
                  <p className="text-xs text-destructive">
                    {errors.confirmPassword?.message || apiErrors.confirmPassword}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link to="/login" className="text-primary hover:underline">
                Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
