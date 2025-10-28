import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Edit, Trash2, ChevronRight } from 'lucide-react'
import type { PositionNode } from '../onboarding-wizard'
import { cn } from '@/lib/utils'

interface OrganizationHierarchyStepProps {
  hierarchy: PositionNode[]
  onChange: (hierarchy: PositionNode[]) => void
}

export function OrganizationHierarchyStep({
  hierarchy,
  onChange,
}: OrganizationHierarchyStepProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedParent, setSelectedParent] = useState<PositionNode | null>(null)
  const [editingNode, setEditingNode] = useState<PositionNode | null>(null)
  const [formData, setFormData] = useState({ title: '', description: '' })

  const handleAddPosition = (parent: PositionNode | null = null) => {
    setSelectedParent(parent)
    setFormData({ title: '', description: '' })
    setIsAddDialogOpen(true)
  }

  const handleEditPosition = (node: PositionNode) => {
    setEditingNode(node)
    setFormData({ title: node.title, description: node.description || '' })
    setIsEditDialogOpen(true)
  }

  const handleSaveAdd = () => {
    if (!formData.title.trim()) return

    const newNode: PositionNode = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      parentId: selectedParent?.id || null,
      children: [],
    }

    if (selectedParent) {
      // Add as child
      const updatedHierarchy = addChildToNode(hierarchy, selectedParent.id, newNode)
      onChange(updatedHierarchy)
    } else {
      // Add as root
      onChange([...hierarchy, newNode])
    }

    setIsAddDialogOpen(false)
    setFormData({ title: '', description: '' })
  }

  const handleSaveEdit = () => {
    if (!editingNode || !formData.title.trim()) return

    const updatedHierarchy = updateNode(hierarchy, editingNode.id, {
      title: formData.title,
      description: formData.description,
    })
    onChange(updatedHierarchy)
    setIsEditDialogOpen(false)
    setEditingNode(null)
  }

  const handleDeletePosition = (nodeId: string) => {
    const updatedHierarchy = deleteNode(hierarchy, nodeId)
    onChange(updatedHierarchy)
  }

  const addChildToNode = (
    nodes: PositionNode[],
    parentId: string,
    newChild: PositionNode
  ): PositionNode[] => {
    return nodes.map((node) => {
      if (node.id === parentId) {
        return { ...node, children: [...node.children, newChild] }
      }
      if (node.children.length > 0) {
        return { ...node, children: addChildToNode(node.children, parentId, newChild) }
      }
      return node
    })
  }

  const updateNode = (
    nodes: PositionNode[],
    nodeId: string,
    updates: Partial<PositionNode>
  ): PositionNode[] => {
    return nodes.map((node) => {
      if (node.id === nodeId) {
        return { ...node, ...updates }
      }
      if (node.children.length > 0) {
        return { ...node, children: updateNode(node.children, nodeId, updates) }
      }
      return node
    })
  }

  const deleteNode = (nodes: PositionNode[], nodeId: string): PositionNode[] => {
    return nodes
      .filter((node) => node.id !== nodeId)
      .map((node) => ({
        ...node,
        children: deleteNode(node.children, nodeId),
      }))
  }

  return (
    <div className='space-y-6 py-4'>
      <div className='space-y-2'>
        <h3 className='text-xl font-semibold'>Team Structure</h3>
        <p className='text-sm text-muted-foreground'>
          Build your organization's hierarchy. Start with top-level positions and add
          reporting structures.
        </p>
      </div>

      <div className='space-y-4'>
        <div className='flex justify-between items-center'>
          <p className='text-sm font-medium'>Organization Chart</p>
          <Button onClick={() => handleAddPosition(null)} size='sm'>
            <Plus className='w-4 h-4 mr-2' />
            Add Root Position
          </Button>
        </div>

        <div className='border rounded-lg p-6 bg-muted/20 min-h-[400px]'>
          {hierarchy.length === 0 ? (
            <div className='flex flex-col items-center justify-center h-[350px] text-center'>
              <p className='text-muted-foreground mb-4'>No positions added yet</p>
              <Button onClick={() => handleAddPosition(null)} variant='outline'>
                <Plus className='w-4 h-4 mr-2' />
                Add First Position
              </Button>
            </div>
          ) : (
            <div className='space-y-2'>
              {hierarchy.map((node) => (
                <PositionTreeNode
                  key={node.id}
                  node={node}
                  level={0}
                  onAdd={handleAddPosition}
                  onEdit={handleEditPosition}
                  onDelete={handleDeletePosition}
                />
              ))}
            </div>
          )}
        </div>

        <div className='bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4'>
          <p className='text-sm text-blue-900 dark:text-blue-100'>
            <strong>Tip:</strong> Common positions include CEO, CTO, Product Owner, Engineering
            Manager, Developer, Designer, QA Engineer, etc.
          </p>
        </div>
      </div>

      {/* Add Position Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Position</DialogTitle>
            <DialogDescription>
              {selectedParent
                ? `Add a position reporting to ${selectedParent.title}`
                : 'Add a top-level position'}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='position-title'>
                Position Title <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='position-title'
                placeholder='e.g., CTO, Product Manager, Developer'
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='position-description'>Description (Optional)</Label>
              <Textarea
                id='position-description'
                placeholder='Brief description of this role...'
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAdd} disabled={!formData.title.trim()}>
              Add Position
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Position Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Position</DialogTitle>
            <DialogDescription>Update the position details</DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='edit-position-title'>
                Position Title <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='edit-position-title'
                placeholder='e.g., CTO, Product Manager, Developer'
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-position-description'>Description (Optional)</Label>
              <Textarea
                id='edit-position-description'
                placeholder='Brief description of this role...'
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={!formData.title.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface PositionTreeNodeProps {
  node: PositionNode
  level: number
  onAdd: (parent: PositionNode) => void
  onEdit: (node: PositionNode) => void
  onDelete: (nodeId: string) => void
}

function PositionTreeNode({ node, level, onAdd, onEdit, onDelete }: PositionTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className='space-y-2'>
      <div
        className={cn(
          'group flex items-center gap-2 p-3 rounded-lg border bg-card hover:shadow-sm transition-all',
          level > 0 && 'ml-8'
        )}
        style={{ marginLeft: level > 0 ? `${level * 2}rem` : 0 }}
      >
        {node.children.length > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className='p-1 hover:bg-muted rounded transition-colors'
          >
            <ChevronRight
              className={cn(
                'w-4 h-4 transition-transform',
                isExpanded && 'transform rotate-90'
              )}
            />
          </button>
        )}

        <div className='flex-1 min-w-0'>
          <div className='font-medium'>{node.title}</div>
          {node.description && (
            <div className='text-sm text-muted-foreground truncate'>{node.description}</div>
          )}
        </div>

        <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
          <Button size='sm' variant='ghost' onClick={() => onAdd(node)}>
            <Plus className='w-4 h-4' />
          </Button>
          <Button size='sm' variant='ghost' onClick={() => onEdit(node)}>
            <Edit className='w-4 h-4' />
          </Button>
          <Button
            size='sm'
            variant='ghost'
            onClick={() => onDelete(node.id)}
            className='text-destructive hover:text-destructive'
          >
            <Trash2 className='w-4 h-4' />
          </Button>
        </div>
      </div>

      {isExpanded && node.children.length > 0 && (
        <div className='space-y-2'>
          {node.children.map((child) => (
            <PositionTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onAdd={onAdd}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
