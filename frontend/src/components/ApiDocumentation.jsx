import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

export default function ApiDocumentation({ activeSection }) {
  const [copiedCode, setCopiedCode] = useState(null)

  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  if (activeSection === 'overview') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>API Overview</CardTitle>
            <CardDescription>
              Welcome to our API documentation. Get started by generating an API key.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Getting Started</h3>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Generate an API key from the API Keys section</li>
                <li>Use your API key in the Authorization header</li>
                <li>Make requests to our endpoints</li>
                <li>Check the Examples section for code samples</li>
              </ol>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold mb-2">Base URL</h3>
              <code className="bg-muted px-2 py-1 rounded text-sm">
                https://api.example.com/v1
              </code>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (activeSection === 'authentication') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
            <CardDescription>
              All API requests require authentication using your API key
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">API Key Authentication</h3>
              <p className="text-muted-foreground mb-4">
                Include your API key in the Authorization header of every request.
              </p>
              <div className="bg-muted p-4 rounded-lg relative">
                <pre className="text-sm overflow-x-auto">
                  <code>{`Authorization: Bearer YOUR_API_KEY`}</code>
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyCode('Authorization: Bearer YOUR_API_KEY', 'auth')}
                >
                  {copiedCode === 'auth' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold mb-2">Example Request</h3>
              <Tabs defaultValue="curl" className="w-full">
                <TabsList>
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                </TabsList>
                <TabsContent value="curl" className="mt-4">
                  <div className="bg-muted p-4 rounded-lg relative">
                    <pre className="text-sm overflow-x-auto">
                      <code>{`curl https://api.example.com/v1/users \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</code>
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyCode('curl https://api.example.com/v1/users \\\n  -H "Authorization: Bearer YOUR_API_KEY"', 'curl')}
                    >
                      {copiedCode === 'curl' ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="javascript" className="mt-4">
                  <div className="bg-muted p-4 rounded-lg relative">
                    <pre className="text-sm overflow-x-auto">
                      <code>{`fetch('https://api.example.com/v1/users', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
})`}</code>
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyCode(`fetch('https://api.example.com/v1/users', {\n  headers: {\n    'Authorization': 'Bearer YOUR_API_KEY'\n  }\n})`, 'js')}
                    >
                      {copiedCode === 'js' ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="python" className="mt-4">
                  <div className="bg-muted p-4 rounded-lg relative">
                    <pre className="text-sm overflow-x-auto">
                      <code>{`import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY'
}

response = requests.get(
    'https://api.example.com/v1/users',
    headers=headers
)`}</code>
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyCode(`import requests\n\nheaders = {\n    'Authorization': 'Bearer YOUR_API_KEY'\n}\n\nresponse = requests.get(\n    'https://api.example.com/v1/users',\n    headers=headers\n)`, 'py')}
                    >
                      {copiedCode === 'py' ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (activeSection === 'endpoints') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>API Endpoints</CardTitle>
            <CardDescription>
              Available endpoints and their usage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default">GET</Badge>
                <code className="text-sm font-semibold">/api/v1/users</code>
              </div>
              <p className="text-muted-foreground mb-3">
                Retrieve a list of all users
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-sm overflow-x-auto">
                  <code>{`GET /api/v1/users
Authorization: Bearer YOUR_API_KEY`}</code>
                </pre>
              </div>
            </div>
            <Separator />
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">POST</Badge>
                <code className="text-sm font-semibold">/api/v1/users</code>
              </div>
              <p className="text-muted-foreground mb-3">
                Create a new user
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-sm overflow-x-auto">
                  <code>{`POST /api/v1/users
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com"
}`}</code>
                </pre>
              </div>
            </div>
            <Separator />
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">GET</Badge>
                <code className="text-sm font-semibold">/api/v1/users/:id</code>
              </div>
              <p className="text-muted-foreground mb-3">
                Get a specific user by ID
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-sm overflow-x-auto">
                  <code>{`GET /api/v1/users/123
