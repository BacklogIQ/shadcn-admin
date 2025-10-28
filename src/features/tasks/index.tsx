import { useState, useEffect } from 'react'
import { useSearch } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { TasksDialogs } from './components/tasks-dialogs'
import { TasksPrimaryButtons } from './components/tasks-primary-buttons'
import { TasksProvider } from './components/tasks-provider'
import { TasksTable } from './components/tasks-table'
import { listTasksFromSupabase } from '@/lib/tasks-service'
import type { Task } from './data/schema'

export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const search = useSearch({ from: '/_authenticated/tasks/' })

  useEffect(() => {
    loadTasks()
  }, [search.page, search.pageSize, search.status, search.priority, search.filter])

  async function loadTasks() {
    try {
      setLoading(true)
      setError(null)
      const { tasks: data } = await listTasksFromSupabase(
        search.page || 1,
        search.pageSize || 10,
        {
          status: search.status,
          priority: search.priority,
          search: search.filter,
        }
      )
      setTasks(data)
    } catch (err) {
      console.error('Failed to load tasks:', err)
      setError(err instanceof Error ? err.message : 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  return (
    <TasksProvider onTasksChange={loadTasks}>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Tasks</h2>
            <p className='text-muted-foreground'>
              Here&apos;s a list of your tasks for this month!
            </p>
          </div>
          <TasksPrimaryButtons />
        </div>
        {loading ? (
          <div className='flex items-center justify-center py-8'>
            <p className='text-muted-foreground'>Loading tasks...</p>
          </div>
        ) : error ? (
          <div className='flex items-center justify-center py-8'>
            <p className='text-destructive'>{error}</p>
          </div>
        ) : (
          <TasksTable data={tasks} />
        )}
      </Main>

      <TasksDialogs />
    </TasksProvider>
  )
}
