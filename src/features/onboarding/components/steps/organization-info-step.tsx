import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { OrganizationData } from '../onboarding-wizard'

interface OrganizationInfoStepProps {
  data: OrganizationData
  onChange: (data: OrganizationData) => void
}

export function OrganizationInfoStep({ data, onChange }: OrganizationInfoStepProps) {
  return (
    <div className='space-y-6 py-4'>
      <div className='space-y-2'>
        <h3 className='text-xl font-semibold'>Organization Information</h3>
        <p className='text-sm text-muted-foreground'>
          Tell us about your organization. You can update this information later.
        </p>
      </div>

      <div className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='org-name'>
            Organization Name <span className='text-destructive'>*</span>
          </Label>
          <Input
            id='org-name'
            placeholder='e.g., Acme Inc., TechCorp'
            value={data.name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            required
          />
          <p className='text-xs text-muted-foreground'>
            The official name of your organization
          </p>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='org-description'>Description (Optional)</Label>
          <Textarea
            id='org-description'
            placeholder='Brief description of your organization...'
            value={data.description}
            onChange={(e) => onChange({ ...data, description: e.target.value })}
            rows={4}
          />
          <p className='text-xs text-muted-foreground'>
            Help your team understand what your organization does
          </p>
        </div>
      </div>
    </div>
  )
}
