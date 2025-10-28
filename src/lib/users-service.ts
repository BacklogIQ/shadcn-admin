import { supabase } from './supabase'
import { getUser } from './api'

/**
 * Users service using backend API
 */

export interface UserProfile {
  id: string
  email: string
  fullName: string | null
  phoneNumber: string | null
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
  // From membership
  organizationId?: string
  role?: string
  status?: 'active' | 'inactive' | 'invited' | 'suspended'
}

export interface UserFilters {
  status?: string[]
  role?: string[]
  search?: string
}

/**
 * Get current user's organization ID from backend API
 */
async function getCurrentUserOrgId(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return null

    const userData = await getUser('me')
    return userData.orgId || null
  } catch (error) {
    console.error('Failed to get current user org:', error)
    return null
  }
}

/**
 * List users from organization (via backend API)
 *
 * TODO: Backend needs to implement GET /api/users endpoint with filtering/pagination
 * For now, returning mock/empty data to avoid direct Supabase queries
 */
export async function listUsersFromSupabase(
  page: number = 1,
  pageSize: number = 10,
  filters?: UserFilters
): Promise<{ users: UserProfile[]; totalCount: number }> {
  try {
    const orgId = await getCurrentUserOrgId()
    if (!orgId) {
      throw new Error('No organization found for current user')
    }

    // TODO: Call backend API endpoint GET /api/users?orgId=xxx&page=x&pageSize=x
    // const response = await fetch(`${API_BASE_URL}/api/users?orgId=${orgId}&page=${page}&pageSize=${pageSize}`)
    // const data = await response.json()
    // return data

    console.warn('listUsersFromSupabase: Backend API not yet implemented, returning empty list')

    return {
      users: [],
      totalCount: 0,
    }
  } catch (error) {
    console.error('Error listing users:', error)
    throw error
  }
}

/**
 * Update user membership (role or status)
 * TODO: Backend needs to implement PATCH /api/users/:userId/membership
 */
export async function updateUserMembership(
  userId: string,
  updates: {
    role?: string
    status?: 'active' | 'inactive' | 'invited' | 'suspended'
  }
): Promise<void> {
  console.warn('updateUserMembership: Backend API not yet implemented')
  throw new Error('Backend API not yet implemented')
}

/**
 * Update user profile
 * TODO: Backend needs to implement PATCH /api/users/:userId
 */
export async function updateUserProfile(
  userId: string,
  updates: {
    fullName?: string
    phoneNumber?: string
    avatarUrl?: string
  }
): Promise<void> {
  console.warn('updateUserProfile: Backend API not yet implemented')
  throw new Error('Backend API not yet implemented')
}

/**
 * Remove user from organization
 * TODO: Backend needs to implement DELETE /api/users/:userId/membership
 */
export async function removeUserFromOrganization(userId: string): Promise<void> {
  console.warn('removeUserFromOrganization: Backend API not yet implemented')
  throw new Error('Backend API not yet implemented')
}

/**
 * Invite user to organization
 * TODO: Backend needs to implement POST /api/users/invite
 */
export async function inviteUserToOrganization(email: string, role: string): Promise<void> {
  console.warn('inviteUserToOrganization: Backend API not yet implemented')
  throw new Error('Backend API not yet implemented')
}
