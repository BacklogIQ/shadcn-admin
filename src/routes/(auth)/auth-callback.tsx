import { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase'
import { syncUserToBackend } from '@/lib/api'
import { Loader2 } from 'lucide-react'

export const Route = createFileRoute('/(auth)/auth-callback')({
  component: AuthCallback,
})

function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase automatically handles the OAuth callback
        // Just check if we have a session
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth callback error:', error)
          navigate({ to: '/sign-in', replace: true })
          return
        }

        if (session) {
          // Sync user to backend - this will handle user/org creation
          try {
            await syncUserToBackend()
            console.log('User synced to backend after OAuth')
          } catch (syncError) {
            console.error('Backend sync failed:', syncError)
            // On sync failure, redirect to sign-in
            navigate({ to: '/sign-in', replace: true })
            return
          }

          // Redirect to authenticated area
          navigate({ to: '/dashboard', replace: true })
        } else {
          // No session, redirect to sign-in
          navigate({ to: '/sign-in', replace: true })
        }
      } catch (err) {
        console.error('Unexpected error in auth callback:', err)
        navigate({ to: '/sign-in', replace: true })
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className='flex h-screen w-full items-center justify-center'>
      <div className='flex flex-col items-center gap-2'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
        <p className='text-muted-foreground'>Completing sign in...</p>
      </div>
    </div>
  )
}
