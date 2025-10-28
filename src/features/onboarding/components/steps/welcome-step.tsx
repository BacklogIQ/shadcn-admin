import { Building2, Users, Workflow } from 'lucide-react'

export function WelcomeStep() {
  return (
    <div className='space-y-6 text-center py-8'>
      <div className='inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10'>
        <Building2 className='w-10 h-10 text-primary' />
      </div>

      <div className='space-y-2'>
        <h2 className='text-3xl font-bold tracking-tight'>Welcome to BacklogIQ!</h2>
        <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
          Let's set up your organization and team structure to get started.
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 pt-8'>
        <div className='flex flex-col items-center gap-3 p-6 rounded-lg border bg-card'>
          <div className='w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center'>
            <Building2 className='w-6 h-6 text-primary' />
          </div>
          <h3 className='font-semibold'>Organization Info</h3>
          <p className='text-sm text-muted-foreground text-center'>
            Set up your organization's basic information
          </p>
        </div>

        <div className='flex flex-col items-center gap-3 p-6 rounded-lg border bg-card'>
          <div className='w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center'>
            <Workflow className='w-6 h-6 text-primary' />
          </div>
          <h3 className='font-semibold'>Team Structure</h3>
          <p className='text-sm text-muted-foreground text-center'>
            Define your organization's hierarchy and roles
          </p>
        </div>

        <div className='flex flex-col items-center gap-3 p-6 rounded-lg border bg-card'>
          <div className='w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center'>
            <Users className='w-6 h-6 text-primary' />
          </div>
          <h3 className='font-semibold'>Invite Team</h3>
          <p className='text-sm text-muted-foreground text-center'>
            Invite team members and assign them to positions
          </p>
        </div>
      </div>

      <p className='text-sm text-muted-foreground pt-4'>
        This should only take a few minutes to complete.
      </p>
    </div>
  )
}
