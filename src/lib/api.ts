import { supabase } from './supabase'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.backlogiq.example.com'

/**
 * Get authorization header with current Supabase access token
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.access_token) {
    throw new Error('No active session')
  }

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
  }
}

/**
 * Sync current user to backend
 * Backend is optional - gracefully handles when backend is not available
 */
export async function syncUserToBackend() {
  // Skip backend sync if API_BASE_URL is not configured or is placeholder
  if (!API_BASE_URL || API_BASE_URL.includes('example.com')) {
    console.log('Backend sync skipped: API_BASE_URL not configured')
    return null
  }

  try {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      console.warn('No session available for user sync')
      return null
    }

    const user = session.user

    // Fetch user's organization from Supabase
    const { data: membership } = await supabase
      .from('memberships')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      console.warn('No organization membership found for user')
      return null
    }

    const headers = await getAuthHeaders()

    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        userId: user.id,
        email: user.email,
        orgId: membership.organization_id,
        role: membership.role,
      }),
    })

    if (!response.ok) {
      throw new Error(`Backend sync failed: ${response.status}`)
    }

    const data = await response.json()
    console.log('User synced to backend:', data)
    return data
  } catch (error) {
    console.error('Failed to sync user to backend (non-fatal):', error)
    // Don't throw - backend sync is optional
    return null
  }
}

/**
 * Send event to backend ingest endpoint
 */
export async function sendEvent(event: {
  type: string
  data: Record<string, any>
}) {
  try {
    const headers = await getAuthHeaders()

    const response = await fetch(`${API_BASE_URL}/api/ingest`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        type: event.type,
        timestamp: new Date().toISOString(),
        source: 'frontend',
        data: event.data,
      }),
    })

    if (!response.ok) {
      throw new Error(`Event send failed: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to send event:', error)
    throw error
  }
}

/**
 * Get user from backend
 */
export async function getUser(userId: string) {
  try {
    const headers = await getAuthHeaders()

    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error(`Failed to get user: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to get user:', error)
    throw error
  }
}

// ============= Tasks API =============

export interface Task {
  id: string
  organizationId: string
  title: string
  description?: string
  status: 'todo' | 'in progress' | 'done' | 'canceled' | 'backlog'
  priority: 'low' | 'medium' | 'high' | 'critical'
  label?: 'bug' | 'feature' | 'documentation'
  assigneeId?: string
  createdBy: string
  dueDate?: string
  createdAt: string
  updatedAt: string
}

export interface ListTasksParams {
  organizationId: string
  page?: number
  pageSize?: number
  status?: string[]
  priority?: string[]
  filter?: string
}

export interface ListTasksResponse {
  tasks: Task[]
  totalCount: number
  page: number
  pageSize: number
}

/**
 * List tasks with filtering and pagination
 */
export async function listTasks(params: ListTasksParams): Promise<ListTasksResponse> {
  try {
    const headers = await getAuthHeaders()
    const queryParams = new URLSearchParams()

    queryParams.append('organizationId', params.organizationId)
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString())
    if (params.status) params.status.forEach(s => queryParams.append('status', s))
    if (params.priority) params.priority.forEach(p => queryParams.append('priority', p))
    if (params.filter) queryParams.append('filter', params.filter)

    const response = await fetch(`${API_BASE_URL}/api/tasks?${queryParams.toString()}`, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error(`Failed to list tasks: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to list tasks:', error)
    throw error
  }
}

/**
 * Get a single task by ID
 */
export async function getTask(taskId: string): Promise<Task> {
  try {
    const headers = await getAuthHeaders()

    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error(`Failed to get task: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to get task:', error)
    throw error
  }
}

/**
 * Create a new task
 */
export async function createTask(task: {
  organizationId: string
  title: string
  description?: string
  status?: Task['status']
  priority?: Task['priority']
  label?: Task['label']
  assigneeId?: string
  dueDate?: string
}): Promise<Task> {
  try {
    const headers = await getAuthHeaders()
    const queryParams = new URLSearchParams({
      organizationId: task.organizationId
    })

    const response = await fetch(`${API_BASE_URL}/api/tasks?${queryParams.toString()}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(task),
    })

    if (!response.ok) {
      throw new Error(`Failed to create task: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to create task:', error)
    throw error
  }
}

/**
 * Update an existing task
 */
export async function updateTask(
  taskId: string,
  organizationId: string,
  updates: Partial<Omit<Task, 'id' | 'organizationId' | 'createdAt' | 'updatedAt' | 'createdBy'>>
): Promise<Task> {
  try {
    const headers = await getAuthHeaders()
    const queryParams = new URLSearchParams({
      organizationId
    })

    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}?${queryParams.toString()}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      throw new Error(`Failed to update task: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to update task:', error)
    throw error
  }
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string, organizationId: string): Promise<void> {
  try {
    const headers = await getAuthHeaders()
    const queryParams = new URLSearchParams({
      organizationId
    })

    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}?${queryParams.toString()}`, {
      method: 'DELETE',
      headers,
    })

    if (!response.ok) {
      throw new Error(`Failed to delete task: ${response.status}`)
    }
  } catch (error) {
    console.error('Failed to delete task:', error)
    throw error
  }
}
