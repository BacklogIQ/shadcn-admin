import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { IconGithub } from '@/assets/brand-icons'
import { Plug } from 'lucide-react'

export function Plugins() {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-semibold tracking-tight'>Plugins</h1>
        <p className='text-muted-foreground mt-1'>Manage your integrations. These are placeholders for Jira and GitHub.</p>
      </div>

      <div className='grid gap-6 sm:grid-cols-2'>
        <IntegrationCard
          name='Jira'
          description='Connect to Jira to sync issues and projects.'
          Logo={<Plug />}
        />
        <IntegrationCard
          name='GitHub'
          description='Connect your repositories to ingest issues and PRs.'
          Logo={<IconGithub />}
        />
      </div>
    </div>
  )
}

function IntegrationCard({ name, description, Logo }: { name: string; description: string; Logo: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center gap-3'>
        <div className='shrink-0'>{Logo}</div>
        <div>
          <CardTitle className='text-lg'>{name}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm text-muted-foreground'>Enabled</p>
          </div>
          <Switch disabled />
        </div>
        <Separator className='my-4' />
        <div className='space-y-2 text-sm text-muted-foreground'>
          <p>• Status: Not connected</p>
          <p>• This is a placeholder UI. Hook it up to your backend later.</p>
        </div>
      </CardContent>
      <CardFooter className='flex justify-end'>
        <Button disabled>Connect</Button>
      </CardFooter>
    </Card>
  )
}
