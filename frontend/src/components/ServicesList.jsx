import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Lock, CheckCircle2, Globe, FileText } from 'lucide-react'
import { API_CONFIG } from '@/api/config'
import { AUTH_ENDPOINTS } from '@/api/endpoint'

export default function ServicesList({ onNavigateToDocs }) {
  const [showDetails, setShowDetails] = useState(false)
  
  const service = {
    id: 1,
    name: 'Authentication Service',
    description: 'Handles user authentication, authorization, and session management',
    status: 'active',
    baseUrl: `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}`,
    version: 'v1.0.0',
    uptime: '99.9%',
    requests: '1.2M',
    category: 'Security',
    endpoints: [
      {
        method: 'POST',
        path: AUTH_ENDPOINTS.REGISTER,
        description: 'Register a new user account',
        requiresAuth: false,
      },
      {
        method: 'POST',
        path: AUTH_ENDPOINTS.LOGIN,
        description: 'Login with email and password',
        requiresAuth: false,
      },
      {
        method: 'POST',
        path: AUTH_ENDPOINTS.LOGOUT,
        description: 'Logout and invalidate session',
        requiresAuth: true,
      },
      {
        method: 'POST',
        path: AUTH_ENDPOINTS.REFRESH_TOKEN,
        description: 'Refresh access token',
        requiresAuth: true,
      },
      {
        method: 'POST',
        path: AUTH_ENDPOINTS.FORGOT_PASSWORD,
        description: 'Request password reset email',
        requiresAuth: false,
      },
      {
        method: 'POST',
        path: AUTH_ENDPOINTS.RESET_PASSWORD,
        description: 'Reset password with token',
        requiresAuth: false,
      },
    ],
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

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

  return (
    <div className="space-y-6">
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">{service.name}</CardTitle>
                <CardDescription className="mt-1">{service.description}</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              {getStatusBadge(service.status)}
            </div>
            <Badge variant="outline">{service.category}</Badge>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Version:</span>
              <span className="font-medium">{service.version}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Uptime:</span>
              <span className="font-medium">{service.uptime}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Requests:</span>
              <span className="font-medium">{service.requests}</span>
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Globe className="h-3 w-3" />
              <span className="truncate">{service.baseUrl}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => setShowDetails(true)}
            >
              <FileText className="h-4 w-4 mr-2" />
              View Details
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => {
                if (onNavigateToDocs) {
                  onNavigateToDocs('api-docs')
                }
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              API Docs
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{service.name} - API Details</DialogTitle>
            <DialogDescription>
              Complete API endpoint information and specifications
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            <div>
              <h3 className="font-semibold mb-2">Base URL</h3>
              <code className="block p-2 bg-muted rounded text-sm">{service.baseUrl}</code>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Available Endpoints</h3>
              <div className="space-y-3">
                {service.endpoints.map((endpoint, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-3">
                      {getMethodBadge(endpoint.method)}
                      <code className="text-sm font-mono">{endpoint.path}</code>
                      {endpoint.requiresAuth && (
                        <Badge variant="outline" className="text-xs">Requires Auth</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Full URL: </span>
                      <code>{service.baseUrl}{endpoint.path}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

