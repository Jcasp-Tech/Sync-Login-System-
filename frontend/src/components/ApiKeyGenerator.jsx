import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast'
import { Copy, Check, RefreshCw, Loader2 } from 'lucide-react'
import { generateApiClient, listApiClients, revokeApiClient } from '@/api/auth'

export default function ApiKeyGenerator() {
  const { toast } = useToast()
  const [apiKeys, setApiKeys] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [environment, setEnvironment] = useState('live')
  const [rateLimit, setRateLimit] = useState('1000')
  const [copiedId, setCopiedId] = useState(null)
  const [error, setError] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [keyToDelete, setKeyToDelete] = useState(null)

  // Fetch API keys on component mount
  useEffect(() => {
    fetchApiKeys()
  }, [])

  const fetchApiKeys = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await listApiClients()
      // Handle different possible response structures
      // Response might be: { data: [...], success: true } or directly an array
      let keys = []
      if (response.data && Array.isArray(response.data)) {
        keys = response.data
      } else if (Array.isArray(response)) {
        keys = response
      } else if (response.apiKeys && Array.isArray(response.apiKeys)) {
        keys = response.apiKeys
      }
      setApiKeys(keys)
    } catch (err) {
      console.error('Error fetching API keys:', err)
      setError(err.message || 'Failed to fetch API keys')
      setApiKeys([])
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateApiKey = async () => {
    if (!rateLimit || isNaN(Number(rateLimit)) || Number(rateLimit) <= 0) {
      setError('Please enter a valid rate limit')
      setTimeout(() => setError(null), 3000)
      return
    }

    try {
      setGenerating(true)
      setError(null)

      const response = await generateApiClient({
        environment: environment,
        rate_limit: Number(rateLimit),
      })

      // Handle response structure: response.data contains the key info
      const keyData = response.data || response
      const accessKeySecret = keyData.access_key_secret || keyData.access_key || keyData.key || keyData.accessKey || keyData.apiKey

      if (accessKeySecret) {
        // Copy to clipboard automatically
        navigator.clipboard.writeText(accessKeySecret)
        
        // Show success toast
        toast({
          title: "API Key Generated Successfully",
          description: "Your API key has been generated and copied to clipboard. Store it securely - it won't be shown again.",
          variant: "success",
          duration: 6000,
        })
        
        // Refresh the list to show the new key (fetchApiKeys will handle loading state)
        await fetchApiKeys()
        // Reset form
        setRateLimit('1000')
      } else {
        setError('Failed to generate API key: Invalid response from server')
      }
    } catch (err) {
      console.error('Error generating API key:', err)
      setError(err.message || err.response?.message || 'Failed to generate API key')
      toast({
        title: "Error",
        description: err.message || err.response?.message || 'Failed to generate API key',
        variant: "destructive",
      })
    } finally {
      setGenerating(false)
    }
  }

  const openDeleteDialog = (accessKeyId) => {
    setKeyToDelete(accessKeyId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteKey = async () => {
    if (!keyToDelete) return

    try {
      setDeleting(keyToDelete)
      setError(null)
      setDeleteDialogOpen(false)
      await revokeApiClient(keyToDelete)
      toast({
        title: "API Key Revoked",
        description: "The API key has been successfully revoked.",
        variant: "success",
      })
      // Refresh the list
      await fetchApiKeys()
      setKeyToDelete(null)
    } catch (err) {
      console.error('Error revoking API key:', err)
      setError(err.message || err.response?.message || 'Failed to revoke API key')
      toast({
        title: "Error",
        description: err.message || err.response?.message || 'Failed to revoke API key',
        variant: "destructive",
      })
    } finally {
      setDeleting(null)
    }
  }

  const copyToClipboard = (key, id) => {
    navigator.clipboard.writeText(key)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString()
    } catch {
      return dateString
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate New API Key</CardTitle>
          <CardDescription>
            Create a new API key to access our services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="environment">Environment</Label>
              <Select value={environment} onValueChange={setEnvironment}>
                <SelectTrigger id="environment">
                  <SelectValue placeholder="Select environment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="test">Test</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate-limit">Rate Limit</Label>
              <Input
                id="rate-limit"
                type="number"
                placeholder="e.g., 1000"
                value={rateLimit}
                onChange={(e) => setRateLimit(e.target.value)}
                min="1"
              />
            </div>
            <Button 
              onClick={handleGenerateApiKey} 
              type="button"
              disabled={generating}
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
          <CardDescription>
            Manage your existing API keys
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(loading || generating) ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">
                {generating ? 'Generating API key...' : 'Loading API keys...'}
              </span>
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No API keys found. Generate your first API key above.
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((apiKey) => {
                // Handle different possible response structures
                const accessKeyId = apiKey.access_key_id || apiKey.id || apiKey.accessKeyId
                // Note: access_key_secret is only shown once after generation
                // In the list, we typically only show access_key_id
                const accessKeySecret = apiKey.access_key_secret || apiKey.access_key || apiKey.key || apiKey.accessKey || apiKey.apiKey
                const env = apiKey.environment || apiKey.env || 'unknown'
                const rateLimit = apiKey.rate_limit || apiKey.rateLimit
                const createdAt = apiKey.created_at || apiKey.createdAt || apiKey.created
                const lastUsed = apiKey.last_used || apiKey.lastUsed

                return (
                  <div
                    key={accessKeyId}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={env === 'live' ? 'default' : 'secondary'}>
                          {env.toUpperCase()}
                        </Badge>
                        {rateLimit && (
                          <span className="text-xs text-muted-foreground">
                            Rate Limit: {rateLimit}/hour
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-sm text-muted-foreground mb-1 break-all">
                        {accessKeySecret || accessKeyId}
                      </p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        {createdAt && <span>Created: {formatDate(createdAt)}</span>}
                        {lastUsed && <span>Last used: {formatDate(lastUsed)}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {(accessKeySecret || accessKeyId) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(accessKeySecret || accessKeyId, accessKeyId)}
                        >
                          {copiedId === accessKeyId ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(accessKeyId)}
                        disabled={deleting === accessKeyId || deleteDialogOpen}
                        className="text-destructive hover:text-destructive"
                      >
                        {deleting === accessKeyId ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Delete'
                        )}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent onClose={() => setDeleteDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>Revoke API Key</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke this API key? This action cannot be undone. The key will be permanently deleted and any applications using it will stop working.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setKeyToDelete(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteKey}
              disabled={deleting === keyToDelete}
            >
              {deleting === keyToDelete ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Revoking...
                </>
              ) : (
                'Revoke Key'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
