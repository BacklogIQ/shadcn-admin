import { createFileRoute, redirect } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase'
import { OnboardingWizard } from '@/features/onboarding/components/onboarding-wizard'

export const Route = createFileRoute('/(auth)/onboarding')({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      throw redirect({ to: '/sign-in' })
    }

    // Check if onboarding already completed
    const { data: membership } = await supabase
      .from('memberships')
      .select('organization_id, organizations!inner(onboarding_completed)')
      .eq('user_id', session.user.id)
      .single()

    if (membership?.organizations && membership.organizations.onboarding_completed) {
      throw redirect({ to: '/_authenticated' })
    }
  },
  component: OnboardingPage,
})

function OnboardingPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-background p-4'>
      <OnboardingWizard />
    </div>
  )
}
