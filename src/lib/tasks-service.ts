import { supabase } from './supabase'
import { getUser, listTasks as listTasksFromAPI } from './api'
import type { Task } from './api'

/**
 * Tasks service using backend API
 */

export interface TaskFilters {
  status?: string[]
  priority?: string[]
  search?: string
}

/**
 * Get current user's organization ID
 */
async function getCurrentUserOrgId(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  const { data: membership } = await supabase
    .from('memberships')
    .select('organization_id')
    .eq('user_id', session.user.id)
    .single()

  return membership?.organization_id || null
}

/**
 * List tasks from Supabase
 */
export async function listTasksFromSupabase(
  page: number = 1,
  pageSize: number = 10,
  filters?: TaskFilters
): Promise<{ tasks: Task[]; totalCount: number }> {
  try {
    const orgId = await getCurrentUserOrgId()
    if (!orgId) {
      throw new Error('No organization found for current user')
    }

    let query = supabase
      .from('tasks')
      .select('*', { count: 'exact' })
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters?.status && filters.status.length > 0) {
      query = query.in('status', filters.status)
    }

    if (filters?.priority && filters.priority.length > 0) {
      query = query.in('priority', filters.priority)
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    // Apply pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error('Failed to fetch tasks:', error)
      throw error
    }

    // Transform to API Task format
    const tasks: Task[] = (data || []).map((row: any) => ({
      id: row.id,
      organizationId: row.organization_id,
      title: row.title,
      description: row.description,
      status: row.status,
      priority: row.priority,
      label: row.label,
      assigneeId: row.assignee_id,
      createdBy: row.created_by,
      dueDate: row.due_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))

    return {
      tasks,
      totalCount: count || 0,
    }
  } catch (error) {
    console.error('Error listing tasks:', error)
    throw error
  }
}

/**
 * Create a task in Supabase
 */
export async function createTaskInSupabase(task: {
  title: string
  description?: string
  status?: string
  priority?: string
  label?: string
  assigneeId?: string
  dueDate?: string
}): Promise<Task> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw new Error('No active session')
    }

    const orgId = await getCurrentUserOrgId()
    if (!orgId) {
      throw new Error('No organization found for current user')
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          organization_id: orgId,
          title: task.title,
          description: task.description || null,
          status: task.status || 'todo',
          priority: task.priority || 'medium',
          label: task.label || null,
          assignee_id: task.assigneeId || null,
          created_by: session.user.id,
          due_date: task.dueDate || null,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Failed to create task:', error)
      throw error
    }

    return {
      id: data.id,
      organizationId: data.organization_id,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      label: data.label,
      assigneeId: data.assignee_id,
      createdBy: data.created_by,
      dueDate: data.due_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  } catch (error) {
    console.error('Error creating task:', error)
    throw error
  }
}

/**
 * Update a task in Supabase
 */
export async function updateTaskInSupabase(
  taskId: string,
  updates: Partial<Omit<Task, 'id' | 'organizationId' | 'createdAt' | 'updatedAt' | 'createdBy'>>
): Promise<Task> {
  try {
    const updateData: any = {}

    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.priority !== undefined) updateData.priority = updates.priority
    if (updates.label !== undefined) updateData.label = updates.label
    if (updates.assigneeId !== undefined) updateData.assignee_id = updates.assigneeId
    if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', taskId)
      .select()
      .single()

    if (error) {
      console.error('Failed to update task:', error)
      throw error
    }

    return {
      id: data.id,
      organizationId: data.organization_id,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      label: data.label,
      assigneeId: data.assignee_id,
      createdBy: data.created_by,
      dueDate: data.due_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  } catch (error) {
    console.error('Error updating task:', error)
    throw error
  }
}

/**
 * Delete a task from Supabase
 */
export async function deleteTaskFromSupabase(taskId: string): Promise<void> {
  try {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId)

    if (error) {
      console.error('Failed to delete task:', error)
      throw error
    }
  } catch (error) {
    console.error('Error deleting task:', error)
    throw error
  }
}

/**
 * Delete multiple tasks from Supabase
 */
export async function deleteManyTasksFromSupabase(taskIds: string[]): Promise<void> {
  try {
    const { error } = await supabase.from('tasks').delete().in('id', taskIds)

    if (error) {
      console.error('Failed to delete tasks:', error)
      throw error
    }
  } catch (error) {
    console.error('Error deleting tasks:', error)
    throw error
  }
}
