import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Copy, Eye, EyeOff, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export function DeveloperForm() {
  const [accessToken, setAccessToken] = useState<string>('')
  const [showToken, setShowToken] = useState(false)
  const [userId, setUserId] = useState<string>('')
  const [userEmail, setUserEmail] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUserData()
  }, [])

  async function loadUserData() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setAccessToken(session.access_token)
        setUserId(session.user.id)
        setUserEmail(session.user.email || '')
      }
    } catch (error) {
      console.error('Failed to load user data:', error)
      toast.error('Failed to load authentication data')
    } finally {
      setLoading(false)
    }
  }

  async function refreshToken() {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) throw error

      if (data.session) {
        setAccessToken(data.session.access_token)
        toast.success('Token refreshed successfully')
      }
    } catch (error) {
      console.error('Failed to refresh token:', error)
      toast.error('Failed to refresh token')
    } finally {
      setLoading(false)
    }
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  function maskToken(token: string) {
    if (token.length < 20) return token
    return `${token.substring(0, 10)}...${token.substring(token.length - 10)}`
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className='space-y-6'>
      <Alert>
        <AlertDescription>
          Use these credentials to authenticate the VSCode extension and other integrations.
          Keep your access token secure and never share it publicly.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>
            Your user ID and email for API authentication
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='userId'>User ID</Label>
            <div className='flex gap-2'>
              <Input
                id='userId'
                value={userId}
                readOnly
                className='font-mono text-sm'
              />
              <Button
                type='button'
                variant='outline'
                size='icon'
                onClick={() => copyToClipboard(userId, 'User ID')}
              >
                <Copy className='h-4 w-4' />
              </Button>
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='userEmail'>Email</Label>
            <div className='flex gap-2'>
              <Input
                id='userEmail'
                value={userEmail}
                readOnly
                className='font-mono text-sm'
              />
              <Button
                type='button'
                variant='outline'
                size='icon'
                onClick={() => copyToClipboard(userEmail, 'Email')}
              >
                <Copy className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Access Token</CardTitle>
          <CardDescription>
            JWT access token for API authentication. This token expires periodically and can be refreshed.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='accessToken'>Access Token</Label>
            <div className='flex gap-2'>
              <Input
                id='accessToken'
                type={showToken ? 'text' : 'password'}
                value={showToken ? accessToken : maskToken(accessToken)}
                readOnly
                className='font-mono text-sm'
              />
              <Button
                type='button'
                variant='outline'
                size='icon'
                onClick={() => setShowToken(!showToken)}
              >
                {showToken ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
              </Button>
              <Button
                type='button'
                variant='outline'
                size='icon'
                onClick={() => copyToClipboard(accessToken, 'Access Token')}
              >
                <Copy className='h-4 w-4' />
              </Button>
            </div>
          </div>

          <Button
            type='button'
            variant='secondary'
            onClick={refreshToken}
            disabled={loading}
            className='w-full sm:w-auto'
          >
            <RefreshCw className='mr-2 h-4 w-4' />
            Refresh Token
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>VSCode Extension Setup</CardTitle>
          <CardDescription>
            Instructions for configuring the BacklogIQ VSCode extension
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <ol className='list-decimal list-inside space-y-2 text-sm'>
            <li>Install the BacklogIQ extension from VSCode marketplace</li>
            <li>Run the command: <code className='bg-muted px-1 py-0.5 rounded'>BacklogIQ: Setup</code></li>
            <li>Choose "Paste access token"</li>
            <li>Copy your access token from above and paste it into VSCode</li>
            <li>Configure your organization ID and webhook URL</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
