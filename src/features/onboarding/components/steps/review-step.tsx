import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Network } from 'lucide-react'
import type { OrganizationData, PositionNode } from '../onboarding-wizard'

interface ReviewStepProps {
  organizationData: OrganizationData
  hierarchy: PositionNode[]
}

export function ReviewStep({ organizationData, hierarchy }: ReviewStepProps) {
  const countPositions = (nodes: PositionNode[]): number => {
    return nodes.reduce((count, node) => {
      return count + 1 + countPositions(node.children)
    }, 0)
  }

  const flattenHierarchy = (nodes: PositionNode[], level: number = 0): Array<{ node: PositionNode; level: number }> => {
    const result: Array<{ node: PositionNode; level: number }> = []
    nodes.forEach((node) => {
      result.push({ node, level })
      result.push(...flattenHierarchy(node.children, level + 1))
    })
    return result
  }

  const totalPositions = countPositions(hierarchy)
  const flatHierarchy = flattenHierarchy(hierarchy)

  return (
    <div className='space-y-6 py-4'>
      <div className='space-y-2'>
        <h3 className='text-xl font-semibold'>Review Your Setup</h3>
        <p className='text-sm text-muted-foreground'>
          Please review your organization details before completing the setup.
        </p>
      </div>

      <div className='space-y-4'>
        {/* Organization Info */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Building2 className='w-5 h-5' />
              Organization Information
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div>
              <div className='text-sm font-medium text-muted-foreground'>Organization Name</div>
              <div className='text-base font-semibold'>{organizationData.name}</div>
            </div>
            {organizationData.description && (
              <div>
                <div className='text-sm font-medium text-muted-foreground'>Description</div>
                <div className='text-sm'>{organizationData.description}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hierarchy */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Network className='w-5 h-5' />
              Team Structure ({totalPositions} {totalPositions === 1 ? 'position' : 'positions'})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hierarchy.length === 0 ? (
              <p className='text-sm text-muted-foreground'>No positions defined</p>
            ) : (
              <div className='space-y-2'>
                {flatHierarchy.map(({ node, level }) => (
                  <div
                    key={node.id}
                    className='flex items-start gap-2 p-2 rounded border bg-card'
                    style={{ marginLeft: level * 24 }}
                  >
                    <div className='flex-1'>
                      <div className='font-medium'>{node.title}</div>
                      {node.description && (
                        <div className='text-sm text-muted-foreground'>{node.description}</div>
                      )}
                    </div>
                    {level > 0 && (
                      <div className='text-xs text-muted-foreground bg-muted px-2 py-1 rounded'>
                        Level {level}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className='bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4'>
          <p className='text-sm text-amber-900 dark:text-amber-100'>
            <strong>Note:</strong> You can modify these settings later from your organization
            settings page.
          </p>
        </div>
      </div>
    </div>
  )
}
