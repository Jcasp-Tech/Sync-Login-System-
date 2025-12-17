import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Lock, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Play, 
  Code,
  FileText,
  Key,
  AlertCircle
} from 'lucide-react'
import { API_CONFIG } from '@/api/config'
import { AUTH_ENDPOINTS } from '@/api/endpoint'
import { useAuth } from '@/contexts/AuthContext'

export default function ApiDocs() {
  const { user } = useAuth()
  const [accessToken, setAccessToken] = useState(localStorage.getItem('token') || '')
  const [selectedEndpoint, setSelectedEndpoint] = useState(null)
  const [requestBody, setRequestBody] = useState('')
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const endpoints = [
    {
      id: 'register',
      method: 'POST',
      path: AUTH_ENDPOINTS.REGISTER,
      description: 'Register a new user account',
      requiresAuth: false,
      exampleBody: {
        full_name: 'John Doe',
        position_title: 'CEO',
        email_address: 'john.doe@example.com',
        phone_no: '+1234567890',
        industry: 'Technology',
        password: 'SecurePassword123!'
      },
    },
    {
      id: 'login',
      method: 'POST',
      path: AUTH_ENDPOINTS.LOGIN,
      description: 'Login with email and password',
      requiresAuth: false,
      exampleBody: {
        email: 'john.doe@example.com',
        password: 'SecurePassword123!'
      },
    },
    {
      id: 'logout',
      method: 'POST',
      path: AUTH_ENDPOINTS.LOGOUT,
      description: 'Logout and invalidate session',
      requiresAuth: true,
      exampleBody: {},
    },
    {
      id: 'refresh',
      method: 'POST',
      path: AUTH_ENDPOINTS.REFRESH_TOKEN,
      description: 'Refresh access token',
      requiresAuth: true,
      exampleBody: {
        accessToken: 'your-access-token-here'
      },
    },
    {
      id: 'forgot-password',
      method: 'POST',
      path: AUTH_ENDPOINTS.FORGOT_PASSWORD,
      description: 'Request password reset email',
      requiresAuth: false,
      exampleBody: {
        email: 'john.doe@example.com'
      },
    },
    {
      id: 'reset-password',
      method: 'POST',
      path: AUTH_ENDPOINTS.RESET_PASSWORD,
      description: 'Reset password with token',
      requiresAuth: false,
      exampleBody: {
        token: 'reset-token-from-email',
        password: 'NewSecurePassword123!'
      },
    },
  ]

  const getMethodBadge = (method) => {
    const colors = {
      GET: 'bg-blue-500',
      POST: 'bg-green-500',
      PUT: 'bg-yellow-500',
      PATCH: 'bg-orange-500',
      DELETE: 'bg-red-500',
    }
    return (
      <Badge className={colors[method] || 'bg-gray-500'}>{method}</Badge>
    )
  }

  const handleEndpointSelect = (endpoint) => {
    setSelectedEndpoint(endpoint)
    setRequestBody(JSON.stringify(endpoint.exampleBody, null, 2))
    setResponse(null)
  }

  const handleTryApi = async () => {
    if (!selectedEndpoint) {
      alert('Please select an endpoint first')
      return
    }

    if (selectedEndpoint.requiresAuth && !accessToken) {
      alert('This endpoint requires an access token')
      return
    }

    setLoading(true)
    setResponse(null)

    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}${selectedEndpoint.path}`
      const headers = {
        'Content-Type': 'application/json',
      }

      if (selectedEndpoint.requiresAuth && accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`
      }

      const body = requestBody.trim() ? JSON.parse(requestBody) : {}

      const fetchOptions = {
        method: selectedEndpoint.method,
        headers,
      }

      if (selectedEndpoint.method !== 'GET' && Object.keys(body).length > 0) {
        fetchOptions.body = JSON.stringify(body)
      }

      const res = await fetch(url, fetchOptions)
      const data = await res.json()

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        data: data,
        ok: res.ok,
      })
    } catch (error) {
      setResponse({
        status: 0,
        statusText: 'Error',
        error: error.message,
        ok: false,
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">API Documentation</h1>
        <p className="text-muted-foreground mb-6">
          Complete guide to using the Authentication Service API
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <FileText className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="endpoints">
            <Code className="h-4 w-4 mr-2" />
            Endpoints
          </TabsTrigger>
          <TabsTrigger value="try-api">
            <Play className="h-4 w-4 mr-2" />
            Try API
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                Learn how to integrate with the Authentication Service API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Base URL</h3>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-muted rounded text-sm">
                    {API_CONFIG.BASE_URL}{API_CONFIG.API_VERSION}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(`${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}`)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Authentication</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Most endpoints require authentication using a Bearer token. Include the token in the Authorization header:
                </p>
                <code className="block p-2 bg-muted rounded text-sm">
                  Authorization: Bearer YOUR_ACCESS_TOKEN
                </code>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Request Format</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  All requests should use JSON format with the Content-Type header:
                </p>
                <code className="block p-2 bg-muted rounded text-sm">
                  Content-Type: application/json
                </code>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Response Format</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  All responses are returned in JSON format with standard HTTP status codes.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-4">
          <div className="grid gap-4">
            {endpoints.map((endpoint) => (
              <Card key={endpoint.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {getMethodBadge(endpoint.method)}
                    <code className="text-sm font-mono">{endpoint.path}</code>
                    {endpoint.requiresAuth && (
                      <Badge variant="outline" className="text-xs">
                        <Key className="h-3 w-3 mr-1" />
                        Requires Auth
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="mt-2">{endpoint.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Full URL</h4>
                    <code className="block p-2 bg-muted rounded text-sm">
                      {API_CONFIG.BASE_URL}{API_CONFIG.API_VERSION}{endpoint.path}
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Example Request Body</h4>
                    <pre className="p-2 bg-muted rounded text-sm overflow-x-auto">
                      {JSON.stringify(endpoint.exampleBody, null, 2)}
                    </pre>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const tabs = document.querySelector('[role="tablist"]')
                      const tryApiTab = Array.from(tabs?.querySelectorAll('button') || []).find(
                        (btn) => btn.textContent?.includes('Try API')
                      )
                      tryApiTab?.click()
                      setTimeout(() => handleEndpointSelect(endpoint), 100)
                    }}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Try This Endpoint
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="try-api" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Request</CardTitle>
                <CardDescription>Configure and test API endpoints</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="access-token">Access Token</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="access-token"
                      type="password"
                      placeholder="Enter your access token"
                      value={accessToken}
                      onChange={(e) => setAccessToken(e.target.value)}
                    />
                    {user && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAccessToken(localStorage.getItem('token') || '')}
                      >
                        Use Current
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Required for authenticated endpoints
                  </p>
                </div>

                <div>
                  <Label htmlFor="endpoint-select">Select Endpoint</Label>
                  <select
                    id="endpoint-select"
                    className="w-full mt-1 p-2 border rounded-md"
                    value={selectedEndpoint?.id || ''}
                    onChange={(e) => {
                      const endpoint = endpoints.find((ep) => ep.id === e.target.value)
                      if (endpoint) handleEndpointSelect(endpoint)
                    }}
                  >
                    <option value="">Select an endpoint...</option>
                    {endpoints.map((endpoint) => (
                      <option key={endpoint.id} value={endpoint.id}>
                        {endpoint.method} {endpoint.path}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedEndpoint && (
                  <>
                    <div>
                      <Label htmlFor="request-body">Request Body (JSON)</Label>
                      <Textarea
                        id="request-body"
                        className="mt-1 font-mono text-sm"
                        rows={10}
                        value={requestBody}
                        onChange={(e) => setRequestBody(e.target.value)}
                        placeholder="Enter JSON request body"
                      />
                    </div>

                    <Button
                      className="w-full"
                      onClick={handleTryApi}
                      disabled={loading || !selectedEndpoint}
                    >
                      {loading ? (
                        <>Loading...</>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Send Request
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response</CardTitle>
                <CardDescription>API response will appear here</CardDescription>
              </CardHeader>
              <CardContent>
                {response ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {response.ok ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="font-semibold">
                        {response.status} {response.statusText}
                      </span>
                    </div>

                    {response.error ? (
                      <div className="p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm text-red-700">{response.error}</p>
                          </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold">Response Body</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(JSON.stringify(response.data, null, 2))}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            {copied ? 'Copied!' : 'Copy'}
                          </Button>
                        </div>
                        <pre className="p-3 bg-muted rounded text-sm overflow-x-auto max-h-96">
                          {JSON.stringify(response.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No response yet. Select an endpoint and send a request.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

