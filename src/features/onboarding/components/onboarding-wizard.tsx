import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { WelcomeStep } from './steps/welcome-step'
import { OrganizationInfoStep } from './steps/organization-info-step'
import { OrganizationHierarchyStep } from './steps/organization-hierarchy-step'
import { ReviewStep } from './steps/review-step'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export interface OrganizationData {
  name: string
  description?: string
}

export interface PositionNode {
  id: string
  title: string
  description?: string
  parentId: string | null
  children: PositionNode[]
}

const steps = [
  { id: 'welcome', title: 'Welcome', description: 'Get started' },
  { id: 'info', title: 'Organization Info', description: 'Basic details' },
  { id: 'hierarchy', title: 'Team Structure', description: 'Define roles' },
  { id: 'review', title: 'Review', description: 'Confirm setup' },
]

export function OnboardingWizard() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [organizationData, setOrganizationData] = useState<OrganizationData>({
    name: '',
    description: '',
  })
  const [hierarchy, setHierarchy] = useState<PositionNode[]>([
    {
      id: 'root',
      title: 'CEO',
      description: 'Chief Executive Officer',
      parentId: null,
      children: [],
    },
  ])

  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFinish = async () => {
    try {
      setIsSubmitting(true)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session')

      // Get user's organization
      const { data: membership } = await supabase
        .from('memberships')
        .select('organization_id')
        .eq('user_id', session.user.id)
        .single()

      if (!membership) throw new Error('No organization found')

      // Update organization info
      await supabase
        .from('organizations')
        .update({
          name: organizationData.name,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq('id', membership.organization_id)

      // Save hierarchy
      await saveHierarchy(membership.organization_id, hierarchy)

      toast.success('Organization setup completed!')
      navigate({ to: '/_authenticated' })
    } catch (error) {
      console.error('Failed to complete onboarding:', error)
      toast.error('Failed to complete setup. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function saveHierarchy(orgId: string, nodes: PositionNode[], parentId: string | null = null) {
    for (const node of nodes) {
      const { data, error } = await supabase
        .from('organization_positions')
        .insert({
          organization_id: orgId,
          title: node.title,
          description: node.description,
          parent_position_id: parentId,
        })
        .select()
        .single()

      if (error) {
        console.error('Failed to save position:', error)
        throw error
      }

      // Recursively save children
      if (node.children.length > 0) {
        await saveHierarchy(orgId, node.children, data.id)
      }
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Welcome
        return true
      case 1: // Organization info
        return organizationData.name.trim().length > 0
      case 2: // Hierarchy
        return hierarchy.length > 0
      case 3: // Review
        return true
      default:
        return false
    }
  }

  return (
    <Card className='w-full max-w-4xl'>
      <CardHeader>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <CardTitle className='text-2xl'>Organization Setup</CardTitle>
            <CardDescription>
              Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
            </CardDescription>
          </div>
          <div className='flex items-center gap-2'>
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  index < currentStep
                    ? 'bg-primary text-primary-foreground'
                    : index === currentStep
                    ? 'bg-primary/20 text-primary border-2 border-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {index < currentStep ? <Check className='w-4 h-4' /> : index + 1}
              </div>
            ))}
          </div>
        </div>
        <Progress value={progress} className='h-2' />
      </CardHeader>

      <CardContent className='space-y-6'>
        {currentStep === 0 && <WelcomeStep />}
        {currentStep === 1 && (
          <OrganizationInfoStep
            data={organizationData}
            onChange={setOrganizationData}
          />
        )}
        {currentStep === 2 && (
          <OrganizationHierarchyStep
            hierarchy={hierarchy}
            onChange={setHierarchy}
          />
        )}
        {currentStep === 3 && (
          <ReviewStep
            organizationData={organizationData}
            hierarchy={hierarchy}
          />
        )}

        <div className='flex justify-between pt-6'>
          <Button
            variant='outline'
            onClick={handleBack}
            disabled={currentStep === 0 || isSubmitting}
          >
            <ChevronLeft className='w-4 h-4 mr-2' />
            Back
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Next
              <ChevronRight className='w-4 h-4 ml-2' />
            </Button>
          ) : (
            <Button onClick={handleFinish} disabled={!canProceed() || isSubmitting}>
              {isSubmitting ? 'Completing...' : 'Complete Setup'}
              <Check className='w-4 h-4 ml-2' />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