Authorization: Bearer YOUR_API_KEY`}</code>
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (activeSection === 'examples') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Code Examples</CardTitle>
            <CardDescription>
              Ready-to-use code examples in different languages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="javascript" className="w-full">
              <TabsList>
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
                <TabsTrigger value="curl">cURL</TabsTrigger>
              </TabsList>
              <TabsContent value="javascript" className="mt-4">
                <div className="bg-muted p-4 rounded-lg relative">
                  <pre className="text-sm overflow-x-auto">
                    <code>{`// Get all users
async function getUsers() {
  const response = await fetch('https://api.example.com/v1/users', {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  return data;
}

// Create a user
async function createUser(userData) {
  const response = await fetch('https://api.example.com/v1/users', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });
  
  return await response.json();
}`}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyCode(`// Get all users\nasync function getUsers() {\n  const response = await fetch('https://api.example.com/v1/users', {\n    headers: {\n      'Authorization': 'Bearer YOUR_API_KEY',\n      'Content-Type': 'application/json'\n    }\n  });\n  \n  const data = await response.json();\n  return data;\n}\n\n// Create a user\nasync function createUser(userData) {\n  const response = await fetch('https://api.example.com/v1/users', {\n    method: 'POST',\n    headers: {\n      'Authorization': 'Bearer YOUR_API_KEY',\n      'Content-Type': 'application/json'\n    },\n    body: JSON.stringify(userData)\n  });\n  \n  return await response.json();\n}`, 'js-example')}
                  >
                    {copiedCode === 'js-example' ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="python" className="mt-4">
                <div className="bg-muted p-4 rounded-lg relative">
                  <pre className="text-sm overflow-x-auto">
                    <code>{`import requests

API_KEY = 'YOUR_API_KEY'
BASE_URL = 'https://api.example.com/v1'

# Get all users
def get_users():
    headers = {'Authorization': f'Bearer {API_KEY}'}
    response = requests.get(f'{BASE_URL}/users', headers=headers)
    return response.json()

# Create a user
def create_user(user_data):
    headers = {
        'Authorization': f'Bearer {API_KEY}',
        'Content-Type': 'application/json'
    }
    response = requests.post(
        f'{BASE_URL}/users',
        headers=headers,
        json=user_data
    )
    return response.json()`}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyCode(`import requests\n\nAPI_KEY = 'YOUR_API_KEY'\nBASE_URL = 'https://api.example.com/v1'\n\n# Get all users\ndef get_users():\n    headers = {'Authorization': f'Bearer {API_KEY}'}\n    response = requests.get(f'{BASE_URL}/users', headers=headers)\n    return response.json()\n\n# Create a user\ndef create_user(user_data):\n    headers = {\n        'Authorization': f'Bearer {API_KEY}',\n        'Content-Type': 'application/json'\n    }\n    response = requests.post(\n        f'{BASE_URL}/users',\n        headers=headers,\n        json=user_data\n    )\n    return response.json()`, 'py-example')}
                  >
                    {copiedCode === 'py-example' ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="curl" className="mt-4">
                <div className="bg-muted p-4 rounded-lg relative">
                  <pre className="text-sm overflow-x-auto">
                    <code>{`# Get all users
curl -X GET https://api.example.com/v1/users \\
  -H "Authorization: Bearer YOUR_API_KEY"

# Create a user
curl -X POST https://api.example.com/v1/users \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "John Doe",
    "email": "john@example.com"
  }'`}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyCode(`# Get all users\ncurl -X GET https://api.example.com/v1/users \\\n  -H "Authorization: Bearer YOUR_API_KEY"\n\n# Create a user\ncurl -X POST https://api.example.com/v1/users \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "name": "John Doe",\n    "email": "john@example.com"\n  }'`, 'curl-example')}
                  >
                    {copiedCode === 'curl-example' ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}

