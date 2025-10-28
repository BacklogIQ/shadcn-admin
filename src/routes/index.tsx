import { createFileRoute, redirect } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
      // If authenticated, redirect to dashboard
      throw redirect({ to: '/dashboard' })
    } else {
      // If not authenticated, redirect to sign-in
      throw redirect({ to: '/sign-in' })
    }
  },
})
