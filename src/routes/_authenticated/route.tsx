import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { supabase } from '@/lib/supabase'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      throw redirect({ to: '/sign-in' })
    }

    // Check if onboarding is completed
    const { data: membership } = await supabase
      .from('memberships')
      .select('organization_id, organizations!inner(onboarding_completed)')
      .eq('user_id', session.user.id)
      .single()

    if (membership?.organizations && !membership.organizations.onboarding_completed) {
      throw redirect({ to: '/onboarding' })
    }
  },
  component: AuthenticatedLayout,
})
